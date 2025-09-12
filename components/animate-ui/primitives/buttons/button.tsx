'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

import { Slot } from '@/components/animate-ui/primitives/animate/slot';

type ButtonProps = Omit<
  HTMLMotionProps<'button'>,
  | 'children'
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onDragEnter'
  | 'onDragLeave'
  | 'onDragOver'
  | 'onDrop'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
> & {
  hoverScale?: number;
  tapScale?: number;
  children?: React.ReactNode;
  asChild?: boolean;
};

function Button({
  hoverScale = 1.05,
  tapScale = 0.95,
  asChild = false,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : motion.button;

  return (
    <Component
      whileTap={{ scale: tapScale }}
      whileHover={{ scale: hoverScale }}
      {...props}
    />
  );
}

export { Button, type ButtonProps };
