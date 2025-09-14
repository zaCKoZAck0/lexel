'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { ProviderIcons } from '@/components/icons/provider-icons';
import { getProviderInfo } from '@/lib/models/providers';
import type { Model } from '@/lib/models';
import {
  Info,
  LightbulbIcon,
  ImageIcon,
  ZapIcon,
  EyeIcon,
  WrenchIcon,
  GaugeIcon,
  DollarSignIcon,
  GitMergeIcon,
} from 'lucide-react';
import { useMemo } from 'react';

interface ModelDetailsProps {
  model: Model;
}

export function ModelDetails({ model }: ModelDetailsProps) {
  const provider = getProviderInfo(model.provider);
  const actualProvider = model.actualProvider
    ? getProviderInfo(model.actualProvider)
    : provider;

  const formatter = new Intl.NumberFormat('en', { notation: 'compact' });

  const costIndicator = useMemo(() => {
    const avgCost = (model.priceInUSD.input + model.priceInUSD.output) / 2;

    if (avgCost < 0.5) return { level: 1, price: 'Very Cheap' };
    if (avgCost < 5) return { level: 2, price: 'Cheap' };
    if (avgCost < 25) return { level: 3, price: 'Expensive' };
    return { level: 4, price: 'Very Expensive' };
  }, [model.priceInUSD.input, model.priceInUSD.output]);

  const costSymbol = '$'.repeat(costIndicator.level);

  const getCostBadgeVariant = () => {
    const costLevel = costIndicator.level;
    switch (costLevel) {
      case 1:
        return 'success';
      case 2:
      case 3:
        return 'secondary';
      case 4:
        return 'destructive';
      default:
        return 'destructive';
    }
  };

  const price = `$${formatter.format(model.priceInUSD.input)} / $${formatter.format(model.priceInUSD.output)} per ${model.priceInUSD.per}`;
  const contextWindow = `${formatter.format(model.contextWindow)} context window`;

  const secondaryFeatures = useMemo(() => {
    const features = [];

    if (model.modalities.includes('image')) {
      features.push({
        icon: EyeIcon,
        label: 'Vision',
        description: 'Can process and understand images',
      });
    }

    if (model.features.includes('tool-calling')) {
      features.push({
        icon: WrenchIcon,
        label: 'Tool Call',
        description: 'Can use external tools and APIs',
      });
    }

    if (model.features.includes('effort-control')) {
      features.push({
        icon: GaugeIcon,
        label: 'Effort Control',
        description: 'Supports configurable effort levels for reasoning',
      });
    }

    if (model.features.includes('open-source')) {
      features.push({
        icon: GitMergeIcon,
        label: 'Open Source',
        description: 'Model weights and architecture are publicly available',
      });
    }

    return features;
  }, [model.modalities, model.features]);

  return (
    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
      <div className="flex-1 space-y-1">
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ProviderIcons
              provider={actualProvider?.id || ''}
              className="h-4 w-4"
            />
            <span className="font-medium hidden md:inline">
              {actualProvider?.name}
            </span>
          </div>
          <span className="text-muted-foreground">/</span>
          <h5 className="font-medium">{model.name}</h5>

          {model.actualProvider && (
            <Badge variant="outline">by {provider.name}</Badge>
          )}

          {model.isReasoning && (
            <Badge variant="outline">
              <LightbulbIcon />
              <span className="hidden md:inline">Reasoning</span>
            </Badge>
          )}
          {model.modelType === 'image-generation' && (
            <Badge>
              <ImageIcon />
              <span className="hidden md:inline">Image Gen</span>
            </Badge>
          )}

          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </TooltipTrigger>
            <TooltipContent>{contextWindow}</TooltipContent>
          </Tooltip>
        </div>
        {model.description ? (
          <p
            title={model.description}
            className="text-sm text-muted-foreground line-clamp-1"
          >
            {model.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No description available.
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap mt-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                className="font-mono rounded-full"
                variant={getCostBadgeVariant()}
              >
                {costSymbol}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {costIndicator.price} to run at {price}
            </TooltipContent>
          </Tooltip>
          {model.features.includes('fast') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="rounded-full">
                  <ZapIcon />
                  Fast
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Optimized for speed and quick responses</p>
              </TooltipContent>
            </Tooltip>
          )}
          {secondaryFeatures.length > 0 && (
            <div className="flex items-center gap-1">
              {secondaryFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <Badge
                        aria-label={feature.label}
                        variant="secondary"
                        className="px-2 h-6 rounded-full"
                      >
                        <Icon className="size-4" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col items-center">
                        <p className="font-semibold">{feature.label}</p>
                        <p>{feature.description}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
