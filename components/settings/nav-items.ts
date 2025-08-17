import {
    User,
    Key,
    Brain,
    Paperclip,
    History,
    Sliders,
} from "lucide-react"

export interface SettingsNavItem {
    id: string
    label: string
    icon: any
    description: string
}

export const settingsNavItems: SettingsNavItem[] = [
    {
        id: "account",
        label: "Account",
        icon: User,
        description: "Personal information",
    },
    {
        id: "api-keys",
        label: "API Keys",
        icon: Key,
        description: "Manage API access",
    },
    {
        id: "models",
        label: "Models",
        icon: Brain,
        description: "AI model preferences",
    },
    {
        id: "attachments",
        label: "Attachments",
        icon: Paperclip,
        description: "File attachments",
    },
    {
        id: "history",
        label: "History",
        icon: History,
        description: "Chat history",
    },
    {
        id: "personalization",
        label: "Personalization",
        icon: Sliders,
        description: "Customize AI behavior",
    },
]
