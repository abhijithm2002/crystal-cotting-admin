import api from './api.js';

export const getFaqs = () => api.get('/api/faq');
export const createFaq = (data) => api.post('/api/faq', data);
export const updateFaq = (id, data) => api.put(`/api/faq/${id}`, data);
export const deleteFaq = (id) => api.delete(`/api/faq/${id}`);
export const reorderFaqs = (order) => api.put('/api/faq/reorder', { order });
