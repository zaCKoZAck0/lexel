'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { getGreetingText } from '@/lib/utils/ui-text';
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
import { Model } from '@/lib/models';
import { getProviderInfo } from '@/lib/models/providers';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ArrowUpIcon,
  SquareIcon,
  BrainIcon,
  ListIcon,
  ChevronDownIcon,
  GlobeIcon,
  LightbulbIcon,
} from 'lucide-react';
import type { ChatStatus } from 'ai';
import Link from 'next/link';
import { cn } from '@/lib/utils/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const greetingText = useMemo(() => {
    return getGreetingText(session?.user?.name);
  }, [session?.user?.name]);

  const filteredModels = useMemo(() => {
    if (!searchQuery) return favoriteModels;
    return favoriteModels.filter(
      model =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [favoriteModels, searchQuery]);

  return (
    <motion.div
      className={`fixed md:p-2 md:px-4 max-w-2xl w-full left-1/2 transform -translate-x-1/2 ${className}`}
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
        onSubmit={onSubmit}
        className="bg-muted/75 border-5 border-border/75 backdrop-blur-md shadow-lg shadow-primary"
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
              {/* Enhanced Model Select with Search */}
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    size="xs"
                    aria-expanded={open}
                    className="justify-between min-w-[100px] rounded-full"
                  >
                    {(() => {
                      const selectedModel = favoriteModels.find(
                        m => m.id === modelInfo.modelId,
                      );
                      const providerInfo = selectedModel
                        ? getProviderInfo(selectedModel.provider)
                        : null;
                      return selectedModel ? (
                        <div className="flex items-center gap-2">
                          {providerInfo && (
                            <providerInfo.Icon className="w-4 h-4" />
                          )}
                          <span className="truncate">{selectedModel.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Select model...
                        </span>
                      );
                    })()}
                    <ChevronDownIcon className="w-4 h-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Command>
                    <div className="flex items-center justify-between p-2">
                      <CommandInput
                        className="w-full"
                        placeholder="Search models..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                            asChild
                          >
                            <Link href="/settings/models">
                              <ListIcon className="w-4 h-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit favorite models</TooltipContent>
                      </Tooltip>
                    </div>
                    <CommandList>
                      <CommandEmpty>No models found.</CommandEmpty>
                      <CommandGroup>
                        {filteredModels.map(modelItem => {
                          const providerInfo = getProviderInfo(
                            modelItem.provider,
                          );
                          const isSelected = modelInfo.modelId === modelItem.id;
                          return (
                            <CommandItem
                              key={modelItem.id}
                              value={modelItem.id}
                              onSelect={() => {
                                setModelInfo(prev => ({
                                  ...prev,
                                  modelId: modelItem.id,
                                }));
                                setOpen(false);
                                setSearchQuery('');
                              }}
                            >
                              <div className="flex items-center gap-2 w-full">
                                {providerInfo && (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <providerInfo.Icon className="w-4 h-4" />
                                    <span>{providerInfo.name}</span> /
                                  </div>
                                )}
                                <span className="flex-1">{modelItem.name}</span>
                                {isSelected && (
                                  <span className="text-xs text-primary">
                                    ✓
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Search Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="xs"
                  variant={modelInfo.webSearchEnabled ? 'default' : 'outline'}
                  onClick={() =>
                    setModelInfo(prev => ({
                      ...prev,
                      webSearchEnabled: !prev.webSearchEnabled,
                    }))
                  }
                  className="rounded-full"
                >
                  <GlobeIcon className="w-4 h-4" />
                  <span className='hidden md:inline-block'>Search</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {modelInfo.webSearchEnabled
                  ? 'Disable Search'
                  : 'Enable Search'}
              </TooltipContent>
            </Tooltip>

            {/* Reasoning Toggle - only show if model supports hybrid reasoning */}
            {(() => {
              const selectedModel = favoriteModels.find(
                m => m.id === modelInfo.modelId,
              );
              const supportsHybridReasoning = selectedModel?.hybridReasoning;

              if (!supportsHybridReasoning) return null;

              return (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="xs"
                      variant={
                        modelInfo.thinkingEnabled ? 'default' : 'outline'
                      }
                      onClick={() =>
                        setModelInfo(prev => ({
                          ...prev,
                          thinkingEnabled: !prev.thinkingEnabled,
                        }))
                      }
                      className="rounded-full"
                    >
                      <LightbulbIcon className="w-4 h-4" />
                      <span className='hidden sm:inline-block'>Thinking</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {modelInfo.thinkingEnabled
                      ? 'Disable Thinking'
                      : 'Enable Thinking'}
                  </TooltipContent>
                </Tooltip>
              );
            })()}

            {/* Reasoning Effort Selector - only show if model supports effort control and doesn't have hybrid reasoning */}
            {(() => {
              const selectedModel = favoriteModels.find(
                m => m.id === modelInfo.modelId,
              );
              const supportsEffortControl =
                selectedModel?.features.includes('effort-control');
              const hasHybridReasoning = selectedModel?.hybridReasoning;

              if (!supportsEffortControl || hasHybridReasoning) return null;

              return (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      className="justify-between rounded-full capitalize"
                    >
                      <div className="flex items-center gap-1">
                        <BrainIcon className="w-4 h-4" />
                        <span className="truncate">{modelInfo.reasoningEffort}</span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[160px]">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {(['low', 'medium', 'high'] as const).map(val => (
                            <CommandItem
                              key={val}
                              value={val}
                              onSelect={() =>
                                setModelInfo(prev => ({ ...prev, reasoningEffort: val }))
                              }
                            >
                              <div
                                className={cn(
                                  'flex items-center gap-2 w-full',
                                  modelInfo.reasoningEffort === val
                                    ? 'text-primary'
                                    : 'text-foreground'
                                )}
                              >
                                <BrainIcon className="w-4 h-4" />
                                <span className="capitalize">{val}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              );
            })()}
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
