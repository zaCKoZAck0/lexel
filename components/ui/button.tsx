import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils/utils';

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-b from-primary to-primary/80 text-primary-foreground shadow-xs hover:bg-gradient-to-b hover:from-primary/75 hover:to-primary/65',
        destructive:
          'bg-gradient-to-b from-destructive to-destructive/75 text-white shadow-xs hover:bg-gradient-to-b hover:from-destructive/70 hover:to-destructive/60 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-gradient-to-b dark:from-destructive/50 dark:to-destructive/40',
        success:
          'bg-gradient-to-b from-success to-success/75 text-white shadow-xs hover:bg-gradient-to-b hover:from-success/70 hover:to-success/60 focus-visible:ring-success/20 dark:focus-visible:ring-success/40 dark:bg-gradient-to-b dark:from-success/50 dark:to-success/40',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-gradient-to-b from-secondary to-secondary/80 text-secondary-foreground shadow-xs hover:bg-gradient-to-b hover:from-secondary/75 hover:to-secondary/65',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        xs: 'h-7 rounded-md gap-1 px-2.5 has-[>svg]:px-2 text-xs',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
