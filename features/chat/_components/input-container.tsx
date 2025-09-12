'use client';

import { motion } from 'framer-motion';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { Model } from '@/lib/models';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, SquareIcon } from 'lucide-react';
import type { ChatStatus } from 'ai';
import { GreetingSection } from './greeting-section';
import { ModelSelector } from './model-selector';
import { ToolbarControls } from './toolbar-controls';

interface ModelInfo {
  modelId: string;
  reasoningEffort: 'low' | 'medium' | 'high';
  thinkingEnabled: boolean;
  webSearchEnabled: boolean;
}

interface InputContainerProps {
  modelInfo: ModelInfo;
  setModelInfo: React.Dispatch<React.SetStateAction<ModelInfo>>;
  input: string;
  setInput: (input: string) => void;
  status: ChatStatus;
  hasMessages: boolean;
  favoriteModels: Model[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  stop: () => void;
  className?: string;
}

export function InputContainer({
  modelInfo,
  setModelInfo,
  input,
  setInput,
  status,
  hasMessages,
  favoriteModels,
  onSubmit,
  stop,
  className,
}: InputContainerProps) {
  return (
    <motion.div
      className={`fixed max-w-3xl w-full z-50 left-1/2 transform -translate-x-1/2 ${className}`}
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
      <GreetingSection hasMessages={hasMessages} />

      <PromptInput
        onSubmit={onSubmit}
        className="bg-background/75 border-5 border-border/75 backdrop-blur-md shadow-lg shadow-primary"
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
            <div className="flex items-center gap-1">
              <ModelSelector
                modelInfo={modelInfo}
                setModelInfo={setModelInfo}
                favoriteModels={favoriteModels}
              />
            </div>

            <ToolbarControls
              modelInfo={modelInfo}
              setModelInfo={setModelInfo}
              favoriteModels={favoriteModels}
            />
          </PromptInputTools>
          {status === 'ready' && (
            <PromptInputSubmit
              disabled={
                !input.trim() || status !== 'ready' || !modelInfo.modelId
              }
              status={status}
            >
              <ArrowUpIcon className="w-4 h-4" />
            </PromptInputSubmit>
          )}
          {status === 'streaming' && (
            <Button
              type="button"
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
  );
}
