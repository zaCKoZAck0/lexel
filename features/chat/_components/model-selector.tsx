'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, ListIcon } from 'lucide-react';
import { Model } from '@/lib/models';
import { getProviderInfo } from '@/lib/models/providers';
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
          className="justify-between min-w-[100px] rounded-full"
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
          <div className="flex items-center justify-between p-2">
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
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <Link href="/settings/models">
                    <ListIcon className="w-4 h-4" />
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
                    value={modelItem.id}
                    onSelect={() => handleModelSelect(modelItem.id)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {providerInfo && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <providerInfo.Icon className="w-4 h-4" />
                          <span>{providerInfo.name}</span> /
                        </div>
                      )}
                      <span className="flex-1">{modelItem.name}</span>
                      {isSelected && (
                        <span className="text-xs text-primary">✓</span>
                      )}
                    </div>
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
