import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const PriceList = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await axiosInstance.get('/pricelist/');
        setPrices(res.data);
      } catch (error) {
        console.error('Fiyatlar yüklenemedi', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

  if (loading) return <div className="text-slate-400">Yükleniyor...</div>;

  const tattoos = prices.filter(p => p.category === 'TATTOO');
  const earPiercings = prices.filter(p => p.category === 'PIERCING_EAR');
  const bodyPiercings = prices.filter(p => p.category === 'PIERCING_BODY');

  const renderPriceSection = (title, items, badgeColor, badgeText) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-10">
        <h3 className="text-xl font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.id} className="glass-panel p-6 rounded-2xl flex justify-between items-center hover:border-purple-500/50 transition-colors">
              <div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeColor}`}>
                  {badgeText}
                </span>
                <h4 className="text-lg font-medium mt-3 text-slate-200">{item.title}</h4>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-pink-400">₺{item.min_price}</span>
                {item.max_price && item.max_price > item.min_price && (
                  <p className="text-xs text-slate-400">başlayan fiyatlarla</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 mb-8">Hizmet Fiyat Listesi</h2>
      
      {renderPriceSection('Dövme Fiyatları', tattoos, 'bg-purple-500/20 text-purple-300', 'Dövme')}
      {renderPriceSection('Kulak Piercingleri', earPiercings, 'bg-blue-500/20 text-blue-300', 'Kulak')}
      {renderPriceSection('Vücut ve Yüz Piercingleri', bodyPiercings, 'bg-emerald-500/20 text-emerald-300', 'Vücut/Yüz')}
      
    </div>
  );
};

export default PriceList;
