/**
 * localStorage persistence layer for the welfare monitoring app.
 * All functions are SSR-safe (return defaults when `window` is undefined).
 *
 * Stored keys:
 *  - welfare_periods       -> EvaluationPeriod[]
 *  - welfare_submissions   -> IndicatorSubmission[]
 *  - welfare_seeded        -> '1' once mock data has been preloaded
 */

export const KEYS = {
  periods: 'welfare_periods',
  submissions: 'welfare_submissions',
  seeded: 'welfare_seeded',
};

function read(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`[welfare storage] failed to read ${key}`, err);
    return fallback;
  }
}

function write(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[welfare storage] failed to write ${key}`, err);
  }
}

export const loadPeriods = () => read(KEYS.periods, []);
export const savePeriods = (periods) => write(KEYS.periods, periods);

export const loadSubmissions = () => read(KEYS.submissions, []);
export const saveSubmissions = (submissions) => write(KEYS.submissions, submissions);

export const isSeeded = () => read(KEYS.seeded, null) === '1';
export const markSeeded = () => write(KEYS.seeded, '1');

/** Wipe all welfare data (used by a "reset demo data" action). */
export function clearAll() {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
