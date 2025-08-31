'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface HistoryLoadingSkeletonProps {
  count?: number;
}

export function HistoryLoadingSkeleton({
  count = 6,
}: HistoryLoadingSkeletonProps) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 border-b border-border animate-pulse"
        >
          <Skeleton className="h-4 w-4" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-6 w-6" />
        </div>
      ))}
    </div>
  );
}
