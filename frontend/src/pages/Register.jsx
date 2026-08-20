import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone_number: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axiosInstance.post('/auth/register/', formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      if (err.response?.data) {
        // Collect error messages from Django
        const errorMessages = Object.values(err.response.data).flat().join(' ');
        setError(`Kayıt başarısız: ${errorMessages}`);
      } else {
        setError('Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-200">
        <div className="w-full max-w-md p-8 glass-panel rounded-2xl shadow-2xl text-center">
          <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Hesabınız Oluşturuldu!</h2>
          <p className="text-slate-400">Giriş sayfasına yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-200 py-10">
      <div className="w-full max-w-md p-8 glass-panel rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
            Misco Studio
          </h1>
          <p className="text-slate-400 mt-2">Yeni Müşteri Hesabı Oluştur</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Kullanıcı Adı</label>
            <input 
              type="text" 
              name="username"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">E-posta</label>
            <input 
              type="email" 
              name="email"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Telefon Numarası</label>
            <input 
              type="tel" 
              name="phone_number"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Şifre</label>
            <input 
              type="password" 
              name="password"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 rounded-lg font-medium text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
              Giriş Yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
