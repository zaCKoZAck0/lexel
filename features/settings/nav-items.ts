import { User, Key, Brain, Paperclip, History, Sliders } from 'lucide-react';

export interface SettingsNavItem {
  id: string;
  label: string;
  icon: any;
}

export const settingsNavItems: SettingsNavItem[] = [
  {
    id: 'account',
    label: 'Account',
    icon: User,
  },
  {
    id: 'api-keys',
    label: 'API Keys',
    icon: Key,
  },
  {
    id: 'models',
    label: 'Models',
    icon: Brain,
  },
  {
    id: 'attachments',
    label: 'Attachments',
    icon: Paperclip,
  },
  {
    id: 'history',
    label: 'History',
    icon: History,
  },
  {
    id: 'personalization',
    label: 'Personalization',
    icon: Sliders,
  },
];
