import { Skeleton } from "@/components/ui/skeleton"

// Skeleton for the content area while switching settings tabs.
export default function SettingsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-80" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ))}
            </div>
        </div>
    )
}
