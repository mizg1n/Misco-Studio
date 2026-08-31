import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { DollarSign, TrendingUp, Users, PieChart as PieChartIcon , UserPlus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const AdminFinance = () => {
  const [stats, setStats] = useState(null);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', phone_number: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [dashboardStats, setDashboardStats] = useState({ total: 0, tattoos: 0, piercings: 0 });

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const statsRes = await axiosInstance.get('/finance/dashboard_stats/');
        setStats(statsRes.data);
        
        const artistRes = await axiosInstance.get('/finance/artist_reports/');
        setArtists(artistRes.data);
        const dashRes = await axiosInstance.get('/appointments/stats/');
        setDashboardStats(dashRes.data);
      } catch (err) {
        console.error('Error fetching finance data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFinanceData();
  }, []);

  if (loading) return <div className="text-center p-8 text-slate-400">Yükleniyor...</div>;

  const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981'];
  
    const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      const registerRes = await axiosInstance.post('/auth/register/', formData);
      const userId = registerRes.data.id;
      await axiosInstance.patch(`/users/${userId}/`, { role: 'ARTIST' });
      
      setSuccess(`"${formData.username}" kullanıcısı Artist olarak başarıyla eklendi!`);
      setFormData({ username: '', email: '', password: '', phone_number: '' });
      setShowForm(false);
    } catch (err) {
      if (err.response?.data) {
        const msgs = Object.values(err.response.data).flat().join(' ');
        setError(`Hata: ${msgs}`);
      } else {
        setError('Artist eklenirken bir hata oluştu.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const paymentMethodData = stats?.methods_split?.map(m => ({
    name: m.payment_method,
    value: parseFloat(m.total)
  })) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
        <DollarSign className="text-yellow-400" />
        Finans ve İşlemler
      </h2>

      {/* İşlem KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-6 rounded-2xl">
          <h4 className="text-slate-400 text-sm mb-1">Toplam Randevu</h4>
          <span className="text-3xl font-bold text-white">{dashboardStats.total}</span>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <h4 className="text-slate-400 text-sm mb-1">Gerçekleşen Dövme</h4>
          <span className="text-3xl font-bold text-white">{dashboardStats.tattoos}</span>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <h4 className="text-slate-400 text-sm mb-1">Gerçekleşen Piercing</h4>
          <span className="text-3xl font-bold text-white">{dashboardStats.piercings}</span>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <h4 className="text-slate-400 text-sm mb-1">Toplam İşlem</h4>
          <span className="text-3xl font-bold text-yellow-400">{stats?.total_sessions || 0}</span>
        </div>
      </div>
      
      {/* Başarı Mesajı */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-sm">
          ✓ {success}
        </div>
      )}

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-slate-400 text-sm">Toplam Ciro</p>
          <h3 className="text-3xl font-bold text-white mt-1">
            ₺{parseFloat(stats?.total_turnover || 0).toLocaleString()}
          </h3>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-slate-400 text-sm">Net Salon Geliri</p>
          <h3 className="text-3xl font-bold text-emerald-400 mt-1">
            ₺{parseFloat(stats?.total_studio_net || 0).toLocaleString()}
          </h3>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-slate-400 text-sm">Toplam Sanatçı Hakedişi</p>
          <h3 className="text-3xl font-bold text-rose-400 mt-1">
            ₺{parseFloat(stats?.total_artist_payouts || 0).toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods Chart */}
        <div className="glass-panel rounded-2xl p-6 col-span-1 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <PieChartIcon size={20} className="text-yellow-400" />
            Ödeme Dağılımı
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `₺${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Artist Reports Table */}
        <div className="glass-panel rounded-2xl p-6 col-span-1 lg:col-span-2 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Users size={20} className="text-rose-400" />
            Sanatçı Performans & Hakedişleri
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Sanatçı</th>
                  <th className="px-4 py-3">Oran</th>
                  <th className="px-4 py-3">İşlem</th>
                  <th className="px-4 py-3">Brüt Ciro</th>
                  <th className="px-4 py-3">Hakediş (Sanatçı)</th>
                  <th className="px-4 py-3 rounded-tr-lg">Stüdyo Net</th>
                </tr>
              </thead>
              <tbody>
                {artists.map((artist, idx) => (
                  <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{artist.artist_name}</td>
                    <td className="px-4 py-3 text-yellow-400">%{artist.commission_rate}</td>
                    <td className="px-4 py-3">{artist.sessions}</td>
                    <td className="px-4 py-3 text-slate-300">₺{parseFloat(artist.turnover).toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-rose-400">₺{parseFloat(artist.commission).toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-400">₺{parseFloat(artist.studio).toLocaleString()}</td>
                  </tr>
                ))}
                {artists.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                      Henüz veri bulunmuyor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>


    </div>
  );
};

export default AdminFinance;
