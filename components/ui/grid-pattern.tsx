'use client';

import React from 'react';
import { cn } from '@/lib/utils/utils';

interface GridPatternProps {
  className?: string;
}

export function GridPattern({ className }: GridPatternProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 opacity-[0.02] dark:opacity-[0.05]',
        'bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)]',
        'dark:bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)]',
        'bg-[size:20px_20px]',
        className,
      )}
      aria-hidden="true"
    />
  );
}
