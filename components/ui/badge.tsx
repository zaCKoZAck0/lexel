import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-gradient-to-r from-primary to-primary/75 text-primary-foreground [a&]:hover:bg-gradient-to-r [a&]:hover:from-primary/70 [a&]:hover:to-primary/60',
        secondary:
          'border-transparent bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground [a&]:hover:bg-gradient-to-r [a&]:hover:from-secondary/75 [a&]:hover:to-secondary/65',
        destructive:
          'border-transparent bg-gradient-to-r from-destructive to-destructive/70 text-white [a&]:hover:bg-gradient-to-r [a&]:hover:from-destructive/65 [a&]:hover:to-destructive/55 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-gradient-to-r dark:from-destructive/50 dark:to-destructive/40',
        success:
          'border-transparent bg-gradient-to-r from-success to-success/70 text-white [a&]:hover:bg-gradient-to-r [a&]:hover:from-success/65 [a&]:hover:to-success/55 focus-visible:ring-success/20 dark:focus-visible:ring-success/40 dark:bg-gradient-to-r dark:from-success/50 dark:to-success/40',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
