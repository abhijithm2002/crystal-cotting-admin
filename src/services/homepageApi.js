import api from './api.js';

export const getHomepage = () => api.get('/api/homepage');
export const updateHomepage = (data) => api.put('/api/homepage', data);
