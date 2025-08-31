import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiKeysService } from '@/lib/api/client/keys';
import {
  apiKeyQueryKeys,
  ApiKey,
  CreateApiKeyInput,
  UpdateApiKeyInput,
} from '@/lib/types/api-keys';
import { ApiRequestError } from '@/lib/api/client';

export function useCreateApiKeyMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    { key: ApiKey; plainApiKey: string },
    ApiRequestError,
    CreateApiKeyInput
  >({
    mutationFn: (data: CreateApiKeyInput) =>
      apiKeysService
        .create(data)
        .then(r => ({ key: r.data, plainApiKey: r.data.key })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.all });
      toast.success('API key created successfully');
    },
    onError: error => {
      toast.error(error.message || 'Failed to create API key');
    },
  });
}

export function useUpdateApiKeyMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiKey,
    ApiRequestError,
    UpdateApiKeyInput & { id: string }
  >({
    mutationFn: ({ id, ...data }: UpdateApiKeyInput & { id: string }) =>
      apiKeysService.update(id, data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.all });
      toast.success('API key updated successfully');
    },
    onError: error => {
      toast.error(error.message || 'Failed to update API key');
    },
  });
}

export function useDeleteApiKeyMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    ApiRequestError,
    string,
    { previousKeys?: ApiKey[] }
  >({
    mutationFn: (id: string) => apiKeysService.delete(id).then(() => undefined),
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: apiKeyQueryKeys.all });

      const previousKeys = queryClient.getQueryData<ApiKey[]>(
        apiKeyQueryKeys.all,
      );

      queryClient.setQueryData<ApiKey[]>(
        apiKeyQueryKeys.all,
        old => old?.filter(key => key.id !== id) ?? [],
      );

      return { previousKeys };
    },
    onSuccess: () => {
      toast.success('API key deleted successfully');
    },
    onError: (error, _vars, context) => {
      if (context?.previousKeys) {
        queryClient.setQueryData(apiKeyQueryKeys.all, context.previousKeys);
      }
      toast.error(error.message || 'Failed to delete API key');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.all });
    },
  });
}

export function useSetDefaultApiKeyMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiKey,
    ApiRequestError,
    string,
    { previousKeys?: ApiKey[] }
  >({
    // setDefault endpoint returns ApiResponse<{ message }>, so map to void
    mutationFn: (id: string) =>
      apiKeysService.setDefault(id).then(() => undefined as unknown as ApiKey),
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: apiKeyQueryKeys.all });

      const previousKeys = queryClient.getQueryData<ApiKey[]>(
        apiKeyQueryKeys.all,
      );

      queryClient.setQueryData<ApiKey[]>(
        apiKeyQueryKeys.all,
        old =>
          old?.map(key => ({
            ...key,
            default: key.id === id,
          })) ?? [],
      );

      return { previousKeys };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.defaults() });
      toast.success('Default API key updated');
    },
    onError: (error, _vars, context) => {
      if (context?.previousKeys) {
        queryClient.setQueryData(apiKeyQueryKeys.all, context.previousKeys);
      }
      toast.error(error.message || 'Failed to set default API key');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.all });
    },
  });
}
