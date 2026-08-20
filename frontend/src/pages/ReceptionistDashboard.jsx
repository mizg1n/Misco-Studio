import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import AppointmentCheckoutModal from '../components/AppointmentCheckoutModal';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ReceptionistDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedArtists, setSelectedArtists] = useState({});

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

  const handleStatusChange = async (id, newStatus, existingArtistId = null) => {
    const payload = { status: newStatus };
    
    if (newStatus === 'APPROVED') {
      if (existingArtistId) {
        payload.artist = existingArtistId;
      } else {
        let artistId = selectedArtists[id];
        if (!artistId) {
          alert('Lütfen onaylamadan önce bir sanatçı atayınız.');
          return;
        }
        payload.artist = artistId;
      }
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

  const pendingAppointments = appointments.filter(a => a.status === 'PENDING');
  const approvedAppointments = appointments.filter(a => a.status === 'APPROVED');
  const completedAppointments = appointments.filter(a => a.status === 'COMPLETED');
  const rejectedAppointments = appointments.filter(a => a.status === 'REJECTED');

  const renderAppointmentCard = (apt, showActions = false) => (
    <div key={apt.id} className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            apt.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
            apt.status === 'APPROVED' ? 'bg-yellow-500/20 text-yellow-400' :
            apt.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {apt.status === 'PENDING' ? 'Onay Bekliyor' : 
             apt.status === 'APPROVED' ? 'Onaylandı' :
             apt.status === 'COMPLETED' ? 'Tamamlandı' : 'Reddedildi'}
          </span>
          <span className="text-sm text-slate-400 font-medium">
            {new Date(apt.scheduled_at).toLocaleString('tr-TR')}
          </span>
        </div>
        <h3 className="text-lg font-medium text-slate-200">
          {apt.service_type === 'TATTOO' ? 'Dövme' : 'Piercing'} İşlemi
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Müşteri: <span className="text-slate-300 font-medium">{apt.customer_name}</span>
          {apt.artist_name && <> | Artist: <span className="text-slate-300 font-medium">{apt.artist_name}</span></>}
        </p>
        <div className="mt-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-300 whitespace-pre-wrap">{apt.description}</p>
        </div>
      </div>
      
      {showActions && (
        <div className="flex flex-col gap-3 min-w-[200px]">
          {apt.status === 'PENDING' && (
            <>
              {!apt.artist && (
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
              )}
              
              <div className="flex gap-2 w-full">
                <button 
                  onClick={() => handleStatusChange(apt.id, 'APPROVED', apt.artist)}
                  className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm font-medium transition-colors"
                >
                  Onayla
                </button>
                <button 
                  onClick={() => handleStatusChange(apt.id, 'REJECTED', apt.artist)}
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
              className="w-full px-4 py-2 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg text-sm font-medium transition-colors"
            >
              Tamamlandı İşaretle
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Özet Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
            <Clock className="text-yellow-400" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{pendingAppointments.length}</p>
            <p className="text-xs text-slate-400">Onay Bekleyen</p>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
            <CheckCircle className="text-yellow-400" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{approvedAppointments.length}</p>
            <p className="text-xs text-slate-400">Onaylanmış</p>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <CheckCircle className="text-green-400" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{completedAppointments.length}</p>
            <p className="text-xs text-slate-400">Tamamlanmış</p>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
            <XCircle className="text-rose-400" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{rejectedAppointments.length}</p>
            <p className="text-xs text-slate-400">Reddedilmiş</p>
          </div>
        </div>
      </div>

      {/* Onay Bekleyenler */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
          <AlertCircle className="text-yellow-400" size={22} />
          Onay Bekleyen Randevular
          {pendingAppointments.length > 0 && (
            <span className="ml-2 text-sm bg-yellow-500/20 text-yellow-400 px-2.5 py-0.5 rounded-full">{pendingAppointments.length}</span>
          )}
        </h2>
        {pendingAppointments.length === 0 ? (
          <div className="glass-panel p-6 rounded-2xl text-center">
            <p className="text-slate-400">Şu an onay bekleyen randevu bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingAppointments.map(apt => renderAppointmentCard(apt, true))}
          </div>
        )}
      </div>

      {/* Ödeme Bekleyenler (Artist tarafından tamamlananlar) */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
          <CheckCircle className="text-green-400" size={22} />
          Ödeme Bekleyen İşlemler
          {completedAppointments.length > 0 && (
            <span className="ml-2 text-sm bg-green-500/20 text-green-400 px-2.5 py-0.5 rounded-full">{completedAppointments.length}</span>
          )}
        </h2>
        {completedAppointments.length === 0 ? (
          <div className="glass-panel p-6 rounded-2xl text-center">
            <p className="text-slate-400">Şu an ödeme bekleyen işlem bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {completedAppointments.map(apt => (
              <div key={apt.id} className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-green-500/20">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                      Yapıldı - Ödeme Bekliyor
                    </span>
                    <span className="text-sm text-slate-400 font-medium">
                      {new Date(apt.scheduled_at).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-slate-200">
                    {apt.service_type === 'TATTOO' ? 'Dövme' : 'Piercing'} İşlemi
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Müşteri: <span className="text-slate-300 font-medium">{apt.customer_name}</span> | 
                    Artist: <span className="text-slate-300 font-medium">{apt.artist_name}</span>
                  </p>
                  <div className="mt-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{apt.description}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedAppointment(apt); setCheckoutModalOpen(true); }}
                  className="px-6 py-3 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 rounded-lg text-sm font-semibold transition-colors border border-yellow-500/30 hover:border-yellow-500/50 min-w-[140px]"
                >
                  💰 Tahsilat / Ödeme
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <AppointmentCheckoutModal 
        isOpen={checkoutModalOpen} 
        onClose={() => setCheckoutModalOpen(false)} 
        appointment={selectedAppointment} 
        onCheckoutComplete={() => {
          fetchAppointments();
          setCheckoutModalOpen(false);
        }}
      />
    </div>
  );
};

export default ReceptionistDashboard;
