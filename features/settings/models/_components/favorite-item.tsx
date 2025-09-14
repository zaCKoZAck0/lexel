'use client';

import { Button } from '@/components/ui/button';
import type { Model } from '@/lib/models';
import { ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { ModelDetails } from './model-details';
import { useEffect, useRef } from 'react';

interface FavoriteItemProps {
  model: Model;
  index: number;
  isFocused: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onFocus: () => void;
}

export function FavoriteItem({
  model,
  index,
  isFocused,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
  onFocus,
}: FavoriteItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused && itemRef.current) {
      itemRef.current.focus();
    }
  }, [isFocused]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (canMoveUp) {
          onMoveUp();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (canMoveDown) {
          onMoveDown();
        }
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        onRemove();
        break;
    }
  };

  return (
    <div
      ref={itemRef}
      tabIndex={0}
      className={`flex items-center gap-3 p-3 border rounded-lg bg-background transition-all duration-200 outline-none ${
        isFocused
          ? 'ring-2 ring-primary border-primary/50 bg-primary/5'
          : 'hover:bg-muted/50 hover:shadow-sm focus:ring-2 focus:ring-primary focus:border-primary/50'
      }`}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      role="listitem"
      aria-label={`${model.name} - Use arrow keys to reorder, Delete to remove`}
    >
      {/* Movement controls */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          aria-label={`Move ${model.name} up`}
          title="Move up (↑)"
          type="button"
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          aria-label={`Move ${model.name} down`}
          title="Move down (↓)"
          type="button"
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>

      {/* Content area */}
      <div className="flex-1 min-w-0">
        <ModelDetails model={model} />
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="flex-shrink-0"
        aria-label={`Remove ${model.name}`}
        title="Remove (Delete)"
        type="button"
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
}
