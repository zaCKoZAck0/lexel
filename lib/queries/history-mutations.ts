import {
  useMutation,
  useQueryClient,
  InfiniteData,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { historyService } from '@/lib/api/client/history';
import { historyQueryKeys } from '@/lib/types/history';
import { ApiRequestError } from '@/lib/api/client';
import type {
  HistoryItem,
  HistoryDeleteParams,
  HistoryBatchDeleteParams,
} from '@/lib/types/history';

export function useDeleteHistoryItem() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string },
    ApiRequestError,
    HistoryDeleteParams,
    { previousData: InfiniteData<any> | undefined }
  >({
    mutationFn: async params => {
      const resp = await historyService.deleteItem(params);
      return resp.data;
    },
    onMutate: async ({ chatId }) => {
      await queryClient.cancelQueries({
        queryKey: historyQueryKeys.list({}),
      });

      const previousData = queryClient.getQueryData<
        InfiniteData<{
          data: HistoryItem[];
          hasMore: boolean;
          nextCursor: string | null;
        }>
      >(historyQueryKeys.list({}));

      queryClient.setQueryData(
        historyQueryKeys.list({}),
        (old: InfiniteData<any> | undefined) => {
          if (!old) return old;
          const newPages = old.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((item: HistoryItem) => item.id !== chatId),
          }));
          return { ...old, pages: newPages };
        },
      );

      return { previousData };
    },
    onSuccess: () => {
      toast.success('Deleted — entry gone');
    },
    onError: (err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          historyQueryKeys.list({}),
          context.previousData,
        );
      }
      toast.error('Delete failed — please try later');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: historyQueryKeys.list({}) });
    },
  });
}

export function useDeleteHistoryItems() {
  const queryClient = useQueryClient();

  return useMutation<
    { deletedCount: number },
    ApiRequestError,
    HistoryBatchDeleteParams,
    { previousData: InfiniteData<any> | undefined }
  >({
    mutationFn: async params => {
      const resp = await historyService.deleteItems(params);
      return resp.data;
    },
    onMutate: async ({ chatIds }) => {
      await queryClient.cancelQueries({
        queryKey: historyQueryKeys.list({}),
      });

      const previousData = queryClient.getQueryData<
        InfiniteData<{
          data: HistoryItem[];
          hasMore: boolean;
          nextCursor: string | null;
        }>
      >(historyQueryKeys.list({}));

      queryClient.setQueryData(
        historyQueryKeys.list({}),
        (old: InfiniteData<any> | undefined) => {
          if (!old) return old;
          const newPages = old.pages.map((page: any) => ({
            ...page,
            data: page.data.filter(
              (item: HistoryItem) => !chatIds.includes(item.id),
            ),
          }));
          return { ...old, pages: newPages };
        },
      );

      return { previousData };
    },
    onSuccess: data => {
      toast.success(
        `Deleted — ${data.deletedCount} ${
          data.deletedCount === 1 ? 'entry' : 'entries'
        } gone`,
      );
    },
    onError: (err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          historyQueryKeys.list({}),
          context.previousData,
        );
      }
      toast.error('Delete failed — please try later');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: historyQueryKeys.list({}) });
    },
  });
}
