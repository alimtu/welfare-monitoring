import { useMutation } from '@tanstack/react-query';
import http from '../axios';
import buildSubmitParams from '../utils/buildSubmitParams';

export default function useSubmitForm() {
  return useMutation({
    mutationFn: ({ values, steps, formId, location }) => {
      const params = buildSubmitParams(values, steps, formId);

      if (location) {
        params.lat = location.lat;
        params.lng = location.lng;
      }

      return http.get('/', { params });
    },
  });
}
