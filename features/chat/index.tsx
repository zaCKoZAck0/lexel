'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { Model } from '@/lib/models';
import { AIMessage } from '@/lib/types/ai-message';
import { ConversationWindow } from './_components/conversation-window';
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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    console.log('modelInfo', modelInfo);
  }, [modelInfo]);

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    clearError,
  } = useChat<AIMessage>({
    onFinish: () => {
      window.history.replaceState({}, '', `/chat/${chatId}`);
    },
    onError: error => {
      console.error('An error occurred:', error);
      toast.error(error.message);
      clearError();
    },
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({ messages, body }) => {
        const trigger = body?.trigger || 'message-send';
        const lastMessage = messages.at(-1);

        return {
          body: {
            id: chatId,
            trigger,
            message: body?.message || lastMessage,
            ...body,
          },
        };
      },
    }),
    experimental_throttle: 50,
  });

  const [input, setInput] = useState('');

  const rewrite = (messageId: string) => {
    let prevId: string | undefined;
    let didSlice = false;
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === messageId);
      if (idx < 1) return prev;
      prevId = prev.at(idx - 1)?.id;
      didSlice = true;
      const newState = prev.slice(0, idx);
      return newState;
    });
    if (didSlice && prevId) {
      regenerate({
        messageId: prevId,
        body: {
          trigger: 'message-rewrite',
          modelInfo: modelInfo,
          userInfo: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        },
      });
    }
  };

  const editMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.role === 'user') {
      const textPart = message.parts.find(part => part.type === 'text');
      if (textPart && textPart.type === 'text') {
        setEditingMessageId(messageId);
        setEditText(textPart.text);
      }
    }
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const saveEdit = () => {
    if (!editingMessageId || !editText.trim()) return;

    // Find the message index
    const messageIndex = messages.findIndex(m => m.id === editingMessageId);
    if (messageIndex === -1) return;

    // Create new message with edited text
    const editedMessage: AIMessage = {
      ...messages[messageIndex],
      parts: [{ type: 'text', text: editText.trim() }],
    };

    // Remove messages from the edited one onwards
    const messagesToKeep = messages.slice(0, messageIndex);
    setMessages(messagesToKeep);

    // Send the edited message using the transport's custom body preparation
    sendMessage(
      { text: editText.trim() },
      {
        body: {
          trigger: 'message-edit',
          message: editedMessage,
          modelInfo: modelInfo,
          userInfo: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        },
      },
    );

    // Clear edit state
    setEditingMessageId(null);
    setEditText('');
  };

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
    <div className="max-w-3xl w-screen pt-8 relative min-h-screen">
      <div className="flex flex-col h-full">
        <div className="w-full flex-1">
          <ConversationWindow
            userAvatar={session?.user?.image ?? ''}
            userInitials={session?.user?.name?.charAt(0) ?? 'Me'}
            messages={messages}
            status={status}
            selectedModelId={modelInfo.modelId}
            chatId={chatId}
            rewrite={rewrite}
            editMessage={editMessage}
            editingMessageId={editingMessageId}
            editText={editText}
            setEditText={setEditText}
            cancelEdit={cancelEdit}
            saveEdit={saveEdit}
            modelInfo={modelInfo}
            setModelInfo={setModelInfo}
            favoriteModels={favoriteModels}
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
