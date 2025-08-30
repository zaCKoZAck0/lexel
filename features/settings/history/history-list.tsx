'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Trash2, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';
import { historyQueryKeys } from '@/lib/types/history';

import { HistoryItemCard } from './history-item-card';
import { HistoryLoadingSkeleton } from './history-loading-skeleton';
import {
  useHistoryInfinite,
  useSearchHistory,
} from '@/lib/queries/history-queries';
import {
  useDeleteHistoryItem,
  useDeleteHistoryItems,
} from '@/lib/queries/history-mutations';

interface HistoryListProps {
  searchQuery?: string;
  sortOrder?: 'newest' | 'oldest';
  isSelectionMode?: boolean;
  onSelectionModeChange?: (mode: boolean) => void;
}

export function HistoryList({
  searchQuery,
  sortOrder = 'newest',
  isSelectionMode = false,
  onSelectionModeChange,
}: HistoryListProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [previousSortOrder, setPreviousSortOrder] = useState<
    'newest' | 'oldest'
  >(sortOrder);

  const queryClient = useQueryClient();

  // Use search query if provided, otherwise use regular history fetch
  const searchQueryHook = useSearchHistory(
    searchQuery || '',
    !!searchQuery?.trim(),
    sortOrder,
  );
  const historyQueryHook = useHistoryInfinite({ sortOrder });

  const {
    data: historyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    isRefetching,
  } = searchQuery ? searchQueryHook : historyQueryHook;

  // Check if we're loading search results
  const isSearchLoading = searchQuery && searchQueryHook.isLoading;

  // Detect sort order changes and invalidate specific queries
  useEffect(() => {
    if (previousSortOrder !== sortOrder) {
      // Invalidate the specific query being used
      if (searchQuery) {
        queryClient.invalidateQueries({
          queryKey: historyQueryKeys.list({ query: searchQuery, sortOrder }),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: historyQueryKeys.list({ sortOrder }),
        });
      }

      setPreviousSortOrder(sortOrder);
    }
  }, [sortOrder, previousSortOrder, queryClient, searchQuery]);

  // Skeleton component for different loading states
  const LoadingSkeleton = ({ count = 6 }: { count?: number }) => (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 border-b border-border animate-pulse"
        >
          {isSelectionMode && <Skeleton className="h-4 w-4" />}
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-6 w-6" />
        </div>
      ))}
    </div>
  );

  const deleteItemMutation = useDeleteHistoryItem();
  const deleteItemsMutation = useDeleteHistoryItems();

  // Flatten the pages data and ensure unique items with valid IDs
  const historyItems = useMemo(() => {
    if (!historyData?.pages) return [];
    const flattened = historyData.pages.flatMap(page => page.data);
    // Filter out items without valid IDs and ensure uniqueness
    const seen = new Set<string>();
    const filtered = flattened.filter(item => {
      if (!item?.id) return false;
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    // Server-side sorting is already applied, just return filtered items
    return filtered;
  }, [historyData?.pages]);

  // Determine loading states - use React Query's built-in states
  const shouldShowSearchLoading = isSearchLoading;
  const shouldShowSortingLoading = isRefetching && historyItems.length > 0;
  const shouldShowRegularLoading = isLoading && historyItems.length === 0;

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(historyItems.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      deleteItemMutation.mutate({ chatId: itemId });
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      deleteItemsMutation.mutate({
        chatIds: Array.from(selectedItems),
      });
      setSelectedItems(new Set());
      onSelectionModeChange?.(false);
    } catch (error) {
      console.error('Failed to delete items:', error);
    }
  };

  // Render the appropriate content based on state
  const renderContent = () => {
    if (shouldShowSearchLoading) {
      return <HistoryLoadingSkeleton count={4} />;
    }

    if (shouldShowSortingLoading) {
      return <HistoryLoadingSkeleton count={historyItems.length} />;
    }

    if (shouldShowRegularLoading) {
      return <HistoryLoadingSkeleton count={8} />;
    }

    if (isError) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-destructive">
                Error loading history
              </h3>
              <p className="text-muted-foreground">
                {error?.message ||
                  'Something went wrong while loading your history.'}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (historyItems.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No history found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No history items found for "${searchQuery}".`
                  : 'Your chat history will appear here.'}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div>
        {historyItems.map((item, index) => (
          <HistoryItemCard
            key={item.id || `fallback-${index}`}
            item={item}
            isSelected={selectedItems.has(item.id)}
            isSelectionMode={isSelectionMode}
            onSelect={handleSelectItem}
            onDelete={handleDeleteItem}
          />
        ))}

        {/* Load more trigger - enhanced button with loading states */}
        {hasNextPage && (
          <div className="flex justify-center py-6">
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Loading more chats...
              </div>
            ) : (
              <Button variant="link" size="xs" onClick={() => fetchNextPage()}>
                Load More
              </Button>
            )}
          </div>
        )}

        {/* Show when all history has been loaded */}
        {!hasNextPage && historyItems.length > 0 && (
          <div className="flex justify-center py-6">
            <p className="text-sm text-muted-foreground">
              You've reached rock bottom... of your history
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Selection mode controls */}
      {isSelectionMode && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={selectedItems.size === historyItems.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">
              {selectedItems.size} selected
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="destructive"
              size="xs"
              onClick={handleDeleteSelected}
              disabled={
                selectedItems.size === 0 || deleteItemsMutation.isPending
              }
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden md:block">Delete Selected</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onSelectionModeChange?.(false);
                setSelectedItems(new Set());
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* History content */}
      {renderContent()}
    </div>
  );
}
