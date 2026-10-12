export function parseApiResponse(value) {
  let parsed = value;
  // Some transports return JSON text; reject malformed responses instead of
  // treating them as an empty page and allowing accidental blank saves.
  for (let depth = 0; typeof parsed === 'string' && depth < 3; depth += 1) {
    try { parsed = JSON.parse(parsed.replace(/^\uFEFF/, '')); }
    catch { throw new Error('The server returned an unreadable response. Please reload and try again.'); }
  }
  return parsed;
}
