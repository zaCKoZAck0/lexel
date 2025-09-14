'use client';

import * as React from 'react';
import { Pin } from 'lucide-react';
import {
  motion,
  LayoutGroup,
  AnimatePresence,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react';
import { cn } from '@/lib/utils/utils';

type PinListItem = {
  id: number | string;
  name: string;
  info: string;
  icon: React.ElementType;
  pinned: boolean;
};

type PinListProps<T = PinListItem> = {
  items: T[];
  renderItem?: (item: T) => PinListItem;
  renderContent?: (item: T, rendered: PinListItem) => React.ReactNode;
  onTogglePin?: (item: T, rendered: PinListItem) => void;
  labels?: {
    pinned?: string;
    unpinned?: string;
  };
  transition?: Transition;
  labelMotionProps?: HTMLMotionProps<'p'>;
  className?: string;
  labelClassName?: string;
  pinnedSectionClassName?: string;
  unpinnedSectionClassName?: string;
  zIndexResetDelay?: number;
} & HTMLMotionProps<'div'>;

function PinList<T = PinListItem>({
  items,
  renderItem = (item: T) => item as PinListItem, // Default assumes T is PinListItem
  renderContent,
  onTogglePin,
  labels = { pinned: 'Pinned Items', unpinned: 'All Items' },
  transition = { stiffness: 320, damping: 20, mass: 0.8, type: 'spring' },
  labelMotionProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.22, ease: 'easeInOut' },
  },
  className,
  labelClassName,
  pinnedSectionClassName,
  unpinnedSectionClassName,
  zIndexResetDelay = 500,
  ...props
}: PinListProps<T>) {
  const [listItems, setListItems] = React.useState(items);
  const [togglingGroup, setTogglingGroup] = React.useState<
    'pinned' | 'unpinned' | null
  >(null);

  // Update items when props change
  React.useEffect(() => {
    setListItems(items);
  }, [items]);

  const renderedItems = listItems.map(renderItem);
  const pinned = renderedItems.filter(u => u.pinned);
  const unpinned = renderedItems.filter(u => !u.pinned);

  const toggleStatus = (id: number | string) => {
    const itemIndex = renderedItems.findIndex(u => u.id === id);
    if (itemIndex === -1) return;

    const originalItem = listItems[itemIndex];
    const renderedItem = renderedItems[itemIndex];

    if (onTogglePin) {
      onTogglePin(originalItem, renderedItem);
      return;
    }

    setTogglingGroup(renderedItem.pinned ? 'pinned' : 'unpinned');
    setListItems(prev => {
      const idx = prev.findIndex((_, i) => i === itemIndex);
      if (idx === -1) return prev;
      const updated = [...prev];
      const [item] = updated.splice(idx, 1);
      if (!item) return prev;

      // For default behavior, we assume the item has a pinned property we can toggle
      const toggled = { ...item, pinned: !renderedItem.pinned } as T;
      if (!renderedItem.pinned) updated.push(toggled);
      else updated.unshift(toggled);
      return updated;
    });

    // Reset group z-index after the animation duration
    setTimeout(() => setTogglingGroup(null), zIndexResetDelay);
  };

  return (
    <motion.div className={cn('space-y-10', className)} {...props}>
      <LayoutGroup>
        <div>
          {pinned.length > 0 && (
            <div
              className={cn(
                'space-y-3 relative',
                togglingGroup === 'pinned' ? 'z-5' : 'z-10',
                pinnedSectionClassName,
              )}
            >
              {pinned.map(item => {
                const originalIndex = renderedItems.findIndex(
                  r => r.id === item.id,
                );
                const originalItem =
                  originalIndex !== -1 ? listItems[originalIndex] : undefined;

                return (
                  <motion.div
                    key={item.id}
                    layoutId={`item-${item.id}`}
                    onClick={
                      renderContent ? undefined : () => toggleStatus(item.id)
                    }
                    transition={transition}
                    className={`flex items-center justify-between gap-1 rounded-md bg-card border py-1 px-3 ${
                      renderContent ? '' : 'cursor-pointer'
                    }`}
                  >
                    {renderContent && originalItem ? (
                      renderContent(originalItem, item)
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-background p-2">
                            <item.icon className="size-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">
                              {item.name}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">
                              {item.info}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground">
                          <Pin className="size-4 fill-current" />
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <AnimatePresence>
            {unpinned.length > 0 && (
              <motion.p
                layout
                key="all-label"
                className={cn(
                  'font-medium px-3 text-muted-foreground text-sm mb-2',
                  labelClassName,
                )}
                {...labelMotionProps}
              >
                {labels.unpinned}
              </motion.p>
            )}
          </AnimatePresence>
          {unpinned.length > 0 && (
            <div
              className={cn(
                'space-y-3 relative',
                togglingGroup === 'unpinned' ? 'z-5' : 'z-10',
                unpinnedSectionClassName,
              )}
            >
              {unpinned.map(item => {
                const originalIndex = renderedItems.findIndex(
                  r => r.id === item.id,
                );
                const originalItem =
                  originalIndex !== -1 ? listItems[originalIndex] : undefined;

                return (
                  <motion.div
                    key={item.id}
                    layoutId={`item-${item.id}`}
                    onClick={
                      renderContent ? undefined : () => toggleStatus(item.id)
                    }
                    transition={transition}
                    className={`flex items-center justify-between gap-1 rounded-md bg-card border py-1 px-3 group ${
                      renderContent ? '' : 'cursor-pointer'
                    }`}
                  >
                    {renderContent && originalItem ? (
                      renderContent(originalItem, item)
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-background p-2">
                            <item.icon className="size-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">
                              {item.name}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">
                              {item.info}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center size-8 rounded-full bg-muted opacity-0 group-hover:opacity-100 transition-opacity duration-250">
                          <Pin className="size-4 text-muted-foreground" />
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </LayoutGroup>
    </motion.div>
  );
}

export { PinList, type PinListProps, type PinListItem };
