export const TATTOO_SERVICES = [
  {
    id: 'tattoo-small',
    name: 'Küçük Boy Dövme (5x5cm)',
    category: 'TATTOO',
    image: '/havuc.jpg',
  },
  {
    id: 'tattoo-medium',
    name: 'Orta Boy Dövme (10x10cm)',
    category: 'TATTOO',
    image: '/orta.jpg',
  },
  {
    id: 'tattoo-large',
    name: 'Büyük Boy Dövme (20x20cm+)',
    category: 'TATTOO',
    image: '/buyuk.jpg',
  },
  {
    id: 'tattoo-sleeve',
    name: 'Kol Kaplama (Full Sleeve)',
    category: 'TATTOO',
    image: '/kaplama.jpg',
  },
  {
    id: 'tattoo-fineline',
    name: 'Minimal / İnce Çizgi (Fine Line)',
    category: 'TATTOO',
    image: '/minimal.jpg',
  },
  {
    id: 'tattoo-coverup',
    name: 'Kapatma (Cover-up)',
    category: 'TATTOO',
    image: '/coverUp.jpg',
  },
];

export const PIERCING_SERVICES = [
  {
    id: 'piercing-earlobe',
    name: 'Kulak Memesi (Earlobe)',
    category: 'PIERCING',
    image: '/ear.jpg',
  },
  {
    id: 'piercing-cartilage',
    name: 'Kıkırdak (Helix/Tragus vs.)',
    category: 'PIERCING',
    image: '/helix.jpg',
  },
  {
    id: 'piercing-nose',
    name: 'Burun (Nostril/Septum)',
    category: 'PIERCING',
    image: '/nose.jpg',
  },
  {
    id: 'piercing-body',
    name: 'Vücut (Göbek/Kaş vs.)',
    category: 'PIERCING',
    image: '/body.jpg',
  },
];

export const getServicesByCategory = (category) => {
  return category === 'TATTOO' ? TATTOO_SERVICES : PIERCING_SERVICES;
};
