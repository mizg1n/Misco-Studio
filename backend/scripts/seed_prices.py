import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import PriceList

def seed_prices():
    prices = [
        # Tattoos
        {'category': 'TATTOO', 'title': 'Orta Boy Dövme (10x10cm)', 'min': 1500, 'max': 3500},
        {'category': 'TATTOO', 'title': 'Büyük Boy Dövme (20x20cm+)', 'min': 3500, 'max': 10000},
        {'category': 'TATTOO', 'title': 'Kol Kaplama (Full Sleeve)', 'min': 15000, 'max': 40000},
        {'category': 'TATTOO', 'title': 'Minimal / İnce Çizgi (Fine Line)', 'min': 500, 'max': 1000},
        {'category': 'TATTOO', 'title': 'Kapak Kapatma (Cover-up)', 'min': 2000, 'max': 7000},
        
        # Piercings
        {'category': 'PIERCING', 'title': 'Tragus / Helix (Kıkırdak)', 'min': 200, 'max': 200},
        {'category': 'PIERCING', 'title': 'Septum / Nostril (Burun)', 'min': 250, 'max': 250},
        {'category': 'PIERCING', 'title': 'Göbek (Navel)', 'min': 300, 'max': 300},
        {'category': 'PIERCING', 'title': 'Dil (Tongue)', 'min': 300, 'max': 300},
        {'category': 'PIERCING', 'title': 'Kaş (Eyebrow)', 'min': 250, 'max': 250},
        {'category': 'PIERCING', 'title': 'Industrial', 'min': 400, 'max': 400},
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

    print("Fiyat listesi başarıyla çeşitlendirildi!")

if __name__ == '__main__':
    seed_prices()
