'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
// Removed Badge (default badge no longer needed)
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Key,
  Eye,
  EyeOff,
  Loader2,
  Star,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useState, useEffect } from 'react';
import { ApiKey, apiKeyQueryKeys } from '@/lib/types/api-keys';
import { getProviderInfo } from '@/lib/models/providers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeysService } from '@/lib/api/client/keys';
import { toast } from 'sonner';
import { useIsMutating } from '@tanstack/react-query';
import { AddApiKeyDialog } from './add-api-key-dialog';
import { EditApiKeyDialog } from './edit-api-key-dialog';
import { formatDistanceToNow } from 'date-fns';
import { ApiRequestError } from '@/lib/api/client';

interface ApiKeysListProps {
  keys: ApiKey[];
}

export function ApiKeysList({ keys }: ApiKeysListProps) {
  if (!keys.length) return <EmptyState />;

  const groupedKeys = keys.reduce(
    (acc, key) => {
      (acc[key.provider] ||= []).push(key);
      return acc;
    },
    {} as Record<string, ApiKey[]>,
  );

  return (
    // 24px vertical rhythm between provider sections (8pt * 3)
    <div className="space-y-6">
      {Object.entries(groupedKeys).map(([providerId, providerKeys]) => (
        <ProviderCard
          key={providerId}
          providerId={providerId}
          keys={providerKeys}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardHeader className="text-center pb-2">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle>No API Keys</CardTitle>
        <CardDescription>
          Add your first API key to start using AI models in your projects.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pt-0">
        <AddApiKeyDialog disabled={false} />
      </CardContent>
    </Card>
  );
}

interface ProviderCardProps {
  providerId: string;
  keys: ApiKey[];
}

function ProviderCard({ providerId, keys }: ProviderCardProps) {
  const providerInfo = getProviderInfo(providerId);
  const Icon = providerInfo?.Icon;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          {/* 16px gap keeps icon + text grouping tight while distinct from 24px card spacing */}
          <div className="flex items-center gap-4">
            <div className="text-2xl">
              {Icon && <Icon className="size-8" />}
            </div>
            <div>
              <CardTitle className="text-lg">{providerInfo?.name}</CardTitle>
              <CardDescription>
                {keys.length} key{keys.length !== 1 ? 's' : ''} configured
              </CardDescription>
            </div>
          </div>
          {providerInfo?.keyPortal && (
            <Button asChild variant="link" size="sm" className="h-auto px-1">
              <a
                href={providerInfo.keyPortal}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${providerInfo.name} API key portal`}
                className="inline-flex items-center gap-1"
              >
                <span>Manage Keys</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {keys.map(key => (
            <ApiKeyRow
              key={key.id}
              apiKey={key}
              providerName={providerInfo?.name}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ApiKeyRowProps {
  apiKey: ApiKey;
  providerName?: string;
}

function ApiKeyRow({ apiKey, providerName }: ApiKeyRowProps) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiKeysService.delete(id),
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: apiKeyQueryKeys.all });
      const previousKeys = queryClient.getQueryData<ApiKey[]>(
        apiKeyQueryKeys.all,
      );
      if (previousKeys) {
        queryClient.setQueryData(
          apiKeyQueryKeys.all,
          previousKeys.filter(k => k.id !== id),
        );
      }
      return { previousKeys };
    },
    onError: (error, _id, ctx) => {
      if (ctx?.previousKeys)
        queryClient.setQueryData(apiKeyQueryKeys.all, ctx.previousKeys);
      const msg =
        error instanceof ApiRequestError
          ? (error.body as { message?: string })?.message || error.statusText
          : 'Failed to delete API key';
      toast.error(msg);
    },
    onSuccess: () => {
      toast.success('Deleted — key gone');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => apiKeysService.setDefault(id),
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: apiKeyQueryKeys.all });
      const previousKeys = queryClient.getQueryData<ApiKey[]>(
        apiKeyQueryKeys.all,
      );
      if (previousKeys) {
        queryClient.setQueryData(
          apiKeyQueryKeys.all,
          previousKeys.map(k => ({
            ...k,
            default: k.id === id,
            updatedAt: new Date(),
          })),
        );
      }
      return { previousKeys };
    },
    onError: (error, _id, ctx) => {
      if (ctx?.previousKeys)
        queryClient.setQueryData(apiKeyQueryKeys.all, ctx.previousKeys);
      const msg =
        error instanceof ApiRequestError
          ? (error.body as { message?: string })?.message || error.statusText
          : 'Failed to set default API key';
      toast.error(msg);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.all });
      toast.success('Default changed — future calls use this key');
    },
  });

  const isMutating = useIsMutating() > 0;

  const masked = `${apiKey.key.substring(0, 8)}${'*'.repeat(20)}`;

  // Reset copied state after short delay
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(apiKey.key)
      .then(() => {
        setCopied(true);
        toast.success('Done — key copied');
      })
      .catch(() => toast.error('Failed to copy key'));
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg">
      {/* Increase internal vertical stack from 4px to 8px for consistent 8pt rhythm */}
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={isMutating}
                variant="ghost"
                size="sm"
                onClick={() => setShowKey(v => !v)}
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{showKey ? 'Hide key' : 'Show key'}</TooltipContent>
          </Tooltip>
          {/* Click-to-copy button styled like code chip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleCopy}
                disabled={isMutating}
                aria-label="Copy API key"
                className={`text-left font-mono text-sm bg-muted hover:bg-muted/80 transition-colors px-2 py-1 rounded break-all max-w-full relative focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${copied ? 'ring-2 ring-ring' : ''}`}
              >
                {showKey ? apiKey.key : masked}
                <span className="absolute inset-0" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {copied ? 'Copied!' : 'Click to copy'}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {(() => {
            const createdAt = new Date(apiKey.createdAt);
            const updatedAt = new Date(apiKey.updatedAt);
            // Consider it "updated" if timestamps differ by more than 1 minute
            const isUpdated =
              Math.abs(updatedAt.getTime() - createdAt.getTime()) > 60_000;
            const refTime = isUpdated ? updatedAt : createdAt;
            return (
              <span>
                {isUpdated ? 'Updated' : 'Added'}{' '}
                {formatDistanceToNow(refTime, { addSuffix: true })}
              </span>
            );
          })()}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant={apiKey.default ? 'secondary' : 'outline'}
                size="sm"
                onClick={() =>
                  !apiKey.default && setDefaultMutation.mutate(apiKey.id)
                }
                disabled={
                  apiKey.default || setDefaultMutation.isPending || isMutating
                }
                aria-label={
                  apiKey.default
                    ? 'Current default key'
                    : 'Make this key default'
                }
              >
                {setDefaultMutation.isPending &&
                setDefaultMutation.variables === apiKey.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {/* Increase icon/text separation to 8px to align with spacing scale */}
                    <Star
                      className={
                        'h-4 w-4 mr-2 ' + (apiKey.default ? 'fill-current' : '')
                      }
                    />
                    Default
                  </>
                )}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {apiKey.default ? 'This is the default key' : 'Set as default'}
          </TooltipContent>
        </Tooltip>
        <EditApiKeyDialog apiKey={apiKey} disabled={isMutating} />
        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={isMutating}
                  variant="outline"
                  size="sm"
                  aria-label="Delete API key"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Delete key</TooltipContent>
          </Tooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete API Key</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this API key? This action cannot
                be undone.
                {apiKey.default && (
                  <span className="block mt-2 font-medium text-orange-600">
                    This is your default key for {providerName}.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(apiKey.id)}
                disabled={deleteMutation.isPending || isMutating}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending &&
                deleteMutation.variables === apiKey.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Delete Key
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
