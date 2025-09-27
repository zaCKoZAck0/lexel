import { getModelDetails } from '.';
import {
  getProviderInfo,
  type ProviderId,
  type NonKeyProviderId,
} from './providers';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createProviderRegistry } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createXai } from '@ai-sdk/xai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

interface GetLanguageModelProps {
  modelId: string;
  providerApiKey: string;
}

export function getRegistryModel({
  modelId,
  providerApiKey,
}: GetLanguageModelProps) {
  const model = getModelDetails(modelId);
  if (!model) {
    throw new Error(`Model ${modelId} not found`);
  }
  const provider = getProviderInfo(model.provider);
  if (!provider) {
    throw new Error(`Provider ${model.provider} not found`);
  }

  const registry = createProviderRegistry({
    google: createGoogleGenerativeAI({
      apiKey: providerApiKey,
    }),
    openai: createOpenAI({
      apiKey: providerApiKey,
    }),
    deepseek: createDeepSeek({
      apiKey: providerApiKey,
    }),
    gateway: createGateway({
      apiKey: providerApiKey,
    }),
    anthropic: createAnthropic({
      apiKey: providerApiKey,
    }),
    xai: createXai({
      apiKey: providerApiKey,
    }),
    zai: createOpenAICompatible({
      name: 'z.ai',
      apiKey: providerApiKey,
      baseURL: 'https://api.z.ai/api/paas/v4',
    }),
  });

  const identifier =
    `${model.provider as Exclude<ProviderId, NonKeyProviderId>}:${model.id.split(':')[1]}` as const;

  return registry.languageModel(identifier);
}
