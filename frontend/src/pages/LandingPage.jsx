import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, ShieldCheck, Palette, Sparkles } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuthStore();

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN': return '/dashboard/admin';
      case 'RECEPTIONIST': return '/dashboard/receptionist';
      case 'ARTIST': return '/dashboard/artist';
      case 'CUSTOMER': return '/dashboard/customer';
      default: return '/login';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-purple-500/30">

      {/* Navbar (Transparent) */}
      <nav className="absolute top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-rose-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Palette className="text-white" size={20} />
            </div>
            <span className="text-xl font-black tracking-widest text-white drop-shadow-md">MISCO STUDIO</span>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && user && ['ADMIN', 'RECEPTIONIST', 'ARTIST'].includes(user.role) ? (
              <Link
                to={getDashboardPath()}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white font-medium rounded-full transition-all"
              >
                Panele Git
              </Link>
            ) : (
              <>
                <Link to="/register" className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Kayıt Ol
                </Link>
                <Link to="/login" className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white font-medium rounded-full transition-all">
                  Giriş Yap
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=2000&auto=format&fit=crop"
            alt="Tattoo Studio Background"
            className="w-full h-full object-cover opacity-40 scale-105 transform hover:scale-100 transition-transform duration-[20s]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={14} /> Premium Stüdyo Deneyimi
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6 drop-shadow-lg">
              Sanatınızı <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-rose-400">Bedeninizde</span> <br />
              Taşıyın.
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl leading-relaxed">
              Ödüllü sanatçılarımızla hayalinizdeki dövmeyi tasarlayın veya hijyenik ortamımızda profesyonel piercing hizmeti alın.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/login"
                className="group relative px-8 py-4 bg-white text-slate-950 font-bold rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Calendar size={20} className="relative z-10" />
                <span className="relative z-10">Hemen Randevu Al</span>
              </Link>

              <a href="#services" className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 backdrop-blur-sm border border-slate-700 text-white font-semibold rounded-full transition-all flex items-center justify-center gap-2 group">
                Hizmetleri İncele
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Uzmanlık Alanlarımız</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">En yüksek hijyen standartlarında, tarzınızı yansıtacak kişiselleştirilmiş hizmetler sunuyoruz.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel p-1 rounded-3xl overflow-hidden group hover:border-purple-500/50 transition-colors">
            <div className="h-64 overflow-hidden rounded-t-[22px] relative">
              <img
                src="dovme.jpg"
                alt="Custom Tattoos"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
            </div>
            <div className="p-8 -mt-10 relative z-10">
              <div className="w-14 h-14 bg-slate-900 border border-purple-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-xl text-purple-400">
                <Palette size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Özel Tasarım Dövme</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Sadece size özel çizilmiş benzersiz tasarımlar. Realistik, minimal, geleneksel veya dilediğiniz her tarzda profesyonel dokunuş.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-1 rounded-3xl overflow-hidden group hover:border-rose-500/50 transition-colors">
            <div className="h-64 overflow-hidden rounded-t-[22px] relative">
              <img
                src="70157706734945991.jpg"
                alt="Piercing"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
            </div>
            <div className="p-8 -mt-10 relative z-10">
              <div className="w-14 h-14 bg-slate-900 border border-rose-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-xl text-rose-400">
                <Sparkles size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Profesyonel Piercing</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Titanyum takılarla, en ince ayrıntısına kadar düşünülmüş, güvenli ve acısız profesyonel vücut delimi hizmeti.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-1 rounded-3xl overflow-hidden group hover:border-emerald-500/50 transition-colors">
            <div className="h-64 overflow-hidden rounded-t-[22px] relative">
              <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                <img
                  src="388505905374659758.jpg"
                  alt="Aftercare"
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
            </div>
            <div className="p-8 -mt-10 relative z-10">
              <div className="w-14 h-14 bg-slate-900 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-xl text-emerald-400">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Sonrası Bakım (Aftercare)</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                İşlem sonrası süreçte size özel hazırlanmış bakım ürünleri ve iyileşme sürecinizi hızlandıracak detaylı bakım yönergeleri.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="border-t border-slate-800/50 bg-slate-950/50 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 opacity-50">
            <Palette size={24} />
            <span className="text-xl font-black tracking-widest">MISCO STUDIO</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Misco Studio. Tüm hakları saklıdır.</p>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;









