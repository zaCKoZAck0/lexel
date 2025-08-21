'use client';

import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { settingsNavItems } from './nav-items';
import { Card } from '@/components/ui/card';

export function SettingsSidebar() {
  const pathname = usePathname();
  const activeTab = (() => {
    if (!pathname) return 'account';
    const parts = pathname.split('/').filter(Boolean);
    const settingsIndex = parts.indexOf('settings');
    const tab = settingsIndex >= 0 ? parts[settingsIndex + 1] : undefined;
    return tab || 'account';
  })();

  return (
    <Card className="w-64 hidden md:block h-fit">
      <ScrollArea className="h-full">
        <div className="px-4 space-y-6">
          <div>
            <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Settings
            </h3>
            <div className="space-y-1">
              {settingsNavItems.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start h-auto p-3',
                      isActive && 'bg-secondary',
                    )}
                    asChild
                  >
                    <Link href={`/settings/${item.id}`}>
                      <item.icon className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">{item.label}</div>
                      </div>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}
