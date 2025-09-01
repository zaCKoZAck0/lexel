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
import { MessageActions } from './message-actions';
import { ArrowUpIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { ChatRequestOptions } from 'ai';
import { ShinyText } from '@/components/ui/shiny-text';
import { getRandomSubmittedMessage } from '@/lib/utils/ui-text';
import { Button } from '@/components/ui/button';
import WebSearchResults from './web-search-results';

export function ConversationWindow({
  messages,
  status,
  userAvatar,
  userInitials,
  selectedModelId,
  chatId,
}: {
  messages: AIMessage[];
  status: string;
  userAvatar: string;
  userInitials: string;
  selectedModelId: string;
  chatId: string;
}) {
  return (
    <Conversation>
      <ConversationContent className="h-full">
        {messages.map((message) => (
          <Message from={message.role} key={message.id}>
            <div className="flex flex-row-reverse gap-2">
              {message.role === 'user' && (
                <MessageAvatar src={userAvatar} name={userInitials} />
              )}
              <MessageContent>
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'tool-webSearch':
                      return (
                        <WebSearchResults
                          className="mb-4"
                          key={`${message.id}-${i}`}
                          part={part as any}
                        />
                      );
                    case 'text':
                      return (
                        <div className="group" key={`${message.id}-${i}`}>
                          <Response>{part.text}</Response>
                          <MessageActions
                            message={message}
                            part={part}
                            chatId={chatId}
                            selectedModelId={selectedModelId}
                            messages={messages}
                          />
                        </div>
                      );

                    case 'reasoning':
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={
                            status === 'streaming' &&
                            message.id === messages[messages.length - 1].id
                          }
                          duration={message.metadata?.reasoningTime}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent className="text-foreground/50">
                            {part.text}
                          </ReasoningContent>
                        </Reasoning>
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
                        <span key={`${message.id}-source-${part.sourceId}`}>
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
                        <span key={`${message.id}-source-${part.sourceId}`}>
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
            </div>
          </Message>
        ))}

        {/* AI Loading Message */}
        {status === 'submitted' && (
          <Message from="assistant" key="submitted-message">
            <div className="flex gap-2">
              <MessageContent>
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
