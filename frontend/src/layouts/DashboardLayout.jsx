import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import NotificationBell from '../components/NotificationBell';
import { LogOut, Calendar, DollarSign, BookOpen, Settings, ShieldAlert, Menu, X, Clock, Home, Palette } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const getMenuItems = () => {
    const items = [];
    if (user.role === 'CUSTOMER') {
      items.push({ label: 'Randevu Al', icon: <Calendar />, path: '/dashboard/customer/appointment' });
      items.push({ label: 'Randevularım', icon: <Clock />, path: '/dashboard/customer/appointments' });
      items.push({ label: 'Fiyat Listesi', icon: <DollarSign />, path: '/dashboard/customer' });
      items.push({ label: 'Bakım Yönergesi', icon: <BookOpen />, path: '/dashboard/customer/care' });
    } else if (user.role === 'ARTIST') {
      items.push({ label: 'Takvimim', icon: <Calendar />, path: '/dashboard/artist' });
      items.push({ label: 'Kazançlarım', icon: <DollarSign />, path: '/dashboard/artist/my-earnings' });
      items.push({ label: 'Çalışma Saatlerim', icon: <Clock />, path: '/dashboard/artist/my-schedule' });
    } else if (user.role === 'RECEPTIONIST') {
      items.push({ label: 'Randevu Durumu', icon: <Calendar />, path: '/dashboard/receptionist' });
      items.push({ label: 'Tüm Randevular', icon: <Calendar />, path: '/dashboard/receptionist/calendar' });
      items.push({ label: 'Personel Mesai', icon: <Clock />, path: '/dashboard/receptionist/shifts' });
    } else if (user.role === 'ADMIN') {
      items.push({ label: 'İşlemler', icon: <Settings />, path: '/dashboard/admin' });
      items.push({ label: 'Tüm Randevular', icon: <Calendar />, path: '/dashboard/receptionist/calendar' });
      items.push({ label: 'Personel Mesai', icon: <Clock />, path: '/dashboard/receptionist/shifts' });
      items.push({ label: 'İzin Talepleri', icon: <BookOpen />, path: '/dashboard/admin/leaves' });
      items.push({ label: 'Finans Raporları', icon: <DollarSign />, path: '/dashboard/admin/finance' });
      items.push({ label: 'Loglar', icon: <ShieldAlert />, path: '/dashboard/admin/logs' });
    }
    
    return items;
  };

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-200">
      
      {/* Görünmez Overlay (Menü Dışına Tıklayınca Kapanması İçin) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sağ Menü (Çekmece/Drawer) */}
      <aside 
        className={`fixed inset-y-0 right-0 w-72 glass-panel border-l border-slate-700/50 flex flex-col h-screen z-50 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <button 
            onClick={closeSidebar}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
          <div className="text-right">
            <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Misco Studio
            </h1>
            <p className="text-xs text-slate-400 mt-1">Yönetim Paneli</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {getMenuItems().map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={idx} 
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  isActive 
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shadow-lg shadow-yellow-500/10' 
                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span className={`${isActive ? 'text-yellow-400' : 'text-slate-400 group-hover:text-yellow-400'} transition-colors`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-yellow-400 border border-yellow-500/30">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm text-slate-200">{user.username}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors font-medium border border-rose-500/20 hover:border-rose-500/40"
          >
            <LogOut size={18} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Ana İçerik Alanı */}
      <main className="flex-1 overflow-auto w-full">
        {/* Üst Kısım (Header) */}
        <header className="h-20 glass-panel border-b border-slate-700/50 flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-md bg-slate-900/80">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" title="Ana Sayfaya Dön">
              <Palette className="text-yellow-400" size={24} />
              <span className="text-sm font-black tracking-widest text-slate-200 drop-shadow-md hidden sm:block">INK & STEEL</span>
            </Link>

            <h2 className="text-lg font-semibold text-slate-400 border-l border-slate-700/50 pl-6 hidden md:block">
              <span className="hidden sm:inline">Hoş Geldiniz, </span>
              <span className="text-yellow-400">{user.username}</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {location.pathname === '/dashboard/customer/appointment' && <NotificationBell />}
            {/* Sağ Üst Menü Açma İkonu */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all border border-slate-600 hover:border-yellow-500 group shadow-lg"
              title="Menüyü Aç"
            >
              <Menu className="text-slate-400 group-hover:text-yellow-400 transition-colors" size={24} />
            </button>
          </div>
        </header>

        {/* Sayfa İçeriği */}
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
