'use client';

import { User } from 'next-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { MobileSettingsNav } from './mobile-nav';

interface SettingsHeaderProps {
  user: User;
}

export function SettingsHeader({ user }: SettingsHeaderProps) {
  const initials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <Card>
      <CardContent className="px-5 flex md:flex-row-reverse flex-col gap-4">
        <div className="flex items-center gap-5">
          <div className="flex items-center justify-between w-full">
            <MobileSettingsNav />
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
        <div className="flex items-start space-x-4 min-w-0 w-full">
          <Avatar className="size-14 border-2">
            <AvatarImage src={user.image || ''} alt={user.name || ''} />
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">
                {user.name || 'Anonymous User'}
              </h1>
            </div>

            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {user.email && (
                <div className="flex items-center space-x-1 truncate max-w-full">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
