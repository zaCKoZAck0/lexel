import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { limiter } from '@/lib/api/server/rate-limit';
import { ok, fail } from '@/lib/api/server/api-response';
import { isAppError } from '@/lib/api/server/errors';
import * as chatService from '@/lib/api/server/services/chat';
import type { NextRequest } from 'next/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Rate-limit (IP-based)
    const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
    const { success } = await limiter.limit(ip);
    if (!success) return fail('Rate limit exceeded', 429);

    // Auth - only logged-in users can delete history
    const session = await auth();
    if (!session?.user?.id) return fail('Unauthorized', 401);

    // Await params since it's now a Promise
    const { id: chatId } = await params;

    if (!chatId) {
      return fail('Chat ID is required', 400);
    }

    await chatService.deleteChat(chatId, session.user.id);
    return ok({ message: 'Chat deleted successfully' }, 200);
  } catch (err) {
    if (isAppError(err)) return fail(err.message, err.status);
    console.error('[API_ERROR]', err);
    return fail('Internal Server Error', 500);
  }
}

// API routes that need session access must be dynamic
export const dynamic = 'force-dynamic';
