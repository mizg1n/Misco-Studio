import { create } from 'zustand';
import axiosInstance from '../api/axios';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,

  login: async (username, password) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.post('/auth/login/', { username, password });
      localStorage.setItem('access_token', response.data.access);
      
      const userRes = await axiosInstance.get('/auth/me/');
      localStorage.setItem('user', JSON.stringify(userRes.data));
      
      set({ user: userRes.data, isAuthenticated: true, loading: false });
      return true;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout/');
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
      window.location.href = '/login';
    }
  },

  checkAuth: async () => {
    if (!localStorage.getItem('access_token')) return;
    try {
      const userRes = await axiosInstance.get('/auth/me/');
      localStorage.setItem('user', JSON.stringify(userRes.data));
      set({ user: userRes.data, isAuthenticated: true });
    } catch (error) {
      // Interceptor will handle refresh if access is expired. If it still fails, user is logged out.
    }
  }
}));

export default useAuthStore;
