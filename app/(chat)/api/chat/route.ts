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
  getChatById,
  getMessagesByChatId,
  saveMessages,
} from '@/lib/api/server/services/chat';
import { JsonValue } from '@prisma/client/runtime/library';
import { convertToUIMessages } from '@/lib/utils/utils';
import { webSearch } from '@/lib/tools/exa-web-search';

// Allow streaming responses up to 30 seconds
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

    // Authentication - only logged-in users can access chat
    const session = await auth();
    if (!session?.user?.id) {
      return fail('Unauthorized - Please log in to continue', 401);
    }

    // Validate request body
    const json = await req.json();

    console.log(json);

    const { id, userInfo, message, modelInfo } = json as RequestBody;

    // Validate model
    const model = getModelDetails(modelInfo.modelId);
    if (!model) {
      return fail(`Unsupported model: ${modelInfo.modelId}`, 400);
    }

    // get provider api key
    const provider = model.provider;

    let chat = await getChatById(id);
    if (!chat) {
      // create chat
      // TODO: get title from query
      const newChat = await createChat({
        userId: session.user.id,
        chatId: id,
        title: 'New Chat',
      });
      chat = newChat;
    }

    const providerApiKey = await getDefaultApiKeyForProvider({
      userId: session.user.id,
      provider,
    });
    if (!providerApiKey) {
      return fail('Missing provider API key', 401);
    }

    await saveMessages({
      messages: [
        {
          chatId: id,
          role: 'user',
          parts: message.parts as JsonValue,
          metadata: message.metadata as JsonValue,
          id: message.id,
          modelId: 'N/A',
          attachmentUrls: [],
          createdAt: new Date(),
        },
      ],
    });

    const dbMessages = await getMessagesByChatId(id);
    const uiMessages = [...convertToUIMessages(dbMessages), message];

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
            ...(modelInfo.webSearchEnabled
              ? {
                  webSearch,
                }
              : {}),
          },
          stopWhen: stepCountIs(5),
          experimental_transform: smoothStream({ chunking: 'word' }),
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
              await saveMessages({
                messages: messages.map(message => ({
                  chatId: id,
                  role: message.role,
                  modelId: modelInfo.modelId,
                  parts: message.parts as JsonValue,
                  metadata: message.metadata as JsonValue,
                  attachmentUrls: [],
                  id: message.id,
                  createdAt: new Date(),
                })),
              });
            },
            generateMessageId: generateId,
            messageMetadata: ({ part }) => {
              if (part.type === 'start') {
                return {
                  modelId: modelInfo.modelId,
                  requestStartTimeMs,
                  responseStartTimeMs: performance.now(),
                };
              }
              if (part.type === 'finish') {
                console.log(part.totalUsage);
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
