import { z } from 'zod';
import { allModels } from '@/lib/models';

// Full schema for a complete preferences object
export const userPreferencesSchema = z.object({
  favoriteModels: z
    .array(z.string())
    .default([])
    .superRefine((models, ctx) => {
      const seen = new Set<string>();
      models.forEach((id, index) => {
        if (seen.has(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['favoriteModels', index],
            message: 'Duplicate model id',
          });
        }
        seen.add(id);
        if (!allModels.some(m => m.id === id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['favoriteModels', index],
            message: 'Unknown model id',
          });
        }
      });
    }),
});

// Partial schema for PATCH-like updates (future fields can be added here)
export const userPreferencesUpdateSchema = z
  .object({
    favoriteModels: z
      .array(z.string())
      .optional()
      .superRefine((models, ctx) => {
        if (!models) return;
        const seen = new Set<string>();
        models.forEach((id, index) => {
          if (seen.has(id)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['favoriteModels', index],
              message: 'Duplicate model id',
            });
          }
          seen.add(id);
          if (!allModels.some(m => m.id === id)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['favoriteModels', index],
              message: 'Unknown model id',
            });
          }
        });
      }),
  })
  .strict();

// Infer types from schemas
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
export type UserPreferencesUpdateInput = z.infer<
  typeof userPreferencesUpdateSchema
>;
