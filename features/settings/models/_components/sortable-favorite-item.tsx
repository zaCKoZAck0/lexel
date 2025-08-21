'use client';

import { Button } from '@/components/ui/button';
import type { Model } from '@/lib/models/models';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Minus } from 'lucide-react';
import { ModelDetails } from './model-details';

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
    transform,
    transition,
    isDragging,
  } = useSortable({ id: model.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || dragOverlay ? 0.75 : 1,
    zIndex: isDragging || dragOverlay ? 1000 : 1,
  } as React.CSSProperties;

  return (
    <div
      ref={dragOverlay ? undefined : setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 border rounded-lg bg-background transition-colors ${
        isDragging || dragOverlay
          ? 'shadow-lg border-primary backdrop-blur-md'
          : 'hover:bg-muted/50'
      }`}
    >
      <Button
        size="icon"
        variant="ghost"
        className="cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${model.name}`}
        title="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </Button>

      <ModelDetails model={model} />

      {!dragOverlay && (
        <Button variant="ghost" size="icon" onClick={() => onRemove()}>
          <Minus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
