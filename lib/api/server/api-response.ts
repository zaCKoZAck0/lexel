import { NextResponse } from 'next/server';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  error: unknown;
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data } as ApiResponse<T>, {
    status,
  });
}

export function fail(message: string, status = 400, error?: unknown) {
  return NextResponse.json(
    {
      success: false,
      message,
      error: error instanceof Error ? error.message : error,
      status,
    } as ApiError,
    { status },
  );
}
