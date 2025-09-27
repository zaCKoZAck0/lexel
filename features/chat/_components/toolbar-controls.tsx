'use client';

import { BrainIcon, GlobeIcon, LightbulbIcon } from 'lucide-react';
import { Model } from '@/lib/models';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils/utils';

interface ModelInfo {
  modelId: string;
  reasoningEffort: 'low' | 'medium' | 'high';
  thinkingEnabled: boolean;
  webSearchEnabled: boolean;
}

interface ToolbarControlsProps {
  modelInfo: ModelInfo;
  setModelInfo: React.Dispatch<React.SetStateAction<ModelInfo>>;
  favoriteModels: Model[];
}

export function ToolbarControls({
  modelInfo,
  setModelInfo,
  favoriteModels,
}: ToolbarControlsProps) {
  const selectedModel = favoriteModels.find(m => m.id === modelInfo.modelId);

  const toggleWebSearch = () => {
    setModelInfo(prev => ({
      ...prev,
      webSearchEnabled: !prev.webSearchEnabled,
    }));
  };

  const toggleThinking = () => {
    setModelInfo(prev => ({
      ...prev,
      thinkingEnabled: !prev.thinkingEnabled,
    }));
  };

  const handleReasoningEffortChange = (value: string) => {
    setModelInfo(prev => ({
      ...prev,
      reasoningEffort: value as 'low' | 'medium' | 'high',
    }));
  };

  return (
    <>
      {/* Search Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="xs"
            variant={modelInfo.webSearchEnabled ? 'default' : 'outline'}
            onClick={toggleWebSearch}
            className="rounded-full"
          >
            <GlobeIcon className="w-4 h-4" />
            <span className="hidden md:inline-block">Search</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {modelInfo.webSearchEnabled ? 'Disable Search' : 'Enable Search'}
        </TooltipContent>
      </Tooltip>

      {/* Reasoning Toggle - only show if model supports hybrid reasoning */}
      {selectedModel?.hybridReasoning && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="xs"
              variant={modelInfo.thinkingEnabled ? 'default' : 'outline'}
              onClick={toggleThinking}
              className="rounded-full"
            >
              <LightbulbIcon className="w-4 h-4" />
              <span className="hidden sm:inline-block">Thinking</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {modelInfo.thinkingEnabled ? 'Disable Thinking' : 'Enable Thinking'}
          </TooltipContent>
        </Tooltip>
      )}

      {/* Reasoning Effort Selector - only show if model supports effort control and doesn't have hybrid reasoning */}
      {selectedModel?.features.includes('effort-control') &&
        !selectedModel?.hybridReasoning && (
          <Select
            value={modelInfo.reasoningEffort}
            onValueChange={handleReasoningEffortChange}
          >
            <SelectTrigger
              size="sm"
              className={cn(
                buttonVariants({
                  variant: 'outline',
                  size: 'xs',
                }),
                'rounded-full !h-7 !border-border',
              )}
            >
              <BrainIcon className="w-4 h-4" />
              <SelectValue placeholder="Reasoning Effort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        )}
    </>
  );
}
