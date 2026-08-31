import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import { Search } from 'lucide-react';

const ReceptionistCalendar = () => {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [selectedArtists, setSelectedArtists] = useState({}); // { appointment_id: artist_id }

  const fetchAppointments = async () => {
    try {
      const res = await axiosInstance.get('/appointments/');
      const sortedData = res.data.sort((a, b) => b.id - a.id);
      setAppointments(sortedData);
    } catch (error) {
      console.error('Randevular yüklenemedi', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtists = async () => {
    try {
      const res = await axiosInstance.get('/users/');
      // Django API returns all users (receptionist has permission now)
      const artistList = res.data.filter(u => u.role === 'ARTIST');
      setArtists(artistList);
    } catch (error) {
      console.error('Artistler yüklenemedi', error);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchArtists();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const payload = { status: newStatus };
    
    if (newStatus === 'APPROVED') {
      const artistId = selectedArtists[id];
      if (!artistId) {
        alert('Lütfen onaylamadan önce bir Artist seçin!');
        return;
      }
      payload.artist = artistId;
    }

    try {
      await axiosInstance.patch(`/appointments/${id}/`, payload);
      fetchAppointments();
    } catch (error) {
      alert('Durum güncellenirken hata oluştu.');
    }
  };

  const handleArtistSelect = (aptId, artistId) => {
    setSelectedArtists(prev => ({ ...prev, [aptId]: artistId }));
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      let matchesStatus = true;
      if (selectedFilter === 'APPROVED') {
        matchesStatus = item.status === 'APPROVED';
      } else if (selectedFilter === 'COMPLETED') {
        matchesStatus = item.status === 'COMPLETED' || item.status === 'PAID';
      } else if (selectedFilter === 'REJECTED') {
        matchesStatus = item.status === 'REJECTED' || item.status === 'CANCELLED';
      }

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.customer_name?.toLowerCase().includes(query) ||
        item.artist_name?.toLowerCase().includes(query) ||
        item.service_type?.toLowerCase().includes(query) ||
        (item.scheduled_at && new Date(item.scheduled_at).toLocaleString('tr-TR').includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [appointments, selectedFilter, searchQuery]);

  if (loading) return <div className="text-slate-400">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      {/* Filtre ve Arama */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-100">Tüm Salon Randevuları</h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg focus:outline-none focus:border-yellow-500 text-slate-200 text-sm"
          >
            <option value="ALL">Tümü</option>
            <option value="APPROVED">Onaylananlar</option>
            <option value="COMPLETED">Tamamlananlar</option>
            <option value="REJECTED">Reddedilenler</option>
          </select>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg focus:outline-none focus:border-yellow-500 text-slate-200 text-sm"
            />
          </div>
        </div>
      </div>
      
      {filteredAppointments.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center">
          <p className="text-slate-400">Takvimde henüz onaylanmış randevu bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((apt) => (
            <div key={apt.id} className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    (apt.status === 'COMPLETED' || apt.status === 'PAID') ? 'bg-green-500/20 text-green-400' :
                    apt.status === 'APPROVED' ? 'bg-yellow-500/20 text-yellow-400' :
                    apt.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {apt.status === 'PENDING' ? 'Onay Bekliyor' : apt.status === 'APPROVED' ? 'Onaylandı' : (apt.status === 'COMPLETED' || apt.status === 'PAID') ? 'Tamamlandı' : 'Reddedildi'}
                  </span>
                  <span className="text-sm text-slate-400 font-medium">
                    {new Date(apt.scheduled_at).toLocaleString('tr-TR')}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-slate-200">
                  {apt.service_type === 'TATTOO' ? 'Dövme' : 'Piercing'} İşlemi
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Müşteri: <span className="text-slate-300">{apt.customer_name}</span> | 
                  Artist: <span className="text-slate-300">{apt.artist_name || 'Atanmadı'}</span>
                </p>
                {apt.description && (
                  <div className="mt-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{apt.description}</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3 min-w-[200px]">
                {apt.status === 'REJECTED' && apt.rejection_reason && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl h-full flex flex-col justify-center">
                    <p className="text-xs text-rose-400 font-semibold mb-1">Reddetme Nedeni:</p>
                    <p className="text-sm text-rose-200">{apt.rejection_reason}</p>
                  </div>
                )}
                {apt.status === 'PENDING' && (
                  <>
                    <select
                      className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-yellow-500 text-slate-200"
                      value={selectedArtists[apt.id] || ''}
                      onChange={(e) => handleArtistSelect(apt.id, e.target.value)}
                    >
                      <option value="" disabled>Artist Seçin...</option>
                      {artists.map(artist => (
                        <option key={artist.id} value={artist.id}>{artist.username}</option>
                      ))}
                    </select>
                    
                    <div className="flex gap-2 w-full">
                      <button 
                        onClick={() => handleStatusChange(apt.id, 'APPROVED')}
                        className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm font-medium transition-colors"
                      >
                        Onayla
                      </button>
                      <button 
                        onClick={() => handleStatusChange(apt.id, 'REJECTED')}
                        className="flex-1 px-4 py-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg text-sm font-medium transition-colors"
                      >
                        Reddet
                      </button>
                    </div>
                  </>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceptionistCalendar;
