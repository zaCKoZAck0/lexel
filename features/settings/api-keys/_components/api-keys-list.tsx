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
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Key, Eye, EyeOff, Loader2, Star, Trash2 } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useState, useEffect, Fragment } from 'react';
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

  return (
    <div className="rounded-lg border bg-card">
      <Table containerClassName="p-0 rounded-none bg-transparent">
        <TableBody>
          {Object.entries(
            keys.reduce(
              (acc, key) => {
                (acc[key.provider] ||= []).push(key);
                return acc;
              },
              {} as Record<string, ApiKey[]>,
            ),
          ).map(([providerId, providerKeys], idx) => {
            const providerInfo = getProviderInfo(providerId);
            const Icon = providerInfo?.Icon;
            return (
              <Fragment key={providerId}>
                <TableRow
                  className={
                    idx > 0
                      ? 'border-0 border-t hover:bg-transparent'
                      : 'border-0 hover:bg-transparent'
                  }
                >
                  <TableCell colSpan={2} className="pt-4 pl-4">
                    <div className="flex items-center gap-3">
                      {Icon ? (
                        <Icon className="h-5 w-5" />
                      ) : (
                        <div className="h-5 w-5 rounded bg-muted" />
                      )}
                      <span className="font-medium">
                        {providerInfo?.name ?? providerId}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {providerKeys.length} key
                        {providerKeys.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
                {providerKeys.map(k => (
                  <ApiKeyRow key={k.id} apiKey={k} />
                ))}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
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

// Provider card removed in favor of a compact table layout

interface ApiKeyRowProps {
  apiKey: ApiKey;
}

function ApiKeyRow({ apiKey }: ApiKeyRowProps) {
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
    <TableRow className="border-0 hover:bg-transparent">
      <TableCell className="w-full max-w-[520px]">
        <div className="flex items-center gap-2 min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={isMutating}
                variant="ghost"
                size="icon"
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
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleCopy}
                disabled={isMutating}
                aria-label="Copy API key"
                className={`text-left font-mono text-xs bg-muted hover:bg-muted/80 transition-colors px-2 py-1 rounded whitespace-nowrap overflow-hidden text-ellipsis max-w-full sm:max-w-[420px] relative focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${copied ? 'ring-2 ring-ring' : ''}`}
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
        <div className="mt-2 flex items-center justify-between md:hidden">
          <span className="text-sm text-muted-foreground">
            {(() => {
              const createdAt = new Date(apiKey.createdAt);
              return `Added ${formatDistanceToNow(createdAt, { addSuffix: true })}`;
            })()}
          </span>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() =>
                      !apiKey.default && setDefaultMutation.mutate(apiKey.id)
                    }
                    disabled={
                      apiKey.default ||
                      setDefaultMutation.isPending ||
                      isMutating
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
                        <Star
                          className={
                            'h-4 w-4 mr-2 ' +
                            (apiKey.default ? 'fill-current' : '')
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <EditApiKeyDialog
                  apiKey={apiKey}
                  disabled={isMutating}
                  trigger={
                    // prevent default so the menu doesn't steal focus before dialog opens
                    <DropdownMenuItem onSelect={e => e.preventDefault()}>
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
                          <span className="block mt-2 font-medium text-orange-600">
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
                        ) : null}
                        Delete Key
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right hidden md:table-cell">
        <div className="flex items-center gap-3 justify-end">
          {(() => {
            const createdAt = new Date(apiKey.createdAt);
            return (
              <span className="text-sm text-muted-foreground">
                {`Added ${formatDistanceToNow(createdAt, { addSuffix: true })}`}
              </span>
            );
          })()}
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="ghost"
                  size="xs"
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
                      <Star
                        className={
                          'h-4 w-4 mr-2 ' +
                          (apiKey.default ? 'fill-current' : '')
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <EditApiKeyDialog
                apiKey={apiKey}
                disabled={isMutating}
                trigger={
                  // prevent default so the menu doesn't steal focus before dialog opens
                  <DropdownMenuItem onSelect={e => e.preventDefault()}>
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
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this API key? This action
                      cannot be undone.
                      {apiKey.default && (
                        <span className="block mt-2 font-medium text-orange-600">
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
                      ) : null}
                      Delete Key
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
