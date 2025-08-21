type Modality = 'text' | 'image' | 'video';
type Features = 'tool-calling' | 'effort-control' | 'fast';
type ModelType = 'chat' | 'image-generation';

type Model = {
  id: string;
  name: string;
  provider: 'openai' | 'google' | 'deepseek';
  /* The actual provider of the model, if hosted by a third party. e.g. Fireworks / Groq for OSS models */
  actualProvider?: string;
  description?: string;
  releaseDate: Date;
  isReasoning: boolean;
  modalities: Modality[];
  features: Features[];
  modelType: ModelType;
  /* Relative speed rating (1-5) where higher means faster */
  speed?: number;
  /* Relative intelligence/quality rating (1-5) */
  intelligence?: number;
  contextWindow: number;
  priceInUSD: {
    input: number;
    output: number;
    /* e.g. Per 1M tokens */
    per: string;
  };
};

const OpenAIModels: Model[] = [
  // GPT-5 Series (August 2025)
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    releaseDate: new Date('2025-08-07'),
    isReasoning: true,
    modalities: ['text', 'image'],
    features: ['tool-calling'],
    modelType: 'chat',
    contextWindow: 400000,
    priceInUSD: { input: 1.25, output: 10.0, per: 'Per 1M tokens' },
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 mini',
    provider: 'openai',
    releaseDate: new Date('2025-08-07'),
    isReasoning: true,
    modalities: ['text', 'image'],
    features: ['tool-calling'],
    modelType: 'chat',
    contextWindow: 400000,
    priceInUSD: { input: 0.25, output: 2.0, per: 'Per 1M tokens' },
  },
  {
    id: 'gpt-5-nano',
    name: 'GPT-5 nano',
    provider: 'openai',
    releaseDate: new Date('2025-08-07'),
    isReasoning: true,
    modalities: ['text', 'image'],
    features: ['tool-calling'],
    modelType: 'chat',
    contextWindow: 400000,
    priceInUSD: { input: 0.05, output: 0.4, per: 'Per 1M tokens' },
  },

  // GPT-4.1 Series (April 2025)
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    releaseDate: new Date('2025-04-14'),
    isReasoning: false,
    modalities: ['text', 'image'],
    features: ['tool-calling'],
    modelType: 'chat',
    contextWindow: 1048000,
    priceInUSD: { input: 2.0, output: 8.0, per: 'Per 1M tokens' },
  },
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 mini',
    provider: 'openai',
    releaseDate: new Date('2025-04-14'),
    isReasoning: false,
    modalities: ['text', 'image'],
    features: ['tool-calling'],
    modelType: 'chat',
    contextWindow: 1048000,
    priceInUSD: { input: 0.4, output: 1.6, per: 'Per 1M tokens' },
  },
  {
    id: 'gpt-4.1-nano',
    name: 'GPT-4.1 nano',
    provider: 'openai',
    releaseDate: new Date('2025-04-14'),
    isReasoning: false,
    modalities: ['text', 'image'],
    features: ['tool-calling', 'fast'],
    modelType: 'chat',
    contextWindow: 1048000,
    priceInUSD: { input: 0.1, output: 0.4, per: 'Per 1M tokens' },
  },

  // GPT-4o Series
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    releaseDate: new Date('2024-05-13'),
    isReasoning: false,
    modalities: ['text', 'image'],
    features: ['tool-calling'],
    modelType: 'chat',
    contextWindow: 128000,
    priceInUSD: { input: 2.5, output: 10.0, per: 'Per 1M tokens' },
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'openai',
    releaseDate: new Date('2024-07-18'),
    isReasoning: false,
    modalities: ['text', 'image'],
    features: ['tool-calling', 'fast'],
    modelType: 'chat',
    contextWindow: 128000,
    priceInUSD: { input: 0.15, output: 0.6, per: 'Per 1M tokens' },
  },

  // (Removed o1 series and o3/o4 series per request)

  // Image Generation Models
  {
    id: 'gpt-image-1',
    name: 'GPT Image 1',
    provider: 'openai',
    releaseDate: new Date('2025-01-31'),
    isReasoning: false,
    modalities: ['text'],
    features: [],
    modelType: 'image-generation',
    speed: 3,
    intelligence: 4,
    contextWindow: 8000,
    priceInUSD: { input: 10.0, output: 40.0, per: 'Per 1M tokens' },
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'openai',
    releaseDate: new Date('2023-10-01'),
    isReasoning: false,
    modalities: ['text'],
    features: [],
    modelType: 'image-generation',
    contextWindow: 4000,
    priceInUSD: { input: 0.02, output: 0.0, per: 'Per image' },
  },

  // (Removed legacy GPT-4/gpt-4-turbo and gpt-3.5-turbo per request)
];
/* ——— Gemini models ——— */
const GeminiModels: Model[] = [
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    releaseDate: new Date('2025-07-22'),
    isReasoning: true,
    modalities: ['text', 'image'],
    features: ['tool-calling', 'effort-control'],
    modelType: 'chat',
    speed: 3,
    intelligence: 5,
    contextWindow: 200000,
    priceInUSD: { input: 1.0, output: 8.0, per: 'Per 1M tokens' },
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    releaseDate: new Date('2025-07-22'),
    isReasoning: true,
    modalities: ['text', 'image'],
    features: ['tool-calling', 'fast'],
    modelType: 'chat',
    speed: 5,
    intelligence: 4,
    contextWindow: 200000,
    priceInUSD: { input: 0.2, output: 1.6, per: 'Per 1M tokens' },
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'google',
    releaseDate: new Date('2025-07-22'),
    isReasoning: true,
    modalities: ['text', 'image'],
    features: ['tool-calling', 'fast'],
    modelType: 'chat',
    speed: 5,
    intelligence: 3,
    contextWindow: 200000,
    priceInUSD: { input: 0.05, output: 0.4, per: 'Per 1M tokens' },
  },
  {
    id: 'gemini-2.5-flash-lite-preview-06-17',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'google',
    releaseDate: new Date('2025-06-17'),
    isReasoning: true,
    modalities: ['text', 'image'],
    features: ['tool-calling', 'fast'],
    modelType: 'chat',
    speed: 5,
    intelligence: 3,
    contextWindow: 200000,
    priceInUSD: { input: 0.05, output: 0.4, per: 'Per 1M tokens' },
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    releaseDate: new Date('2025-02-28'),
    isReasoning: true,
    modalities: ['text', 'image'],
    features: ['tool-calling', 'fast'],
    modelType: 'chat',
    speed: 5,
    intelligence: 4,
    contextWindow: 128000,
    priceInUSD: { input: 0.15, output: 1.2, per: 'Per 1M tokens' },
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    releaseDate: new Date('2025-01-18'),
    isReasoning: true,
    modalities: ['text', 'image'],
    features: ['tool-calling'],
    modelType: 'chat',
    speed: 3,
    intelligence: 4,
    contextWindow: 1000000,
    priceInUSD: { input: 0.5, output: 3.0, per: 'Per 1M tokens' },
  },
  {
    id: 'gemini-1.5-pro-latest',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    releaseDate: new Date('2025-05-10'),
    isReasoning: true,
    modalities: ['text', 'image'],
    features: ['tool-calling'],
    modelType: 'chat',
    speed: 3,
    intelligence: 4,
    contextWindow: 1000000,
    priceInUSD: { input: 0.5, output: 3.0, per: 'Per 1M tokens' },
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    releaseDate: new Date('2025-01-18'),
    isReasoning: true,
    modalities: ['text', 'image'],
    features: ['tool-calling', 'fast'],
    modelType: 'chat',
    speed: 5,
    intelligence: 3,
    contextWindow: 1000000,
    priceInUSD: { input: 0.1, output: 0.8, per: 'Per 1M tokens' },
  },
  {
    id: 'gemini-1.5-flash-latest',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    releaseDate: new Date('2025-05-10'),
    isReasoning: true,
    modalities: ['text', 'image'],
    features: ['tool-calling', 'fast'],
    modelType: 'chat',
    speed: 5,
    intelligence: 3,
    contextWindow: 1000000,
    priceInUSD: { input: 0.1, output: 0.8, per: 'Per 1M tokens' },
  },
  {
    id: 'gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash 8B',
    provider: 'google',
    releaseDate: new Date('2025-03-12'),
    isReasoning: true,
    modalities: ['text', 'image'],
    features: ['tool-calling', 'fast'],
    modelType: 'chat',
    speed: 5,
    intelligence: 3,
    contextWindow: 1000000,
    priceInUSD: { input: 0.02, output: 0.16, per: 'Per 1M tokens' },
  },
  {
    id: 'gemini-1.5-flash-8b-latest',
    name: 'Gemini 1.5 Flash 8B',
    provider: 'google',
    releaseDate: new Date('2025-05-10'),
    isReasoning: true,
    modalities: ['text', 'image'],
    features: ['tool-calling', 'fast'],
    modelType: 'chat',
    speed: 5,
    intelligence: 3,
    contextWindow: 1000000,
    priceInUSD: { input: 0.02, output: 0.16, per: 'Per 1M tokens' },
  },
];

/* ——— DeepSeek models ——— */
const DeepSeekModels: Model[] = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    releaseDate: new Date('2025-06-30'), // adjust if you have a different date
    isReasoning: true,
    modalities: ['text'],
    features: ['tool-calling'], // supports tool usage per screenshot
    modelType: 'chat',
    speed: 4, // relative estimates
    intelligence: 4,
    contextWindow: 128000,
    priceInUSD: { input: 0.05, output: 0.4, per: 'Per 1M tokens' },
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    provider: 'deepseek',
    releaseDate: new Date('2025-06-30'),
    isReasoning: true,
    modalities: ['text'],
    features: [],
    modelType: 'chat',
    speed: 3,
    intelligence: 5,
    contextWindow: 128000,
    priceInUSD: { input: 0.1, output: 0.8, per: 'Per 1M tokens' },
  },
];

/* ——— Combine ——— */
export const allModels: Model[] = [
  ...OpenAIModels,
  ...GeminiModels,
  ...DeepSeekModels,
];

export function getModelDetails(modelId: string) {
  return allModels.find(model => model.id === modelId);
}

export {
  type Model,
  type Modality,
  type Features,
  type ModelType,
  OpenAIModels,
};
