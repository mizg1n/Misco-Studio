import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { Palette, ArrowLeft } from 'lucide-react';

const ArtistLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard/artist');
    } catch (err) {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-200">
      <div className="w-full max-w-md p-8 glass-panel rounded-2xl shadow-2xl">
        
        {/* Başlık */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Palette size={32} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Artist Girişi
          </h1>
          <p className="text-slate-400 mt-2">Sanatçı paneline erişim</p>
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
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Sanatçı kullanıcı adınız"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Şifre</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg font-medium text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft size={16} />
            Ana giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArtistLogin;
