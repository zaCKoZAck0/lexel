import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { SettingsHeader } from '@/features/settings/settings-header';
import { SettingsSidebar } from '@/features/settings/settings-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/chat" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Chat</span>
              </Link>
            </Button>
          </div>
          <ThemeToggle />
        </div>

        <SettingsHeader user={session.user} />

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-6">
          <SettingsSidebar />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
