import { apiRequest } from './index';

export interface ProvidersResponse {
  data: string[];
}

export const providersApi = {
  async getAvailable(): Promise<ProvidersResponse> {
    return apiRequest<ProvidersResponse>('/providers');
  },
};
