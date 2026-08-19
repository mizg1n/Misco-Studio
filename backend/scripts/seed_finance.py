import os
import random
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import CustomUser, Appointment, Payment
from core.services.finance import process_appointment_payment

def seed_finance():
    artists = CustomUser.objects.filter(role='ARTIST')
    if not artists.exists():
        print("No artists found.")
        return
        
    customers = CustomUser.objects.filter(role='CUSTOMER')
    if not customers.exists():
        print("No customers found.")
        return
        
    # Get some paid or completed appointments
    appointments = Appointment.objects.all()
    if not appointments.exists():
        # Create some if needed
        pass
        
    # Process payments for appointments that don't have payments
    for appt in appointments:
        if not hasattr(appt, 'payment'):
            if appt.artist is None:
                appt.artist = random.choice(artists)
                appt.save()
                
            total = Decimal(random.randint(500, 3000))
            discount = Decimal(random.choice([0, 0, 0, 100, 200, 50]))
            deposit = Decimal(random.choice([0, 100, 200, 500]))
            payment_method = random.choice(['CASH', 'CREDIT_CARD', 'TRANSFER'])
            
            payment = process_appointment_payment(
                appt, total, discount, deposit, payment_method
            )
            # randomly shift paid_at date for realistic charts
            days_ago = random.randint(0, 30)
            payment.paid_at = timezone.now() - timedelta(days=days_ago)
            payment.save()
            print(f"Created payment for Appt {appt.id}")

if __name__ == '__main__':
    seed_finance()
