import { useMemo, useState } from 'react';
import { Model } from '@/lib/models';

export function useModelFiltering(models: Model[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModels = useMemo(() => {
    if (!searchQuery) return models;
    return models.filter(
      model =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [models, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredModels,
  };
}
