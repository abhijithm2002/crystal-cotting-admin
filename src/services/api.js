import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// In-memory token as a fallback header in case the httpOnly cookie isn't
// available cross-origin in some dev setups. The cookie remains the primary
// auth mechanism; this is never persisted to storage.
let inMemoryToken = null;
export const setAuthToken = (token) => {
  inMemoryToken = token || null;
};

api.interceptors.request.use((config) => {
  if (inMemoryToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${inMemoryToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      setAuthToken(null);
      const onAuthPages = ['/login', '/forgot-password', '/reset-password'].some((p) =>
        window.location.pathname.startsWith(p)
      );
      if (!onAuthPages) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const API_BASE_URL = baseURL;
export const resolveMediaUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${baseURL}${path}`;
};

export default api;
