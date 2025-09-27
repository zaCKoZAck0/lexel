import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TooltipButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  /**
   * The tooltip content to display on hover
   */
  tooltipContent: React.ReactNode;
  /**
   * Whether to render the button as a child component
   */
  asChild?: boolean;
  /**
   * Custom delay before tooltip opens (in milliseconds)
   * @default 0
   */
  openDelay?: number;
  /**
   * Custom class name for the tooltip content
   */
  tooltipClassName?: string;
  /**
   * Side where the tooltip should appear
   * @default "top"
   */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /**
   * Alignment of the tooltip relative to the trigger
   * @default "center"
   */
  align?: 'start' | 'center' | 'end';
  /**
   * Offset in pixels from the trigger
   * @default 10
   */
  sideOffset?: number;
}

/**
 * A button component with an integrated tooltip.
 *
 * @example
 * ```tsx
 * <TooltipButton
 *   tooltipContent="This is a helpful tooltip"
 *   variant="outline"
 *   size="sm"
 * >
 *   Click me
 * </TooltipButton>
 * ```
 *
 * @example
 * ```tsx
 * <TooltipButton
 *   tooltipContent="Save your changes"
 *   variant="default"
 *   side="bottom"
 *   align="end"
 *   openDelay={500}
 * >
 *   <SaveIcon />
 *   Save
 * </TooltipButton>
 * ```
 */

const TooltipButton = React.forwardRef<HTMLButtonElement, TooltipButtonProps>(
  (
    {
      tooltipContent,
      openDelay = 0,
      tooltipClassName,
      side = 'top',
      align = 'center',
      sideOffset = 10,
      asChild = false,
      variant,
      size,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <TooltipProvider openDelay={openDelay}>
        <Tooltip side={side} align={align} sideOffset={sideOffset}>
          <TooltipTrigger asChild>
            <Button
              ref={ref}
              variant={variant}
              size={size}
              className={className}
              asChild={asChild}
              {...props}
            >
              {children}
            </Button>
          </TooltipTrigger>
          <TooltipContent className={tooltipClassName}>
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

TooltipButton.displayName = 'TooltipButton';

export { TooltipButton, type TooltipButtonProps };
