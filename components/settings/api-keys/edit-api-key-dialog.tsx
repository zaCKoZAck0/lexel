"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, Pencil, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiKeysService, ApiRequestError } from '@/lib/api/keys'
import { ApiKey, UpdateApiKeyInput, apiKeyQueryKeys } from '@/lib/types/api-keys'
import { toast } from 'sonner'
import { AI_PROVIDERS, getProviderInfo, validateProviderKey } from '@/lib/providers'

interface EditApiKeyDialogProps {
    apiKey: ApiKey
    disabled?: boolean
}

export function EditApiKeyDialog({ apiKey, disabled = false }: EditApiKeyDialogProps) {
    const [open, setOpen] = useState(false)
    const [provider, setProvider] = useState(apiKey.provider)
    const [keyValue, setKeyValue] = useState(apiKey.key)
    const queryClient = useQueryClient()
    const [showKey, setShowKey] = useState(false)


    const updateMutation = useMutation({
        mutationFn: (data: UpdateApiKeyInput) => apiKeysService.update(apiKey.id, data),
        onMutate: async (data) => {
            await queryClient.cancelQueries({ queryKey: apiKeyQueryKeys.all })
            const previous = queryClient.getQueryData<ApiKey[]>(apiKeyQueryKeys.all)
            if (previous) {
                queryClient.setQueryData<ApiKey[]>(apiKeyQueryKeys.all, previous.map(k => {
                    if (k.id !== apiKey.id) {
                        // If making this default, unset others of same provider (optimistic)
                        // Default flag no longer editable via this form
                        return k
                    }
                    return { ...k, provider: data.provider ?? k.provider, key: data.key ?? k.key, updatedAt: new Date() as any }
                }))
            }
            return { previous }
        },
        onError: (error, _vars, ctx) => {
            if (ctx?.previous) queryClient.setQueryData(apiKeyQueryKeys.all, ctx.previous)
            const msg = error instanceof ApiRequestError ? (error.body?.message || error.statusText) : 'Failed to update API key'
            toast.error(msg)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.all })
            toast.success('Updated — changes applied')
        },
        onSettled: () => {
            setOpen(false)
        }
    })

    const isPatternValid = provider && keyValue
        ? validateProviderKey(provider as any, keyValue)
        : true // if no change yet, allow

    const handleSave = () => {
        if (!keyValue.trim()) return
        if (!isPatternValid) return
        const payload: UpdateApiKeyInput = {
            key: keyValue.trim() !== apiKey.key ? keyValue.trim() : undefined,
            provider: provider !== apiKey.provider ? provider : undefined,
        }
        if (!payload.key && !payload.provider) {
            // Nothing changed
            setOpen(false)
            return
        }
        updateMutation.mutate(payload)
    }

    const selectedProviderInfo = getProviderInfo(provider)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={disabled} aria-label="Edit API key">
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Edit key</TooltipContent>
            </Tooltip>
            <DialogContent className="sm:max-w-md space-y-5">
                <DialogHeader>
                    <DialogTitle>Edit API Key</DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed">Update the key value or move it to another provider.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="provider">Provider</Label>
                        <Select value={provider} onValueChange={setProvider}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {AI_PROVIDERS.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                        <div className="flex items-center gap-2">
                                            <p.Icon className="h-4 w-4" />
                                            <span>{p.name}</span>
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
                        <Label htmlFor="api-key-edit">API Key</Label>
                        <div className="flex items-center gap-2">
                            <Input id="api-key-edit" type={showKey ? 'text' : 'password'} value={keyValue} onChange={e => setKeyValue(e.target.value)} className="flex-1" />
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowKey(s => !s)} aria-label={showKey ? 'Hide key' : 'Show key'}>
                                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{showKey ? 'Hide key' : 'Show key'}</TooltipContent>
                            </Tooltip>
                        </div>
                        {keyValue && !isPatternValid && (
                            <p className="text-xs text-destructive">Key doesn't match expected pattern for provider.</p>
                        )}
                    </div>
                    {/* Removed default toggle from edit dialog */}
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={updateMutation.isPending}>Cancel</Button>
                    <Button onClick={handleSave} disabled={updateMutation.isPending || !provider || !keyValue.trim() || !isPatternValid}>
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
