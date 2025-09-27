import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/utils';
import type { UIMessage } from 'ai';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ComponentProps, HTMLAttributes } from 'react';
import { useEffect, useRef, useState } from 'react';

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage['role'];
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      'group flex w-full items-end justify-end gap-2 py-4 [&>div]:w-full',
      from === 'user' ? 'is-user' : 'is-assistant flex-row-reverse justify-end',
      className,
    )}
    {...props}
  />
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement> & {
  from?: UIMessage['role'];
};

export const MessageContent = ({
  children,
  className,
  from,
  ...props
}: MessageContentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isUserMessage = from === 'user';

  useEffect(() => {
    if (isUserMessage && contentRef.current) {
      const element = contentRef.current;
      // Check if content overflows the max height (20rem = 320px)
      const maxHeight = 320; // 20rem in pixels (assuming 1rem = 16px)
      setShowLoadMore(element.scrollHeight > maxHeight);
    }
  }, [children, isUserMessage]);

  return (
    <div
      ref={contentRef}
      className={cn(
        'flex flex-col gap-2 overflow-hidden rounded-lg px-4 py-3 text-foreground text-base relative',
        'group-[.is-user]:bg-secondary group-[.is-user]:text-secondary-foreground group-[.is-user]:rounded-2xl group-[.is-user]:rounded-br-none',
        'group-[.is-assistant]:text-foreground group-[.is-assistant]:w-full',
        isUserMessage && !isExpanded && 'group-[.is-user]:max-h-[22rem]',
        isUserMessage && 'group-[.is-user]:overflow-hidden',
        className,
      )}
      {...props}
    >
      <div>{children}</div>

      {/* Shadow overlay and load more button for truncated user messages */}
      {isUserMessage && showLoadMore && !isExpanded && (
        <>
          {/* Shadow overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-25 bg-gradient-to-t from-secondary via-secondary/95 to-transparent pointer-events-none rounded-b-2xl" />

          {/* Load more button */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
            <Button
              variant="ghost"
              size="xs"
              className="font-semibold text-sm border border-secondary-foreground/25 rounded-full"
              onClick={() => setIsExpanded(true)}
            >
              Show more
              <ChevronDown className="size-4" />
            </Button>
          </div>
        </>
      )}

      {/* Show less button for expanded messages */}
      {isUserMessage && isExpanded && (
        <div className="mt-2 flex justify-center">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setIsExpanded(false)}
            className="font-semibold text-sm border border-secondary-foreground/25 rounded-full"
          >
            Show less
            <ChevronUp className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const MessageAvatar = ({
  src,
  name,
  className,
  ...props
}: MessageAvatarProps) => (
  <Avatar className={cn('size-8 ring-1 ring-border', className)} {...props}>
    <AvatarImage alt="" className="mt-0 mb-0" src={src} />
    <AvatarFallback>{name?.slice(0, 2) || 'ME'}</AvatarFallback>
  </Avatar>
);
