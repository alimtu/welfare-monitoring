import { useQuery } from '@tanstack/react-query';
import http from '../axios';

export default function usePageData(slug, options = {}) {
  return useQuery({
    queryKey: ['page-data', slug],
    queryFn: ({ signal }) => http.get(`/public/render/${slug}`, { signal }),
    enabled: !!slug,
    ...options,
  });
}
