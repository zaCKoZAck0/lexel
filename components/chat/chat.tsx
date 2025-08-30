'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useState, useEffect } from 'react';
import { Loader2, RefreshCcwIcon } from 'lucide-react';
import React from 'react';
import { Model } from '@/lib/models';
import { AIMessage } from '@/lib/types/ai-message';
import { ConversationWindow } from './conversation-window';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { InputContainer } from '@/components/chat/input-container';
import { toast } from 'sonner';
import { getProviderInfo } from '@/lib/models/providers';

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
  const [model, setModel] = useState<string>(favoriteModels[0].id);
  const [requestBody, setRequestBody] = useState<any>({
    options: {
      reasoning: false,
    },
  });

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    status,
    stop,
    reload,
  } = useChat({
    onFinish: () => {
      window.history.replaceState({}, '', `/chat/${chatId}`);
    },
    onError: error => {
      console.error('An error occurred:', error);
      toast.error(error.message);
    },
    onData: data => {
      console.log('Received data part from server:', data);
    },
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({
        id,
        messages,
        trigger,
        messageId,
        body,
      }) => {
        if (trigger === 'submit-message') {
          return {
            body: {
              trigger: 'submit-message',
              id: chatId,
              message: messages[messages.length - 1],
              ...body,
              ...requestBody,
            },
          };
        } else if (trigger === 'regenerate-message') {
          return {
            body: {
              trigger: 'regenerate-message',
              ...body,
              ...requestBody,
            },
          };
        }
        throw new Error(`Unsupported trigger: ${trigger}`);
      },
    }),
    experimental_throttle: 50,
    body: {
      modelId: model,
      ...requestBody,
    },
  });

  // Group models by provider
  const groupedModels = availableModels.reduce(
    (acc, model) => {
      const provider = model.provider;
      if (!acc[provider]) {
        acc[provider] = [];
      }
      acc[provider].push(model);
      return acc;
    },
    {} as Record<string, Model[]>,
  );

  // Create icon map for models
  const modelIconMap = availableModels.reduce(
    (acc, model) => {
      const providerInfo = getProviderInfo(model.provider);
      acc[model.id] = providerInfo.icon;
      return acc;
    },
    {} as Record<string, string>,
  );

  return (
    <div className="max-w-4xl mx-auto p-6 relative min-h-screen">
      <div className="flex flex-col h-full">
        <div className="w-full flex-1">
          <ConversationWindow
            userAvatar={session?.user?.image ?? ''}
            userInitials={session?.user?.name?.charAt(0) ?? 'Me'}
            messages={messages}
            status={status}
            selectedModelId={model}
            chatId={chatId}
          />
        </div>
        {/* Spacer for bottom positioning */}
        {messages.length > 0 && <div className="h-32" />}

        <InputContainer
          model={model}
          setModel={setModel}
          input={input}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          messages={messages}
          status={status}
          availableModels={availableModels}
          groupedModels={groupedModels}
          modelIconMap={modelIconMap}
          favoriteModels={favoriteModels}
          stop={stop}
          reload={reload}
          requestBody={requestBody}
          setRequestBody={setRequestBody}
        />
      </div>
    </div>
  );
}
