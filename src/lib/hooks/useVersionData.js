import { useQuery } from '@tanstack/react-query';
import http from '../axios';

/**
 * Hook to fetch form data.
 * @param {object} options - React Query options
 */
export default function useVersionData(options = {}) {
  return useQuery({
    queryKey: ['version-data', 'm_version'],
    queryFn: ({ signal }) =>
      http.get('/', {
        params: { op: 'm_version' },
        signal,
        _skipStatusCheck: true, // m_version returns raw { version, logo, name, images }
      }),
    ...options,
  });
}
