import api from './api.js';

export const uploadMedia = (fileOrFiles, category, onUploadProgress) => {
  const formData = new FormData();
  if (Array.isArray(fileOrFiles)) {
    fileOrFiles.forEach((f) => formData.append('files', f));
  } else {
    formData.append('file', fileOrFiles);
  }
  if (category) formData.append('category', category);
  return api.post('/api/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};

export const getMediaList = (params) => api.get('/api/media', { params });
export const updateMedia = (id, data) => api.put(`/api/media/${id}`, data);
export const replaceMedia = (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.put(`/api/media/${id}/replace`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteMedia = (id) => api.delete(`/api/media/${id}`);
export const getMediaUsage = (id) => api.get(`/api/media/${id}/usage`);
export const reorderMedia = (order) => api.put('/api/media/reorder', { order });
