import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 0.1,
      gcTime: 1000 * 60 * 15,
      retry: 2,
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10_000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
  },
});

export default queryClient;
