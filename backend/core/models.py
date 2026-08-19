from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('CUSTOMER', 'Müşteri'),
        ('ARTIST', 'Artist'),
        ('RECEPTIONIST', 'Resepsiyon'),
        ('ADMIN', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CUSTOMER')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    PAYOUT_CHOICES = (
        ('PERCENTAGE', 'Yüzdelik'),
        ('FIXED_PER_SESSION', 'Seans Başı Sabit'),
        ('HYBRID', 'Hibrit'),
    )
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=50.00, help_text="% olarak")
    payout_type = models.CharField(max_length=20, choices=PAYOUT_CHOICES, default='PERCENTAGE')

    def __str__(self):
        return f"{self.username} - {self.role}"

class PriceList(models.fields.Field):
    pass # Wait, let's just make it a normal model
    
class PriceList(models.Model):
    CATEGORY_CHOICES = (
        ('TATTOO', 'Dövme'),
        ('PIERCING_EAR', 'Kulak Piercingleri'),
        ('PIERCING_BODY', 'Vücut Piercingleri'),
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=255)
    min_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    max_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.category})"

class CareInstruction(models.Model):
    CATEGORY_CHOICES = (
        ('TATTOO', 'Dövme'),
        ('PIERCING', 'Piercing'),
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=255)
    content = models.TextField()

    def __str__(self):
        return self.title

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Bekliyor'),
        ('APPROVED', 'Onaylandı'),
        ('COMPLETED', 'Tamamlandı'),
        ('PAID', 'Ödendi'),
        ('REJECTED', 'Reddedildi'),
    )
    SERVICE_CHOICES = (
        ('TATTOO', 'Dövme'),
        ('PIERCING', 'Piercing'),
    )
    
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments')
    artist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_appointments', limit_choices_to={'role': 'ARTIST'})
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    service_type = models.CharField(max_length=20, choices=SERVICE_CHOICES)
    description = models.TextField(blank=True, null=True)
    reference_image = models.ImageField(upload_to='appointments/references/', null=True, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.customer.username} - {self.service_type} - {self.status}"

class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action_type = models.CharField(max_length=50) # e.g. CREATE, UPDATE, DELETE
    target_model = models.CharField(max_length=100)
    target_id = models.CharField(max_length=255, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action_type} - {self.target_model}"

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ('CASH', 'Nakit'),
        ('CREDIT_CARD', 'Kredi Kartı'),
        ('TRANSFER', 'Havale/EFT'),
        ('SPLIT', 'Parçalı'),
    )
    STATUS_CHOICES = (
        ('PENDING', 'Bekliyor'),
        ('COMPLETED', 'Tamamlandı'),
        ('REFUNDED', 'İade Edildi'),
    )
    
    appointment = models.OneToOneField('Appointment', on_delete=models.CASCADE, related_name='payment')
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='payments_made')
    artist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='payments_received')
    
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0) # total - discount
    
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='CASH')
    cash_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    card_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    paid_at = models.DateTimeField(auto_now_add=True)
    
    # Financial tracking fields to avoid complex joins later
    artist_commission_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    studio_cut_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    def __str__(self):
        return f"Payment #{self.id} for Appt {self.appointment.id}"

class ArtistPayout(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Taslak'),
        ('PAID', 'Ödendi'),
        ('CANCELLED', 'İptal'),
    )
    
    artist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payouts')
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    
    total_turnover = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    salon_cut = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    net_payout = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    paid_at = models.DateTimeField(null=True, blank=True)
    receipt_notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Payout {self.artist.username} - {self.net_payout}"


class ArtistWorkingHours(models.Model):
    artist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='working_hours', limit_choices_to={'role': 'ARTIST'})
    day_of_week = models.IntegerField(choices=[(0, 'Pazartesi'), (1, 'Salı'), (2, 'Çarşamba'), (3, 'Perşembe'), (4, 'Cuma'), (5, 'Cumartesi'), (6, 'Pazar')])
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('artist', 'day_of_week')
        
class ArtistShift(models.Model):
    artist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shifts', limit_choices_to={'role': 'ARTIST'})
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    is_working_day = models.BooleanField(default=True)
    note = models.CharField(max_length=255, blank=True, null=True)

class ArtistLeave(models.Model):
    LEAVE_CHOICES = (
        ('ANNUAL', 'Yıllık İzin'),
        ('SICK', 'Hastalık İzni'),
        ('UNPAID', 'Ücretsiz İzin'),
        ('CASUAL', 'Mazeret İzni'),
    )
    STATUS_CHOICES = (
        ('PENDING', 'Bekliyor'),
        ('APPROVED', 'Onaylandı'),
        ('REJECTED', 'Reddedildi'),
        ('CANCELLED', 'İptal Edildi'),
    )
    artist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='leaves', limit_choices_to={'role': 'ARTIST'})
    leave_type = models.CharField(max_length=20, choices=LEAVE_CHOICES)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_leaves', limit_choices_to={'role': 'ADMIN'})
    reviewed_at = models.DateTimeField(null=True, blank=True)
