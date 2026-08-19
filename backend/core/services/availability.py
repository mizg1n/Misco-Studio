from datetime import timedelta
from django.db.models import Q
from core.models import ArtistWorkingHours, ArtistShift, ArtistLeave, Appointment

def check_artist_availability(artist, start_datetime, exclude_appointment_id=None):
    # Varsayılan süre: 1 saat
    end_datetime = start_datetime + timedelta(hours=1)
    date_val = start_datetime.date()
    start_time = start_datetime.time()
    end_time = end_datetime.time()

    # 1. Onaylanmış İzin Kontrolü (Leaves)
    leaves = ArtistLeave.objects.filter(
        artist=artist,
        status='APPROVED',
        start_datetime__lt=end_datetime,
        end_datetime__gt=start_datetime
    )
    if leaves.exists():
        return False, "Sanatçı bu tarihte/saatte izinli."

    # 2. Çalışma Saatleri Kontrolü (Vardiya veya Standart Saatler)
    shift = ArtistShift.objects.filter(artist=artist, date=date_val).first()
    if shift:
        if not shift.is_working_day:
            return False, "Sanatçı bugün çalışmıyor (Özel İzin/Kapalı)."
        if shift.start_time and shift.end_time:
            if start_time < shift.start_time or end_time > shift.end_time:
                return False, "Talep edilen saat, sanatçının bugünkü mesai saatleri dışında."
    else:
        # Standart Haftalık Saatleri Kontrol Et
        day_of_week = start_datetime.weekday() # 0=Pazartesi, 6=Pazar
        working_hours = ArtistWorkingHours.objects.filter(artist=artist, day_of_week=day_of_week, is_active=True).first()
        
        if not working_hours:
            import datetime
            default_start = datetime.time(10, 0)
            default_end = datetime.time(20, 0)
            if start_time < default_start or end_time > default_end:
                return False, "Talep edilen saat, stüdyo çalışma saatleri (10:00-20:00) dışında."
        else:
            if start_time < working_hours.start_time or end_time > working_hours.end_time:
                return False, "Talep edilen saat, sanatçının mesai saatleri dışında."

    # 3. Başka Randevularla Çakışma Kontrolü
    conflicting_appts = Appointment.objects.filter(
        artist=artist,
        scheduled_at__isnull=False,
    ).exclude(status='REJECTED')
    
    if exclude_appointment_id:
        conflicting_appts = conflicting_appts.exclude(id=exclude_appointment_id)

    # Her randevuyu 1 saatlik varsayıyoruz
    for apt in conflicting_appts:
        apt_start = apt.scheduled_at
        apt_end = apt_start + timedelta(hours=1)
        if apt_start < end_datetime and apt_end > start_datetime:
            return False, "Sanatçının bu saatte başka bir randevusu var."

    return True, "Uygun"
