import { useQuery } from '@tanstack/react-query';
import { preferencesApi } from '@/lib/api/client/preferences';
import { providersApi } from '@/lib/api/client/providers';
import type { UserPreferences } from '@/lib/types/user-preferences';

export const preferencesQueryKeys = {
  root: ['preferences'] as const,
};

export const providersQueryKeys = {
  root: ['providers'] as const,
};

export function useUserPreferencesQuery() {
  const query = useQuery<UserPreferences | null, Error>({
    queryKey: preferencesQueryKeys.root,
    queryFn: () => preferencesApi.get().then(r => r.data),
    staleTime: 5 * 60 * 1000,
    retry: failureCount => failureCount < 3,
  });
  return { ...query, preferences: query.data };
}

export function useAvailableProvidersQuery() {
  const query = useQuery<string[], Error>({
    queryKey: providersQueryKeys.root,
    queryFn: () => providersApi.getAvailable().then(r => r.data),
    staleTime: 5 * 60 * 1000,
    retry: failureCount => failureCount < 3,
  });
  return { ...query, availableProviders: query.data ?? [] };
}
