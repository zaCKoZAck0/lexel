import { Action, Actions } from '@/components/ai-elements/actions';
import { AIMessage } from '@/lib/types/ai-message';
import { ChevronDownIcon, CopyIcon } from 'lucide-react';
import { MessageMetadata } from './message-metadata';
import { toast } from 'sonner';
import { TextUIPart } from 'ai';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

  return (
    <Actions className="mt-2 mb-4 flex items-center w-full gap-2">
      <div className="flex items-center gap-2">
        {message.role === 'assistant' && (
          <MessageMetadata rewrite={rewrite} message={message} />
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="xs" onClick={handleCopy}>
              <CopyIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Copy</TooltipContent>
        </Tooltip>
      </div>
    </Actions>
  );
}
