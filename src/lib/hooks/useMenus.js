import { useQuery } from '@tanstack/react-query';
import http from '../axios';

export default function useMenus(options = {}) {
  return useQuery({
    queryKey: ['menus'],
    queryFn: ({ signal }) => http.get('/public/menu', { signal }),
    staleTime: 1000 * 60 * 10,
    ...options,
  });
}
