"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { settingsNavItems } from "./nav-items"

export function SettingsSidebar() {
    const pathname = usePathname()
    // path like /settings/models or /settings/models/extra -> take first segment after /settings
    const activeTab = (() => {
        if (!pathname) return "account"
        const parts = pathname.split("/").filter(Boolean)
        const settingsIndex = parts.indexOf("settings")
        const tab = settingsIndex >= 0 ? parts[settingsIndex + 1] : undefined
        return tab || "account"
    })()

    return (
        <div className="w-64 border-r bg-muted/30 hidden md:block">
            <ScrollArea className="h-full py-6">
                <div className="px-4 space-y-6">
                    <div>
                        <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Settings
                        </h3>
                        <div className="space-y-1">
                            {settingsNavItems.map((item) => {
                                const isActive = activeTab === item.id
                                return (
                                    <Button
                                        key={item.id}
                                        variant={isActive ? "secondary" : "ghost"}
                                        className={cn(
                                            "w-full justify-start h-auto p-3",
                                            isActive && "bg-secondary"
                                        )}
                                        asChild
                                    >
                                        <Link href={`/settings/${item.id}`}>
                                            <item.icon className="h-4 w-4 mr-3" />
                                            <div className="text-left">
                                                <div className="font-medium">{item.label}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.description}
                                                </div>
                                            </div>
                                        </Link>
                                    </Button>
                                )
                            })}
                        </div>
                    </div>
                    <Separator />
                </div>
            </ScrollArea>
        </div>
    )
}
