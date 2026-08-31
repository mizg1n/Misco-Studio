import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { Calendar, Clock, AlertCircle , UserPlus } from "lucide-react";

const AdminShifts = () => {
  const [workingHours, setWorkingHours] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', phone_number: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

  const fetchData = async () => {
    try {
      const [whRes, artistsRes, shiftsRes] = await Promise.all([
        axiosInstance.get("/working-hours/"),
        axiosInstance.get("/users/"),
        axiosInstance.get("/shifts/")
      ]);
      setWorkingHours(whRes.data);
      setArtists(artistsRes.data.filter(u => u.role === "ARTIST"));
      setShifts(shiftsRes.data);
    } catch (error) {
      console.error("Error fetching shift data", error);
    } finally {
      setLoading(false);
    }
  };

  
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
      fetchData(); // refresh list
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

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="text-slate-400">Yükleniyor...</div>;
  
  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="text-yellow-400" size={24} />
            Personel Vardiya Matrisi
          </h2>
          <button 
            onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 font-medium rounded-lg border border-yellow-500/20 transition-colors"
          >
            <UserPlus size={18} />
            Artist Ekle
          </button>
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-sm mb-6">
            ✓ {success}
          </div>
        )}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {DAYS.map((dayName, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDay(idx)}
              className={selectedDay === idx ? "px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-yellow-500 text-white shadow-lg shadow-yellow-500/20" : "px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"}
            >
              {dayName}
            </button>
          ))}
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium w-1/3">Sanatçı</th>
                <th className="px-6 py-4 font-medium w-1/3">Mesai Saatleri</th>
                <th className="px-6 py-4 font-medium w-1/3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {artists.map(artist => {
                const wh = workingHours.find(w => w.artist === artist.id && w.day_of_week === selectedDay);
                return (
                  <tr key={artist.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-300 font-bold">
                        {artist.username.charAt(0).toUpperCase()}
                      </div>
                      {artist.username}
                    </td>
                    <td className="px-6 py-4">
                      {wh ? (
                        wh.is_active ? (
                          <div className="flex items-center gap-2 text-yellow-300 font-medium">
                            <Clock size={16} />
                            {wh.start_time.substring(0,5)} - {wh.end_time.substring(0,5)}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Çalışmıyor</span>
                        )
                      ) : (
                        <span className="text-slate-500 italic">Tanımlanmamış</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {wh && wh.is_active ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                          Aktif (Mesai Var)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-400">
                          Kapalı (İzinli)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-slate-200"
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
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-slate-200"
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
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-slate-200"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Şifre</label>
                <input
                  type="password"
                  name="password"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-slate-200"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 rounded-lg font-medium text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                >
                  {formLoading ? 'Ekleniyor...' : 'Artist Ekle'}
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

export default AdminShifts;