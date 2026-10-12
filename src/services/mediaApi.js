import api, { API_BASE_URL, getAuthToken, resolveMediaUrl } from './api.js';
import { normalizeMediaResponse } from '../utils/mediaResponse.js';
import { parseApiResponse } from '../utils/apiResponse.js';

export function verifyMediaImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timer = setTimeout(() => { image.onload = image.onerror = null; reject(new Error('This image is taking too long to load. Please try again.')); }, 20000);
    image.onload = () => { clearTimeout(timer); resolve(); };
    image.onerror = () => { clearTimeout(timer); reject(new Error('This saved image is missing. Upload a new copy of the original image.')); };
    image.src = resolveMediaUrl(url);
  });
}

// Parse uploads explicitly so browser/HTTP-client response transformations cannot
// turn a successful upload into a missing-URL error.
async function uploadRequest(path, method, files, category, onUploadProgress) {
  const selected = Array.isArray(files) ? files : [files];
  const formData = new FormData();
  for (const file of selected) {
    if (file.size > 20 * 1024 * 1024) throw new Error(`${file.name} is larger than 20 MB. Choose a smaller image.`);
    formData.append(selected.length > 1 ? 'files' : 'file', file);
  }
  if (category) formData.append('category', category);
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method, body: formData, credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(120000),
  });
  const payload = parseApiResponse(await response.text());
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || `Upload failed (${response.status}). Please try again.`);
  }
  const media = normalizeMediaResponse(payload);
  if (!media.length) throw new Error('The server did not return the uploaded image. Reload the page and try again.');
  // Confirm the returned image can actually be displayed before selecting it.
  await Promise.all(media.map(item => verifyMediaImage(item.url)));
  onUploadProgress?.({ loaded: 1, total: 1 });
  return { data: selected.length > 1 ? media : media[0] };
}

export const uploadMedia = (files, category, onUploadProgress) =>
  uploadRequest('/api/media/upload', 'POST', files, category, onUploadProgress);

export const getMediaList = async (params = {}) => {
  const response = await api.get('/api/media', { params: { ...params, limit: 100 } });
  if (params.page) return response;
  const items = [...response.data];
  for (let page = 2; page <= (response.pagination?.totalPages || 1); page += 1) {
    const next = await api.get('/api/media', { params: { ...params, limit: 100, page } });
    items.push(...next.data);
  }
  return { ...response, data: items };
};
export const updateMedia = (id, data) => api.put(`/api/media/${id}`, data);
export const replaceMedia = (id, file) => uploadRequest(`/api/media/${id}/replace`, 'PUT', file);
export const deleteMedia = (id) => api.delete(`/api/media/${id}`);
export const getMediaUsage = (id) => api.get(`/api/media/${id}/usage`);
export const reorderMedia = (order) => api.put('/api/media/reorder', { order });
