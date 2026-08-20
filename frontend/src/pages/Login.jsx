import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser?.role === 'CUSTOMER') {
        navigate('/dashboard/customer/appointment');
      } else if (storedUser?.role === 'ADMIN') {
        navigate('/dashboard/admin');
      } else if (storedUser?.role === 'RECEPTIONIST') {
        navigate('/dashboard/receptionist');
      } else if (storedUser?.role === 'ARTIST') {
        navigate('/dashboard/artist');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-200">
      <div className="w-full max-w-md p-8 glass-panel rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
            Misco Studio
          </h1>
          <p className="text-slate-400 mt-2">Sisteme Giriş Yapın</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Kullanıcı Adı</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Şifre</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 rounded-lg font-medium text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
              Hemen Kayıt Olun
            </Link>
          </p>
        </div>

        {/* Hızlı Giriş */}
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center mb-3">Hızlı Giriş</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setError('');
                try { await login('admin', 'admin123'); navigate('/dashboard/admin'); } catch (err) { setError('Hızlı giriş başarısız.'); }
              }}
              className="py-2 px-3 rounded-lg text-xs font-semibold border from-red-500/20 to-red-600/20 border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => navigate('/login/artist')}
              className="py-2 px-3 rounded-lg text-xs font-semibold border from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-all"
            >
              Artist
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setError('');
                try { await login('recep', 'recep123'); navigate('/dashboard/receptionist'); } catch (err) { setError('Hızlı giriş başarısız.'); }
              }}
              className="py-2 px-3 rounded-lg text-xs font-semibold border from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              Resepsiyon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

