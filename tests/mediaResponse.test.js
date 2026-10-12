import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMediaResponse } from '../src/utils/mediaResponse.js';
const media = { url: '/uploads/image.png', filename: 'image.png' };
test('upload picker accepts direct, wrapped, Axios and bulk responses', () => {
  for (const payload of [media, [media], { data: media }, { data: { success: true, data: media } }, { success: true, data: [media] }, { media }, { files: [media] }]) {
    assert.deepEqual(normalizeMediaResponse(payload), [media]);
  }
  assert.deepEqual(normalizeMediaResponse({ success: true }), []);
});
