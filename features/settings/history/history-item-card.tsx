'use client';

import React from 'react';
import { Trash2, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { HistoryItem } from '@/lib/types/history';
import Link from 'next/link';

interface HistoryItemCardProps {
  item: HistoryItem;
  isSelected: boolean;
  isSelectionMode: boolean;
  onSelect: (itemId: string, checked: boolean) => void;
  onDelete: (itemId: string) => void;
}

export function HistoryItemCard({
  item,
  isSelected,
  isSelectionMode,
  onSelect,
  onDelete,
}: HistoryItemCardProps) {
  const handleDelete = () => {
    onDelete(item.id);
  };

  return (
    <div className={cn('flex items-center gap-3 pl-3 border-b border-border')}>
      {isSelectionMode && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={checked => onSelect(item.id, checked as boolean)}
          className="h-4 w-4"
        />
      )}

      <Link href={`/chat/${item.id}`} className={'flex-1 min-w-0 p-3 group'}>
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm truncate flex-1 group-hover:text-foreground/75 transition-colors">
            {item.title}
          </h4>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(item.createdAt))}
          </span>
        </div>
      </Link>

      {!isSelectionMode && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="xs">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDelete} variant="destructive">
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
