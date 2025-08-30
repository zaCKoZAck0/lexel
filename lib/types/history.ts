import { Chat, Visibility } from '@prisma/client';

// History item (Chat) type
export type HistoryItem = Chat;

// History list response with pagination
export interface HistoryListResponse {
  data: HistoryItem[];
  total: number;
  hasMore: boolean;
  nextCursor: string | null;
}

// History search params
export interface HistorySearchParams {
  query?: string;
  cursor?: string;
  limit?: number;
  sortOrder?: 'newest' | 'oldest';
}

// History delete params
export interface HistoryDeleteParams {
  chatId: string;
}

// History batch delete params
export interface HistoryBatchDeleteParams {
  chatIds: string[];
}

// History statistics
export interface HistoryStats {
  totalChats: number;
  totalMessages: number;
  publicChats: number;
  privateChats: number;
  recentChats: number;
}

// History filters
export interface HistoryFilters {
  visibility?: Visibility;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// Extended history item with additional metadata
export interface HistoryItemExtended extends HistoryItem {
  messageCount?: number;
  lastMessageAt?: Date;
  totalTokens?: number;
}

// History query keys for React Query
export const historyQueryKeys = {
  all: ['history'] as const,
  lists: () => [...historyQueryKeys.all, 'list'] as const,
  list: (filters: HistorySearchParams) =>
    [...historyQueryKeys.lists(), filters] as const,
  details: () => [...historyQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...historyQueryKeys.details(), id] as const,
  stats: () => [...historyQueryKeys.all, 'stats'] as const,
} as const;
