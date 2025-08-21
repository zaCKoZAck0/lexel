import { getModelDetails } from '@/lib/models/models';
import { fail } from '@/lib/api/server/api-response';
import {
  getChatById,
  createChat,
  getMessagesByChatId,
  deleteMessages,
  saveMessages,
} from '@/lib/api/server/services/chat';
import { AIMessage } from '@/lib/types/ai-message';
import { convertToModelMessages, generateId, streamText } from 'ai';
import { headers } from 'next/headers';
import { PostRequestBody, postRequestBodySchema } from './schema';
import { convertToUIMessages } from '@/lib/utils/utils';
import { JsonValue } from '@prisma/client/runtime/library';
import { auth } from '@/lib/auth/auth';
import { limiter } from '@/lib/api/server/rate-limit';
import { isAppError } from '@/lib/api/server/errors';
import { getDefaultApiKeyForProvider } from '@/lib/api/server/services/api-keys';
import { getRegistryModel } from '@/lib/models/model-registry';
import { getSystemPrompt } from '@/lib/utils/prompts';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

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
    let requestBody: PostRequestBody;
    try {
      const json = await req.json();
      requestBody = postRequestBodySchema.parse(json);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return fail('Invalid request format', 400, error);
      }
      return fail('Invalid JSON in request body', 400);
    }

    const { id, message, trigger, messageId, modelId } = requestBody;

    // Validate required fields
    if (!id || !modelId) {
      return fail('Missing required fields: id and modelId are required', 400);
    }

    if (trigger === 'submit-message' && !message) {
      return fail('Message is required for submit-message trigger', 400);
    }

    if (trigger === 'regenerate-message' && !messageId) {
      return fail('Message ID is required for regenerate-message trigger', 400);
    }

    const chat = await getChatById(id);

    if (!chat) {
      // Todo: generate a title for the chat
      await createChat({
        chatId: id,
        userId: session.user.id,
        title: 'New Chat',
      });
    } else {
      if (chat.userId !== session.user.id) {
        return fail('Unauthorized - You are not the owner of this chat', 401);
      }
    }

    // Validate model
    const model = getModelDetails(modelId);
    if (!model) {
      return fail(`Unsupported model: ${modelId}`, 400);
    }

    // get provider api key
    const provider = model.provider;

    // Validate provider API key
    const providerApiKey = await getDefaultApiKeyForProvider({
      userId: session.user.id,
      provider,
    });
    if (!providerApiKey) {
      return fail('Missing provider API key', 401);
    }

    // Get chat messages with error handling
    let dbMessages;
    try {
      dbMessages = await getMessagesByChatId(id);
    } catch (error) {
      console.error('[CHAT_API_ERROR] Failed to fetch messages:', error);
      return fail('Failed to retrieve chat history', 500);
    }

    let uiMessages = [...convertToUIMessages(dbMessages)];

    // Handle different triggers
    if (trigger === 'submit-message') {
      uiMessages = [...uiMessages, message];
    } else if (trigger === 'regenerate-message') {
      const messageIndex = uiMessages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) {
        return fail('Message not found for regeneration', 404);
      }

      uiMessages = uiMessages.slice(0, messageIndex);

      // Delete messages after the messageId
      try {
        await deleteMessages(uiMessages.slice(messageIndex + 1).map(m => m.id));
      } catch (error) {
        console.error('[CHAT_API_ERROR] Failed to delete messages:', error);
        // Continue with the request even if deletion fails
      }
    }

    // Save user message
    try {
      await saveMessages({
        messages: [
          {
            id: message.id,
            chatId: id,
            modelId: 'N/A',
            role: 'user',
            parts: message.parts,
            metadata: {},
            attachmentUrls: [],
            createdAt: new Date(),
          },
        ],
      });
    } catch (error) {
      console.error('[CHAT_API_ERROR] Failed to save user message:', error);
      return fail('Failed to save message', 500);
    }

    // Create AI stream with enhanced error handling
    const result = streamText({
      model: getRegistryModel({
        modelId,
        providerApiKey: providerApiKey.key,
      }),
      system: getSystemPrompt({
        modelName: model.name,
        dateTime: new Date().toLocaleString(),
      }),
      messages: convertToModelMessages(uiMessages),
    });

    const requestStartTimeMs = Date.now();

    return result.toUIMessageStreamResponse<AIMessage>({
      sendReasoning: true,
      sendSources: true,
      generateMessageId: generateId,
      onFinish: async ({ messages }) => {
        try {
          await saveMessages({
            messages: messages.map(m => ({
              id: m.id,
              chatId: id,
              metadata: m.metadata as JsonValue,
              modelId,
              role: m.role,
              parts: m.parts as JsonValue,
              attachmentUrls: [],
              createdAt: new Date(),
            })),
          });
        } catch (error) {
          console.error('[CHAT_API_ERROR] Failed to save AI messages:', error);
          // Don't fail the stream for save errors, just log them
        }
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
      messageMetadata: ({ part }) => {
        if (part.type === 'start') {
          return {
            modelId,
            requestStartTimeMs,
            responseStartTimeMs: Date.now(),
          };
        }
        if (part.type === 'finish') {
          return {
            totalTokens: part.totalUsage.totalTokens,
            responseEndTimeMs: Date.now(),
          };
        }
      },
    });
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
