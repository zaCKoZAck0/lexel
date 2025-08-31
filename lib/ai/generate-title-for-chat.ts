import { generateText } from 'ai';
import { AIMessage } from '../types/ai-message';
import { getRegistryModel } from '../models/model-registry';
import { CHAT_TITLE_GEN_MODEL_DETAILS } from '../config/config';

export async function generateTitleForChat({
  message,
}: {
  message: AIMessage;
}) {
  const { text: title } = await generateText({
    model: getRegistryModel({
      modelId: CHAT_TITLE_GEN_MODEL_DETAILS.modelId,
      providerApiKey: CHAT_TITLE_GEN_MODEL_DETAILS.modelApiKey || '',
    }),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}
