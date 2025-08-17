import { QueryClient } from '@tanstack/react-query'

// Create a query client with production-ready configurations
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Time in milliseconds after data is considered stale
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Time in milliseconds that unused/inactive cache data remains in memory
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            // Retry failed requests 3 times by default
            retry: 3,
            // Retry delay that increases exponentially
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus
            refetchOnWindowFocus: false,
            // Refetch on reconnect
            refetchOnReconnect: true,
            // Background refetch interval
            refetchInterval: false,
        },
        mutations: {
            // Retry failed mutations once by default
            retry: 1,
            // Retry delay for mutations
            retryDelay: 1000,
        },
    },
})
