import api from './api.js';

export const getContactPage = () => api.get('/api/contact');
export const updateContactPage = (data) => api.put('/api/contact', data);

export const getContactMessages = (params) => api.get('/api/contact/messages', { params });
export const exportContactMessagesUrl = () => `${api.defaults.baseURL}/api/contact/messages/export`;
export const markMessageRead = (id, isRead) =>
  api.patch(`/api/contact/messages/${id}/read`, { isRead });
export const deleteMessage = (id) => api.delete(`/api/contact/messages/${id}`);
