import axios from 'axios';
const api = axios.create({ baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/api` });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
api.interceptors.response.use((r) => r, (err) => {
  // Expired/invalid token on a protected call -> force re-login (login itself returns 401 for bad credentials)
  if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
    localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.assign('/login');
  }
  return Promise.reject(err);
});
export const errMsg = (e) => e.response?.data?.message || e.message || 'Something went wrong';
export default api;
