import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { limiter } from '@/lib/api/server/rate-limit';
import { ok, fail } from '@/lib/api/server/api-response';
import * as apiKeysService from '@/lib/api/server/services/api-keys';
import type { NextRequest } from 'next/server';
import { getProviderInfo } from '@/lib/models/providers';
import { setDefaultSchema, updateKeySchema } from '../schema';

// GET /api/keys/[id] - Get a specific key
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return fail('Unauthorized', 401);
    const { id } = await params;
    const key = await apiKeysService.findById(id, session.user.id);

    if (!key) {
      return fail('API key not found', 404);
    }

    return ok(key);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Unauthorized:')) {
      return fail(err.message, 403);
    }
    console.error('[API_ERROR]', err);
    return fail('Internal Server Error', 500);
  }
}

// PATCH /api/keys/[id] - Update a specific key
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Rate-limit (IP-based)
    const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
    const { success } = await limiter.limit(ip);
    if (!success) return fail('Rate limit exceeded', 429);

    const session = await auth();
    if (!session?.user?.id) return fail('Unauthorized', 401);

    const body = await req.json();
    const parsed = updateKeySchema.parse(body);

    // If key provided without provider, we must fetch existing to know provider for validation
    if (parsed.key && !parsed.provider) {
      const { id } = await params;
      const session2 = await auth();
      if (!session2?.user?.id) return fail('Unauthorized', 401);
      const existing = await apiKeysService.findById(id, session2.user.id);
      if (!existing) return fail('API key not found', 404);
      const info = getProviderInfo(existing.provider);
      if (!info) {
        return fail('Unknown provider', 400);
      }
      if (info.enabled === false) {
        return fail(
          `Adding API keys for ${info.name} is currently disabled`,
          400,
        );
      }
      if (info.keyPattern && !info.keyPattern.test(parsed.key.trim())) {
        return fail('Key format invalid for provider', 400);
      }
    }

    const { id } = await params;
    const updatedKey = await apiKeysService.updateById(
      id,
      session.user.id,
      parsed,
    );

    return ok(updatedKey);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Unauthorized:')) {
      return fail(err.message, 403);
    }
    if (err instanceof Error && err.message === 'API key not found') {
      return fail(err.message, 404);
    }
    if (
      err instanceof Error &&
      err.message === 'API key already exists for this user'
    ) {
      return fail(err.message, 409);
    }
    if (err instanceof Error && err.name === 'ZodError') {
      return fail('Invalid input', 400, err);
    }
    console.error('[API_ERROR]', err);
    return fail('Internal Server Error', 500);
  }
}

// DELETE /api/keys/[id] - Delete a specific key
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Rate-limit (IP-based)
    const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
    const { success } = await limiter.limit(ip);
    if (!success) return fail('Rate limit exceeded', 429);

    const session = await auth();
    if (!session?.user?.id) return fail('Unauthorized', 401);

    const { id } = await params;
    await apiKeysService.deleteById(id, session.user.id);

    return ok({ message: 'API key deleted successfully' });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Unauthorized:')) {
      return fail(err.message, 403);
    }
    if (err instanceof Error && err.message === 'API key not found') {
      return fail(err.message, 404);
    }
    console.error('[API_ERROR]', err);
    return fail('Internal Server Error', 500);
  }
}

// POST /api/keys/[id] - Perform actions on a specific key (like set-default)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Rate-limit (IP-based)
    const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
    const { success } = await limiter.limit(ip);
    if (!success) return fail('Rate limit exceeded', 429);

    const session = await auth();
    if (!session?.user?.id) return fail('Unauthorized', 401);

    const body = await req.json();
    const parsed = setDefaultSchema.parse(body);

    if (parsed.action === 'set-default') {
      const { id } = await params;
      await apiKeysService.setDefault(id, session.user.id);
      return ok({ message: 'API key set as default successfully' });
    }

    return fail('Invalid action', 400);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Unauthorized:')) {
      return fail(err.message, 403);
    }
    if (err instanceof Error && err.message === 'API key not found') {
      return fail(err.message, 404);
    }
    if (err instanceof Error && err.name === 'ZodError') {
      return fail('Invalid input', 400, err);
    }
    console.error('[API_ERROR]', err);
    return fail('Internal Server Error', 500);
  }
}
