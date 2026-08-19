from core.services.availability import check_artist_availability
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PriceList, CareInstruction, Appointment, AuditLog, Notification, Payment, ArtistPayout

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone_number', 'commission_rate', 'payout_type')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'phone_number')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            phone_number=validated_data.get('phone_number', ''),
            role='CUSTOMER'
        )
        return user

class PriceListSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceList
        fields = '__all__'

class CareInstructionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareInstruction
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source='customer.username')
    artist_name = serializers.ReadOnlyField(source='artist.username')

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ('customer', 'status')

    def validate(self, data):
        scheduled_at = data.get('scheduled_at', getattr(self.instance, 'scheduled_at', None))
        artist = data.get('artist', getattr(self.instance, 'artist', None))
        status_val = data.get('status', getattr(self.instance, 'status', None))

        if status_val == 'APPROVED' and not artist:
            raise serializers.ValidationError({"artist": "Sanatçı atanmadan randevu onaylanamaz."})
        
        if scheduled_at and artist:
            exclude_id = self.instance.pk if self.instance else None
            is_available, msg = check_artist_availability(artist, scheduled_at, exclude_id)
            if not is_available:
                raise serializers.ValidationError({"scheduled_at": f"Sanatçı müsait değil: {msg}"})
        elif scheduled_at:
            # Fallback if no artist selected yet (check if all artists are booked)
            from django.contrib.auth import get_user_model
            User = get_user_model()
            existing = Appointment.objects.filter(scheduled_at=scheduled_at).exclude(status='REJECTED')
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            
            artist_count = User.objects.filter(role='ARTIST').count()
            if existing.count() >= artist_count:
                raise serializers.ValidationError({"scheduled_at": "Bu tarih ve saatte stüdyomuz doludur. Lütfen farklı bir saat seçin."})
        
        return data

    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        appointment = super().create(validated_data)
        
        # Create notification for customer
        Notification.objects.create(
            user=appointment.customer,
            title="Randevu Talebiniz Alındı",
            message=f"Talebiniz başarıyla alındı ve onay bekliyor. Durumu buradan takip edebilirsiniz."
        )
        
        return appointment

class AppointmentAdminSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source='customer.username')
    artist_name = serializers.ReadOnlyField(source='artist.username')

    class Meta:
        model = Appointment
        fields = '__all__'

    def validate(self, data):
        scheduled_at = data.get('scheduled_at', getattr(self.instance, 'scheduled_at', None))
        artist = data.get('artist', getattr(self.instance, 'artist', None))
        status_val = data.get('status', getattr(self.instance, 'status', None))

        if status_val == 'APPROVED' and not artist:
            raise serializers.ValidationError({"artist": "Sanatçı atanmadan randevu onaylanamaz."})
        
        if scheduled_at and artist:
            exclude_id = self.instance.pk if self.instance else None
            is_available, msg = check_artist_availability(artist, scheduled_at, exclude_id)
            if not is_available:
                raise serializers.ValidationError({"scheduled_at": f"Sanatçı müsait değil: {msg}"})
        elif scheduled_at:
            # Fallback if no artist selected yet (check if all artists are booked)
            from django.contrib.auth import get_user_model
            User = get_user_model()
            existing = Appointment.objects.filter(scheduled_at=scheduled_at).exclude(status='REJECTED')
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            
            artist_count = User.objects.filter(role='ARTIST').count()
            if existing.count() >= artist_count:
                raise serializers.ValidationError({"scheduled_at": "Bu tarih ve saatte stüdyomuz doludur. Lütfen farklı bir saat seçin."})
        
        return data

    def update(self, instance, validated_data):
        old_status = instance.status
        appointment = super().update(instance, validated_data)
        new_status = appointment.status
        
        if old_status != new_status:
            if new_status == 'APPROVED':
                Notification.objects.create(
                    user=appointment.customer,
                    title="Randevunuz Onaylandı!",
                    message=f"Harika haber! Randevunuz onaylandı. Bizi tercih ettiğiniz için teşekkürler."
                )
            elif new_status == 'REJECTED':
                Notification.objects.create(
                    user=appointment.customer,
                    title="Randevunuz İptal Edildi",
                    message=f"Maalesef randevunuz onaylanamadı veya iptal edildi. Lütfen başka bir tarih için tekrar deneyin."
                )
                
        return appointment

class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = AuditLog
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='client.username')
    artist_name = serializers.ReadOnlyField(source='artist.username')

    class Meta:
        model = Payment
        fields = '__all__'

class ArtistPayoutSerializer(serializers.ModelSerializer):
    artist_name = serializers.ReadOnlyField(source='artist.username')

    class Meta:
        model = ArtistPayout
        fields = '__all__'


from .models import ArtistWorkingHours, ArtistShift, ArtistLeave

class ArtistWorkingHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtistWorkingHours
        fields = '__all__'

class ArtistShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtistShift
        fields = '__all__'

class ArtistLeaveSerializer(serializers.ModelSerializer):
    artist_name = serializers.ReadOnlyField(source='artist.username')
    reviewed_by_name = serializers.ReadOnlyField(source='reviewed_by.username')
    class Meta:
        model = ArtistLeave
        fields = '__all__'
        read_only_fields = ('artist', 'reviewed_by', 'reviewed_at', 'status')
