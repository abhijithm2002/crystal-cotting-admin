import { parseApiResponse } from './apiResponse.js';
// Accept direct media, bulk media, and API/Axios envelopes during rolling deploys.
export function normalizeMediaResponse(payload) {
  payload = parseApiResponse(payload);
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload)) return payload.flatMap(normalizeMediaResponse);
  if (typeof payload.url === 'string' && payload.url) return [payload];
  for (const key of ['data', 'media', 'file', 'files', 'items']) {
    if (payload[key] && typeof payload[key] === 'object') return normalizeMediaResponse(payload[key]);
  }
  return [];
}
