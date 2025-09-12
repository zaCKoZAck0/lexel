import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils/utils';

interface ChatSkeletonProps {
  className?: string;
}

export function ChatSkeleton({ className }: ChatSkeletonProps) {
  return (
    <div
      className={cn('max-w-3xl w-screen pt-8 relative min-h-screen', className)}
    >
      <div className="flex flex-col h-full">
        <div className="w-full flex-1">
          {/* Conversation Window Skeleton */}
          <div className="space-y-6 pb-4">
            {/* User Message Skeleton */}
            <div className="group flex w-full items-end justify-end gap-2 py-4 is-user [&>div]:max-w-[80%] rounded-br-none rounded-xl">
              <div className="flex flex-col gap-2 overflow-hidden rounded-lg px-4 py-3 bg-secondary">
                <Skeleton className="h-4 w-48 bg-secondary-foreground/20" />
                <Skeleton className="h-4 w-32 bg-secondary-foreground/20" />
              </div>
              <div className="flex gap-2">
                {/* User Avatar */}
                <Skeleton className="size-8 rounded-full ring-1 ring-border" />
              </div>
            </div>

            {/* Assistant Message Skeleton */}
            <div className="group flex w-full items-end justify-end gap-2 py-4 is-assistant flex-row-reverse">
              <div className="flex flex-col gap-2 overflow-hidden rounded-lg px-4 py-3 text-foreground text-base w-full">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            </div>

            {/* User Message Skeleton */}
            <div className="group flex w-full items-end justify-end gap-2 py-4 is-user [&>div]:max-w-[80%]">
              <div className="flex flex-col gap-2 overflow-hidden rounded-lg px-4 py-3 bg-secondary">
                <Skeleton className="h-4 w-56 bg-secondary-foreground/20" />
              </div>
              <div className="flex gap-2">
                {/* User Avatar */}
                <Skeleton className="size-8 rounded-full ring-1 ring-border" />
              </div>
            </div>

            {/* Loading Assistant Message */}
            <div className="group flex w-full items-end justify-end gap-2 py-4 is-assistant flex-row-reverse">
              <div className="flex flex-col gap-2 overflow-hidden rounded-lg px-4 py-3 text-foreground text-base w-full">
                <div className="flex gap-2 items-center">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex space-x-1">
                    <Skeleton className="h-2 w-2 rounded-full animate-pulse" />
                    <Skeleton className="h-2 w-2 rounded-full animate-pulse [animation-delay:0.2s]" />
                    <Skeleton className="h-2 w-2 rounded-full animate-pulse [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-32" />

        {/* Input Container Skeleton */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4 pb-4">
          <div className="bg-background/80 h-[130px] backdrop-blur-sm rounded-lg border border-border p-4 shadow-lg flex flex-col justify-end">
            {/* Input area skeleton */}
            <div className="flex items-end justify-between gap-2">
              {/* Model selector skeleton */}
              <div className="flex items-end gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
