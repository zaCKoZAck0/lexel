'use client';

import { Button } from '@/components/ui/button';
import type { Model } from '@/lib/models';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Minus } from 'lucide-react';
import { ModelDetails } from './model-details';
import { forwardRef } from 'react';

interface SortableFavoriteItemProps {
  model: Model;
  onRemove: () => void;
  dragOverlay?: boolean;
}

export function SortableFavoriteItem({
  model,
  onRemove,
  dragOverlay = false,
}: SortableFavoriteItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: model.id,
  });

  // Handle drag overlay separately to prevent positioning issues
  if (dragOverlay) {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-background shadow-2xl border-primary/50 backdrop-blur-md">
        <div className="flex-shrink-0">
          <GripVertical className="size-4 text-muted-foreground" />
        </div>
        <ModelDetails model={model} />
      </div>
    );
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 border rounded-lg bg-background transition-all duration-200 ${
        isDragging
          ? 'opacity-50 scale-95 z-50'
          : 'hover:bg-muted/50 hover:shadow-sm'
      }`}
    >
      {/* Dedicated drag handle */}
      <Button
        ref={setActivatorNodeRef}
        size="icon"
        variant="ghost"
        className="cursor-grab active:cursor-grabbing touch-none select-none flex-shrink-0"
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${model.name}`}
        title="Drag to reorder"
        type="button"
      >
        <GripVertical className="size-4" />
      </Button>

      {/* Content area - not draggable */}
      <div className="flex-1 min-w-0">
        <ModelDetails model={model} />
      </div>

      {/* Remove button - not draggable */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="flex-shrink-0"
        type="button"
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
}
