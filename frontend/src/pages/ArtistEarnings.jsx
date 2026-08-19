import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { DollarSign, Activity, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const ArtistEarnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await axiosInstance.get('/finance/my_earnings/');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching earnings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEarnings();
  }, []);

  if (loading) return <div className="text-center p-8 text-slate-400">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
        <DollarSign className="text-rose-400" />
        Hakediş & Kazançlarım
      </h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5">
          <p className="text-slate-400 text-sm">Toplam Kazancım</p>
          <h3 className="text-3xl font-bold text-rose-400 mt-1">
            ₺{parseFloat(data?.my_commission || 0).toLocaleString()}
          </h3>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-slate-400 text-sm">Ürettiğim Ciro</p>
          <h3 className="text-3xl font-bold text-white mt-1">
            ₺{parseFloat(data?.total_turnover || 0).toLocaleString()}
          </h3>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-slate-400 text-sm">Tamamlanan İşlem</p>
          <h3 className="text-3xl font-bold text-purple-400 mt-1 flex items-center gap-2">
            <Activity size={24} />
            {data?.total_sessions || 0}
          </h3>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-purple-400" />
          Son İşlemlerim (Özet)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/50 text-slate-400">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Tarih</th>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Toplam Tutar</th>
                <th className="px-4 py-3">Benim Payım</th>
                <th className="px-4 py-3 rounded-tr-lg">Durum</th>
              </tr>
            </thead>
            <tbody>
              {data?.recent_payments?.map((payment, idx) => (
                <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-slate-400">
                    {format(new Date(payment.paid_at), 'dd MMM yyyy, HH:mm', { locale: tr })}
                  </td>
                  <td className="px-4 py-3 text-white">{payment.client_name || 'Bilinmiyor'}</td>
                  <td className="px-4 py-3">₺{parseFloat(payment.final_amount).toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-rose-400">₺{parseFloat(payment.artist_commission_amount).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">
                      {payment.status === 'COMPLETED' ? 'Tamamlandı' : payment.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!data?.recent_payments || data?.recent_payments.length === 0) && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    Henüz işlem bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ArtistEarnings;
