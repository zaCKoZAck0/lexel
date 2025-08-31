import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { SettingsContent } from '@/features/settings';

interface SettingsPageProps {
  params: Promise<{ setting: string[] }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  // Get authentication session
  const session = await auth();

  if (!session?.user) {
    redirect('/auth');
  }

  // Await the params
  const { setting } = await params;

  // Extract the active tab from URL parameters
  const activeTab = setting?.[0] || 'account';

  // Valid settings pages
  const validSettings = [
    'account',
    'api-keys',
    'models',
    'attachments',
    'history',
    'personalization',
  ];

  // If no setting is specified, redirect to account
  if (!setting || setting.length === 0) {
    redirect('/settings/account');
  }

  // If invalid setting, show 404
  if (!validSettings.includes(activeTab as (typeof validSettings)[number])) {
    notFound();
  }

  return <SettingsContent activeTab={activeTab} user={session.user} />;
}
