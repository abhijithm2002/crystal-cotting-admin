import axios from 'axios';
import { parseApiResponse } from '../utils/apiResponse.js';

const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').trim().replace(/\/+$/, '').replace(/\/api$/, '');

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 60000,
  responseType: 'json',
});

// Tab-scoped bearer fallback for browsers blocking cross-site cookies.
// Cleared on logout or an expired session; survives a page refresh.
let inMemoryToken = null;
try { inMemoryToken = sessionStorage.getItem('adminToken'); } catch { /* Storage unavailable. */ }
export const setAuthToken = (token) => {
  inMemoryToken = token || null;
  try {
    if (inMemoryToken) sessionStorage.setItem('adminToken', inMemoryToken);
    else sessionStorage.removeItem('adminToken');
  } catch { /* In-memory authentication still works. */ }
};

api.interceptors.request.use((config) => {
  if (inMemoryToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${inMemoryToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob') return response;
    const envelope = parseApiResponse(response.data);
    response.data = envelope;
    if (envelope && typeof envelope === 'object' && envelope.success === true && 'data' in envelope) {
      response.data = envelope.data;
      response.pagination = envelope.pagination;
    }
    return response;
  },
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

export const getAuthToken = () => inMemoryToken;
export const API_BASE_URL = baseURL;
export const resolveMediaUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${baseURL}/${path.replace(/^\/+/, '')}`;
};

export default api;
