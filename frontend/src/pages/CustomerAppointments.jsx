import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const CustomerAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axiosInstance.get('/appointments/');
        // Reverse so the newest (highest ID/created_at) appear at the top
        setAppointments(res.data.reverse());
      } catch (error) {
        console.error('Randevular yüklenemedi', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) return <div className="text-slate-400">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100">Geçmiş ve Mevcut Randevularım</h2>
      
      {appointments.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center">
          <p className="text-slate-400">Henüz bir randevu talebiniz bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((apt) => (
            <div key={apt.id} className={`glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 ${
              apt.status === 'COMPLETED' || apt.status === 'PAID' ? 'border-green-500/50 bg-green-500/5' :
              apt.status === 'APPROVED' ? 'border-yellow-500/50 bg-yellow-500/5' :
              apt.status === 'REJECTED' ? 'border-rose-500/50 bg-rose-500/5' :
              'border-yellow-500/50 bg-yellow-500/5'
            }`}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                    apt.status === 'COMPLETED' || apt.status === 'PAID' ? 'bg-green-500/20 text-green-400' :
                    apt.status === 'APPROVED' ? 'bg-yellow-500/20 text-yellow-400' :
                    apt.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {apt.status === 'COMPLETED' || apt.status === 'PAID' ? <CheckCircle size={14} /> :
                     apt.status === 'APPROVED' ? <CheckCircle size={14} /> :
                     apt.status === 'REJECTED' ? <XCircle size={14} /> :
                     <Clock size={14} />}
                    
                    {apt.status === 'PENDING' ? 'Onay Bekliyor' : 
                     apt.status === 'APPROVED' ? 'Onaylandı' :
                     apt.status === 'COMPLETED' || apt.status === 'PAID' ? 'Tamamlandı' : 'Reddedildi'}
                  </span>
                  {apt.scheduled_at && (
                    <span className="text-sm text-slate-400 font-medium flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(apt.scheduled_at).toLocaleString('tr-TR')}
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-slate-200">
                  {apt.service_type === 'TATTOO' ? 'Dövme' : 'Piercing'} İşlemi
                </h3>
                
                {apt.artist_name && (
                  <p className="text-sm text-slate-400 mt-1">
                    Artist: <span className="text-slate-300 font-medium">{apt.artist_name}</span>
                  </p>
                )}

                <div className="mt-4 p-4 bg-slate-900/60 rounded-xl border border-slate-700/50">
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{apt.description}</p>
                </div>
              </div>
              
              {/* Reddedildi Mesajı */}
              {apt.status === 'REJECTED' && (
                <div className="md:w-64 bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-semibold text-rose-400 mb-1">Randevu İptali</h4>
                    <p className="text-xs text-rose-300/80">Randevu talebiniz reddedilmiştir. Stüdyonun uygunluk durumuna göre başka bir tarih için tekrar talep oluşturabilirsiniz.</p>
                  </div>
                </div>
              )}

              {/* Onay Bekliyor Mesajı */}
              {apt.status === 'PENDING' && (
                <div className="md:w-64 bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-start gap-3">
                  <Clock className="text-yellow-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-400 mb-1">Değerlendiriliyor</h4>
                    <p className="text-xs text-yellow-300/80">Talebiniz resepsiyon tarafından incelenmektedir. Yakında onay durumu güncellenecektir.</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerAppointments;
