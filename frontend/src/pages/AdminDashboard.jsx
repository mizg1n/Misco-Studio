import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { UserPlus } from 'lucide-react';

const AdminDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, tattoos: 0, piercings: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/appointments/stats/');
        setStats(res.data);
      } catch (err) {
        console.error('Stats fetch error:', err);
      }
    };
    fetchStats();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Register as customer first, then update role to ARTIST
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
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h4 className="text-slate-400 text-sm mb-1">Toplam Randevu</h4>
          <span className="text-3xl font-bold text-white">{stats.total}</span>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <h4 className="text-slate-400 text-sm mb-1">Gerçekleşen Dövme</h4>
          <span className="text-3xl font-bold text-white">{stats.tattoos}</span>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <h4 className="text-slate-400 text-sm mb-1">Gerçekleşen Piercing</h4>
          <span className="text-3xl font-bold text-white">{stats.piercings}</span>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
          className="glass-panel p-6 rounded-2xl hover:border-purple-500/50 border border-transparent transition-all cursor-pointer text-left group"
        >
          <h4 className="text-slate-400 text-sm mb-1">Yeni Sanatçı</h4>
          <span className="text-3xl font-bold text-purple-400 flex items-center gap-2 group-hover:text-purple-300 transition-colors">
            <UserPlus size={28} />
            Artist Ekle
          </span>
        </button>
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

      {/* Artist Ekleme Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative glass-panel p-8 rounded-2xl w-full max-w-lg mx-4 shadow-2xl border border-slate-700/50">
            <h3 className="text-xl font-bold text-slate-100 mb-6">Yeni Artist Ekle</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Kullanıcı Adı</label>
                <input
                  type="text"
                  name="username"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-200"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">E-posta</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-200"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Telefon</label>
                <input
                  type="tel"
                  name="phone_number"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-200"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Şifre</label>
                <input
                  type="password"
                  name="password"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-200"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-medium text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                >
                  {loading ? 'Ekleniyor...' : 'Artist Ekle'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium text-slate-300 transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
