'use client';

import { useEffect, useMemo, useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { allModels, type Model } from '@/lib/models/models';
import {
  getUserPreferencesQuery,
  useUpdatePreferencesMutation,
  availableProvidersQuery,
} from './_queries/query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FavoritesList } from './_components/favorites-list';
import { AvailableList } from './_components/available-list';
import { AvailableProviders } from './_components/available-providers';

interface ModelsSettingsProps {}

export function ModelsSettings({}: ModelsSettingsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { preferences, isLoading, error } = getUserPreferencesQuery();
  const {
    availableProviders,
    isLoading: providersLoading,
    error: providersError,
  } = availableProvidersQuery();
  const updateMutation = useUpdatePreferencesMutation();

  const [favoriteModelIds, setFavoriteModelIds] = useState<string[]>([]);

  useEffect(() => {
    if (preferences?.favoriteModels) {
      setFavoriteModelIds(preferences.favoriteModels);
    }
  }, [preferences?.favoriteModels]);

  const favoriteModels = useMemo<Model[]>(() => {
    return favoriteModelIds
      .map(id => allModels.find(m => m.id === id))
      .filter((m): m is Model => Boolean(m));
  }, [favoriteModelIds]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const availableModels = allModels.filter(
    model =>
      !favoriteModelIds.includes(model.id) &&
      availableProviders.includes(model.provider),
  );

  const filteredAvailableModels = availableModels.filter(
    model =>
      model.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const modelsByProvider = filteredAvailableModels.reduce(
    (acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    },
    {} as Record<string, Model[]>,
  );

  const persistFavorites = (ids: string[]) => {
    setFavoriteModelIds(ids);
    updateMutation.mutate({ favoriteModels: ids });
  };

  const addToFavorites = (model: Model) => {
    const next = [...favoriteModelIds, model.id];
    persistFavorites(next);
  };

  const removeFromFavorites = (modelId: string) => {
    const next = favoriteModelIds.filter(id => id !== modelId);
    persistFavorites(next);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = favoriteModelIds.findIndex(id => id === active.id);
      const newIndex = favoriteModelIds.findIndex(id => id === over.id);
      const reordered = arrayMove(favoriteModelIds, oldIndex, newIndex);
      persistFavorites(reordered);
    }

    setActiveId(null);
  };

  if (isLoading || providersLoading) {
    return <ModelsSettingsSkeleton />;
  }

  if (error || providersError) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive mb-2">
          {error
            ? 'Failed to load preferences'
            : 'Failed to load available providers'}
        </p>
        <p className="text-sm text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 sm:space-y-6 max-w-full">
        <AvailableProviders availableProviders={availableProviders} />

        <FavoritesList
          favoriteModels={favoriteModels}
          activeId={activeId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onRemove={id => removeFromFavorites(id)}
        />

        <AvailableList
          modelsByProvider={modelsByProvider}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onAdd={addToFavorites}
          availableProviders={availableProviders}
        />
      </div>
    </TooltipProvider>
  );
}

const ModelsSettingsSkeleton = () => {
  return (
    <div className="space-y-6 sm:space-y-6 max-w-full">
      {/* Available Providers Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-16" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg"
            >
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Favorites Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-56" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-80" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-64" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-72" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
          <div className="pt-6 space-y-6">
            {[0, 1].map(g => (
              <div key={g} className="space-y-4">
                <Skeleton className="h-5 w-64" />
                <div className="space-y-3">
                  {[0, 1, 2].map(r => (
                    <div
                      key={r}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4 rounded" />
                          <Skeleton className="h-5 w-40" />
                        </div>
                        <Skeleton className="h-4 w-80" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
