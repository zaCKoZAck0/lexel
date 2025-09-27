import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageAvatar,
  MessageContent,
} from '@/components/ai-elements/message';
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@/components/ai-elements/reasoning';
import { Response } from '@/components/ai-elements/response';
import { AIMessage } from '@/lib/types/ai-message';
import { MessageActions, UserActions } from './message-actions';
import { ArrowUpIcon } from 'lucide-react';
import Image from 'next/image';
import { ShinyText } from '@/components/ui/shiny-text';
import { getRandomSubmittedMessage } from '@/lib/utils/ui-text';
import WebSearchResults, { WebSearchPart } from './web-search-results';
import {
  SearchMemoryUI,
  AddMemoryUI,
  SearchMemoryPart,
  AddMemoryPart,
} from '@/components/ai-elements/tools/supermemory-ui';
import {
  ToolWatchYoutube,
  WatchYoutubeUI,
} from '@/components/ai-elements/tools/watch-youtube-ui';
import { Fragment } from 'react';
import { TextUIPart, type ChatStatus } from 'ai';
import type { Model } from '@/lib/models';
import type { ModelInfo } from '../_types';
import type React from 'react';

export function ConversationWindow({
  messages,
  status,
  userAvatar,
  userInitials,
  selectedModelId,
  chatId,
  rewrite,
  editMessage,
  editingMessageId,
  editText,
  setEditText,
  cancelEdit,
  saveEdit,
  modelInfo,
  setModelInfo,
  favoriteModels,
}: {
  messages: AIMessage[];
  status: ChatStatus | string;
  userAvatar: string;
  userInitials: string;
  selectedModelId: string;
  chatId: string;
  rewrite: (messageId: string) => void;
  editMessage?: (messageId: string) => void;
  editingMessageId?: string | null;
  editText?: string;
  setEditText?: (text: string) => void;
  cancelEdit?: () => void;
  saveEdit?: () => void;
  modelInfo?: ModelInfo;
  setModelInfo?: React.Dispatch<React.SetStateAction<ModelInfo>>;
  favoriteModels?: Model[];
}) {
  return (
    <Conversation>
      <ConversationContent className="h-full">
        {messages.map(message => (
          <Fragment key={message.id}>
            <Message from={message.role} key={message.id}>
              <div className="flex flex-row-reverse items-end gap-2">
                {message.role === 'user' && (
                  <MessageAvatar src={userAvatar} name={userInitials} />
                )}
                {editingMessageId === message.id ? (
                  <div className="w-full">
                    <UserActions
                      message={message}
                      part={message.parts.at(-1)! as TextUIPart}
                      chatId={chatId}
                      selectedModelId={selectedModelId}
                      messages={messages}
                      rewrite={rewrite}
                      editMessage={editMessage}
                      isEditing={true}
                      editText={editText}
                      setEditText={setEditText}
                      cancelEdit={cancelEdit}
                      saveEdit={saveEdit}
                      modelInfo={modelInfo}
                      setModelInfo={setModelInfo}
                      favoriteModels={favoriteModels}
                      status={status as ChatStatus}
                    />
                  </div>
                ) : (
                  <MessageContent from={message.role}>
                    {[...message.parts]
                      .sort((a, b) => {
                        const typeOrder = [
                          'reasoning',
                          'file',
                          'tool-webSearch',
                          'tool-searchMemories',
                          'tool-addMemory',
                          'tool-watchYoutube',
                          'source-url',
                          'source-document',
                          'text',
                        ];
                        return (
                          typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
                        );
                      })
                      .map((part, i, arr) => {
                        const isLastPart = i === arr.length - 1;
                        switch (part.type) {
                          case 'tool-webSearch':
                            return (
                              <WebSearchResults
                                className="mb-4"
                                key={`${message.id}-${i}`}
                                part={part as WebSearchPart}
                              />
                            );
                          case 'tool-searchMemories':
                            return (
                              <SearchMemoryUI
                                className="mb-4"
                                key={`${message.id}-${i}`}
                                part={part as SearchMemoryPart}
                              />
                            );
                          case 'tool-addMemory':
                            return (
                              <AddMemoryUI
                                className="mb-4"
                                key={`${message.id}-${i}`}
                                part={part as AddMemoryPart}
                              />
                            );
                          case 'tool-watchYoutube':
                            return (
                              <WatchYoutubeUI
                                key={`${message.id}-${i}`}
                                part={part as ToolWatchYoutube}
                              />
                            );

                          case 'reasoning':
                            return (
                              <Reasoning
                                key={`${message.id}-${i}`}
                                className="w-full"
                                isStreaming={
                                  status === 'streaming' &&
                                  message.id ===
                                    messages[messages.length - 1].id
                                }
                                duration={message.metadata?.reasoningTime}
                              >
                                <ReasoningTrigger />
                                <ReasoningContent className="text-foreground/50">
                                  {part.text}
                                </ReasoningContent>
                              </Reasoning>
                            );

                          case 'text':
                            return (
                              <div className="group" key={`${message.id}-${i}`}>
                                <Response>{part.text}</Response>
                                {isLastPart && status !== 'streaming' && (
                                  <MessageActions
                                    message={message}
                                    part={part}
                                    chatId={chatId}
                                    selectedModelId={selectedModelId}
                                    messages={messages}
                                    rewrite={rewrite}
                                  />
                                )}
                              </div>
                            );

                          case 'file':
                            if (part.mediaType.startsWith('image/')) {
                              return (
                                <Image
                                  key={`${message.id}-${i}`}
                                  src={part.url}
                                  alt="Generated image"
                                  width={800}
                                  height={600}
                                  className="max-w-full h-auto rounded"
                                />
                              );
                            }
                            return null;

                          case 'source-url':
                            return (
                              <span
                                key={`${message.id}-source-${part.sourceId}`}
                              >
                                [
                                <a
                                  href={part.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  {part.title ?? new URL(part.url).hostname}
                                </a>
                                ]
                              </span>
                            );

                          case 'source-document':
                            return (
                              <span
                                key={`${message.id}-source-${part.sourceId}`}
                              >
                                [
                                <span>
                                  {part.title ?? `Document ${part.sourceId}`}
                                </span>
                                ]
                              </span>
                            );

                          default:
                            return null;
                        }
                      })}
                  </MessageContent>
                )}
              </div>
            </Message>
            {message.role === 'user' &&
              status !== 'streaming' &&
              editingMessageId !== message.id && (
                <div className="-mt-2">
                  <UserActions
                    message={message}
                    part={message.parts.at(-1)! as TextUIPart}
                    chatId={chatId}
                    selectedModelId={selectedModelId}
                    messages={messages}
                    rewrite={rewrite}
                    editMessage={editMessage}
                    isEditing={false}
                    editText={editText}
                    setEditText={setEditText}
                    cancelEdit={cancelEdit}
                    saveEdit={saveEdit}
                    modelInfo={modelInfo}
                    setModelInfo={setModelInfo}
                    favoriteModels={favoriteModels}
                    status={status as ChatStatus}
                  />
                </div>
              )}
          </Fragment>
        ))}

        {/* AI Loading Message */}
        {status === 'submitted' && (
          <Message from="assistant" key="submitted-message">
            <div className="flex gap-2">
              <MessageContent from="assistant">
                <div className="flex gap-2 items-center">
                  <ShinyText
                    text={getRandomSubmittedMessage()}
                    disabled={false}
                    speed={1}
                  />
                </div>
              </MessageContent>
            </div>
          </Message>
        )}
      </ConversationContent>
      <ConversationScrollButton variant="destructive">
        <ArrowUpIcon className="size-4" />
      </ConversationScrollButton>
    </Conversation>
  );
}
