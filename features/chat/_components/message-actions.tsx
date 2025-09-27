import { Action, Actions } from '@/components/ai-elements/actions';
import { AIMessage } from '@/lib/types/ai-message';
import { ChevronDownIcon, PenLineIcon, RefreshCcwIcon } from 'lucide-react';
import { MessageMetadata } from './message-metadata';
import { TextUIPart } from 'ai';
import { TooltipButton } from '@/components/ui/tooltip-button';
import { CopyButton } from '@/components/ui/copy-button';
import { getModelDetails } from '@/lib/models';
import { getProviderInfo } from '@/lib/models/providers';
import { ShinyText } from '@/components/ui/shiny-text';
import { InputContainer } from './input-container';
import { Model } from '@/lib/models';
import type { ChatStatus } from 'ai';
import type { ModelInfo as ClientModelInfo } from '../_types';
import type React from 'react';

export function MessageActions({
  message,
  part,
  chatId,
  selectedModelId,
  messages,
  rewrite,
}: {
  message: AIMessage;
  part: TextUIPart;
  chatId?: string;
  selectedModelId?: string;
  messages?: AIMessage[];
  rewrite: (messageId: string) => void;
}) {
  if (message.role === 'assistant') {
    return (
      <AssistantActions
        message={message}
        part={part}
        chatId={chatId}
        selectedModelId={selectedModelId}
        messages={messages}
        rewrite={rewrite}
      />
    );
  }
}

function AssistantActions({
  message,
  part,
  chatId,
  selectedModelId,
  messages,
  rewrite,
}: {
  message: AIMessage;
  part: TextUIPart;
  chatId?: string;
  selectedModelId?: string;
  messages?: AIMessage[];
  rewrite: (messageId: string) => void;
}) {
  const model = message.metadata?.modelInfo
    ? {
        id: message.metadata.modelInfo.id,
        name: message.metadata.modelInfo.name,
        provider: message.metadata.modelInfo.provider,
        actualProvider: message.metadata.modelInfo.actualProvider,
        description: message.metadata.modelInfo.description,
        releaseDate: message.metadata.modelInfo.releaseDate,
        isReasoning: message.metadata.modelInfo.isReasoning,
        modalities: message.metadata.modelInfo.modalities,
        features: message.metadata.modelInfo.features,
        hybridReasoning: message.metadata.modelInfo.hybridReasoning,
        modelType: message.metadata.modelInfo.modelType,
        speed: message.metadata.modelInfo.speed,
        intelligence: message.metadata.modelInfo.intelligence,
        contextWindow: message.metadata.modelInfo.contextWindow,
        priceInUSD: message.metadata.modelInfo.priceInUSD,
      }
    : null;
  const provider = getProviderInfo(model?.provider || '');

  return (
    <Actions className="my-2 flex items-start justify-between w-full gap-2 rounded-md">
      <div className="flex items-center gap-1">
        {message.role === 'assistant' && <MessageMetadata message={message} />}
        <CopyButton text={part.text} />
        <TooltipButton
          tooltipContent="Rewrite"
          variant="ghost"
          size="xs"
          onClick={() => rewrite(message.id)}
        >
          <RefreshCcwIcon className="size-4" />
        </TooltipButton>
      </div>
      <div>
        {model && (
          <div className="flex items-center gap-1">
            {provider && <provider.Icon className="size-4 inline-block mr-1" />}
            {(() => {
              const effortFromMessage =
                message.metadata?.modelInfo?.reasoningEffort;
              const supportsEffort = Array.isArray(model.features)
                ? (model.features as Array<string>).includes('effort-control')
                : false;
              const showEffort = supportsEffort && !!effortFromMessage;

              const thinkingEnabled = Boolean(
                message.metadata?.modelInfo?.thinkingEnabled,
              );
              const supportsHybrid = Boolean(model.hybridReasoning);
              const showThinking =
                !showEffort && (supportsHybrid || thinkingEnabled);

              const suffix = showEffort
                ? effortFromMessage
                : showThinking
                  ? 'thinking'
                  : undefined;

              // Prefer a compact display name: for OpenAI use id tail (e.g., o3),
              // otherwise strip provider name prefix from model.name if present.
              const idTail = model.id?.includes(':')
                ? model.id.split(':')[1]
                : model.id;
              const providerName = provider?.name || '';
              let compactName = model.name;
              if (model.provider === 'openai' && idTail) {
                compactName = idTail;
              } else if (
                providerName &&
                model.name
                  .toLowerCase()
                  .startsWith(providerName.toLowerCase() + ' ')
              ) {
                compactName = model.name.slice(providerName.length + 1);
              }

              return (
                <p className="text-foreground">
                  <span className="bg-gradient-to-l dark:from-muted-foreground from-foreground via-foreground/50 to-foreground dark:via-foreground dark:to-muted-foreground bg-clip-text text-transparent">
                    {compactName}
                  </span>
                  {suffix && (
                    <span className="text-muted-foreground ml-1">
                      ({suffix})
                    </span>
                  )}
                </p>
              );
            })()}
          </div>
        )}
      </div>
    </Actions>
  );
}

export function UserActions({
  message,
  part,
  chatId,
  selectedModelId,
  messages,
  rewrite,
  editMessage,
  isEditing,
  editText,
  setEditText,
  cancelEdit,
  saveEdit,
  modelInfo,
  setModelInfo,
  favoriteModels,
  status,
}: {
  message: AIMessage;
  part: TextUIPart;
  chatId?: string;
  selectedModelId?: string;
  messages?: AIMessage[];
  rewrite: (messageId: string) => void;
  editMessage?: (messageId: string) => void;
  isEditing?: boolean;
  editText?: string;
  setEditText?: (text: string) => void;
  cancelEdit?: () => void;
  saveEdit?: () => void;
  modelInfo?: ClientModelInfo;
  setModelInfo?: React.Dispatch<React.SetStateAction<ClientModelInfo>>;
  favoriteModels?: Model[];
  status?: ChatStatus;
}) {
  if (isEditing) {
    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      saveEdit?.();
    };

    return (
      <div className="w-full">
        <InputContainer
          modelInfo={
            modelInfo || {
              modelId: '',
              reasoningEffort: 'medium',
              thinkingEnabled: false,
              webSearchEnabled: false,
            }
          }
          setModelInfo={
            setModelInfo ||
            ((() => {
              // noop that matches Dispatch<SetStateAction<ModelInfo>>
              return undefined as unknown as ClientModelInfo;
            }) as unknown as React.Dispatch<
              React.SetStateAction<ClientModelInfo>
            >)
          }
          input={editText || ''}
          setInput={setEditText || (() => {})}
          status={status || 'ready'}
          hasMessages={true}
          favoriteModels={favoriteModels || []}
          onSubmit={handleEditSubmit}
          stop={() => {}}
          isEditMode={true}
          onCancel={cancelEdit}
          editPlaceholder="Edit your message..."
        />
      </div>
    );
  }

  return (
    <Actions className="px-8 flex items-center justify-end w-full gap-1">
      <TooltipButton
        tooltipContent="Edit"
        variant="ghost"
        size="xs"
        onClick={() => editMessage?.(message.id)}
      >
        <PenLineIcon className="size-4" />
      </TooltipButton>
      <CopyButton text={part.text} />
    </Actions>
  );
}
