import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Home, Settings } from "lucide-react"

export default function SettingsNotFound() {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Card className="w-full max-w-md">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <Settings className="h-16 w-16 text-muted-foreground" />
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">Settings Page Not Found</h1>
                        <p className="text-muted-foreground">
                            The settings page you're looking for doesn't exist.
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button asChild variant="outline">
                            <Link href="/">
                                <Home className="h-4 w-4 mr-2" />
                                Home
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/settings/account">
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
