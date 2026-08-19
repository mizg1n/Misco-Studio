import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import CareInstruction

def seed_care_instructions():
    tattoo_content = """Dövme Bakımı Nasıl Yapılır?

1. Streç Filmi Çıkarma: Sanatçınızın sardığı koruyucu filmi işlemden 2-3 saat sonra yavaşça çıkarın.
2. Yıkama: Dövmenizi ılık su ve antibakteriyel, kokusuz bir sabunla (örn: bebek şampuanı) nazikçe yıkayın. Kesinlikle kese veya lif kullanmayın.
3. Kurulama: Temiz bir kağıt havlu ile hafifçe dokunarak (tampon hareketlerle) kurulayın. Havlu kullanmayın, havlular bakteri barındırabilir.
4. Kremleme: Günde 2-3 defa, sanatçınızın önerdiği bakım kremini çok ince bir tabaka halinde uygulayın. Derinin hava alması gerektiği için çok fazla krem sürmekten kaçının.
5. Kabuklanma Dönemi: Birkaç gün içinde dövmeniz kabuklanacak, kaşınacak ve soyulacaktır. Kesinlikle kabukları soymayın, koparmayın veya kaşımayın!
6. Su ve Güneş: İlk 2 hafta boyunca küvet, havuz, deniz, sauna ve doğrudan güneş ışığından uzak durun."""

    piercing_content = """Piercing Bakımı Nasıl Yapılır?

1. Dokunmayın: Piercinginize iyileşme süreci boyunca ellerinizi yıkamadan KESİNLİKLE dokunmayın ve oynamayın.
2. Temizleme: Günde 2 defa steril serum fizyolojik (tuzlu su solüsyonu) ile bölgeyi temizleyin. Kulak pamuğu kullanarak piercingin etrafında biriken kabukları nazikçe yumuşatarak alın.
3. Çevirmeyin: Takıyı sürekli çevirmek veya ileri geri hareket ettirmek iyileşmekte olan dokuyu yırtar ve enfeksiyon riskini artırır.
4. Kozmetik Ürünler: İyileşme süresince piercingli bölgeye parfüm, makyaj malzemesi veya krem temas ettirmeyin.
5. Uyku: Yeni piercinginizin (özellikle kulak kıkırdak piercinglerinde) üzerine yatmaktan kaçının. Baskı, piercingin iyileşme açısını bozabilir.
6. Takı Değişimi: İyileşme süreci tamamlanmadan (bölgeye göre 2-6 ay sürebilir) ilk takınızı çıkarmayın veya kendiniz değiştirmeyin."""

    if not CareInstruction.objects.filter(category='TATTOO').exists():
        CareInstruction.objects.create(category='TATTOO', title='Dövme Sonrası Bakım Süreci', content=tattoo_content)
        print("Dövme bakım yönergesi eklendi.")
    else:
        # Update existing
        ci = CareInstruction.objects.get(category='TATTOO')
        ci.title = 'Dövme Sonrası Bakım Süreci'
        ci.content = tattoo_content
        ci.save()
        print("Dövme bakım yönergesi güncellendi.")
        
    if not CareInstruction.objects.filter(category='PIERCING').exists():
        CareInstruction.objects.create(category='PIERCING', title='Piercing Sonrası Bakım Süreci', content=piercing_content)
        print("Piercing bakım yönergesi eklendi.")
    else:
        # Update existing
        ci = CareInstruction.objects.get(category='PIERCING')
        ci.title = 'Piercing Sonrası Bakım Süreci'
        ci.content = piercing_content
        ci.save()
        print("Piercing bakım yönergesi güncellendi.")

if __name__ == '__main__':
    seed_care_instructions()
