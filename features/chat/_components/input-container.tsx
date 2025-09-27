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
import { ArrowUpIcon, CheckIcon, SquareIcon, XIcon } from 'lucide-react';
import type { ChatStatus } from 'ai';
import { GreetingSection } from './greeting-section';
import { ModelSelector } from './model-selector';
import { ToolbarControls } from './toolbar-controls';
import { cn } from '@/lib/utils/utils';
import { TooltipButton } from '@/components/ui/tooltip-button';

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
  // Edit mode props
  isEditMode?: boolean;
  onCancel?: () => void;
  editPlaceholder?: string;
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
  isEditMode = false,
  onCancel,
  editPlaceholder,
}: InputContainerProps) {
  return (
    <motion.div
      className={cn(`max-w-3xl w-full ${className}`, isEditMode ? '' : 'fixed')}
      initial={isEditMode ? false : hasMessages ? 'bottom' : 'center'}
      animate={isEditMode ? false : hasMessages ? 'bottom' : 'center'}
      variants={
        !isEditMode
          ? {
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
            }
          : undefined
      }
    >
      {!isEditMode && <GreetingSection hasMessages={hasMessages} />}

      <PromptInput
        onSubmit={onSubmit}
        className={
          'bg-background/75 border-5 border-border/75 backdrop-blur-md shadow-lg shadow-primary rounded-3xl'
        }
      >
        <PromptInputTextarea
          onChange={e => setInput(e.target.value)}
          value={input}
          disabled={status !== 'ready'}
          placeholder={
            editPlaceholder ||
            (isEditMode
              ? 'Edit your message...'
              : hasMessages
                ? 'What would you like to know?'
                : 'Start a conversation...')
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
          <div className="flex items-center gap-2">
            {isEditMode && onCancel && (
              <TooltipButton
                tooltipContent="Cancel"
                type="button"
                variant="ghost"
                size="xs"
                onClick={onCancel}
                className="rounded-lg"
              >
                <XIcon />
              </TooltipButton>
            )}
            {status === 'ready' && (
              <PromptInputSubmit
                disabled={
                  !input.trim() || status !== 'ready' || !modelInfo.modelId
                }
                status={status}
                className="rounded-2xl"
              >
                {isEditMode ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <ArrowUpIcon className="w-4 h-4" />
                )}
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
          </div>
        </PromptInputToolbar>
      </PromptInput>
    </motion.div>
  );
}
