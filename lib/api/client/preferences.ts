import type { UserPreferences } from '@/lib/types/user-preferences';
import { apiRequest } from '.';
import { ApiResponse } from '../server/api-response';

export const preferencesApi = {
  get: async (): Promise<ApiResponse<UserPreferences | null>> => {
    return apiRequest('/preferences');
  },
  update: async (
    payload: Partial<UserPreferences>,
  ): Promise<ApiResponse<UserPreferences>> => {
    return apiRequest('/preferences', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
