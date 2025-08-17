"use client"

import { useState, useMemo } from "react"
import { AddApiKeyDialog } from "./add-api-key-dialog"
import { ApiKeysList } from "./list"
import { apiKeysQuery } from "./query"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function ApiKeys() {
    const { keys, isLoading, error, refetch } = apiKeysQuery()
    const [query, setQuery] = useState("")

    // Stable default ordering so order doesn't jump after mutations (sort by id asc)
    const sortedKeys = useMemo(() => {
        if (!keys) return []
        // create a shallow copy to avoid mutating react-query cache
        return [...keys].sort((a, b) => a.id.localeCompare(b.id))
    }, [keys])

    // Apply search filter on the stable sorted list
    const filtered = useMemo(() => {
        if (!sortedKeys.length) return []
        const q = query.trim().toLowerCase()
        if (!q) return sortedKeys
        return sortedKeys.filter(k => {
            const provider = k.provider.toLowerCase()
            const keyPart = k.key.toLowerCase()
            return provider.includes(q) || keyPart.includes(q)
        })
    }, [sortedKeys, query])

    const totalKeys = keys?.length || 0
    const totalProviders = useMemo(() => new Set((keys || []).map(k => k.provider)).size, [keys])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading API keys...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <p className="text-destructive mb-4">Failed to load API keys</p>
                <Button onClick={() => refetch()}>Retry</Button>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-4 space-y-4">
                <div className="space-y-1">
                    <CardTitle className="text-xl">API Keys</CardTitle>
                    <CardDescription>Securely store and manage your AI provider keys (256-bit encryption).</CardDescription>
                </div>
                <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center">
                    <div className="w-full">
                        <Input
                            placeholder="Search keys..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full"
                            aria-label="Search API keys"
                        />
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => refetch()}
                                    disabled={isLoading}
                                    aria-label="Refresh keys"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Refresh</TooltipContent>
                        </Tooltip>
                        <AddApiKeyDialog />
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs font-normal">{totalKeys} {totalKeys === 1 ? "Key" : "Keys"}</Badge>
                    <Badge variant="outline" className="text-xs font-normal">{totalProviders} {totalProviders === 1 ? "Provider" : "Providers"}</Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
                <ApiKeysList keys={filtered} />
                {filtered.length === 0 && keys && keys.length > 0 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">No keys match "{query}"</p>
                )}
            </CardContent>
        </Card>
    )
}
