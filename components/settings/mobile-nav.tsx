"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { settingsNavItems } from "./nav-items"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"

export function MobileSettingsNav() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    // Close when route changes
    useEffect(() => { setOpen(false) }, [pathname])
    0
    const activeTab = (() => {
        if (!pathname) return "account"
        const parts = pathname.split("/").filter(Boolean)
        const settingsIndex = parts.indexOf("settings")
        const tab = settingsIndex >= 0 ? parts[settingsIndex + 1] : undefined
        return tab || "account"
    })()

    return (
        <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                        <Menu className="h-4 w-4" />
                        Settings
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                    <div className="p-4 border-b">
                        <SheetTitle className="text-base">Settings</SheetTitle>
                    </div>
                    <nav className="p-2 space-y-1 overflow-y-auto">
                        {settingsNavItems.map(item => {
                            const isActive = activeTab === item.id
                            const Icon = item.icon
                            return (
                                <Button
                                    key={item.id}
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn("w-full justify-start h-auto px-3 py-3", isActive && "bg-secondary")}
                                    asChild
                                >
                                    <Link href={`/settings/${item.id}`} className="flex gap-3">
                                        <Icon className="h-4 w-4 mt-0.5" />
                                        <span className="flex flex-col text-left">
                                            <span className="font-medium leading-none">{item.label}</span>
                                            <span className="text-xs text-muted-foreground leading-tight mt-1 line-clamp-2">{item.description}</span>
                                        </span>
                                    </Link>
                                </Button>
                            )
                        })}
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    )
}
