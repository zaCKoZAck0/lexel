import { Model } from '.';

export const GoogleModels: Model[] = [
  {
    id: 'google:gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    isReasoning: false,
    modalities: ['text', 'image'],
    features: ['tool-calling', 'fast'],
    modelType: 'chat',
    contextWindow: 1_000_000,
    priceInUSD: {
      input: 0.1,
      output: 0.4,
      per: '1M tokens',
    },
  },
  {
    id: 'google:gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    isReasoning: true,
    modalities: ['text', 'image'],
    features: ['tool-calling'],
    modelType: 'chat',
    contextWindow: 1_000_000,
    priceInUSD: {
      input: 1.24,
      output: 10,
      per: '1M tokens',
    },
  },
  {
    id: 'google:gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    isReasoning: false,
    modalities: ['text', 'image'],
    features: ['tool-calling', 'fast'],
    modelType: 'chat',
    contextWindow: 1_000_000,
    priceInUSD: {
      input: 0.15,
      output: 0.6,
      per: '1M tokens',
    },
  },
];
