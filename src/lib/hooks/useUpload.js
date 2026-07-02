import { useMutation } from '@tanstack/react-query';
import http from '../axios';

export default function useUpload() {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('ufile', file);

      return http.post('/', formData, {
        params: { op: 'm_upload' },
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60_000,
      });
    },
  });
}
