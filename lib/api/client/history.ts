import { apiRequest, ApiRequestError } from '@/lib/api/client';
import type {
  HistoryItem,
  HistoryListResponse,
  HistorySearchParams,
  HistoryDeleteParams,
  HistoryBatchDeleteParams,
} from '@/lib/types/history';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// History service functions
export const historyService = {
  /**
   * Get paginated history items
   */
  getHistory: async (
    params: HistorySearchParams = {},
  ): Promise<HistoryListResponse> => {
    const queryParams = new URLSearchParams();

    if (params.query) queryParams.append('query', params.query);
    if (params.cursor) queryParams.append('cursor', params.cursor);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const url = queryString ? `/history?${queryString}` : '/history';

    const response = await apiRequest<ApiResponse<HistoryListResponse>>(url);
    return response.data; // Extract the inner data from the API response wrapper
  },

  /**
   * Delete a single history item
   */
  deleteItem: async ({
    chatId,
  }: HistoryDeleteParams): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiRequest<ApiResponse<{ message: string }>>(
      `/history/${chatId}`,
      {
        method: 'DELETE',
      },
    );
    return response; // Return the full response since it contains success status
  },

  /**
   * Delete multiple history items
   */
  deleteItems: async ({
    chatIds,
  }: HistoryBatchDeleteParams): Promise<
    ApiResponse<{ deletedCount: number }>
  > => {
    const response = await apiRequest<ApiResponse<{ deletedCount: number }>>(
      '/history',
      {
        method: 'DELETE',
        body: JSON.stringify({ chatIds }),
      },
    );
    return response; // Return the full response since it contains success status
  },

  /**
   * Search history items
   */
  search: async (query: string, limit = 20): Promise<HistoryItem[]> => {
    const response = await historyService.getHistory({ query, limit });
    return response.data;
  },
};
