import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMediaResponse } from '../src/utils/mediaResponse.js';
const media = { url: '/uploads/image.png', filename: 'image.png' };
test('upload picker accepts direct, wrapped, Axios and bulk responses', () => {
  for (const payload of [media, [media], { data: media }, { data: { success: true, data: media } }, { success: true, data: [media] }, { media }, { files: [media] }, JSON.stringify({ success: true, data: media }), JSON.stringify(JSON.stringify({ success: true, data: media }))]) {
    assert.deepEqual(normalizeMediaResponse(payload), [media]);
  }
  assert.deepEqual(normalizeMediaResponse({ success: true }), []);
});

test('malformed JSON is rejected instead of becoming empty form data', () => {
  assert.throws(() => normalizeMediaResponse('<html>Bad gateway</html>'), /unreadable response/);
});
