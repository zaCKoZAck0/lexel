import { prisma } from '@/prisma';
import { Chat, Message, Stream, Vote, Visibility } from '@prisma/client';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { AppError } from '@/lib/api/server/errors';
import { UIMessagePart, UIDataTypes, UITools } from 'ai';

/* eslint-disable @typescript-eslint/no-unused-vars */

// DTO type aliases
export type ChatDTO = Chat;
export type MessageDTO = Message;
export type StreamDTO = Stream;
export type VoteDTO = Vote;

// Extended DTOs
export interface ChatWithMessagesDTO extends Chat {
  messages: MessageDTO[];
}

export interface ChatWithStreamsDTO extends Chat {
  streams: StreamDTO[];
}

export interface MessageWithVotesDTO extends Message {
  votes: VoteDTO[];
}

// Pagination interfaces
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  cursor?: string;
  sortOrder?: 'newest' | 'oldest';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

// Input interfaces
export interface CreateChatInput {
  chatId: string;
  userId: string;
  title: string;
}

export interface UpdateChatTitleInput {
  chatId: string;
  userId: string;
  title: string;
}

interface CreateMessageInput {
  chatId: string;
  messageId: string;
  role: string;
  parts: UIMessagePart<UIDataTypes, UITools>[];
  modelId: string;
  attachmentUrls?: string[];
}

interface SaveMessagesInput {
  messages: Message[];
}

interface UpdateChatVisibilityInput {
  chatId: string;
  userId: string;
  visibility: Visibility;
}

interface UpdateMessageInput {
  messageId: string;
  chatId: string;
  parts?: UIMessagePart<UIDataTypes, UITools>[];
  metadata?: Record<string, any>;
  attachmentUrls?: string[];
}

export interface SearchChatsInput {
  userId: string;
  query: string;
  limit?: number;
  offset?: number;
  sortOrder?: 'newest' | 'oldest';
}

interface CreateStreamInput {
  chatId: string;
}

interface CreateVoteInput {
  chatId: string;
  messageId: string;
  userId: string;
  isUpvoted: boolean;
}

interface BulkDeleteChatsInput {
  chatIds: string[];
  userId: string;
}

/**
 * Create a new chat for a user
 */
export async function createChat(data: CreateChatInput): Promise<ChatDTO> {
  try {
    const chat = await prisma.chat.create({
      data: {
        id: data.chatId,
        title: data.title,
        userId: data.userId,
        visibility: 'PRIVATE',
      },
    });
    return chat;
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to create chat', 500);
  }
}

/**
 * Get a chat by ID
 */
