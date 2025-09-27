'use client';

import { Button } from '@/components/ui/button';
import { getProviderInfo } from '@/lib/models/providers';
import { allModels } from '@/lib/models';
import { KeyIcon, Settings } from 'lucide-react';
import Link from 'next/link';

interface AvailableProvidersProps {
  availableProviders: string[];
}

export function AvailableProviders({
  availableProviders,
}: AvailableProvidersProps) {
  // Count models per provider
  const modelCounts = availableProviders.reduce(
    (acc, providerId) => {
      acc[providerId] = allModels.filter(
        model => model.provider === providerId,
      ).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleProviderClick = (providerId: string) => {
    const element = document.getElementById(providerId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-3 px-1">
      {/* Header with provider count and manage button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Available Providers ({availableProviders.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Add API keys to access more providers.
          </p>
        </div>
        <Button asChild variant="link" size="sm" className="h-7 px-2 text-xs">
          <Link href="/settings/api-keys">
            <KeyIcon className="h-3 w-3 mr-1" />
            Add API keys
          </Link>
        </Button>
      </div>

      {/* Compact provider pills */}
      <div className="flex flex-wrap gap-2">
        {availableProviders.map(providerId => {
          const providerInfo = getProviderInfo(providerId);
          const Icon = providerInfo?.Icon;
          const modelCount = modelCounts[providerId] || 0;

          return (
            <button
              key={providerId}
              onClick={() => handleProviderClick(providerId)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-background border rounded-lg hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group"
              aria-label={`Go to ${providerInfo?.name || providerId} models section`}
            >
              <div className="flex-shrink-0">
                {Icon && <Icon className="h-4 w-4" />}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="font-medium">
                  {providerInfo?.name || providerId}
                </span>
                <span className="text-muted-foreground">({modelCount})</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
