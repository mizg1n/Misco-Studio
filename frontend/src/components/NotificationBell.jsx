import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axios';
import { Bell, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get('/notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error('Bildirimler yuklenemedi', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000);
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id) => {
    try {
      await axiosInstance.post(`/notifications/${id}/mark_read/`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Bildirim okundu isaretlenemedi', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.post(`/notifications/mark_all_read/`);
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Tumu okundu isaretlenemedi', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-800/50 transition-colors text-slate-300 hover:text-white cursor-pointer"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
            <h3 className="font-semibold text-slate-100">Bildirimler</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Check size={14} /> Tumu Okundu
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                Henuz hic bildiriminiz yok.
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                  className={`p-4 border-b border-slate-800/50 cursor-pointer transition-colors flex gap-3 ${notif.is_read ? 'opacity-70 hover:bg-slate-800/30' : 'bg-yellow-500/5 hover:bg-yellow-500/10'}`}
                >
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notif.is_read ? 'bg-transparent' : 'bg-yellow-500'}`}></div>
                  <div>
                    <h4 className={`text-sm ${notif.is_read ? 'font-medium text-slate-300' : 'font-semibold text-yellow-100'}`}>
                      {notif.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                    <p className="text-[10px] text-slate-500 mt-2">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: tr })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
