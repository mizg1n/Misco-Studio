import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { ShieldAlert, Info, User, Calendar, Settings, Activity, PlusCircle, Edit, Trash2, Search } from 'lucide-react';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axiosInstance.get('/auditlogs/');
        setLogs(res.data);
      } catch (error) {
        console.error('Loglar yüklenemedi', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="text-slate-400 p-8 text-center">İşlem kayıtları yükleniyor...</div>;

  // Yardımcı fonksiyonlar: Teknik terimleri anlaşılır Türkçeye çevirir.
  const getActionInfo = (method) => {
    switch (method) {
      case 'POST': return { text: 'Yeni Kayıt Oluşturuldu', icon: <PlusCircle size={16} />, color: 'text-emerald-400 bg-emerald-500/20' };
      case 'PATCH':
      case 'PUT': return { text: 'Bilgiler Güncellendi', icon: <Edit size={16} />, color: 'text-amber-400 bg-amber-500/20' };
      case 'DELETE': return { text: 'Kayıt Silindi', icon: <Trash2 size={16} />, color: 'text-rose-400 bg-rose-500/20' };
      default: return { text: 'Sistem İşlemi', icon: <Activity size={16} />, color: 'text-slate-400 bg-slate-500/20' };
    }
  };

  const getTargetInfo = (url) => {
    if (url.includes('appointments')) return { text: 'Randevu Sistemi', icon: <Calendar size={16} className="text-yellow-400" /> };
    if (url.includes('users')) return { text: 'Kullanıcı Hesapları', icon: <User size={16} className="text-yellow-400" /> };
    if (url.includes('prices')) return { text: 'Fiyat Listesi', icon: <Settings size={16} className="text-slate-400" /> };
    if (url.includes('care')) return { text: 'Bakım Yönergeleri', icon: <Info size={16} className="text-teal-400" /> };
    return { text: 'Genel Sistem (' + url + ')', icon: <Settings size={16} className="text-slate-500" /> };
  };

  // Filtreleme işlemi
  const filteredLogs = logs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    const action = getActionInfo(log.action_type);
    const target = getTargetInfo(log.target_model);
    
    return (
      (log.user_name || 'Misafir').toLowerCase().includes(searchLower) ||
      action.text.toLowerCase().includes(searchLower) ||
      target.text.toLowerCase().includes(searchLower) ||
      (log.ip_address || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Başlık ve Açıklama Paneli */}
      <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-yellow-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldAlert size={120} />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3 mb-3">
            <ShieldAlert className="text-yellow-400" />
            Sistem İşlem Kayıtları (Güvenlik Kamerası)
          </h2>
          <p className="text-slate-300 mb-2 leading-relaxed max-w-3xl">
            Bu sayfa, stüdyonuzun dijital <strong>güvenlik kamerasıdır.</strong> Sistemde kimin, ne zaman, hangi değişikliği yaptığını takip etmenizi sağlar.
          </p>
          <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside max-w-3xl">
            <li>Eğer bir randevu habersiz silindiyse veya değiştirildiyse buradan kimin yaptığını görebilirsiniz.</li>
            <li>Sadece veri <strong>ekleme</strong>, <strong>değiştirme</strong> ve <strong>silme</strong> işlemleri kaydedilir (sayfayı görüntüleme işlemleri kaydedilmez).</li>
            <li>IP adresi bölümü sayesinde işlemlerin stüdyo içinden mi yoksa dışarıdan mı yapıldığını anlayabilirsiniz.</li>
          </ul>
        </div>
      </div>
      
      {/* Loglar Tablosu */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-slate-800/80 p-4 border-b border-slate-700/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <h3 className="font-semibold text-slate-200">Son Yapılan İşlemler</h3>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="İşlem, kişi veya bölüm ara..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-full font-medium whitespace-nowrap">
              {filteredLogs.length} Kayıt
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Ne Zaman?</th>
                <th className="px-6 py-4 font-medium">Kim Yaptı?</th>
                <th className="px-6 py-4 font-medium">Ne Yaptı?</th>
                <th className="px-6 py-4 font-medium">Hangi Bölümde?</th>
                <th className="px-6 py-4 font-medium">Nereden? (IP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredLogs.map((log) => {
                const action = getActionInfo(log.action_type);
                const target = getTargetInfo(log.target_model);
                
                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-slate-200 font-medium">{new Date(log.timestamp).toLocaleDateString('tr-TR')}</div>
                      <div className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleTimeString('tr-TR')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                          {log.user_name ? log.user_name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span className="font-medium text-slate-200">{log.user_name || 'Misafir / Anonim'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${action.color}`}>
                        {action.icon}
                        {action.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-300">
                        {target.icon}
                        {target.text}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {log.ip_address}
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <Activity className="mx-auto h-12 w-12 text-slate-600 mb-3 opacity-50" />
                    <p>{searchTerm ? 'Aramanızla eşleşen işlem bulunamadı.' : 'Sistemde henüz kaydedilmiş bir işlem bulunmuyor.'}</p>
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

export default AdminLogs;
