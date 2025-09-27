import { auth } from '@/lib/auth/auth';
import { ok, fail } from '@/lib/api/server/api-response';
import { isAppError } from '@/lib/api/server/errors';
import { userPreferencesUpdateSchema } from './schema';
import { headers } from 'next/headers';
import { limiter } from '@/lib/api/server/rate-limit';
import * as userPrefService from '@/lib/api/server/services/user-preferences';
import { NextRequest } from 'next/server';

// GET /api/preferences - returns current user's preferences
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return fail('Unauthorized', 401);

    const prefs = await userPrefService.getByUserId(session.user.id);
    return ok(prefs ?? { favoriteModels: [] });
  } catch (err) {
    if (isAppError(err)) return fail(err.message, err.status);
    console.error('[API_ERROR]', err);
    return fail('Internal Server Error', 500);
  }
}

// PUT /api/preferences - updates current user's preferences
export async function PUT(req: NextRequest) {
  try {
    const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
    const { success } = await limiter.limit(ip);
    if (!success) return fail('Rate limit exceeded', 429);

    const session = await auth();
    if (!session?.user?.id) return fail('Unauthorized', 401);

    const body = await req.json();
    const parsed = userPreferencesUpdateSchema.parse(body);
    console.log(parsed);
    const updated = await userPrefService.update(session.user.id, {
      favoriteModels: parsed.favoriteModels,
    });
    return ok(updated);
  } catch (err) {
    console.error('[API_ERROR]', err);
    if (isAppError(err)) return fail(err.message, err.status);
    if (err instanceof Error && err.name === 'ZodError')
      return fail('Invalid input', 400, err);
    console.error('[API_ERROR]', err);
    return fail('Internal Server Error', 500);
  }
}

export const dynamic = 'force-dynamic';
