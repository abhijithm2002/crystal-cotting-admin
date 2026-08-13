import api from './api.js';

export const login = (email, password) => api.post('/api/admin/login', { email, password });
export const logout = () => api.post('/api/admin/logout');
export const changePassword = (currentPassword, newPassword) =>
  api.post('/api/admin/change-password', { currentPassword, newPassword });
export const forgotPassword = (email) => api.post('/api/admin/forgot-password', { email });
export const resetPassword = (token, newPassword) =>
  api.post('/api/admin/reset-password', { token, newPassword });
export const getMe = () => api.get('/api/admin/me');
