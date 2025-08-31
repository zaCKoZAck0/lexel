import { cn } from '@/lib/utils/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'bg-accent/75 backdrop-blur-sm animate-pulse rounded-md',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
