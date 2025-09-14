import 'server-only';

export const MAX_API_KEYS_PER_PROVIDER = 5;

export const CHAT_TITLE_GEN_MODEL_DETAILS = {
  modelId: 'gateway:groq/llama-4-scout',
  modelApiKey: process.env.AI_GATEWAY_API_KEY,
};

export const DEFAULT_CHAT_TITLE = 'No Title';

export const MAX_MESSAGES_CONTEXT = 10;
