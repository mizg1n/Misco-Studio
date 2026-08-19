import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import CustomUser, ArtistWorkingHours, ArtistLeave, ArtistShift
from datetime import time, timedelta
from django.utils import timezone

def seed_shifts():
    artists = CustomUser.objects.filter(role='ARTIST')
    if not artists.exists():
        print("No artists found to seed.")
        return

    # Delete existing to prevent duplicates
    ArtistWorkingHours.objects.all().delete()
    ArtistLeave.objects.all().delete()
    ArtistShift.objects.all().delete()

    for artist in artists:
        # Working hours: Monday to Friday (0 to 4), 10:00 to 18:00
        for day in range(5):
            ArtistWorkingHours.objects.create(
                artist=artist,
                day_of_week=day,
                start_time=time(10, 0),
                end_time=time(18, 0)
            )
        
        # Give them an upcoming leave next week
        next_week = timezone.now() + timedelta(days=7)
        ArtistLeave.objects.create(
            artist=artist,
            leave_type='ANNUAL',
            start_datetime=next_week.replace(hour=9, minute=0),
            end_datetime=(next_week + timedelta(days=1)).replace(hour=18, minute=0),
            reason="Yıllık dinlenme izni",
            status='PENDING'
        )

    print("Seeded shifts and leaves successfully.")

if __name__ == '__main__':
    seed_shifts()
