'use client';

import { useEffect, useState, useCallback } from 'react';
import http from '../axios';
import buildSubmitParams from '../utils/buildSubmitParams';
import {
  getPending,
  getPendingCount,
  removePending,
  updatePending,
  subscribePendingChange,
} from '../offline/idb';

export function usePendingSubmissions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await getPending();
    setItems(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribePendingChange(refresh);
    return unsubscribe;
  }, [refresh]);

  return { items, loading, refresh };
}

export function usePendingCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const read = async () => {
      const c = await getPendingCount();
      if (mounted) setCount(c);
    };
    read();
    const unsubscribe = subscribePendingChange(read);
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return count;
}

export async function flushOne(record) {
  await updatePending(record.id, { status: 'sending', error: null });
  try {
    const params = buildSubmitParams(record.values, record.steps, record.formId);
    if (record.location) {
      params.lat = record.location.lat;
      params.lng = record.location.lng;
    }
    await http.get('/', { params });
    await removePending(record.id);
    return { ok: true };
  } catch (err) {
    await updatePending(record.id, {
      status: 'failed',
      error: err?.message || 'خطا در ارسال',
    });
    return { ok: false, error: err };
  }
}
