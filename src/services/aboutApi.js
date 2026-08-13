import api from './api.js';

export const getAbout = () => api.get('/api/about');
export const updateAbout = (data) => api.put('/api/about', data);
