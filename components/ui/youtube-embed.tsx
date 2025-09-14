'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from './button';
import Image from 'next/image';

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  className?: string;
}

export function YouTubeEmbed({ videoId, title, className }: YouTubeEmbedProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  if (isModalOpen) {
    return (
      <div
        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
        onClick={handleOverlayClick}
      >
        {/* Close Button */}
        <Button
          size="icon"
          variant="secondary"
          onClick={handleCloseModal}
          className="absolute top-4 right-4 z-10 rounded-full"
        >
          <X className="w-6 h-6 text-white" />
        </Button>

        {/* Video Player */}
        <div className="w-full max-w-6xl aspect-video">
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative w-full aspect-video rounded-lg overflow-hidden cursor-pointer group/embed',
        className,
      )}
      onClick={handleOpenModal}
    >
      {/* Thumbnail */}
      <Image
        src={thumbnailUrl || '/placeholder.svg'}
        alt={title}
        width={640}
        height={360}
        className="w-full h-full object-cover transition-all duration-300 group-hover/embed:scale-105"
      />

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/40 backdrop-blur-sm rounded-full p-4 transition-opacity duration-300 shadow-lg flex items-center justify-center border border-white/20">
          <Play className="w-8 h-8 text-white fill-white ml-1" />
        </div>
      </div>

      {/* Gradient Overlay for Title */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
        <h3 className="text-white font-medium text-sm leading-tight transition-opacity duration-300 line-clamp-2 text-ellipsis opacity-90 group-hover/embed:opacity-100">
          {title}
        </h3>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 opacity-0 group-hover/embed:opacity-100" />
    </div>
  );
}
