export const API_BASE_URL = '/api';

export const URLS = {
  /**
   * URL for the user profile page, for authenticated users
   */
  userProfile: '/settings/account',
  /**
   * Default redirect URL after login
   */
  defaultRedirect: '/',
};

export const MAX_API_KEYS_PER_PROVIDER = 5;

export const CHAT_TITLE_GEN_MODEL_DETAILS = {
  modelId: 'gateway:groq/llama-4-scout',
  modelApiKey: process.env.AI_GATEWAY_API_KEY,
};
