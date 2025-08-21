import { z } from 'zod';

const textPartSchema = z.object({
  type: z.enum(['text']),
  text: z.string().min(1).max(2000),
});

const filePartSchema = z.object({
  type: z.enum(['file']),
  mediaType: z.enum(['image/jpeg', 'image/png']),
  name: z.string().min(1).max(100),
  url: z.string().url(),
});

const partSchema = z.union([textPartSchema, filePartSchema]);

const metadataSchema = z
  .object({
    modelId: z.string(),
    totalTokens: z.number(),
    requestStartTimeMs: z.number(),
    responseStartTimeMs: z.number(),
    responseEndTimeMs: z.number(),
  })
  .optional();

export const postRequestBodySchema = z.object({
  id: z.string(),
  message: z.object({
    id: z.string(),
    role: z.enum(['user']),
    parts: z.array(partSchema),
    metadata: metadataSchema,
  }),
  trigger: z.enum(['submit-message', 'regenerate-message']),
  messageId: z.string().optional(),
  modelId: z.string(),
});

// Infer types from schemas
export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
export type TextPart = z.infer<typeof textPartSchema>;
export type FilePart = z.infer<typeof filePartSchema>;
export type MessagePart = z.infer<typeof partSchema>;
export type MessageMetadata = z.infer<typeof metadataSchema>;
