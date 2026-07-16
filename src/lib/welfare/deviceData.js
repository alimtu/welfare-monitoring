/**
 * Shared helpers for moving welfare data in and out of this device's
 * localStorage — used by the data inspector and the sample-data page.
 *
 * A "bundle" is a plain `{ storageKey: value }` object (the shape produced by
 * the copy/download buttons and the exported sample JSON). Values may be
 * already-parsed (arrays/objects) or raw JSON strings; both are handled.
 *
 * No backend is involved; everything is client-side and SSR-safe.
 */
import { KEYS } from './storage';
import { AUTH_KEY } from '../auth/session';

/** Keys that make up the "welfare only" bundle (the app's own data + auth flag). */
export const WELFARE_KEYS = [KEYS.periods, KEYS.submissions, KEYS.seeded, AUTH_KEY];

/** Where a one-time snapshot of the device's own storage is kept before a load. */
export const BACKUP_KEY = 'welfare_data_backup';

/** Parse a stored string as JSON, falling back to the raw string when it isn't JSON. */
export function tryParse(value) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/** Normalize a bundle value to its parsed form (handles both bundle shapes). */
function ensureParsed(value) {
  return typeof value === 'string' ? tryParse(value) : value;
}

/**
 * Reconstruct the raw localStorage string for a key, matching how the app
 * itself stores it: `auth_token` is a plain string, everything else is JSON.
 */
function rawForWrite(key, value) {
  const parsed = ensureParsed(value);
  if (key === AUTH_KEY) return String(parsed);
  return JSON.stringify(parsed);
}

/** Validate a pasted bundle: must be a JSON object of key → value. */
export function parseBundle(text) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return { error: 'ابتدا داده کاربر را وارد کنید.' };
  let data;
  try {
    data = JSON.parse(trimmed);
  } catch {
    return { error: 'JSON نامعتبر است. داده کپی‌شده را کامل و بدون تغییر بچسبانید.' };
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { error: 'ساختار داده معتبر نیست؛ باید یک شیء از کلید/مقدار باشد.' };
  }
  return { data };
}

/** Whether a restorable snapshot of the device's own data currently exists. */
export function hasBackup() {
  return typeof window !== 'undefined' && Boolean(localStorage.getItem(BACKUP_KEY));
}

/**
 * Replace this device's welfare data with `data`, snapshotting the current
 * state first (once) so it can be restored. `auth_token` is only overwritten
 * when the bundle carries it, so an existing login is preserved otherwise.
 * The seeded flag is forced on so WelfareProvider never re-seeds over the load.
 * Caller is responsible for reloading the app afterwards.
 */
export function applyBundle(data) {
  if (typeof window === 'undefined') return false;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;

  // 1. Snapshot the device's own storage once (exact raw strings) for restore.
  if (!localStorage.getItem(BACKUP_KEY)) {
    const backup = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key == null || key === BACKUP_KEY) continue;
      backup[key] = localStorage.getItem(key) ?? '';
    }
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
  }
  // 2. Clear the current welfare state so none of it lingers under the new data.
  [KEYS.periods, KEYS.submissions, KEYS.seeded].forEach((k) => localStorage.removeItem(k));
  // 3. Write the bundle's keys (seeded handled separately below).
  Object.entries(data).forEach(([key, value]) => {
    if (key === BACKUP_KEY || key === KEYS.seeded) return;
    localStorage.setItem(key, rawForWrite(key, value));
  });
  // 4. Force the seeded flag so the provider doesn't re-seed over the load.
  localStorage.setItem(KEYS.seeded, JSON.stringify('1'));
  return true;
}

/**
 * Restore the device's original data from the snapshot taken by applyBundle
 * and drop the snapshot. Returns false when there is nothing to restore.
 * Caller is responsible for reloading the app afterwards.
 */
export function restoreBackup() {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(BACKUP_KEY);
  if (!raw) return false;
  let backup;
  try {
    backup = JSON.parse(raw);
  } catch {
    return false;
  }
  localStorage.clear();
  Object.entries(backup).forEach(([key, value]) => {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  });
  return true;
}
