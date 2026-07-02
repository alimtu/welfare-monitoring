'use client';

import { createStore, get, set, del, keys, values } from 'idb-keyval';

const isBrowser = typeof window !== 'undefined';

let formsCacheStore = null;
let pendingStore = null;

if (isBrowser) {
  try {
    if (typeof indexedDB !== 'undefined' && indexedDB.deleteDatabase) {
      indexedDB.deleteDatabase('poll-offline');
    }
    formsCacheStore = createStore('poll-offline-forms', 'forms-cache');
    pendingStore = createStore('poll-offline-pending', 'pending-submissions');
  } catch (err) {
    console.warn('[offline] IndexedDB unavailable, using localStorage fallback:', err);
  }
}

const LS_PENDING_PREFIX = 'offline-pending:';
const LS_FORMS_PREFIX = 'offline-forms:';

function lsKeys(prefix) {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) out.push(k);
  }
  return out;
}

function toPlain(value) {
  return JSON.parse(JSON.stringify(value));
}

export async function cacheForms(op, data) {
  if (!isBrowser) return;
  const payload = { data, cachedAt: Date.now() };
  if (formsCacheStore) {
    try {
      await set(op, payload, formsCacheStore);
      return;
    } catch (err) {
      console.warn('[offline] cacheForms IDB failed, using localStorage:', err);
    }
  }
  try {
    localStorage.setItem(LS_FORMS_PREFIX + op, JSON.stringify(payload));
  } catch (err) {
    console.warn('[offline] cacheForms localStorage failed:', err);
  }
}

export async function getCachedForms(op) {
  if (!isBrowser) return null;
  if (formsCacheStore) {
    try {
      const entry = await get(op, formsCacheStore);
      if (entry?.data !== undefined) return entry.data;
    } catch (err) {
      console.warn('[offline] getCachedForms IDB failed:', err);
    }
  }
  try {
    const raw = localStorage.getItem(LS_FORMS_PREFIX + op);
    if (!raw) return null;
    return JSON.parse(raw).data ?? null;
  } catch {
    return null;
  }
}

export async function addPending(item) {
  if (!isBrowser) throw new Error('not-in-browser');

  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const safeItem = toPlain(item);
  const record = { id, status: 'pending', createdAt: Date.now(), ...safeItem };

  if (pendingStore) {
    try {
      await set(id, record, pendingStore);
      notifyPendingChange();
      return record;
    } catch (err) {
      console.warn('[offline] addPending IDB failed, using localStorage:', err);
    }
  }

  try {
    localStorage.setItem(LS_PENDING_PREFIX + id, JSON.stringify(record));
    notifyPendingChange();
    return record;
  } catch (err) {
    console.error('[offline] addPending localStorage failed:', err);
    throw err;
  }
}

export async function getPending() {
  if (!isBrowser) return [];

  let list = [];
  if (pendingStore) {
    try {
      list = await values(pendingStore);
    } catch (err) {
      console.warn('[offline] getPending IDB failed:', err);
    }
  }

  try {
    const lsList = lsKeys(LS_PENDING_PREFIX)
      .map((k) => {
        try { return JSON.parse(localStorage.getItem(k)); } catch { return null; }
      })
      .filter(Boolean);

    const seen = new Set(list.map((r) => r.id));
    for (const r of lsList) if (!seen.has(r.id)) list.push(r);
  } catch {}

  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getPendingCount() {
  if (!isBrowser) return 0;

  let count = 0;
  if (pendingStore) {
    try {
      const ks = await keys(pendingStore);
      count = ks.length;
    } catch {}
  }
  try {
    count += lsKeys(LS_PENDING_PREFIX).length;
  } catch {}
  return count;
}

export async function updatePending(id, patch) {
  if (!isBrowser) return;

  if (pendingStore) {
    try {
      const existing = await get(id, pendingStore);
      if (existing) {
        await set(id, { ...existing, ...patch }, pendingStore);
        notifyPendingChange();
        return;
      }
    } catch (err) {
      console.warn('[offline] updatePending IDB failed:', err);
    }
  }

  try {
    const raw = localStorage.getItem(LS_PENDING_PREFIX + id);
    if (!raw) return;
    const existing = JSON.parse(raw);
    localStorage.setItem(LS_PENDING_PREFIX + id, JSON.stringify({ ...existing, ...patch }));
    notifyPendingChange();
  } catch {}
}

export async function removePending(id) {
  if (!isBrowser) return;

  if (pendingStore) {
    try {
      await del(id, pendingStore);
    } catch (err) {
      console.warn('[offline] removePending IDB failed:', err);
    }
  }
  try {
    localStorage.removeItem(LS_PENDING_PREFIX + id);
  } catch {}
  notifyPendingChange();
}

const PENDING_EVENT = 'offline-pending-change';

function notifyPendingChange() {
  if (!isBrowser) return;
  window.dispatchEvent(new Event(PENDING_EVENT));
}

export function subscribePendingChange(callback) {
  if (!isBrowser) return () => {};
  window.addEventListener(PENDING_EVENT, callback);
  return () => window.removeEventListener(PENDING_EVENT, callback);
}
