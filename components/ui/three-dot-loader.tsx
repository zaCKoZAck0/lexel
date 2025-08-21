import { cn } from '@/lib/utils/utils';

export function ThreeDotLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex items-center justify-center space-x-1', className)}
    >
      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
    </div>
  );
}