export async function getChatById(chatId: string): Promise<ChatDTO | null> {
  try {
    return await prisma.chat.findFirst({
      where: {
        id: chatId,
      },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to retrieve chat', 500);
  }
}

/**
 * Get a chat by ID with all its messages
 */
export async function getChatByIdWithMessages(
  chatId: string,
): Promise<ChatWithMessagesDTO | null> {
  try {
    return await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        messages: true,
      },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to retrieve chat with messages', 500);
  }
}

/**
 * Get all chats for a user
 */
export async function getChatsByUserId(userId: string): Promise<ChatDTO[]> {
  try {
    return await prisma.chat.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to retrieve user chats', 500);
  }
}

/**
 * Update a chat's title
 */
export async function updateChatTitle(
  data: UpdateChatTitleInput,
): Promise<ChatDTO | null> {
  try {
    const result = await prisma.chat.updateMany({
      where: {
        id: data.chatId,
        userId: data.userId,
      },
      data: {
        title: data.title,
      },
    });

    if (result.count === 0) {
      throw new AppError('Chat not found or unauthorized', 404);
    }

    return await prisma.chat.findUnique({
      where: { id: data.chatId },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (_error instanceof AppError) {
      throw _error;
    }
    throw new AppError('Failed to update chat title', 500);
  }
}

/**
 * Delete a chat
 */
export async function deleteChat(
  chatId: string,
  userId: string,
): Promise<void> {
  try {
    const result = await prisma.chat.deleteMany({
      where: {
        id: chatId,
        userId,
      },
    });

    if (result.count === 0) {
      throw new AppError('Chat not found or unauthorized', 404);
    }
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (_error instanceof AppError) {
      throw _error;
    }
    throw new AppError('Failed to delete chat', 500);
  }
}

/**
 * Add a message to a chat
 */
export async function addMessage(
  data: CreateMessageInput,
): Promise<MessageDTO> {
  try {
    // Verify chat exists and user has access
    const chat = await prisma.chat.findFirst({
      where: {
        id: data.chatId,
      },
    });

    if (!chat) {
      throw new AppError('Chat not found', 404);
    }

    return await prisma.message.create({
      data: {
        id: data.messageId,
        chatId: data.chatId,
        role: data.role,
        parts: data.parts as InputJsonValue,
        modelId: data.modelId,
        attachmentUrls: data.attachmentUrls || [],
      },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (_error instanceof AppError) {
      throw _error;
    }
    throw new AppError('Failed to add message', 500);
  }
}

/**
 * Get all messages for a chat
 */
export async function getMessagesByChatId(
  chatId: string,
): Promise<MessageDTO[]> {
  try {
    return await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to retrieve messages', 500);
  }
}

/**
 * Save multiple messages
 */
export async function saveMessages(data: SaveMessagesInput): Promise<void> {
  try {
    if (!Array.isArray(data.messages) || data.messages.length === 0) {
      throw new AppError(
        'Messages array is required and must not be empty',
        400,
      );
    }

    await prisma.message.createMany({
      data: data.messages.map(message => ({
        id: message.id,
        chatId: message.chatId,
        modelId: message.modelId,
        role: message.role,
        parts: message.parts as InputJsonValue,
        createdAt: message.createdAt,
        attachmentUrls: message.attachmentUrls,
        metadata: message.metadata as InputJsonValue,
      })),
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (_error instanceof AppError) {
      throw _error;
    }
    throw new AppError('Failed to save messages', 500);
  }
}

/**
 * Delete multiple messages
 */
export async function deleteMessages(messageIds: string[]): Promise<void> {
  try {
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      throw new AppError(
        'Message IDs array is required and must not be empty',
        400,
      );
    }

    await prisma.message.deleteMany({
      where: {
        id: { in: messageIds },
      },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (_error instanceof AppError) {
      throw _error;
    }
    throw new AppError('Failed to delete messages', 500);
  }
}

// ===== ENHANCED CRUD OPERATIONS =====

/**
 * Update chat visibility
 */
export async function updateChatVisibility(
  data: UpdateChatVisibilityInput,
): Promise<ChatDTO | null> {
  try {
    const result = await prisma.chat.updateMany({
      where: {
        id: data.chatId,
        userId: data.userId,
      },
      data: {
        visibility: data.visibility,
      },
    });

    if (result.count === 0) {
      throw new AppError('Chat not found or unauthorized', 404);
    }

    return await prisma.chat.findUnique({
      where: { id: data.chatId },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (_error instanceof AppError) {
      throw _error;
    }
    throw new AppError('Failed to update chat visibility', 500);
  }
}

/**
 * Get chats with pagination
 */
export async function getChatsByUserIdPaginated(
  userId: string,
  options: PaginationOptions = {},
): Promise<PaginatedResponse<ChatDTO>> {
  try {
    const { limit = 20, offset = 0, cursor, sortOrder = 'newest' } = options;

    const whereCondition = cursor
      ? {
          userId,
          createdAt: { lt: new Date(cursor) },
        }
      : { userId };

    // Determine sort direction based on sortOrder
    const sortDirection = sortOrder === 'newest' ? 'desc' : 'asc';

    const chats = await prisma.chat.findMany({
      where: whereCondition,
      orderBy: { createdAt: sortDirection },
      take: limit + 1,
      skip: offset,
    });

    const hasMore = chats.length > limit;
    const data = hasMore ? chats.slice(0, limit) : chats;
    const nextCursor = hasMore
      ? data[data.length - 1]?.createdAt.toISOString()
      : undefined;

    const total = await prisma.chat.count({
      where: { userId },
    });

    return {
      data,
      total,
      hasMore,
      nextCursor,
    };
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to retrieve paginated chats', 500);
  }
}

/**
 * Get messages with pagination
 */
export async function getMessagesByChatIdPaginated(
  chatId: string,
  options: PaginationOptions = {},
): Promise<PaginatedResponse<MessageDTO>> {
  try {
    const { limit = 50, offset = 0, cursor } = options;

    const whereCondition = cursor
      ? {
          chatId,
          createdAt: { gt: new Date(cursor) },
        }
      : { chatId };

    const messages = await prisma.message.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'asc' },
      take: limit + 1,
      skip: offset,
    });

    const hasMore = messages.length > limit;
    const data = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore
      ? data[data.length - 1]?.createdAt.toISOString()
      : undefined;

    const total = await prisma.message.count({
      where: { chatId },
    });

    return {
      data,
      total,
      hasMore,
      nextCursor,
    };
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to retrieve paginated messages', 500);
  }
}

/**
 * Search chats by title
 */
export async function searchChats(data: SearchChatsInput): Promise<ChatDTO[]> {
  try {
    const {
      userId,
      query,
      limit = 20,
      offset = 0,
      sortOrder = 'newest',
    } = data;

    // Determine sort direction based on sortOrder
    const sortDirection = sortOrder === 'newest' ? 'desc' : 'asc';

    return await prisma.chat.findMany({
      where: {
        userId,
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: { createdAt: sortDirection },
      take: limit,
      skip: offset,
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to search chats', 500);
  }
}

/**
 * Get single message by ID
 */
export async function getMessageById(
  messageId: string,
): Promise<MessageDTO | null> {
  try {
    return await prisma.message.findUnique({
      where: { id: messageId },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to retrieve message', 500);
  }
}

/**
 * Get message with votes
 */
export async function getMessageByIdWithVotes(
  messageId: string,
): Promise<MessageWithVotesDTO | null> {
  try {
    return await prisma.message.findUnique({
      where: { id: messageId },
      include: { votes: true },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to retrieve message with votes', 500);
  }
}

/**
 * Update a message
 */
export async function updateMessage(
  data: UpdateMessageInput,
): Promise<MessageDTO | null> {
  try {
    const updateData: any = {};

    if (data.parts !== undefined) {
      updateData.parts = data.parts as InputJsonValue;
    }
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata as InputJsonValue;
    }
    if (data.attachmentUrls !== undefined) {
      updateData.attachmentUrls = data.attachmentUrls;
    }

    return await prisma.message
      .updateMany({
        where: {
          id: data.messageId,
          chatId: data.chatId,
        },
        data: updateData,
      })
      .then(() =>
        prisma.message.findUnique({
          where: { id: data.messageId },
        }),
      );
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to update message', 500);
  }
}

/**
 * Get chat with streams
 */
export async function getChatByIdWithStreams(
  chatId: string,
): Promise<ChatWithStreamsDTO | null> {
  try {
    return await prisma.chat.findUnique({
      where: { id: chatId },
      include: { streams: true },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to retrieve chat with streams', 500);
  }
}

// ===== STREAM CRUD OPERATIONS =====

/**
 * Create a new stream for a chat
 */
export async function createStream(
  data: CreateStreamInput,
): Promise<StreamDTO> {
  try {
    return await prisma.stream.create({
      data: {
        chatId: data.chatId,
      },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to create stream', 500);
  }
}

/**
 * Get streams by chat ID
 */
export async function getStreamsByChatId(chatId: string): Promise<StreamDTO[]> {
  try {
    return await prisma.stream.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to retrieve streams', 500);
  }
}

/**
 * Delete streams by chat ID
 */
export async function deleteStreamsByChatId(chatId: string): Promise<void> {
  try {
    await prisma.stream.deleteMany({
      where: { chatId },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to delete streams', 500);
  }
}

// ===== VOTE CRUD OPERATIONS =====

/**
 * Create or update a vote
 */
export async function upsertVote(data: CreateVoteInput): Promise<VoteDTO> {
  try {
    return await prisma.vote.upsert({
      where: {
        chatId_messageId: {
          chatId: data.chatId,
          messageId: data.messageId,
        },
      },
      update: {
        isUpvoted: data.isUpvoted,
      },
      create: {
        chatId: data.chatId,
        messageId: data.messageId,
        userId: data.userId,
        isUpvoted: data.isUpvoted,
      },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to upsert vote', 500);
  }
}

/**
 * Get votes by chat ID
 */
export async function getVotesByChatId(chatId: string): Promise<VoteDTO[]> {
  try {
    return await prisma.vote.findMany({
      where: { chatId },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to retrieve votes', 500);
  }
}

/**
 * Get votes by message ID
 */
export async function getVotesByMessageId(
  messageId: string,
): Promise<VoteDTO[]> {
  try {
    return await prisma.vote.findMany({
      where: { messageId },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to retrieve votes', 500);
  }
}

/**
 * Delete vote
 */
export async function deleteVote(
  chatId: string,
  messageId: string,
): Promise<void> {
  try {
    await prisma.vote.delete({
      where: {
        chatId_messageId: {
          chatId,
          messageId,
        },
      },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to delete vote', 500);
  }
}

// ===== BULK OPERATIONS =====

/**
 * Bulk delete chats
 */
export async function bulkDeleteChats(
  data: BulkDeleteChatsInput,
): Promise<number> {
  try {
    const { chatIds, userId } = data;

    if (!Array.isArray(chatIds) || chatIds.length === 0) {
      throw new AppError(
        'Chat IDs array is required and must not be empty',
        400,
      );
    }

    const result = await prisma.chat.deleteMany({
      where: {
        id: { in: chatIds },
        userId,
      },
    });

    return result.count;
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (_error instanceof AppError) {
      throw _error;
    }
    throw new AppError('Failed to bulk delete chats', 500);
  }
}

/**
 * Bulk update chat visibility
 */
export async function bulkUpdateChatVisibility(
  chatIds: string[],
  userId: string,
  visibility: Visibility,
): Promise<number> {
  try {
    if (!Array.isArray(chatIds) || chatIds.length === 0) {
      throw new AppError(
        'Chat IDs array is required and must not be empty',
        400,
      );
    }

    const result = await prisma.chat.updateMany({
      where: {
        id: { in: chatIds },
        userId,
      },
      data: { visibility },
    });

    return result.count;
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (_error instanceof AppError) {
      throw _error;
    }
    throw new AppError('Failed to bulk update chat visibility', 500);
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get chat statistics for a user
 */
export async function getChatStats(userId: string): Promise<{
  totalChats: number;
  totalMessages: number;
  publicChats: number;
  privateChats: number;
  recentChats: number;
}> {
  try {
    const [totalChats, totalMessages, publicChats, privateChats, recentChats] =
      await Promise.all([
        prisma.chat.count({ where: { userId } }),
        prisma.message.count({
          where: {
            chat: { userId },
          },
        }),
        prisma.chat.count({
          where: { userId, visibility: 'PUBLIC' },
        }),
        prisma.chat.count({
          where: { userId, visibility: 'PRIVATE' },
        }),
        prisma.chat.count({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ]);

    return {
      totalChats,
      totalMessages,
      publicChats,
      privateChats,
      recentChats,
    };
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to get chat statistics', 500);
  }
}

/**
 * Check if user has access to chat
 */
export async function checkChatAccess(
  chatId: string,
  userId: string,
): Promise<boolean> {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { userId: true },
    });

    return chat?.userId === userId;
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return false;
  }
}

/**
 * Get recent chats for a user
 */
export async function getRecentChats(
  userId: string,
  limit: number = 10,
): Promise<ChatDTO[]> {
  try {
    return await prisma.chat.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throw new AppError('Failed to get recent chats', 500);
  }
}
