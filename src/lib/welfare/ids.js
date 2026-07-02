// Small helper for generating unique ids in a browser-only (localStorage) app.
// Falls back to a timestamp+random string when crypto.randomUUID is unavailable.
export function uid(prefix = '') {
  let id;
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    id = crypto.randomUUID();
  } else {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
  return prefix ? `${prefix}_${id}` : id;
}
