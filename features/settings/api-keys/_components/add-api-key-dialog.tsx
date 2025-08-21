'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Loader2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeysService } from '@/lib/api/client/keys';
import {
  CreateApiKeyInput,
  ApiKey,
  apiKeyQueryKeys,
} from '@/lib/types/api-keys';
import { toast } from 'sonner';
import {
  AI_PROVIDERS,
  getProviderInfo,
  validateProviderKey,
} from '@/lib/models/providers';
import { ApiRequestError } from '@/lib/api/client';

export function AddApiKeyDialog({ disabled = false }: { disabled?: boolean }) {
  const [newKeyValue, setNewKeyValue] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const queryClient = useQueryClient();
  const [showKey, setShowKey] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: CreateApiKeyInput) => apiKeysService.create(data),
    onMutate: async newKey => {
      await queryClient.cancelQueries({ queryKey: apiKeyQueryKeys.all });
      const previousKeys = queryClient.getQueryData<ApiKey[]>(
        apiKeyQueryKeys.all,
      );
      if (previousKeys) {
        const optimisticKey: ApiKey = {
          id: `temp-${Date.now()}`,
          provider: newKey.provider,
          key: newKey.key,
          userId: 'current-user',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as ApiKey;
        queryClient.setQueryData(apiKeyQueryKeys.all, [
          ...previousKeys,
          optimisticKey,
        ]);
      }
      return { previousKeys };
    },
    onError: (error, _vars, ctx) => {
      if (ctx?.previousKeys) {
        queryClient.setQueryData(apiKeyQueryKeys.all, ctx.previousKeys);
      }
      const msg =
        error instanceof ApiRequestError
          ? (error.body as { message?: string })?.message || error.statusText
          : 'Failed to create API key';
      toast.error(msg);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.all });
      toast.success('Added — ready to use');
    },
  });

  const isPatternValid =
    selectedProvider && newKeyValue
      ? validateProviderKey(selectedProvider as any, newKeyValue)
      : false;

  const handleCreateKey = async () => {
    if (!newKeyValue.trim() || !selectedProvider) return;
    if (!isPatternValid) return;

    const keyData: CreateApiKeyInput = {
      provider: selectedProvider,
      key: newKeyValue.trim(),
      default: false,
    };

    try {
      await createMutation.mutateAsync(keyData);
      setNewKeyValue('');
      setSelectedProvider('');
      setShowAddDialog(false);
    } catch {}
  };

  const selectedProviderInfo = selectedProvider
    ? getProviderInfo(selectedProvider)
    : null;

  return (
    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Plus className="h-4 w-4 mr-2" />
          Add API Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md space-y-5">
        <DialogHeader>
          <DialogTitle>Add New API Key</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed max-w-prose">
            Add an API key for your preferred AI provider. Stored encrypted &
            only used server-side.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={selectedProvider}
              onValueChange={setSelectedProvider}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select AI provider" />
              </SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS.map(provider => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex items-center gap-2">
                      <provider.Icon className="h-4 w-4" />
                      <span>{provider.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProviderInfo && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground">
                <span>Format: {selectedProviderInfo.keyFormat}</span>
                {selectedProviderInfo.keyPortal && (
                  <a
                    href={selectedProviderInfo.keyPortal}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${selectedProviderInfo.name} API key portal`}
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <span>Get API key</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex items-center gap-2">
              <Input
                id="api-key"
                placeholder="Enter your API key"
                type={showKey ? 'text' : 'password'}
                value={newKeyValue}
                onChange={e => setNewKeyValue(e.target.value)}
                className="flex-1"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKey(s => !s)}
                    aria-label={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showKey ? 'Hide key' : 'Show key'}
                </TooltipContent>
              </Tooltip>
            </div>
            {newKeyValue && selectedProvider && !isPatternValid && (
              <p className="text-xs text-destructive">
                Key doesn't match expected pattern for provider.
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAddDialog(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateKey}
            disabled={
              createMutation.isPending ||
              !selectedProvider ||
              !newKeyValue.trim() ||
              !isPatternValid
            }
          >
            {createMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Add Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
