'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { Model } from '@/lib/models';
import { AIMessage } from '@/lib/types/ai-message';
import { ConversationWindow } from './_components/conversation-window';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { InputContainer } from '@/features/chat/_components/input-container';
import { toast } from 'sonner';

interface ChatProps {
  chatId: string;
  initialMessages: AIMessage[];
  favoriteModels: Model[];
  availableModels: Model[];
}

export function Chat({
  chatId,
  initialMessages,
  favoriteModels,
  availableModels,
}: ChatProps) {
  const { data: session } = useSession();

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modelInfo, setModelInfo] = useState({
    modelId: favoriteModels[0]?.id,
    reasoningEffort: 'medium' as 'low' | 'medium' | 'high',
    thinkingEnabled: false,
    webSearchEnabled: false,
  });

  useEffect(() => {
    console.log('modelInfo', modelInfo);
  }, [modelInfo]);

  const { messages, sendMessage, status, stop } = useChat<AIMessage>({
    onFinish: () => {
      window.history.replaceState({}, '', `/chat/${chatId}`);
    },
    onError: error => {
      console.error('An error occurred:', error);

      toast.error(error.message);
    },
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({ messages, body }) => {
        return {
          body: {
            id: chatId,
            message: messages.at(-1),
            ...body,
          },
        };
      },
    }),
    experimental_throttle: 50,
  });

  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(
        { text: input, files },
        {
          body: {
            modelInfo: modelInfo,
            userInfo: {
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          },
        },
      );
      setInput('');
      setFiles(undefined);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative min-h-screen">
      <div className="flex flex-col h-full">
        <div className="w-full flex-1">
          <ConversationWindow
            userAvatar={session?.user?.image ?? ''}
            userInitials={session?.user?.name?.charAt(0) ?? 'Me'}
            messages={messages}
            status={status}
            selectedModelId={modelInfo.modelId}
            chatId={chatId}
          />
        </div>
        {/* Spacer for bottom positioning */}
        {messages.length > 0 && <div className="h-32" />}

        <InputContainer
          modelInfo={modelInfo}
          setModelInfo={setModelInfo}
          input={input}
          setInput={setInput}
          status={status}
          hasMessages={messages.length > 0}
          favoriteModels={favoriteModels}
          onSubmit={handleSubmit}
          stop={stop}
        />
      </div>
    </div>
  );
}
