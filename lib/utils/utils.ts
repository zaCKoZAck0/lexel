import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AIMessage, MessageMetadata } from '@/lib/types/ai-message';
import { Message } from '@prisma/client';
import { UIDataTypes, UIMessagePart, UITools } from 'ai';
import { formatDuration, intervalToDuration } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToUIMessages(messages: Message[]): AIMessage[] {
  return messages.map(message => ({
    id: message.id,
    role: message.role as 'user' | 'assistant' | 'system',
    parts: message.parts as UIMessagePart<UIDataTypes, UITools>[],
    metadata: message.metadata as MessageMetadata,
  }));
}

export const formatMsToReadableTime = (durationMs?: number) => {
  if (!durationMs || durationMs <= 0) return 'some time';

  // For very small durations, show milliseconds
  if (durationMs < 1000) {
    return `${Math.round(durationMs)}ms`;
  }

  const duration = intervalToDuration({
    start: 0,
    end: durationMs,
  });
  return formatDuration(duration, {
    format: ['hours', 'minutes', 'seconds'],
    zero: false,
  });
};

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${formattedSize} ${sizes[i]}`;
}

export function extractVideoId(url: string) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
