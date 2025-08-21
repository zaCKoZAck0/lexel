'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Model } from '@/lib/models/models';
import { getProviderInfo } from '@/lib/models/providers';
import { Search, Plus } from 'lucide-react';
import { ModelDetails } from './model-details';

interface AvailableListProps {
  modelsByProvider: Record<string, Model[]>;
  searchQuery: string;
  onSearch: (value: string) => void;
  onAdd: (model: Model) => void;
  availableProviders?: string[];
}

export function AvailableList({
  modelsByProvider,
  searchQuery,
  onSearch,
  onAdd,
  availableProviders = [],
}: AvailableListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available models</CardTitle>
        <CardDescription>
          Models from providers with API keys configured. Choose models to add
          to your favorites.
          {availableProviders.length === 0 &&
            ' No providers configured - add API keys in settings to see models.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            className="pl-10 text-base sm:text-sm min-h-[44px]"
          />
        </div>

        <div className="pt-6 space-y-4">
          {Object.entries(modelsByProvider).map(([provider, models]) => (
            <div key={provider} id={provider} className="space-y-4 scroll-mt-6">
              <h4 className="font-medium text-lg sm:text-lg px-1">
                {getProviderInfo(provider)?.name ?? provider} ({models.length}{' '}
                models)
              </h4>
              <div className="space-y-3">
                {models.map(model => (
                  <div
                    key={model.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <ModelDetails model={model} />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAdd(model)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(modelsByProvider).length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            {searchQuery ? (
              <>No models found matching "{searchQuery}"</>
            ) : availableProviders.length === 0 ? (
              <>No models available. Add API keys in settings to see models.</>
            ) : (
              <>No models available from configured providers.</>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
