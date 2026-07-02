import { useQuery } from '@tanstack/react-query';
import http from '../axios';
import { cacheForms, getCachedForms } from '../offline/idb';

/**
 * Hook to fetch form data.
 * Caches successful responses in IndexedDB and falls back to cached data
 * when offline or when the network request fails.
 *
 * @param {string} op - Operation name (e.g., 'm_forms')
 * @param {object} options - React Query options
 */
export default function useFormData(op, options = {}) {
  return useQuery({
    queryKey: ['form-data', op],
    queryFn: async ({ signal }) => {
      const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

      if (isOffline) {
        const cached = await getCachedForms(op);
        if (cached) return cached;
        throw new Error('offline-no-cache');
      }

      try {
        const data = await http.get('/', {
          params: { op },
          signal,
          _skipStatusCheck: op === 'm_version',
        });
        cacheForms(op, data);
        return data;
      } catch (err) {
        const cached = await getCachedForms(op);
        if (cached) return cached;
        throw err;
      }
    },
    enabled: !!op,
    ...options,
  });
}
