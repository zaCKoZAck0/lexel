import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { limiter } from '@/lib/server/rate-limit';
import { ok, fail } from '@/lib/server/api-response';
import { keySchema } from '@/lib/server/schema/key';
import { isAppError } from '@/lib/server/errors';
import * as apiKeysService from '@/lib/server/services/api-keys';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        // Rate-limit (IP-based)
        const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
        const { success } = await limiter.limit(ip);
        if (!success) return fail('Rate limit exceeded', 429);

        // Auth - only logged-in users can create products (example)
        const session = await auth();
        if (!session?.user?.id) return fail('Unauthorized', 401);

        // Validate body
        const body = await req.json();
        const parsed = keySchema.parse(body); // throws on fail

        // Business logic
        const key = await apiKeysService.create({ userId: session.user.id, ...parsed });

        return ok(key, 201);
    } catch (err) {
        if (isAppError(err)) return fail(err.message, err.status);
        if (err instanceof Error && err.name === 'ZodError')
            return fail('Invalid input', 400, err);
        console.error('[API_ERROR]', err);
        return fail('Internal Server Error', 500);
    }
}

// API routes that need session access must be dynamic
export const dynamic = 'force-dynamic';

export const GET = async (req: NextRequest) => {
    try {
        const session = await auth();
        if (!session?.user?.id) return fail('Unauthorized', 401);

        const keys = await apiKeysService.findAllByUserId(session.user.id);
        return ok(keys);
    } catch (err) {
        console.error('[API_ERROR]', err);
        return fail('Internal Server Error', 500);
    }
};