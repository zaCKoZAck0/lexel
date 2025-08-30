import { AnthropicProviderOptions } from '@ai-sdk/anthropic';

type ProviderOptionsConfig = {
  isReasoning?: boolean;
  thinkingEnabled?: boolean;
  effort?: 'minimal' | 'low' | 'medium' | 'high';
};

export function getProviderOptions(config: ProviderOptionsConfig = {}) {
  const options: any = {
    openai: {
      reasoningEffort: config.effort || 'low',
    },

    anthropic: {
      thinking: {
        type: config.thinkingEnabled ? 'enabled' : 'disabled',
        budgetTokens: 12000,
      },
    } satisfies AnthropicProviderOptions,
  };

  if (config.isReasoning) {
    options.google = {
      thinkingConfig: {
        thinkingBudget: 8192,
        includeThoughts: true,
      },
    };
  }

  return options;
}
