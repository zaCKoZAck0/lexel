'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Copy, MoreVerticalIcon } from 'lucide-react';
import { Key, Eye, EyeOff, Loader2, Star, Trash2, Edit3 } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useState, useEffect } from 'react';
import { ApiKey, apiKeyQueryKeys } from '@/lib/types/api-keys';
import { getProviderInfo } from '@/lib/models/providers';
import {
  useMutation,
  useQueryClient,
  useIsMutating,
} from '@tanstack/react-query';
import { apiKeysService } from '@/lib/api/client/keys';
import { toast } from 'sonner';
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
    <div className="space-y-6">
      {Object.entries(groupedKeys).map(([providerId, providerKeys]) => {
        const providerInfo = getProviderInfo(providerId);
        const Icon = providerInfo?.Icon;

        return (
          <div key={providerId} className="group">
            {/* Provider Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {Icon ? (
                  <Icon className="h-5 w-5 text-foreground" />
                ) : (
                  <div className="h-5 w-5 rounded bg-muted" />
                )}
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">
                    {providerInfo?.name ?? providerId}
                  </h3>
                </div>
              </div>
              <Badge variant="outline" className="px-2 py-0.5 text-xs">
                {providerKeys.length} key
                {providerKeys.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Keys List */}
            <div className="space-y-2">
              {providerKeys.map(apiKey => (
                <ApiKeyCard key={apiKey.id} apiKey={apiKey} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardHeader className="text-center pb-2">
        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
          <Key className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardTitle className="text-base">No API Keys</CardTitle>
        <CardDescription className="text-sm">
          Add your first key to get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pt-0">
        <AddApiKeyDialog disabled={false} />
      </CardContent>
    </Card>
  );
}

interface ApiKeyCardProps {
  apiKey: ApiKey;
}

function ApiKeyCard({ apiKey }: ApiKeyCardProps) {
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

  const createdAt = new Date(apiKey.createdAt);

  return (
    <Card className="group p-2">
      <CardContent className="px-2">
        {/* Key Name */}
        {apiKey.name && (
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-semibold text-lg text-foreground font-serif max-w-[50%]">
              {apiKey.name}
            </h4>
            {/* Metadata */}
            <div className="flex items-center justify-between text-sm text-muted-foreground gap-2">
              <span>
                Added {formatDistanceToNow(createdAt, { addSuffix: true })}
              </span>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label="More actions"
                  >
                    <MoreVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <EditApiKeyDialog
                    apiKey={apiKey}
                    disabled={isMutating}
                    trigger={
                      <DropdownMenuItem onSelect={e => e.preventDefault()}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={e => e.preventDefault()}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this API key? This
                          action cannot be undone.
                          {apiKey.default && (
                            <span className="block mt-2 font-medium text-muted-foreground">
                              This is your default key.
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
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete Key
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {/* Key Display Area */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={isMutating}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKey(v => !v)}
                    className="shrink-0 h-8 w-8 p-0"
                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
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

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={isMutating}
                    aria-label="Copy API key"
                    className="flex-1 text-left font-mono text-sm bg-muted hover:bg-muted/80 transition-colors px-3 py-1 rounded-md border min-w-0 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  >
                    <div className="truncate">
                      {showKey ? apiKey.key : masked}
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {copied ? 'Copied!' : 'Click to copy'}
                </TooltipContent>
              </Tooltip>

              {/* Default Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      !apiKey.default && setDefaultMutation.mutate(apiKey.id)
                    }
                    disabled={
                      apiKey.default ||
                      setDefaultMutation.isPending ||
                      isMutating
                    }
                    className="h-8 text-xs"
                  >
                    {setDefaultMutation.isPending &&
                    setDefaultMutation.variables === apiKey.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Star
                        className={`h-3 w-3 mr-1 ${apiKey.default ? 'fill-current' : ''}`}
                      />
                    )}
                    Default
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {apiKey.default
                    ? 'This is the default key'
                    : 'Set as default'}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
