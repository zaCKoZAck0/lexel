import { useInfiniteQuery } from '@tanstack/react-query';
import { historyService } from '@/lib/api/client/history';
import { historyQueryKeys } from '@/lib/types/history';
import { ApiRequestError } from '@/lib/api/client';
import type { HistoryItem, HistorySearchParams } from '@/lib/types/history';

export function useHistoryInfinite(
  params: HistorySearchParams = { sortOrder: 'newest' },
) {
  return useInfiniteQuery<
    {
      data: HistoryItem[];
      hasMore: boolean;
      nextCursor: string | null;
    },
    ApiRequestError
  >({
    queryKey: historyQueryKeys.list(params),
    queryFn: async ({ pageParam }) => {
      const resp = await historyService.getHistory({
        ...params,
        cursor: pageParam as string,
      });
      return {
        data: resp.data,
        hasMore: resp.hasMore,
        nextCursor: resp.nextCursor,
      };
    },
    getNextPageParam: lastPage =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    initialPageParam: null,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, err) => {
      if ([401, 403].includes(err.status)) return false;
      return failureCount < 3;
    },
    // Ensure queries refetch when sort order changes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useSearchHistory(
  query: string,
  enabled = false,
  sortOrder?: 'newest' | 'oldest',
) {
  return useInfiniteQuery<
    {
      data: HistoryItem[];
      hasMore: boolean;
      nextCursor: string | null;
    },
    ApiRequestError
  >({
    queryKey: historyQueryKeys.list({ query, sortOrder }),
    queryFn: async ({ pageParam }) => {
      const resp = await historyService.getHistory({
        query,
        cursor: pageParam as string,
        sortOrder,
      });
      return {
        data: resp.data,
        hasMore: resp.hasMore,
        nextCursor: resp.nextCursor,
      };
    },
    getNextPageParam: lastPage =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    initialPageParam: null,
    enabled: enabled && !!query.trim(),
    staleTime: 30 * 1000,
    retry: (failureCount, err) => {
      if ([401, 403].includes(err.status)) return false;
      return failureCount < 2;
    },
    // Ensure queries refetch when sort order changes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
