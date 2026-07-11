import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // Only retry once, with a 2s delay — avoids hammering the API on slow connections
      retry: 1,
      retryDelay: 2000,
      // 2 minute stale time — prevents redundant refetches when navigating between screens
      staleTime: 120000,
    },
    mutations: {
      retry: 0,
    },
  },
});