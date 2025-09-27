'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CheckIcon,
  ChevronDownIcon,
  Edit2Icon,
  Edit3Icon,
  ListIcon,
  PencilIcon,
  EyeIcon,
  WrenchIcon,
  GaugeIcon,
  GitMergeIcon,
  ZapIcon,
  BrainIcon,
  LightbulbIcon,
} from 'lucide-react';
import { Model } from '@/lib/models';
import { getProviderInfo, ProviderConfig } from '@/lib/models/providers';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useModelFiltering } from '../_hooks/use-model-filtering';
import { Badge } from '@/components/ui/badge';

interface ModelInfo {
  modelId: string;
  reasoningEffort: 'low' | 'medium' | 'high';
  thinkingEnabled: boolean;
  webSearchEnabled: boolean;
}

interface ModelSelectorProps {
  modelInfo: ModelInfo;
  setModelInfo: React.Dispatch<React.SetStateAction<ModelInfo>>;
  favoriteModels: Model[];
}

export function ModelSelector({
  modelInfo,
  setModelInfo,
  favoriteModels,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const { searchQuery, setSearchQuery, filteredModels } =
    useModelFiltering(favoriteModels);

  const selectedModel = favoriteModels.find(m => m.id === modelInfo.modelId);
  const providerInfo = selectedModel
    ? getProviderInfo(selectedModel.provider)
    : null;

  const handleModelSelect = (modelId: string) => {
    setModelInfo(prev => ({
      ...prev,
      modelId,
    }));
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          size="xs"
          aria-expanded={open}
          className="justify-between min-w-[100px] !rounded-full"
        >
          {selectedModel ? (
            <div className="flex items-center gap-2">
              {providerInfo && <providerInfo.Icon className="w-4 h-4" />}
              <span className="truncate">{selectedModel.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Select model...</span>
          )}
          <ChevronDownIcon className="w-4 h-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <div className="flex items-center justify-between py-2 pr-1">
            <CommandInput
              className="w-full"
              placeholder="Search models..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <Link href="/settings/models">
                    <Edit3Icon className="w-4 h-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit favorite models</TooltipContent>
            </Tooltip>
          </div>
          <CommandList>
            <CommandEmpty>No models found.</CommandEmpty>
            <CommandGroup>
              {filteredModels.map(modelItem => {
                const providerInfo = getProviderInfo(modelItem.provider);
                const isSelected = modelInfo.modelId === modelItem.id;
                return (
                  <CommandItem
                    key={modelItem.id}
                    className="p-0"
                    value={modelItem.id}
                    onSelect={() => handleModelSelect(modelItem.id)}
                  >
                    <ModelItem
                      modelItem={modelItem}
                      providerInfo={providerInfo}
                      isSelected={isSelected}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const ModelItem = ({
  modelItem,
  providerInfo,
  isSelected,
}: {
  modelItem: Model;
  providerInfo: ProviderConfig;
  isSelected: boolean;
}) => {
  return (
    <Tooltip side="right">
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 w-full p-2">
          {providerInfo && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <providerInfo.Icon className="w-4 h-4" />
              <span>{providerInfo.name}</span> /
            </div>
          )}
          <span className="flex-1">{modelItem.name}</span>
          {isSelected && <CheckIcon className="w-4 h-4 text-primary" />}
        </div>
      </TooltipTrigger>
      <TooltipContent
        arrowStyle="fill-muted/75"
        className="!bg-card/75 border text-card-foreground backdrop-blur-md"
      >
        <ModelDetails model={modelItem} providerInfo={providerInfo} />
      </TooltipContent>
    </Tooltip>
  );
};

const ModelDetails = ({
  model,
  providerInfo,
}: {
  model: Model;
  providerInfo: ProviderConfig;
}) => {
  const formatter = new Intl.NumberFormat('en', { notation: 'compact' });

  const features = useMemo(() => {
    const featuresList = [];

    if (model.modalities.includes('image')) {
      featuresList.push({
        icon: EyeIcon,
        label: 'Vision',
        description: 'Can process and understand images',
      });
    }

    if (model.features.includes('tool-calling')) {
      featuresList.push({
        icon: WrenchIcon,
        label: 'Tool Call',
        description: 'Can use external tools and APIs',
      });
    }

    if (model.features.includes('effort-control')) {
      featuresList.push({
        icon: GaugeIcon,
        label: 'Effort Control',
        description: 'Supports configurable effort levels for reasoning',
      });
    }

    if (model.features.includes('open-source')) {
      featuresList.push({
        icon: GitMergeIcon,
        label: 'Open Source',
        description: 'Model weights and architecture are publicly available',
      });
    }

    if (model.features.includes('fast')) {
      featuresList.push({
        icon: ZapIcon,
        label: 'Fast',
        description: 'Optimized for speed and quick responses',
      });
    }

    return featuresList;
  }, [model.modalities, model.features]);

  return (
    <div className="w-[30rem] space-y-2 text-sm py-2">
      <div className="flex items-center gap-2 text-xl">
        <providerInfo.Icon className="w-5 h-5 opacity-75" />
        <span className="opacity-50">{providerInfo.name}</span> /
        <span className="truncate">{model.name}</span>
        {model.isReasoning && (
          <Badge className="rounded-full">
            <BrainIcon className="w-5 h-5" /> Reasoning
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Badge
              className="rounded-full"
              variant="outline"
              key={`${feature.label}-${index}`}
            >
              <Icon className="w-4 h-4" />
              {feature.label}
            </Badge>
          );
        })}
      </div>
      <p className="text-sm leading-relaxed opacity-70">{model.description}</p>
      <table className="text-sm w-[70%]">
        <tbody className="space-y-0.5">
          {model.contextWindow && (
            <tr>
              <td className="opacity-70">Context</td>
              <td>{formatter.format(model.contextWindow)} tokens</td>
            </tr>
          )}
          <tr>
            <td className="opacity-70">Input Pricing</td>
            <td>
              ${formatter.format(model.priceInUSD.input)} per{' '}
              {model.priceInUSD.per}
            </td>
          </tr>
          <tr>
            <td className="opacity-70">Output Pricing</td>
            <td>
              ${formatter.format(model.priceInUSD.output)} per{' '}
              {model.priceInUSD.per}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
