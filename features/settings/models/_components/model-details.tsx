'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ProviderIcons } from '@/components/icons/provider-icons';
import { getProviderInfo } from '@/lib/models/providers';
import type { Model } from '@/lib/models/models';
import {
  Info,
  LightbulbIcon,
  ImageIcon,
  ZapIcon,
  EyeIcon,
  WrenchIcon,
} from 'lucide-react';

interface ModelDetailsProps {
  model: Model;
}

export function ModelDetails({ model }: ModelDetailsProps) {
  const provider = getProviderInfo(model.provider);
  const actualProvider = model.actualProvider
    ? getProviderInfo(model.actualProvider)
    : provider;

  const formatter = new Intl.NumberFormat('en', { notation: 'compact' });

  const modelInfo = () => {
    const price = `$${formatter.format(model.priceInUSD.input)} / $${formatter.format(model.priceInUSD.output)} ${model.priceInUSD.per}`;
    const contextWindow = `${formatter.format(model.contextWindow)} context window`;
    return `${price} • ${contextWindow}`;
  };

  return (
    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-muted-foreground">
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
            <Badge variant="outline">
              by{' '}
              {model.provider.charAt(0).toUpperCase() + model.provider.slice(1)}
            </Badge>
          )}

          {model.isReasoning && (
            <Badge>
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
            <TooltipContent>
              <div className="text-sm">
                <p>{modelInfo()}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-sm text-muted-foreground">
          {'No description available.'}
        </p>
        <div className="flex items-center gap-2 flex-wrap mt-1">
          {model.features.includes('fast') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary">
                  <ZapIcon />
                  Fast
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Optimized for speed and quick responses</p>
              </TooltipContent>
            </Tooltip>
          )}
          {model.modalities.includes('image') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary">
                  <EyeIcon />
                  Vision
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Can process and understand images</p>
              </TooltipContent>
            </Tooltip>
          )}
          {model.features.includes('tool-calling') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary">
                  <WrenchIcon />
                  Tool Call
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Can use external tools and APIs</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
