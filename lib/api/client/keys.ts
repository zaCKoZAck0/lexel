import {
  ApiKey,
  CreateApiKeyInput,
  UpdateApiKeyInput,
  SetDefaultActionInput,
} from '@/lib/types/api-keys';

import { apiRequest } from '.';
import { ApiResponse } from '../server/api-response';

// API Keys service functions
export const apiKeysService = {
  // Get all keys for the current user
  getAll: async (filters?: {
    default?: boolean;
  }): Promise<ApiResponse<ApiKey[]>> => {
    const params = new URLSearchParams();
    if (filters?.default !== undefined) {
      params.append('default', filters.default.toString());
    }

    const url = params.toString() ? `/keys?${params.toString()}` : '/keys';
    return apiRequest(url);
  },

  // Get a specific key by ID
  getById: async (id: string): Promise<ApiResponse<ApiKey>> => {
    return apiRequest(`/keys/${id}`);
  },

  // Create a new API key
  create: async (data: CreateApiKeyInput): Promise<ApiResponse<ApiKey>> => {
    return apiRequest('/keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update an existing API key
  update: async (
    id: string,
    data: UpdateApiKeyInput,
  ): Promise<ApiResponse<ApiKey>> => {
    return apiRequest(`/keys/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Delete an API key
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(`/keys/${id}`, {
      method: 'DELETE',
    });
  },

  // Set an API key as default
  setDefault: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(`/keys/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'set-default' } as SetDefaultActionInput),
    });
  },
};
