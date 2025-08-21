import { useQuery } from '@tanstack/react-query';
import { apiKeysService } from '@/lib/api/client/keys';
import { apiKeyQueryKeys, ApiKey } from '@/lib/types/api-keys';
import { ApiRequestError } from '@/lib/api/client';

export function getAllApiKeysQuery() {
  const query = useQuery<ApiKey[], ApiRequestError>({
    queryKey: apiKeyQueryKeys.all,
    queryFn: () => apiKeysService.getAll().then(r => r.data),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, err) => {
      if ([401, 403].includes(err.status)) return false;
      return failureCount < 3;
    },
  });
  return { ...query, keys: query.data };
}
