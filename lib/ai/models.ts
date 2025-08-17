export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ProviderDetails {
  id: string;
  name: string;
  url: string;
  apiKeyUrl: string;
  iconUrl: string;
}
/**
 * Represents a chat model used in the application.
 */
export interface ChatModel {
  /**
   * Unique identifier for the chat model.
   */
  id: string;
  /**
   * Official name of the chat model.
   */
  name: string;
  /**
   * A short description of the chat model.
   */
  description: string;
  /**
   * URL to the chat model's documentation.
   */
  modelUrl: string;
  /**
   * Indicates if the chat model is capable of reasoning.
   */
  isReasoning: boolean;
  /**
   * Details about the provider of the chat model.
   */
  providerDetails: ProviderDetails;
  /**
   * The context window size for the chat model.
   */
  contextWindow?: number;
  /**
   * Pricing information for the chat model.
   */
  priceInUsd: {
    input: number;
    output: number;
    unit: 'Per 1M tokens';
  };
  /**
   * Speed rating for the chat model (1-5).
   */
  speed: 1 | 2 | 3 | 4 | 5;
  /**
   * Intelligence rating (or Reasoning if applicable) for the chat model (1-5).
   */
  intelligence: 1 | 2 | 3 | 4 | 5;
  /**
   * Indicates if model is enabled on the platform.
   */
  enabled: boolean;
}

export const OpenAIProviderDetails: ProviderDetails = {
  id: 'openai',
  name: 'OpenAI',
  url: 'https://openai.com',
  apiKeyUrl: 'https://platform.openai.com/signup',
  iconUrl: '/providers/logos/openai.svg'
};

const openAIModels: Array<ChatModel> = [
  {
    id: 'gpt-5',
    name: 'GPT-5',
    description: 'GPT-5 is OpenAI\'s flagship model for coding, reasoning, and agentic tasks across domains.',
    isReasoning: true,
    providerDetails: OpenAIProviderDetails,
    contextWindow: 400_000,
    priceInUsd: {
      input: 1.25,
      output: 10,
      unit: 'Per 1M tokens'
    },
    modelUrl: 'https://platform.openai.com/docs/models/gpt-5',
    intelligence: 4,
    speed: 3,
    enabled: true
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 mini',
    description: 'A faster, cost-efficient version of GPT-5 for well-defined tasks.',
    isReasoning: true,
    providerDetails: OpenAIProviderDetails,
    contextWindow: 400_000,
    priceInUsd: {
      input: 0.25,
      output: 2,
      unit: 'Per 1M tokens'
    },
    modelUrl: 'https://platform.openai.com/docs/models/gpt-5-mini',
    intelligence: 3,
    speed: 4,
    enabled: true
  },
  {
    id: 'gpt-5-nano',
    name: 'GPT-5 nano',
    description: 'GPT-5 Nano is OpenAI\'s fastest, cheapest version of GPT-5. It\'s great for summarization and classification tasks.',
    isReasoning: true,
    providerDetails: OpenAIProviderDetails,
    contextWindow: 400_000,
    priceInUsd: {
      input: 0.05,
      output: 0.4,
      unit: 'Per 1M tokens'
    },
    modelUrl: 'https://platform.openai.com/docs/models/gpt-5-nano',
    speed: 5,
    intelligence: 2,
    enabled: true
  }
];


export const chatModels: Array<ChatModel> = [
  ...openAIModels
];

