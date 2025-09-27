import { GoogleModels } from './google-models';
import { ProviderId } from './providers';
import { OpenAiModels } from './openai-models';
import { gatewayModels } from './gateway-models';
import { anthropicModels } from './anthropic-models';
import { xaiModels } from './xai-models';

type Modality = 'text' | 'image' | 'video';
type Features = 'tool-calling' | 'effort-control' | 'fast' | 'open-source';
type ModelType = 'chat' | 'image-generation';

type Model = {
  id: string;
  name: string;
  provider: ProviderId;
  /* The actual provider of the model, if hosted by a third party. e.g. Fireworks / Groq for OSS models */
  actualProvider?: string;
  description?: string;
  releaseDate?: Date;
  isReasoning: boolean;
  modalities: Modality[];
  features: Features[];

  hybridReasoning?: boolean;

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

export const allModels: Model[] = [
  ...GoogleModels,
  ...OpenAiModels,
  ...gatewayModels,
  ...anthropicModels,
  ...xaiModels,
];

export function getModelDetails(modelId: string) {
  return allModels.find(model => model.id === modelId);
}

export function allModelsForProviders(providers: ProviderId[]) {
  return allModels.filter(model => providers.includes(model.provider));
}

export { type Model, type Modality, type Features, type ModelType };
