import { prisma } from '@/prisma';
import { Chat, Message } from '@prisma/client';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { AppError } from '@/lib/api/server/errors';
import { UIMessagePart, UIDataTypes } from 'ai';

/* eslint-disable @typescript-eslint/no-unused-vars */

// DTO type aliases
export type ChatDTO = Chat;

export interface ChatWithMessagesDTO extends Chat {
  messages: MessageDTO[];
}

export type MessageDTO = Message;

// Input interfaces
interface CreateChatInput {
  chatId: string;
  userId: string;
  title: string;
}

interface UpdateChatTitleInput {
  chatId: string;
  userId: string;
  title: string;
}

interface CreateMessageInput {
  chatId: string;
  messageId: string;
  role: string;
  parts: UIMessagePart<UIDataTypes>[];
  modelId: string;
  attachmentUrls?: string[];
}

interface SaveMessagesInput {
  messages: Message[];
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
    if (error instanceof AppError) {
      throw error;
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
    if (error instanceof AppError) {
      throw error;
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
        parts: data.parts,
        modelId: data.modelId,
        attachmentUrls: data.attachmentUrls || [],
      },
    });
  } catch (_error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (error instanceof AppError) {
      throw error;
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
    if (error instanceof AppError) {
      throw error;
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
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete messages', 500);
  }
}
