import { z } from 'zod';
import type { Prisma } from '@prisma/client';

// API Key returned to client (decrypted)
export interface ApiKey {
  id: string;
  userId: string;
  provider: string;
  key: string; // plaintext exposed to UI after decryption (masked in display logic)
  name?: string; // custom name for the API key
  default: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create/Update schemas that match your Prisma model (without relations)
export const createApiKeySchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  key: z.string().min(1, 'API key is required'),
  name: z.string().optional(),
  default: z.boolean().optional().default(false),
});

export const updateApiKeySchema = z.object({
  provider: z.string().optional(),
  key: z.string().optional(),
  name: z.string().optional(),
  default: z.boolean().optional(),
});

// Set default action schema
export const setDefaultSchema = z.object({
  action: z.literal('set-default'),
});

// Type definitions using Prisma types
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type UpdateApiKeyInput = z.infer<typeof updateApiKeySchema>;
export type SetDefaultActionInput = z.infer<typeof setDefaultSchema>;

// Query keys for TanStack Query
export const apiKeyQueryKeys = {
  all: ['api-keys'] as const,
  lists: () => [...apiKeyQueryKeys.all, 'list'] as const,
  list: (filters?: string) => [...apiKeyQueryKeys.lists(), filters] as const,
  details: () => [...apiKeyQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...apiKeyQueryKeys.details(), id] as const,
  defaults: () => [...apiKeyQueryKeys.all, 'default'] as const,
} as const;

// Re-export Prisma types for convenience
export type { Prisma };
