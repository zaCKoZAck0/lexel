import { generateObject } from 'ai';
import { z } from 'zod';
import { AIMessage } from '../types/ai-message';
import { getRegistryModel } from '../models/model-registry';
import { CHAT_TITLE_GEN_MODEL_DETAILS } from '../config/server';

export async function generateTitleForChat({
  message,
}: {
  message: AIMessage;
}) {
  const TitleSchema = z.object({
    title: z
      .string()
      .max(80, 'Max 80 characters')
      .refine(s => !/[":]/.test(s), 'No quotes or colons')
      .trim()
      .describe(
        "Short, descriptive title summarizing the user's first message.",
      ),
  });

  const { object } = await generateObject({
    model: getRegistryModel({
      modelId: CHAT_TITLE_GEN_MODEL_DETAILS.modelId,
      providerApiKey: CHAT_TITLE_GEN_MODEL_DETAILS.modelApiKey || '',
    }),
    schema: TitleSchema,
    prompt: JSON.stringify(message),
  });

  return object.title;
}
