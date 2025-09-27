import { getModelDetails } from '@/lib/models';
import { fail } from '@/lib/api/server/api-response';
import { AIMessage } from '@/lib/types/ai-message';
import {
  convertToModelMessages,
  createUIMessageStream,
  generateId,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from 'ai';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { limiter } from '@/lib/api/server/rate-limit';
import { isAppError } from '@/lib/api/server/errors';
import { getDefaultApiKeyForProvider } from '@/lib/api/server/services/api-keys';
import { getRegistryModel } from '@/lib/models/model-registry';
import { getSystemPrompt } from '@/lib/utils/prompts';
import { getProviderOptions } from '@/lib/models/provider-options';
import {
  createChat,
  deleteMessages,
  getChatByIdWithMessages,
  saveMessages,
} from '@/lib/api/server/services/chat';
import { createMemoryTools } from '@/lib/tools/supermemory';
import { JsonValue } from '@prisma/client/runtime/library';
import { convertToUIMessages } from '@/lib/utils/utils';
import { webSearch } from '@/lib/tools/exa-web-search';
import { watchYoutube } from '@/lib/tools/watch-youtube';
import { DEFAULT_CHAT_TITLE, MAX_MESSAGES_CONTEXT } from '@/lib/config/server';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

interface RequestBody {
  id: string;
  userInfo: {
    timezone: string;
  };
  message: AIMessage;
  modelInfo: {
    modelId: string;
    webSearchEnabled?: boolean;
    reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high';
    thinkingEnabled?: boolean;
  };
  trigger: 'message-send' | 'message-rewrite' | 'message-edit';
}

export async function POST(req: Request) {
  try {
    // Rate-limit (IP-based)
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') ?? 'unknown';
    const { success } = await limiter.limit(ip);
    if (!success) {
      return fail('Rate limit exceeded. Please try again later.', 429);
    }

    // Validate request body
    const json = await req.json();

    const { id, userInfo, message, modelInfo, trigger } = json as RequestBody;

    // Validate model
    const model = getModelDetails(modelInfo.modelId);
    if (!model) {
      return fail(`Unsupported model: ${modelInfo.modelId}`, 400);
    }

    const provider = model.provider;

    const session = await auth();

    // Authentication - only logged-in users can access chat
    if (!session?.user?.id) {
      return fail('Unauthorized - Please log in to continue', 401);
    }

    const userId = session.user.id;

    let chatWithMessages = await getChatByIdWithMessages(
      id,
      MAX_MESSAGES_CONTEXT,
    );

    if (chatWithMessages && chatWithMessages.userId !== userId) {
      return fail('Chat not found', 404);
    }

    if (!chatWithMessages) {
      const firstTextLikePart = message.parts.find(
        part => part.type === 'text',
      );
      const title =
        firstTextLikePart && firstTextLikePart.type === 'text'
          ? firstTextLikePart.text.slice(0, 80)
          : DEFAULT_CHAT_TITLE;

      const newChat = await createChat({
        userId: session.user.id,
        chatId: id,
        title,
      });
      chatWithMessages = { ...newChat, messages: [] };
    }

    const providerApiKey = await getDefaultApiKeyForProvider({
      userId: session.user.id,
      provider,
    });
    if (!providerApiKey) {
      return fail('Missing provider API key', 401);
    }

    let messageIdsToDelete: string[] = [];

    if (trigger === 'message-rewrite' || trigger === 'message-edit') {
      const messageIds = chatWithMessages?.messages.map(message => message.id);
      const messageIndex = messageIds?.indexOf(message.id);

      if (!messageIds || messageIndex === undefined || messageIndex === -1) {
        const action = trigger === 'message-rewrite' ? 'rewrite' : 'edit';
        return fail(`No messages to ${action}`, 400);
      }

      if (trigger === 'message-edit' && message.role !== 'user') {
        return fail('Only user messages can be edited', 400);
      }

      // For rewrite and edit: delete messages including the current one
      const sliceIndex = messageIndex;
      messageIdsToDelete = messageIds.slice(sliceIndex);
    }

    // Create a shared modelInfo snapshot and helper for composing metadata consistently
    const effectiveModelInfo = {
      ...model,
      webSearchEnabled: modelInfo.webSearchEnabled,
      reasoningEffort: modelInfo.reasoningEffort,
      thinkingEnabled: modelInfo.thinkingEnabled,
    };

    const composeMetadata = (base?: AIMessage['metadata']): JsonValue =>
      ({
        ...(base || {}),
        modelInfo: effectiveModelInfo,
      }) as AIMessage['metadata'] as JsonValue;

    // Build the UI messages to send to the model, ensuring rewrite/edit don't include
    // messages that are about to be deleted from the context.
    let priorMessages = chatWithMessages?.messages ?? [];

    // If we're rewriting or editing, compute the slice so the model only sees messages
    // up to (but not including) the target message being rewritten/edited.
    if (trigger === 'message-rewrite' || trigger === 'message-edit') {
      const originalIds = priorMessages.map(m => m.id);
      // messageIdsToDelete[0] is the first id to delete, i.e., the target message id
      const sliceIndex = originalIds.indexOf(messageIdsToDelete[0]);
      if (sliceIndex > -1) {
        priorMessages = priorMessages.slice(0, sliceIndex);
      }
    }

    // For message-send and message-edit, append the (new/edited) user message.
    // For message-rewrite, do NOT append the incoming message if it's the assistant target;
    // the last prior message should already be the user turn prompting a fresh assistant reply.
    const uiMessages =
      trigger === 'message-send' || trigger === 'message-edit'
        ? [...convertToUIMessages(priorMessages), message]
        : convertToUIMessages(priorMessages);

    const memoryTools = createMemoryTools(userId);

    let reasoningStartTimeMs: number | undefined;
    let reasoningEndTimeMs: number | undefined;
    const requestStartTimeMs = performance.now();

    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const result = streamText({
          model: getRegistryModel({
            modelId: modelInfo.modelId,
            providerApiKey: providerApiKey.key,
          }),
          tools: {
            ...(modelInfo.webSearchEnabled && {
              webSearch,
            }),
            searchMemories: memoryTools.searchMemories,
            addMemory: memoryTools.addMemory,
            watchYoutube,
          },
          stopWhen: stepCountIs(5),
          experimental_transform: smoothStream({ chunking: 'line' }),
          providerOptions: getProviderOptions({
            isReasoning: model.isReasoning,
            effort: modelInfo.reasoningEffort,
            thinkingEnabled: modelInfo.thinkingEnabled,
          }),
          onChunk: ({ chunk }) => {
            if (chunk.type === 'reasoning-delta') {
              if (!reasoningStartTimeMs) {
                reasoningStartTimeMs = performance.now();
              } else {
                reasoningEndTimeMs = performance.now();
              }
            }
          },
          system: getSystemPrompt({
            modelName: model.name,
            webSearchEnabled: modelInfo.webSearchEnabled,
            dateTime: new Date().toLocaleString('en-US', {
              timeZone: userInfo.timezone,
            }),
          }),
          messages: convertToModelMessages(uiMessages),
        });
        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream<AIMessage>({
            sendReasoning: true,
            sendSources: true,
            onFinish: async ({ messages }) => {
              const userMessages =
                trigger === 'message-send' || trigger === 'message-edit'
                  ? [
                      {
                        chatId: id,
                        role: 'user',
                        parts: message.parts as JsonValue,
                        metadata: composeMetadata(
                          message.metadata as AIMessage['metadata'],
                        ),
                        id: message.id,
                        attachmentUrls: [],
                        createdAt: new Date(),
                      },
                    ]
                  : [];

              // Delete any messages if needed (for rewrite or edit)
              if (messageIdsToDelete.length > 0) {
                await deleteMessages(messageIdsToDelete);
              }

              // Save all messages
              const assistantAndToolMessages = messages.map(message => ({
                chatId: id,
                role: message.role,
                parts: message.parts as JsonValue,
                metadata: composeMetadata(
                  message.metadata as AIMessage['metadata'],
                ),
                attachmentUrls: [],
                id: message.id,
                createdAt: new Date(),
              }));

              await saveMessages({
                messages: [
                  // Persist the (new/edited) user message first, then assistant/tool messages
                  ...userMessages,
                  ...assistantAndToolMessages,
                ],
              });
            },
            generateMessageId: generateId,
            messageMetadata: ({ part }) => {
              if (part.type === 'start') {
                return {
                  modelInfo: effectiveModelInfo,
                  requestStartTimeMs,
                  responseStartTimeMs: performance.now(),
                };
              }
              if (part.type === 'finish') {
                return {
                  totalTokens: part.totalUsage.totalTokens,
                  responseEndTimeMs: performance.now(),
                  reasoningTime:
                    !reasoningStartTimeMs || !reasoningEndTimeMs
                      ? undefined
                      : reasoningEndTimeMs - reasoningStartTimeMs,
                };
              }
            },
          }),
        );
      },
      onError: error => {
        console.error('[CHAT_API_ERROR] AI stream error:', error);

        // Enhanced error handling for AI SDK
        if (error == null) {
          return 'An unknown error occurred during AI processing';
        }

        if (typeof error === 'string') {
          return error;
        }

        if (error instanceof Error) {
          // Handle specific AI SDK errors
          if (
            error.message.includes('rate limit') ||
            error.message.includes('quota')
          ) {
            return 'AI service rate limit exceeded. Please try again later.';
          }
          if (
            error.message.includes('authentication') ||
            error.message.includes('invalid key')
          ) {
            return 'Invalid API key. Please check your credentials.';
          }
          if (
            error.message.includes('model') ||
            error.message.includes('not found')
          ) {
            return 'Selected AI model is currently unavailable.';
          }
          return error.message;
        }

        return 'An unexpected error occurred during AI processing';
      },
    });

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (err) {
    // Handle application-specific errors
    if (isAppError(err)) {
      return fail(err.message, err.status);
    }

    // Handle validation errors
    if (err instanceof Error && err.name === 'ZodError') {
      return fail('Invalid input data', 400, err);
    }

    // Handle AI SDK specific errors
    if (err instanceof Error) {
      if (err.message.includes('rate limit') || err.message.includes('quota')) {
        return fail('AI service rate limit exceeded', 429);
      }
      if (
        err.message.includes('authentication') ||
        err.message.includes('invalid key')
      ) {
        return fail('Invalid API credentials', 401);
      }
      if (err.message.includes('model') || err.message.includes('not found')) {
        return fail('AI model not available', 503);
      }
    }

    // Log unexpected errors
    console.error('[CHAT_API_ERROR] Unexpected error:', err);
    return fail('Internal server error', 500);
  }
}

// API routes that need session access must be dynamic
export const dynamic = 'force-dynamic';
