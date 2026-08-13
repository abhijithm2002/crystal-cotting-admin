import api from './api.js';

export const getPortfolioItems = (params) => api.get('/api/portfolio', { params });
export const getPortfolioItem = (id) => api.get(`/api/portfolio/${id}`);
export const createPortfolioItem = (data) => api.post('/api/portfolio', data);
export const updatePortfolioItem = (id, data) => api.put(`/api/portfolio/${id}`, data);
export const deletePortfolioItem = (id) => api.delete(`/api/portfolio/${id}`);
