import { auth } from '@/lib/auth/auth';
import { ok, fail } from '@/lib/api/server/api-response';
import * as apiKeysService from '@/lib/api/server/services/api-keys';

// GET /api/providers - returns providers available to the authenticated user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return fail('Unauthorized', 401);

    const providers = await apiKeysService.getAllAvailableProvidersForUserId(
      session.user.id,
    );
    return ok(providers);
  } catch (err) {
    console.error('[API_ERROR]', err);
    return fail('Internal Server Error', 500);
  }
}

// API routes that need session access must be dynamic
export const dynamic = 'force-dynamic';
