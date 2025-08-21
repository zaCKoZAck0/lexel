'use client';

import { useState, useMemo } from 'react';
import { AddApiKeyDialog } from './_components/add-api-key-dialog';
import { ApiKeysList } from './_components/api-keys-list';
import { getAllApiKeysQuery } from './_queries/get-all-api-keys-query';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

export function ApiKeys() {
  const { keys, isLoading, error, refetch } = getAllApiKeysQuery();
  const [query, setQuery] = useState('');

  // Stable default ordering so order doesn't jump after mutations (sort by id asc)
  const sortedKeys = useMemo(() => {
    if (!keys) return [];
    // create a shallow copy to avoid mutating react-query cache
    return [...keys].sort((a, b) => a.id.localeCompare(b.id));
  }, [keys]);

  // Apply search filter on the stable sorted list
  const filtered = useMemo(() => {
    if (!sortedKeys.length) return [];
    const q = query.trim().toLowerCase();
    if (!q) return sortedKeys;
    return sortedKeys.filter(k => {
      const provider = k.provider.toLowerCase();
      const keyPart = k.key.toLowerCase();
      return provider.includes(q) || keyPart.includes(q);
    });
  }, [sortedKeys, query]);

  const totalKeys = keys?.length || 0;
  const totalProviders = useMemo(
    () => new Set((keys || []).map(k => k.provider)).size,
    [keys],
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center">
            <div className="w-full">
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {[0, 1].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[0, 1, 2].map(r => (
                    <div key={r} className="p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-64" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive mb-4">Failed to load API keys</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-4 space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">API Keys</h1>
          <p className="text-sm text-muted-foreground">
            Securely store and manage your AI provider keys (256-bit
            encryption).
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center">
          <div className="w-full">
            <Input
              placeholder="Search keys..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full"
              aria-label="Search API keys"
            />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetch()}
                  disabled={isLoading}
                  aria-label="Refresh keys"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
            <AddApiKeyDialog />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs font-normal">
            {totalKeys} {totalKeys === 1 ? 'Key' : 'Keys'}
          </Badge>
          <Badge variant="outline" className="text-xs font-normal">
            {totalProviders} {totalProviders === 1 ? 'Provider' : 'Providers'}
          </Badge>
        </div>
      </div>
      <div className="pt-0 space-y-4">
        <ApiKeysList keys={filtered} />
        {filtered.length === 0 && keys && keys.length > 0 && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            No keys match "{query}"
          </p>
        )}
      </div>
    </div>
  );
}
