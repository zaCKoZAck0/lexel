'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useState, useEffect, useMemo } from 'react';
import { Loader2, ArrowUpIcon, SquareIcon, RefreshCcwIcon } from 'lucide-react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { Model } from '@/lib/models/models';
import { AIMessage } from '@/lib/types/ai-message';
import { ConversationWindow } from './_components/conversation-window';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { getGreetingText } from '@/lib/utils/ui-text';

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

  // Memoize the greeting text to prevent unnecessary re-renders
  const greetingText = useMemo(() => {
    return getGreetingText(session?.user?.name);
  }, [session?.user?.name]);

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [model, setModel] = useState<string>(favoriteModels[0].id);
  const [hasMessages, setHasMessages] = useState(initialMessages.length > 0);

  const { messages, sendMessage, status, stop, error, regenerate } =
    useChat<AIMessage>({
      onFinish: () => {
        window.history.replaceState({}, '', `/chat/${chatId}`);
      },
      onError: error => {
        console.error('An error occurred:', error);
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
              },
            };
          } else if (trigger === 'regenerate-message') {
            return {
              body: {
                trigger: 'regenerate-message',
                id,
                messageId,
                message: messages[messages.length - 1],
                ...body,
              },
            };
          }
          throw new Error(`Unsupported trigger: ${trigger}`);
        },
      }),
      experimental_throttle: 50,
    });

  const [input, setInput] = useState('');

  // Update hasMessages state when messages change
  useEffect(() => {
    setHasMessages(messages.length > 0);
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(
        { text: input, files },
        {
          body: {
            modelId: model,
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
    <div className="max-w-4xl mx-auto p-6 relative min-h-screen">
      <div className="flex flex-col h-full">
        <div className="w-full flex-1">
          <ConversationWindow
            userAvatar={session?.user?.image ?? ''}
            userInitials={session?.user?.name?.charAt(0) ?? 'Me'}
            messages={messages}
            status={status}
            regenerate={regenerate}
            selectedModelId={model}
          />
        </div>

        {error && (
          <div className="flex flex-col items-center gap-2 bg-card/50 backdrop-blur-md shadow-md p-4 rounded-md">
            <div>An error occurred.</div>
            <Button
              onClick={() => regenerate()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCcwIcon className="w-4 h-4" />
              Retry
            </Button>
          </div>
        )}

        {/* Spacer for bottom positioning */}
        {hasMessages && <div className="h-32" />}

        {/* Animated Prompt Input */}
        <motion.div
          className="fixed m-4 p-2 max-w-2xl w-full left-1/2 transform -translate-x-1/2"
          initial={hasMessages ? 'bottom' : 'center'}
          animate={hasMessages ? 'bottom' : 'center'}
          variants={{
            center: {
              top: '50%',
              bottom: 'auto',
              y: '-50%',
              transition: {
                duration: 0.3,
                ease: 'easeInOut',
              },
            },
            bottom: {
              top: 'auto',
              bottom: '1rem',
              y: '0%',
              transition: {
                duration: 0.3,
                ease: 'easeInOut',
              },
            },
          }}
        >
          {/* Greeting Text - Only show when no messages */}
          <AnimatePresence>
            {!hasMessages && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="text-center mb-6"
              >
                {session && session.user && (
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {greetingText}
                  </h1>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <PromptInput
            onSubmit={handleSubmit}
            className="bg-muted/50 backdrop-blur-md shadow shadow-primary"
          >
            <PromptInputTextarea
              onChange={e => setInput(e.target.value)}
              value={input}
              disabled={status !== 'ready'}
              placeholder={
                hasMessages
                  ? 'What would you like to know?'
                  : 'Start a conversation...'
              }
            />
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputModelSelect
                  onValueChange={value => {
                    setModel(value);
                  }}
                  value={model}
                >
                  <PromptInputModelSelectTrigger>
                    <PromptInputModelSelectValue />
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    {favoriteModels.map(model => (
                      <PromptInputModelSelectItem
                        key={model.id}
                        value={model.id}
                      >
                        {model.name}
                      </PromptInputModelSelectItem>
                    ))}
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect>
              </PromptInputTools>
              {status === 'ready' && (
                <PromptInputSubmit
                  disabled={!input.trim() || status !== 'ready' || !model}
                  status={status}
                >
                  <ArrowUpIcon className="w-4 h-4" />
                </PromptInputSubmit>
              )}
              {status === 'streaming' && (
                <Button
                  onClick={() => stop()}
                  size="icon"
                  className="rounded-full"
                >
                  <SquareIcon className="w-4 h-4 animate-pulse fill-primary-foreground" />
                </Button>
              )}
            </PromptInputToolbar>
          </PromptInput>
        </motion.div>
      </div>
    </div>
  );
}
