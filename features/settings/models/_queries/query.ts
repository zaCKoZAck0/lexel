import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesApi } from '@/lib/api/client/preferences';
import { providersApi } from '@/lib/api/client/providers';
import type { UserPreferences } from '@/lib/types/user-preferences';
import { toast } from 'sonner';
import { useMemo, useRef } from 'react';

export const preferencesQueryKeys = {
  root: ['preferences'] as const,
};

export const providersQueryKeys = {
  root: ['providers'] as const,
};

/**
 * Custom debounce utility for React Query mutations
 * Following best practices from React Query documentation
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): T {
  let timeoutId: NodeJS.Timeout | null = null;

  return ((...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  }) as T;
}

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

  const mutation = useMutation<
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

  // Store the original mutate function in a ref to ensure stability
  const mutateRef = useRef(mutation.mutate);

  // Update the ref when mutation.mutate changes
  mutateRef.current = mutation.mutate;

  // Create a debounced version of the mutate function (300ms delay)
  const debouncedMutate = useMemo(
    () =>
      debounce((variables: Partial<UserPreferences>) => {
        mutateRef.current(variables);
      }, 300),
    [],
  );

  return {
    ...mutation,
    debouncedMutate,
    // Also provide the original mutate for immediate actions if needed
    mutate: mutation.mutate,
  };
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
