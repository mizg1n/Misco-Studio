import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { Users, Shield, Palette, Headphones, User } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get('/users/');
        setUsers(res.data);
      } catch (error) {
        console.error('Kullanıcılar yüklenemedi', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="text-slate-400">Yükleniyor...</div>;

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN': return <Shield size={16} className="text-red-400" />;
      case 'ARTIST': return <Palette size={16} className="text-blue-400" />;
      case 'RECEPTIONIST': return <Headphones size={16} className="text-emerald-400" />;
      case 'CUSTOMER': return <User size={16} className="text-purple-400" />;
      default: return <User size={16} className="text-slate-400" />;
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      'ADMIN': 'bg-red-500/20 text-red-400 border-red-500/30',
      'ARTIST': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'RECEPTIONIST': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'CUSTOMER': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    const labels = {
      'ADMIN': 'Admin',
      'ARTIST': 'Artist',
      'RECEPTIONIST': 'Resepsiyonist',
      'CUSTOMER': 'Müşteri',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${styles[role] || 'bg-slate-500/20 text-slate-400'}`}>
        {getRoleIcon(role)}
        {labels[role] || role}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Users className="text-purple-400" />
          Kayıtlı Kullanıcılar
        </h2>
        <span className="text-sm text-slate-400">{users.length} kullanıcı</span>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kullanıcı Adı</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">E-posta</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Telefon</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr 
                key={user.id} 
                className={`border-b border-slate-700/30 hover:bg-slate-800/40 transition-colors ${idx % 2 === 0 ? 'bg-slate-800/10' : ''}`}
              >
                <td className="px-6 py-4 text-sm text-slate-500 font-mono">#{user.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-purple-400 border border-purple-500/30">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-200">{user.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{user.email || '—'}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{user.phone_number || '—'}</td>
                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
