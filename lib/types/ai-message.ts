import { UIMessage } from 'ai';
import { z } from 'zod';

// Define the model info schema that will be stored in metadata
export const modelInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  actualProvider: z.string().optional(),
  description: z.string().optional(),
  releaseDate: z.date().optional(),
  isReasoning: z.boolean(),
  modalities: z.array(z.string()),
  features: z.array(z.string()),
  hybridReasoning: z.boolean().optional(),
  modelType: z.string(),
  speed: z.number().optional(),
  intelligence: z.number().optional(),
  contextWindow: z.number(),
  priceInUSD: z.object({
    input: z.number(),
    output: z.number(),
    per: z.string(),
  }),
  webSearchEnabled: z.boolean().optional(),
  reasoningEffort: z.enum(['minimal', 'low', 'medium', 'high']).optional(),
  thinkingEnabled: z.boolean().optional(),
});

// Define your metadata schema
export const messageMetadataSchema = z.object({
  modelInfo: modelInfoSchema.optional(),
  totalTokens: z.number().optional(),
  requestStartTimeMs: z.number().optional(),
  responseStartTimeMs: z.number().optional(),
  responseEndTimeMs: z.number().optional(),
  reasoningTime: z.number().optional(),
});

export type ModelInfo = z.infer<typeof modelInfoSchema>;
export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

export type AIMessage = UIMessage<MessageMetadata>;
