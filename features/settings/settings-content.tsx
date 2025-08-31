'use client';

import { User } from 'next-auth';
import { AccountSettings } from '@/features/settings/account-settings';
import { ApiKeys } from '@/features/settings/api-keys';
import { ModelsSettings } from '@/features/settings/models';
import { HistorySettings } from '@/features/settings/history/history-settings';
import { Card, CardContent } from '@/components/ui/card';

interface SettingsContentProps {
  activeTab: string;
  user: User;
}

export function SettingsContent({ activeTab, user }: SettingsContentProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings user={user} />;
      case 'api-keys':
        return <ApiKeys />;
      case 'models':
        return <ModelsSettings />;
      case 'history':
        return <HistorySettings />;
      default:
        return (
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Page Not Found</h3>
                <p className="text-muted-foreground">
                  The settings page you're looking for doesn't exist.
                </p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return renderContent();
}
