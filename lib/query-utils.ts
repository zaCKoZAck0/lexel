/**
 * Utility functions for TanStack React Query integration
 */

import { QueryKey, QueryFunction } from '@tanstack/react-query'
import { ApiRequestError } from '@/lib/api/keys'

/**
 * Creates a type-safe query key factory
 * Usage: const userKeys = createQueryKeyFactory('users')
 * Then: userKeys.all() or userKeys.detail(id)
 */
export function createQueryKeyFactory(entity: string) {
    return {
        all: () => [entity] as const,
        lists: () => [entity, 'list'] as const,
        list: (filters?: Record<string, any>) => [entity, 'list', filters] as const,
        details: () => [entity, 'detail'] as const,
        detail: (id: string | number) => [entity, 'detail', id] as const,
    }
}

/**
 * Creates a type-safe query function with error handling
 */
export function createQueryFunction<TData>(
    fn: () => Promise<TData>
): QueryFunction<TData, QueryKey> {
    return async () => {
        try {
            return await fn()
        } catch (error) {
            // Transform unknown errors into ApiRequestError
            if (error instanceof ApiRequestError) {
                throw error
            }

            throw new ApiRequestError(
                0,
                'Unknown Error',
                { message: error instanceof Error ? error.message : 'An unknown error occurred' }
            )
        }
    }
}

/**
 * Utility for handling mutation errors consistently
 */
export function handleMutationError(error: unknown): string {
    if (error instanceof ApiRequestError) {
        return error.body?.message || error.statusText || 'Request failed'
    }

    if (error instanceof Error) {
        return error.message
    }

    return 'An unexpected error occurred'
}

/**
 * Retry function that respects HTTP status codes
 */
export function shouldRetryRequest(failureCount: number, error: unknown): boolean {
    // Don't retry client errors (4xx) except for 408, 429
    if (error instanceof ApiRequestError) {
        const status = error.status

        // Don't retry auth errors
        if ([401, 403].includes(status)) {
            return false
        }

        // Don't retry validation errors
        if ([400, 422].includes(status)) {
            return false
        }

        // Don't retry not found errors
        if (status === 404) {
            return false
        }

        // Retry rate limiting and timeout errors
        if ([408, 429].includes(status)) {
            return failureCount < 3
        }

        // Retry server errors
        if (status >= 500) {
            return failureCount < 3
        }
    }

    // Retry network errors
    return failureCount < 3
}

/**
 * Calculate exponential backoff delay
 */
export function calculateRetryDelay(attemptIndex: number, baseDelay = 1000, maxDelay = 30000): number {
    return Math.min(baseDelay * 2 ** attemptIndex, maxDelay)
}

/**
 * Debounced query function for search
 */
export function createDebouncedQuery<TData>(
    queryFn: (searchTerm: string) => Promise<TData>,
    delay = 300
) {
    let timeoutId: NodeJS.Timeout

    return (searchTerm: string): Promise<TData> => {
        return new Promise((resolve, reject) => {
            clearTimeout(timeoutId)

            timeoutId = setTimeout(async () => {
                try {
                    const result = await queryFn(searchTerm)
                    resolve(result)
                } catch (error) {
                    reject(error)
                }
            }, delay)
        })
    }
}

/**
 * Creates optimistic update helpers
 */
export function createOptimisticHelpers<TData extends { id: string | number }>() {
    return {
        // Add item optimistically
        addOptimistic: (items: TData[], newItem: TData): TData[] => [
            ...items,
            { ...newItem, id: `temp-${Date.now()}` as any }
        ],

        // Update item optimistically
        updateOptimistic: (items: TData[], id: string | number, updates: Partial<TData>): TData[] =>
            items.map(item => item.id === id ? { ...item, ...updates } : item),

        // Remove item optimistically
        removeOptimistic: (items: TData[], id: string | number): TData[] =>
            items.filter(item => item.id !== id),

        // Replace temporary ID with real ID from server
        replaceTemporaryId: (items: TData[], tempId: string | number, serverItem: TData): TData[] =>
            items.map(item => item.id === tempId ? serverItem : item)
    }
}

/**
 * Type-safe cache update helper
 */
export function createCacheUpdater<TData>(queryKey: QueryKey) {
    return {
        update: (
            queryClient: any,
            updater: (oldData: TData | undefined) => TData | undefined
        ) => {
            queryClient.setQueryData(queryKey, updater)
        },

        invalidate: (queryClient: any) => {
            queryClient.invalidateQueries({ queryKey })
        },

        remove: (queryClient: any) => {
            queryClient.removeQueries({ queryKey })
        }
    }
}

/**
 * Enhanced toast utility for consistent messaging
 */
export const queryToast = {
    loading: (message: string) => ({ loading: message }),

    success: (message: string, description?: string) => ({
        success: { title: message, description }
    }),

    error: (error: unknown, fallbackMessage = 'Operation failed') => ({
        error: {
            title: 'Error',
            description: handleMutationError(error) || fallbackMessage
        }
    })
}
