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
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
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
  // Configure sensors with proper activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Require 10px movement before starting drag
        tolerance: 5,
        delay: 100,
      },
    }),
  );

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
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            // Apply modifiers to restrict movement
            modifiers={[restrictToVerticalAxis]}
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

            <DragOverlay
              // Critical: Disable scale adjustment and use proper modifiers
              adjustScale={false}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              style={{
                transformOrigin: '0 0',
              }}
              dropAnimation={{
                duration: 200,
                easing: 'ease',
              }}
            >
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
