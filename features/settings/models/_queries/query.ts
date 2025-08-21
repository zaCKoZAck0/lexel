import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesApi } from '@/lib/api/client/preferences';
import { providersApi } from '@/lib/api/client/providers';
import type { UserPreferences } from '@/lib/types/user-preferences';
import { toast } from 'sonner';

export const preferencesQueryKeys = {
  root: ['preferences'] as const,
};

export const providersQueryKeys = {
  root: ['providers'] as const,
};

export function getUserPreferencesQuery() {
  const query = useQuery<UserPreferences | null, Error>({
    queryKey: preferencesQueryKeys.root,
    queryFn: () => preferencesApi.get().then(r => r.data),
    staleTime: 5 * 60 * 1000,
    retry: failureCount => failureCount < 3,
  });
  return { ...query, preferences: query.data };
}

export function useUpdatePreferencesMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    UserPreferences,
    Error,
    Partial<UserPreferences>,
    { previous: UserPreferences | null }
  >({
    mutationFn: (payload: Partial<UserPreferences>) =>
      preferencesApi.update(payload).then(r => r.data),
    onMutate: payload => {
      const previous =
        queryClient.getQueryData<UserPreferences | null>(
          preferencesQueryKeys.root,
        ) ?? null;

      // Build optimistic state immediately to avoid flicker
      const optimistic: UserPreferences = {
        ...(previous ?? { favoriteModels: [] }),
        ...(payload || {}),
        favoriteModels:
          payload.favoriteModels ?? previous?.favoriteModels ?? [],
      };

      queryClient.setQueryData(preferencesQueryKeys.root, optimistic);
      // Cancel any in-flight queries without awaiting to keep UI snappy
      queryClient.cancelQueries({ queryKey: preferencesQueryKeys.root });
      return { previous };
    },
    onError: (_err, _payload, ctx) => {
      if (ctx && 'previous' in ctx) {
        queryClient.setQueryData(preferencesQueryKeys.root, ctx.previous);
      }
      toast.error('Failed to save model preferences');
    },
    onSuccess: data => {
      // Ensure cache reflects server truth
      queryClient.setQueryData(preferencesQueryKeys.root, data);
      toast.success('Favorites updated — selector refreshed');
    },
    onSettled: () => {
      // Revalidate to sync with server if anything changed externally
      queryClient.invalidateQueries({ queryKey: preferencesQueryKeys.root });
    },
  });
}

export function availableProvidersQuery() {
  const query = useQuery<string[], Error>({
    queryKey: providersQueryKeys.root,
    queryFn: () => providersApi.getAvailable().then(r => r.data),
    staleTime: 5 * 60 * 1000,
    retry: failureCount => failureCount < 3,
  });
  return { ...query, availableProviders: query.data ?? [] };
}
