import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { limiter } from '@/lib/api/server/rate-limit';
import { ok, fail } from '@/lib/api/server/api-response';
import { isAppError } from '@/lib/api/server/errors';
import * as chatService from '@/lib/api/server/services/chat';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Rate-limit (IP-based)
    const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
    const { success } = await limiter.limit(ip);
    if (!success) return fail('Rate limit exceeded', 429);

    // Auth - only logged-in users can access history
    const session = await auth();
    if (!session?.user?.id) return fail('Unauthorized', 401);

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const query = searchParams.get('query')?.trim();
    const sortOrder =
      (searchParams.get('sortOrder') as 'newest' | 'oldest') || 'newest';

    let result;

    if (query) {
      // Search chats
      result = await chatService.searchChats({
        userId: session.user.id,
        query,
        limit,
        offset: 0,
        sortOrder,
      });

      // For search results, we don't use cursor pagination
      return ok({
        data: result,
        total: result.length,
        hasMore: false,
        nextCursor: null,
      });
    } else {
      // Get paginated chats
      result = await chatService.getChatsByUserIdPaginated(session.user.id, {
        limit,
        cursor: cursor || undefined,
        sortOrder,
      });

      return ok(result);
    }
  } catch (err) {
    if (isAppError(err)) return fail(err.message, err.status);
    console.error('[API_ERROR]', err);
    return fail('Internal Server Error', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Rate-limit (IP-based)
    const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
    const { success } = await limiter.limit(ip);
    if (!success) return fail('Rate limit exceeded', 429);

    // Auth - only logged-in users can delete history
    const session = await auth();
    if (!session?.user?.id) return fail('Unauthorized', 401);

    // Parse request body for batch delete
    const body = await req.json();
    const { chatIds } = body;

    if (Array.isArray(chatIds)) {
      // Batch delete
      if (chatIds.length === 0) {
        return fail('Chat IDs array cannot be empty', 400);
      }

      const deletedCount = await chatService.bulkDeleteChats({
        chatIds,
        userId: session.user.id,
      });

      return ok({ deletedCount }, 200);
    } else {
      // Single delete - get chatId from URL
      const url = new URL(req.url);
      const chatId = url.pathname.split('/').pop();

      if (!chatId || chatId === 'history') {
        return fail('Chat ID is required', 400);
      }

      await chatService.deleteChat(chatId, session.user.id);
      return ok({ message: 'Chat deleted successfully' }, 200);
    }
  } catch (err) {
    if (isAppError(err)) return fail(err.message, err.status);
    console.error('[API_ERROR]', err);
    return fail('Internal Server Error', 500);
  }
}

// API routes that need session access must be dynamic
export const dynamic = 'force-dynamic';
