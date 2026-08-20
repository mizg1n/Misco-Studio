import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const ArtistCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await axiosInstance.get('/appointments/');
      setAppointments(res.data);
    } catch (error) {
      console.error('Randevular yüklenemedi', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleComplete = async (id) => {
    try {
      await axiosInstance.patch(`/appointments/${id}/`, { status: 'COMPLETED' });
      fetchAppointments();
    } catch (error) {
      alert('İşlem güncellenirken hata oluştu.');
    }
  };

  if (loading) return <div className="text-slate-400">Yükleniyor...</div>;

  const activeAppointments = appointments.filter(a => a.status === 'APPROVED');
  const completedAppointments = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'PAID');

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-100">Takvimim ve Randevular</h2>
      
      {/* Aktif Randevular */}
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Aktif Randevular</h3>
        {activeAppointments.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center">
            <p className="text-slate-400">Şu an için aktif bir randevunuz bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeAppointments.map((apt) => (
              <div key={apt.id} className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                      Onaylandı
                    </span>
                    <span className="text-sm text-slate-400 font-medium">
                      {new Date(apt.scheduled_at).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-slate-200">
                    {apt.service_type === 'TATTOO' ? 'Dövme' : 'Piercing'} İşlemi
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Müşteri: <span className="text-slate-300 font-medium">{apt.customer_name}</span></p>
                  <div className="mt-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{apt.description}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleComplete(apt.id)}
                  className="px-6 py-3 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm font-semibold transition-colors border border-green-500/30 hover:border-green-500/50 min-w-[140px]"
                >
                  ✓ Yapıldı
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tamamlanan Randevular */}
      {completedAppointments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Tamamlanan İşlemler</h3>
          <div className="grid gap-4">
            {completedAppointments.map((apt) => (
              <div key={apt.id} className="glass-panel p-5 rounded-2xl flex items-center justify-between opacity-70">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      apt.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {apt.status === 'PAID' ? 'Ödendi' : 'Yapıldı - Ödeme Bekliyor'}
                    </span>
                    <span className="text-sm text-slate-400 font-medium">
                      {new Date(apt.scheduled_at).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-slate-200">
                    {apt.service_type === 'TATTOO' ? 'Dövme' : 'Piercing'} İşlemi
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Müşteri: <span className="text-slate-300 font-medium">{apt.customer_name}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistCalendar;
