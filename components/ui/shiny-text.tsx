'use client';
import React from 'react';
import { useTheme } from 'next-themes';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export function ShinyText({
  text,
  disabled = false,
  speed = 5,
  className = '',
}: ShinyTextProps) {
  const { theme, systemTheme } = useTheme();
  const animationDuration = `${speed}s`;

  const currentTheme = theme === 'system' ? systemTheme : theme;

  const backgroundImage =
    currentTheme === 'light'
      ? 'linear-gradient(120deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 0) 60%)'
      : 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)';

  const backgroundSize = '200% 100%';

  return (
    <div
      className={`text-foreground/50 bg-clip-text inline-block ${disabled ? '' : 'animate-shine'} ${className}`}
      style={{
        backgroundImage,
        backgroundSize,
        WebkitBackgroundClip: 'text',
        animationDuration: animationDuration,
      }}
    >
      {text}
    </div>
  );
}
