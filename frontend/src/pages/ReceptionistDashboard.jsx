import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import { Clock, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';
import { useMemo } from 'react';

const ReceptionistDashboard = () => {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtists, setSelectedArtists] = useState({});
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectAptId, setRejectAptId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert("Lütfen reddetme nedeni girin.");
      return;
    }
    try {
      await axiosInstance.patch(`/appointments/${rejectAptId}/`, { status: 'REJECTED', rejection_reason: rejectReason });
      setRejectModalOpen(false);
      setRejectAptId(null);
      setRejectReason("");
      fetchAppointments();
    } catch (error) {
      alert('Durum güncellenirken hata oluştu.');
    }
  };

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

  const pendingAppointments = appointments.filter(a => a.status === 'PENDING');
  const approvedAppointments = appointments.filter(a => a.status === 'APPROVED');
  const completedAppointments = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'PAID');
  const rejectedAppointments = appointments.filter(a => a.status === 'REJECTED');

  const renderAppointmentCard = (apt, showActions = false) => (
    <div key={apt.id} className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            (apt.status === 'COMPLETED' || apt.status === 'PAID') ? 'bg-green-500/20 text-green-400' :
            apt.status === 'APPROVED' ? 'bg-yellow-500/20 text-yellow-400' :
            apt.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {apt.status === 'PENDING' ? 'Onay Bekliyor' : 
             apt.status === 'APPROVED' ? 'Onaylandı' :
             (apt.status === 'COMPLETED' || apt.status === 'PAID') ? 'Tamamlandı' : 'Reddedildi'}
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
        {apt.description && (
          <div className="mt-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{apt.description}</p>
          </div>
        )}
      </div>
      
      {(showActions || (apt.status === 'REJECTED' && apt.rejection_reason)) && (
        <div className="flex flex-col gap-3 min-w-[200px]">
          {apt.status === 'REJECTED' && apt.rejection_reason && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl h-full flex flex-col justify-center">
              <p className="text-xs text-rose-400 font-semibold mb-1">Reddetme Nedeni:</p>
              <p className="text-sm text-rose-200">{apt.rejection_reason}</p>
            </div>
          )}
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
                  onClick={() => { setRejectAptId(apt.id); setRejectModalOpen(true); }}
                  className="flex-1 px-4 py-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg text-sm font-medium transition-colors"
                >
                  Reddet
                </button>
              </div>
            </>
          )}


        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
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

      <div className="mt-8">
        {filteredAppointments.length === 0 ? (
          <div className="glass-panel p-6 rounded-2xl text-center">
            <p className="text-slate-400">Aranan kriterlere uygun randevu bulunamadı.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAppointments.map(apt => renderAppointmentCard(apt, true))}
          </div>
        )}
      </div>



      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-slate-900 border border-slate-700/50 p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-100 mb-2">Randevuyu Reddet</h3>
            <p className="text-sm text-slate-400 mb-4">Lütfen müşteriye iletilecek reddetme nedenini yazın.</p>
            <textarea
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-lg focus:outline-none focus:border-rose-500 text-slate-200 h-24 resize-none mb-4"
              placeholder="Örn: Bu saatte sanatçımızın farklı bir işlemi uzayacağı için uygun değiliz..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => { setRejectModalOpen(false); setRejectAptId(null); setRejectReason(""); }}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button 
                onClick={handleRejectSubmit}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg shadow-lg shadow-rose-500/20 transition-colors"
              >
                Randevuyu Reddet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;
