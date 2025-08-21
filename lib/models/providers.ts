// Central AI provider configuration.
// This module is the single source of truth for provider metadata (ids, names, models, docs, key formats, icons, etc.).
// Client components that need lightweight data can tree-shake unused fields.

import type { ComponentType, SVGProps } from 'react';
import {
  OpenAIIcon,
  AnthropicIcon,
  GeminiIcon,
  DeepSeekIcon,
  QwenIcon,
} from '@/components/icons/provider-icons';

// Add new providers here and their inferred union type will update automatically.
export interface ProviderConfig {
  id: 'openai' | 'google' | 'anthropic' | 'deepseek' | 'qwen';
  name: string;
  /** React SVG icon component (forwardRef). */
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Example / expected key format prefix shown as a hint (NOT validated strictly). */
  keyFormat: string;
  /** Documentation URL for the provider. */
  documentation: string;
  /** Portal / dashboard URL where the user can create & manage API keys. */
  keyPortal?: string;
  /** Optional regex to validate API key shape (lightweight client side). */
  keyPattern?: RegExp;
}

export const AI_PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    Icon: OpenAIIcon,
    keyFormat: 'sk-...',
    documentation: 'https://platform.openai.com/docs',
    keyPortal: 'https://platform.openai.com/api-keys',
    // OpenAI now issues both classic keys (sk-...) and project keys (sk-proj-...).
    // Classic: sk- followed by mixed-case base62 (length varies ~48+ total)
    // Project: sk-proj-<projectid>-<rest> (hyphen separated). Keep pattern permissive but anchored.
    keyPattern: /^(?:sk-[A-Za-z0-9]{10,}|sk-proj-[A-Za-z0-9_-]{10,})$/,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    Icon: AnthropicIcon,
    keyFormat: 'sk-ant-...',
    documentation: 'https://docs.anthropic.com',
    keyPortal: 'https://console.anthropic.com/settings/keys',
    // Anthropic keys observed: sk-ant- + base62 tail (length >= 8)
    keyPattern: /^sk-ant-[A-Za-z0-9]{8,}$/,
  },
  {
    id: 'google',
    name: 'Google',
    Icon: GeminiIcon,
    keyFormat: 'AIza...',
    documentation: 'https://ai.google.dev/docs',
    keyPortal: 'https://aistudio.google.com/app/apikey',
    // Google API style keys start with AIza followed by base64-ish chars (length typically 39)
    keyPattern: /^AIza[0-9A-Za-z_\-]{10,}$/,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    Icon: DeepSeekIcon,
    keyFormat: 'sk-...',
    documentation: 'https://api-docs.deepseek.com',
    keyPortal: 'https://platform.deepseek.com/api_keys',
  },
  {
    id: 'qwen',
    name: 'Qwen',
    Icon: QwenIcon,
    keyFormat: 'sk-...',
    documentation: 'https://help.aliyun.com/en/qwen',
    keyPortal: 'https://bailian.console.aliyun.com/?apiKey=1#/api-key',
  },
];

export type ProviderId = (typeof AI_PROVIDERS)[number]['id'];

// Fast lookup map (frozen for safety)
export const PROVIDER_MAP: Record<ProviderId, ProviderConfig> = Object.freeze(
  AI_PROVIDERS.reduce(
    (acc, p) => {
      acc[p.id] = p;
      return acc;
    },
    {} as Record<ProviderId, ProviderConfig>,
  ),
);

export function getProviderInfo<T extends string>(
  providerId: T,
): T extends ProviderId ? ProviderConfig : ProviderConfig | undefined;
export function getProviderInfo(providerId: string) {
  return (PROVIDER_MAP as Record<string, ProviderConfig | undefined>)[
    providerId
  ];
}

export function validateProviderKey(
  providerId: ProviderId,
  key: string,
): boolean {
  const info = getProviderInfo(providerId);
  if (!info) return false;
  if (info.keyPattern) return info.keyPattern.test(key.trim());
  // Fallback: simple prefix heuristic from keyFormat up to first ellipsis
  const prefix = info.keyFormat.split('...')[0];
  return prefix
    ? key.startsWith(prefix.replace(/\s+/g, ''))
    : key.trim().length > 0;
}
