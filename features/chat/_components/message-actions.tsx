import { Action, Actions } from '@/components/ai-elements/actions';
import { AIMessage } from '@/lib/types/ai-message';
import { ChevronDownIcon, ClipboardIcon, RefreshCcwIcon } from 'lucide-react';
import { CopyIcon } from 'lucide-react';
import { MessageMetadata } from './message-metadata';
import { TextUIPart } from 'ai';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function MessageActions({
  message,
  part,
  regenerate,
}: {
  message: AIMessage;
  part: TextUIPart;
  regenerate: ({
    messageId,
    text,
  }: {
    messageId: string;
    text: string;
  }) => void;
}) {
  if (message.role === 'assistant') {
    return (
      <AssistantActions message={message} part={part} regenerate={regenerate} />
    );
  }
  return null;
}

function AssistantActions({
  message,
  part,
  regenerate,
}: {
  message: AIMessage;
  part: TextUIPart;
  regenerate: ({
    messageId,
    text,
  }: {
    messageId: string;
    text: string;
  }) => void;
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
    <Actions className="mt-2 flex items-center w-full justify-between">
      {message.role === 'assistant' && <MessageMetadata message={message} />}
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              <ClipboardIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Copy</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Retry <RefreshCcwIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="p-2">
            <Button variant="secondary" size="sm">
              <RefreshCcwIcon className="size-4" />
              With no changes
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Actions>
  );
}
