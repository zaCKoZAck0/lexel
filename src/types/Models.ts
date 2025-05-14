export type Provider = 'xAI' | 'Anthropic' | 'OpenAI' | 'Google'; 

export type ModelType = 'chat' | 'reasoning' | 'image' ;

export type Model = {
    id: string;
    name: string;
    provider: Provider;
    enabled: boolean;
    description: string;
    size: number;
    modelType: ModelType;
}