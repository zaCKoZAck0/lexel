import { Action, Actions } from '@/components/ai-elements/actions';
import { AIMessage } from '@/lib/types/ai-message';
import { ChevronDownIcon, CopyIcon, RefreshCcwIcon } from 'lucide-react';
import { MessageMetadata } from './message-metadata';
import { toast } from 'sonner';
import { TextUIPart } from 'ai';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getModelDetails } from '@/lib/models';
import { getProviderInfo } from '@/lib/models/providers';
import { ShinyText } from '@/components/ui/shiny-text';

export function MessageActions({
  message,
  part,
  chatId,
  selectedModelId,
  messages,
  rewrite,
}: {
  message: AIMessage;
  part: TextUIPart;
  chatId?: string;
  selectedModelId?: string;
  messages?: AIMessage[];
  rewrite: (messageId: string) => void;
}) {
  if (message.role === 'assistant') {
    return (
      <AssistantActions
        message={message}
        part={part}
        chatId={chatId}
        selectedModelId={selectedModelId}
        messages={messages}
        rewrite={rewrite}
      />
    );
  }
  return null;
}

function AssistantActions({
  message,
  part,
  chatId,
  selectedModelId,
  messages,
  rewrite,
}: {
  message: AIMessage;
  part: TextUIPart;
  chatId?: string;
  selectedModelId?: string;
  messages?: AIMessage[];
  rewrite: (messageId: string) => void;
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(part.text);
      toast.success('Copied — ready to paste');
    } catch (error) {
      // Fallback for older browsers or when clipboard API fails
      try {
        const textArea = document.createElement('textarea');
        textArea.value = part.text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        toast.success('Copied — ready to paste');
      } catch (fallbackError) {
        toast.error('Unable to copy — use Ctrl+C instead');
      }
    }
  };

  const model = getModelDetails(message.metadata?.modelId || '');
  const provider = getProviderInfo(model?.provider || '');

  return (
    <Actions className="my-2 flex items-start justify-between w-full gap-2 rounded-md">
      <div className="flex items-center gap-1">
        {message.role === 'assistant' && (
          <MessageMetadata rewrite={rewrite} message={message} />
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="xs" onClick={handleCopy}>
              <CopyIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => rewrite(message.id)}
            >
              <RefreshCcwIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Rewrite</TooltipContent>
        </Tooltip>
      </div>
      <div>
        {model && (
          <div className="flex items-center gap-1">
            {provider && <provider.Icon className="size-4 inline-block mr-1" />}
            <p className="bg-gradient-to-l dark:from-muted-foreground from-foreground via-foreground/50 to-foreground dark:via-foreground dark:to-muted-foreground bg-clip-text text-transparent">
              {model.name}
            </p>
          </div>
        )}
      </div>
    </Actions>
  );
}
