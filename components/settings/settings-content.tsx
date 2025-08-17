"use client"

import { User } from "next-auth"
import { AccountSettings } from "@/components/settings/account-settings"
import { ApiKeys } from "@/components/settings/api-keys"
import { Card, CardContent } from "@/components/ui/card"

interface SettingsContentProps {
    activeTab: string
    user: User
}

export function SettingsContent({ activeTab, user }: SettingsContentProps) {
    // Mock API keys data - in real app this would come from props or API
    const apiKeys = [
        {
            id: 1,
            name: "Production OpenAI",
            provider: 'openai',
            key: "sk-proj-*********************",
            created: "2024-01-15",
            lastUsed: "2 hours ago",
            status: "active" as const,
            isPrimary: true,
            modelsEnabled: ['GPT-4', 'GPT-3.5 Turbo']
        },
        {
            id: 2,
            name: "Development OpenAI",
            provider: 'openai',
            key: "sk-proj-*********************",
            created: "2024-01-10",
            lastUsed: "Yesterday",
            status: "active" as const,
            isPrimary: false,
            modelsEnabled: ['GPT-3.5 Turbo']
        },
        {
            id: 3,
            name: "Claude Production",
            provider: 'anthropic',
            key: "sk-ant-*********************",
            created: "2024-01-05",
            lastUsed: "1 week ago",
            status: "active" as const,
            isPrimary: true,
            modelsEnabled: ['Claude 3.5 Sonnet', 'Claude 3 Haiku']
        },
        {
            id: 4,
            name: "Gemini Testing",
            provider: 'google',
            key: "AIza*********************",
            created: "2024-01-20",
            lastUsed: "3 days ago",
            status: "active" as const,
            isPrimary: true,
            modelsEnabled: ['Gemini 1.5 Pro']
        }
    ]

    const renderContent = () => {
        switch (activeTab) {
            case "account":
                return <AccountSettings user={user} />
            case "api-keys":
                return <ApiKeys />
            default:
                return (
                    <Card>
                        <CardContent className="flex items-center justify-center h-96">
                            <div className="text-center space-y-2">
                                <h3 className="text-lg font-semibold">Page Not Found</h3>
                                <p className="text-muted-foreground">The settings page you're looking for doesn't exist.</p>
                            </div>
                        </CardContent>
                    </Card>
                )
        }
    }

    return renderContent()
}