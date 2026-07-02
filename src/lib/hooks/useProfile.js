import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import http from '../axios';

export default function useProfile(options = {}) {
  return useQuery({
    queryKey: ['profile'],
    queryFn: ({ signal }) =>
      http.get('/', {
        params: { op: 'm_profile' },
        signal,
        _returnFullBody: true,
      }),
    ...options,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates) => {
      return http.get('/', {
        params: { op: 'm_profile', ...updates },
        _returnFullBody: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
