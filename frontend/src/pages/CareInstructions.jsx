import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { ShieldCheck, Droplets, HeartPulse, Sparkles, AlertCircle } from 'lucide-react';

const CareInstructions = () => {
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        const res = await axiosInstance.get('/careinstructions/');
        setInstructions(res.data);
      } catch (error) {
        console.error('Yönergeler yüklenemedi', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInstructions();
  }, []);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-64 space-y-4">
      <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
      <p className="text-slate-400 animate-pulse">Bakım rehberleri hazırlanıyor...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="relative overflow-hidden glass-panel p-8 md:p-12 rounded-3xl border border-slate-700/50 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-semibold mb-6">
            <HeartPulse size={16} />
            <span>Aftercare Rehberi</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
            İyileşme Sürecinizi <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Mükemmelleştirin</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">
            Yeni dövmeniz veya piercinginiz için en doğru bakım adımları. İşleminizin ilk günkü gibi kusursuz kalması için uzmanlarımızın hazırladığı bu yönergelere mutlaka uyun.
          </p>
        </div>
      </div>

      {instructions.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border-dashed border-2 border-slate-700/50">
          <AlertCircle size={48} className="mx-auto text-slate-500 mb-4" />
          <p className="text-xl font-medium text-slate-300">Henüz bakım yönergesi bulunmuyor.</p>
          <p className="text-slate-500 mt-2">Sisteme yeni rehberler eklendiğinde burada görünecektir.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {instructions.map((item, idx) => {
            const isTattoo = item.category === 'TATTOO';
            return (
              <div 
                key={item.id} 
                className="group relative glass-panel p-8 rounded-3xl border border-slate-700/50 hover:border-yellow-500/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-yellow-500/10 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${isTattoo ? 'bg-orange-500/20' : 'bg-emerald-500/20'}`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border ${
                      isTattoo 
                        ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-orange-500/20' 
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/20'
                    }`}>
                      {isTattoo ? <Droplets size={28} /> : <Sparkles size={28} />}
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      isTattoo 
                        ? 'bg-orange-500/10 text-orange-300 border-orange-500/20' 
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    }`}>
                      {isTattoo ? 'Dövme Bakımı' : 'Piercing Bakımı'}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-100 mb-4 group-hover:text-yellow-300 transition-colors">
                    {item.title}
                  </h3>
                  
                  <div className="prose prose-invert prose-slate max-w-none">
                    <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-700/50 flex items-center gap-3">
                    <ShieldCheck className={isTattoo ? 'text-orange-400' : 'text-emerald-400'} size={20} />
                    <span className="text-sm font-medium text-slate-300">Steril ve Güvenli İyileşme</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CareInstructions;
