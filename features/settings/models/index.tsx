'use client';

import { useEffect, useMemo, useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { allModels, type Model } from '@/lib/models';
import { PROVIDER_MAP } from '@/lib/models/providers';
import { PinList, type PinListItem } from '@/components/ui/pin-list';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Pin, ChevronUp, ChevronDown } from 'lucide-react';
import { AvailableProviders } from './_components/available-providers';
import { ModelDetails } from './_components/model-details';

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

  const persistFavorites = (ids: string[]) => {
    setFavoriteModelIds(ids);
    updateMutation.debouncedMutate({ favoriteModels: ids });
  };

  const addToFavorites = (model: Model) => {
    const next = [...favoriteModelIds, model.id];
    persistFavorites(next);
  };

  const removeFromFavorites = (modelId: string) => {
    const next = favoriteModelIds.filter(id => id !== modelId);
    persistFavorites(next);
  };

  const moveModelUp = (modelId: string) => {
    const currentIndex = favoriteModelIds.indexOf(modelId);
    if (currentIndex > 0) {
      const newIds = [...favoriteModelIds];
      [newIds[currentIndex - 1], newIds[currentIndex]] = [
        newIds[currentIndex],
        newIds[currentIndex - 1],
      ];
      persistFavorites(newIds);
    }
  };

  const moveModelDown = (modelId: string) => {
    const currentIndex = favoriteModelIds.indexOf(modelId);
    if (currentIndex < favoriteModelIds.length - 1) {
      const newIds = [...favoriteModelIds];
      [newIds[currentIndex], newIds[currentIndex + 1]] = [
        newIds[currentIndex + 1],
        newIds[currentIndex],
      ];
      persistFavorites(newIds);
    }
  };

  // Transform models into pin list items
  const transformModelToPinItem = (model: Model): PinListItem => {
    const providerInfo = PROVIDER_MAP[model.provider];
    return {
      id: model.id,
      name: model.name,
      info: `${model.provider} • ${model.modalities.join(', ')} • $${model.priceInUSD.input}/${model.priceInUSD.per}`,
      icon: providerInfo?.Icon || (() => null),
      pinned: favoriteModelIds.includes(model.id),
    };
  };

  const availableModels = useMemo(() => {
    const baseFiltered = allModels.filter(model =>
      availableProviders.includes(model.provider),
    );

    const searched = searchQuery
      ? baseFiltered.filter(
          model =>
            model.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            model.provider.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : baseFiltered;

    // Sort to put favorites first in their specified order, then non-favorites
    const favorites = favoriteModelIds
      .map(id => searched.find(model => model.id === id))
      .filter((model): model is Model => model !== undefined);

    const nonFavorites = searched.filter(
      model => !favoriteModelIds.includes(model.id),
    );

    return [...favorites, ...nonFavorites];
  }, [availableProviders, searchQuery, favoriteModelIds]);

  const renderModelContent = (model: Model, renderedItem: PinListItem) => {
    const isPinned = renderedItem.pinned;
    const currentIndex = favoriteModelIds.indexOf(model.id);
    const canMoveUp = isPinned && currentIndex > 0;
    const canMoveDown = isPinned && currentIndex < favoriteModelIds.length - 1;

    return (
      <>
        {isPinned && (
          <div className="flex flex-col gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={e => {
                e.stopPropagation();
                moveModelUp(model.id);
              }}
              disabled={!canMoveUp}
              aria-label={`Move ${model.name} up`}
              title="Move up"
              type="button"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={e => {
                e.stopPropagation();
                moveModelDown(model.id);
              }}
              disabled={!canMoveDown}
              aria-label={`Move ${model.name} down`}
              title="Move down"
              type="button"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        )}
        <div className="flex-1 min-w-0 cursor-default p-2">
          <ModelDetails model={model} />
        </div>
        <Button
          variant={isPinned ? 'secondary' : 'outline'}
          size="icon"
          onClick={e => {
            e.stopPropagation();
            handleTogglePin(model, renderedItem);
          }}
          aria-label={isPinned ? `Unpin ${model.name}` : `Pin ${model.name}`}
          title={isPinned ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Pin className={`size-4 ${isPinned ? 'fill-current' : ''}`} />
        </Button>
      </>
    );
  };
  const handleTogglePin = (model: Model, renderedItem: PinListItem) => {
    if (favoriteModelIds.includes(model.id)) {
      removeFromFavorites(model.id);
    } else {
      addToFavorites(model);
    }
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

        <Card>
          <CardHeader>
            <CardTitle>AI Models</CardTitle>
            <CardDescription>
              Pin your favorite models to prioritize them in the chat selector.
              {availableProviders.length === 0 &&
                ' No providers configured - add API keys in settings to see models.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 text-base sm:text-sm min-h-[44px]"
                />
              </div>

              {availableModels.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {searchQuery ? (
                    <>No models found matching "{searchQuery}"</>
                  ) : availableProviders.length === 0 ? (
                    <>
                      No models available. Add API keys in settings to see
                      models.
                    </>
                  ) : (
                    <>No models available from configured providers.</>
                  )}
                </div>
              ) : (
                <PinList<Model>
                  items={availableModels}
                  renderItem={transformModelToPinItem}
                  renderContent={renderModelContent}
                  onTogglePin={handleTogglePin}
                  labels={{
                    pinned: 'Favorite Models',
                    unpinned: 'Available Models',
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
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
