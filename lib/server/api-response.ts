import { NextResponse } from 'next/server';

export function ok<T>(data: T, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
}

export function fail(message: string, status = 400, error?: unknown) {
    return NextResponse.json(
        { success: false, message, error: error instanceof Error ? error.message : error },
        { status },
    );
}
