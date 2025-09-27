import { getModelDetails } from '@/lib/models';
import { AIMessage } from '@/lib/types/ai-message';
import { ClockIcon, BracketsIcon, ZapIcon, RefreshCcwIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getProviderInfo } from '@/lib/models/providers';

export function MessageMetadata({ message }: { message: AIMessage }) {
  const totalTokens = message.metadata?.totalTokens;
  const tokensPerSecond =
    totalTokens &&
    message.metadata?.responseEndTimeMs &&
    message.metadata?.responseStartTimeMs
      ? totalTokens /
        ((message.metadata.responseEndTimeMs -
          message.metadata.responseStartTimeMs) /
          1000)
      : 0;
  const timeToFirstTokenSeconds =
    ((message.metadata?.responseStartTimeMs || 0) -
      (message.metadata?.requestStartTimeMs || 0)) /
    1000;

  return (
    <div className="flex gap-1 items-center w-full justify-between">
      {(totalTokens || tokensPerSecond || timeToFirstTokenSeconds) && (
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="xs">
                  <ZapIcon className="size-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Stats for Nerds</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-64" side="top" align="start">
            <div className="space-y-2 text-sm">
              <h4 className="font-medium text-sm">Stats for Nerds</h4>
              {totalTokens && (
                <p className="flex items-center gap-2">
                  <BracketsIcon className="size-4" />
                  {totalTokens} tokens
                </p>
              )}
              {tokensPerSecond && (
                <p className="flex items-center gap-2">
                  <ZapIcon className="size-4" />
                  {tokensPerSecond.toFixed(2)} tokens/sec
                </p>
              )}
              {timeToFirstTokenSeconds && (
                <p className="flex items-center gap-2">
                  <ClockIcon className="size-4" />
                  Time-to-first: {timeToFirstTokenSeconds.toFixed(2)}s
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
