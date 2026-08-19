import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import PriceList

def seed_prices():
    # Clear existing piercings to avoid duplicates with old category
    PriceList.objects.filter(category='PIERCING').delete()
    PriceList.objects.filter(category='PIERCING_EAR').delete()
    PriceList.objects.filter(category='PIERCING_BODY').delete()

    prices = [
        # Tattoos (Keeping existing if any, not deleting)
        
        # Ear Piercings (PIERCING_EAR)
        {'category': 'PIERCING_EAR', 'title': 'Kulak Memesi (Lobe)', 'min': 150, 'max': 150},
        {'category': 'PIERCING_EAR', 'title': 'Üst Kulak Memesi (Upper Lobe)', 'min': 150, 'max': 150},
        {'category': 'PIERCING_EAR', 'title': 'Kıkırdak (Helix)', 'min': 200, 'max': 200},
        {'category': 'PIERCING_EAR', 'title': 'Ön Kıkırdak (Forward Helix)', 'min': 250, 'max': 250},
        {'category': 'PIERCING_EAR', 'title': 'Tragus', 'min': 200, 'max': 200},
        {'category': 'PIERCING_EAR', 'title': 'Anti-Tragus', 'min': 250, 'max': 250},
        {'category': 'PIERCING_EAR', 'title': 'Daith', 'min': 300, 'max': 300},
        {'category': 'PIERCING_EAR', 'title': 'Rook', 'min': 300, 'max': 300},
        {'category': 'PIERCING_EAR', 'title': 'Conch', 'min': 250, 'max': 250},
        {'category': 'PIERCING_EAR', 'title': 'Snug', 'min': 300, 'max': 300},
        {'category': 'PIERCING_EAR', 'title': 'Industrial', 'min': 400, 'max': 400},
        
        # Body & Face Piercings (PIERCING_BODY)
        {'category': 'PIERCING_BODY', 'title': 'Burun (Nostril)', 'min': 250, 'max': 250},
        {'category': 'PIERCING_BODY', 'title': 'Septum', 'min': 250, 'max': 250},
        {'category': 'PIERCING_BODY', 'title': 'Göbek (Navel)', 'min': 300, 'max': 300},
        {'category': 'PIERCING_BODY', 'title': 'Dil (Tongue)', 'min': 300, 'max': 300},
        {'category': 'PIERCING_BODY', 'title': 'Kaş (Eyebrow)', 'min': 250, 'max': 250},
        {'category': 'PIERCING_BODY', 'title': 'Dudak (Lip / Labret)', 'min': 250, 'max': 250},
        {'category': 'PIERCING_BODY', 'title': 'Medusa / Monroe', 'min': 300, 'max': 300},
        {'category': 'PIERCING_BODY', 'title': 'Yanak (Dimple)', 'min': 400, 'max': 400},
        {'category': 'PIERCING_BODY', 'title': 'Köprü (Bridge)', 'min': 350, 'max': 350},
        {'category': 'PIERCING_BODY', 'title': 'Göğüs Ucu (Nipple)', 'min': 400, 'max': 400},
        {'category': 'PIERCING_BODY', 'title': 'Yüzey (Surface Piercing)', 'min': 500, 'max': 500},
    ]

    for p in prices:
        if not PriceList.objects.filter(title=p['title']).exists():
            PriceList.objects.create(
                category=p['category'], 
                title=p['title'], 
                min_price=p['min'], 
                max_price=p['max']
            )
            print(f"Eklendi: {p['title']}")
        else:
            print(f"Zaten mevcut: {p['title']}")

    print("Piercing fiyat listesi başarıyla kategorize edildi!")

if __name__ == '__main__':
    seed_prices()
