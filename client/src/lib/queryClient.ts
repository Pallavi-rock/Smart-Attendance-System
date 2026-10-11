import { QueryClient } from '@tanstack/react-query';

/**
 * Shared React Query client with sensible defaults for the app.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
