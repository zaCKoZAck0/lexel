import { TooltipButton } from '@/components/ui/tooltip-button';
import { CopyIcon } from 'lucide-react';
import { toast } from 'sonner';

interface CopyButtonProps {
  text: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
  className?: string;
  tooltipText?: string;
}

const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied — ready to paste');
  } catch (error) {
    console.error('Failed to copy text: ', error);
    // Fallback for older browsers or when clipboard API fails
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      toast.success('Copied — ready to paste');
    } catch (fallbackError) {
      console.error('Fallback: Oops, unable to copy', fallbackError);
      toast.error('Unable to copy — use Ctrl+C instead');
    }
  }
};

export function CopyButton({
  text,
  variant = 'ghost',
  size = 'xs',
  className,
  tooltipText = 'Copy',
}: CopyButtonProps) {
  return (
    <TooltipButton
      tooltipContent={tooltipText}
      variant={variant}
      size={size}
      className={className}
      onClick={() => handleCopy(text)}
    >
      <CopyIcon className="size-4" />
    </TooltipButton>
  );
}
