import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import PriceList, CareInstruction

User = get_user_model()

def seed():
    print("Seeding database...")
    
    # Create Admin
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123', role='ADMIN')
        print("Created admin user (admin / admin123)")

    # Create Receptionist
    if not User.objects.filter(username='recep').exists():
        User.objects.create_user('recep', 'recep@example.com', 'recep123', role='RECEPTIONIST')
        print("Created receptionist user (recep / recep123)")

    # Create Artist
    if not User.objects.filter(username='artist1').exists():
        User.objects.create_user('artist1', 'artist1@example.com', 'artist123', role='ARTIST')
        print("Created artist user (artist1 / artist123)")

    # Create Customer
    if not User.objects.filter(username='customer1').exists():
        User.objects.create_user('customer1', 'customer1@example.com', 'customer123', role='CUSTOMER')
        print("Created customer user (customer1 / customer123)")

    # Create PriceList
    if not PriceList.objects.exists():
        PriceList.objects.create(category='TATTOO', title='Küçük Boy Dövme (5x5cm)', min_price=500, max_price=1500)
        PriceList.objects.create(category='PIERCING', title='Kulak Memesi', min_price=150, max_price=150)
        print("Created sample price list")

    print("Seeding complete!")

if __name__ == '__main__':
    seed()
