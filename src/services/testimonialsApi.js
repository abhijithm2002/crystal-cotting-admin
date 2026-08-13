import api from './api.js';

export const getTestimonials = (params) => api.get('/api/testimonials', { params });
export const createTestimonial = (data) => api.post('/api/testimonials', data);
export const updateTestimonial = (id, data) => api.put(`/api/testimonials/${id}`, data);
export const deleteTestimonial = (id) => api.delete(`/api/testimonials/${id}`);
