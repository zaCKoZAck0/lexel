import { UIMessage } from 'ai';
import { z } from 'zod';

// Define your metadata schema
export const messageMetadataSchema = z.object({
  modelId: z.string().optional(),
  totalTokens: z.number().optional(),
  requestStartTimeMs: z.number().optional(),
  responseStartTimeMs: z.number().optional(),
  responseEndTimeMs: z.number().optional(),
  reasoningTime: z.number().optional(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

export type AIMessage = UIMessage<MessageMetadata>;
