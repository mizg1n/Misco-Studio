import axios from 'axios';

const baseURL = 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // Required to send cookies
});

// Request interceptor to add the access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login/') {
      originalRequest._retry = true;
      try {
        const response = await axios.post(`${baseURL}/auth/refresh/`, {}, { withCredentials: true });
        if (response.status === 200) {
          localStorage.setItem('access_token', response.data.access);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, user needs to login again
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
