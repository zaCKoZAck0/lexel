import { getModelDetails } from './models';
import { getProviderInfo } from './providers';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createProviderRegistry } from 'ai';

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
    // register provider with prefix and default setup:
    google: createGoogleGenerativeAI({
      apiKey: providerApiKey,
    }),
    // register provider with prefix and custom setup:
    openai: createOpenAI({
      apiKey: providerApiKey,
    }),
    deepseek: createDeepSeek({
      apiKey: providerApiKey,
    }),
  });

  const identifier = `${model.provider}:${model.id}` as const;

  return registry.languageModel(identifier);
}
