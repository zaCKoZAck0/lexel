import { z } from 'zod';
import { getProviderInfo } from '@/lib/models/providers';

// Match the Prisma ApiKeys model schema
export const keySchema = z
  .object({
    provider: z.string().min(1, 'Provider is required'),
    key: z.string().min(1, 'API key is required'),
    name: z.string().optional(),
    default: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    const info = getProviderInfo(data.provider);
    if (!info) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['provider'],
        message: 'Unknown provider',
      });
      return;
    }
    if (info.enabled === false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['provider'],
        message: `Adding API keys for ${info.name} is currently disabled`,
      });
      return;
    }
    if (info.keyPattern && !info.keyPattern.test(data.key.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['key'],
        message: 'Key format does not match expected pattern for ' + info.name,
      });
    }
  });

// Schema for setting a key as default
export const setDefaultSchema = z.object({
  action: z.literal('set-default'),
});

// Schema for updating a key
export const updateKeySchema = z
  .object({
    provider: z.string().optional(),
    key: z.string().optional(),
    name: z.string().optional(),
    default: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // Only validate if both provider and key are provided
    if (data.provider && data.key) {
      const info = getProviderInfo(data.provider);
      if (!info) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['provider'],
          message: 'Unknown provider',
        });
        return;
      }
      if (info.enabled === false) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['provider'],
          message: `Adding API keys for ${info.name} is currently disabled`,
        });
        return;
      }
      if (info.keyPattern && !info.keyPattern.test(data.key.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['key'],
          message: 'Key format invalid for provider',
        });
      }
    }
  });

// Infer types from schemas
export type KeyInput = z.infer<typeof keySchema>;
export type SetDefaultInput = z.infer<typeof setDefaultSchema>;
export type UpdateKeyInput = z.infer<typeof updateKeySchema>;
