'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { Model } from '@/lib/models';
import {
  DndContext,
  closestCenter,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableFavoriteItem } from './sortable-favorite-item';

interface FavoritesListProps {
  favoriteModels: Model[];
  activeId: string | null;
  onDragStart: (e: DragStartEvent) => void;
  onDragEnd: (e: DragEndEvent) => void;
  onRemove: (modelId: string) => void;
}

export function FavoritesList({
  favoriteModels,
  activeId,
  onDragStart,
  onDragEnd,
  onRemove,
}: FavoritesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your favorite Models ({favoriteModels.length})</CardTitle>
        <CardDescription>
          Reorder and manage the models shown in your selector.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {favoriteModels.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 sm:py-16 border-2 border-dashed border-muted rounded-lg">
            <div className="space-y-3 max-w-sm mx-auto">
              <p className="text-sm sm:text-base">No favorite models yet.</p>
              <p className="text-xs sm:text-sm">
                Add some from the available models below.
              </p>
            </div>
          </div>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={favoriteModels.map(m => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {favoriteModels.map(model => (
                  <SortableFavoriteItem
                    key={model.id}
                    model={model}
                    onRemove={() => onRemove(model.id)}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeId ? (
                <SortableFavoriteItem
                  model={
                    favoriteModels.find(m => m.id === activeId) ||
                    favoriteModels[0]
                  }
                  onRemove={() => {}}
                  dragOverlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
