import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const ReceptionistCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div className="text-slate-400">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100">Tüm Salon Randevuları</h2>
      
      {appointments.filter(a => a.status !== 'PENDING' && a.status !== 'REJECTED').length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center">
          <p className="text-slate-400">Takvimde henüz onaylanmış randevu bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.filter(a => a.status !== 'PENDING' && a.status !== 'REJECTED').map((apt) => (
            <div key={apt.id} className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    apt.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                    apt.status === 'APPROVED' ? 'bg-blue-500/20 text-blue-400' :
                    apt.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {apt.status}
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
                <p className="text-sm text-slate-300 mt-2 whitespace-pre-wrap">{apt.description}</p>
              </div>
              
              <div className="flex flex-col gap-3 min-w-[200px]">
                {apt.status === 'PENDING' && (
                  <>
                    <select
                      className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 text-slate-200"
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
                {apt.status === 'APPROVED' && (
                  <button 
                    onClick={() => handleStatusChange(apt.id, 'COMPLETED')}
                    className="w-full px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    Tamamlandı İşaretle
                  </button>
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
