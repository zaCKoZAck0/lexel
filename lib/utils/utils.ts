import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AIMessage, MessageMetadata } from '@/lib/types/ai-message';
import { Message } from '@prisma/client';
import { UIDataTypes, UIMessagePart, UITools } from 'ai';

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
