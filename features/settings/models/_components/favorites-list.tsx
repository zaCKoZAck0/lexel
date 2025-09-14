'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { Model } from '@/lib/models';
import { FavoriteItem } from './favorite-item';

interface FavoritesListProps {
  favoriteModels: Model[];
  focusedIndex: number;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRemove: (modelId: string) => void;
  onFocusChange: (index: number) => void;
}

export function FavoritesList({
  favoriteModels,
  focusedIndex,
  onMoveUp,
  onMoveDown,
  onRemove,
  onFocusChange,
}: FavoritesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your favorite Models ({favoriteModels.length})</CardTitle>
        <CardDescription>
          Use arrow keys to reorder and manage the models shown in your
          selector.
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
          <div className="space-y-4">
            {favoriteModels.map((model, index) => (
              <FavoriteItem
                key={model.id}
                model={model}
                index={index}
                isFocused={focusedIndex === index}
                canMoveUp={index > 0}
                canMoveDown={index < favoriteModels.length - 1}
                onMoveUp={() => onMoveUp(index)}
                onMoveDown={() => onMoveDown(index)}
                onRemove={() => onRemove(model.id)}
                onFocus={() => onFocusChange(index)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
