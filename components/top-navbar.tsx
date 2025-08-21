import { Button, buttonVariants } from './ui/button';
import { PlusIcon, Search, SettingsIcon } from 'lucide-react';
import { SidebarTrigger } from './ui/sidebar';
import Link from 'next/link';
import { cn } from '@/lib/utils/utils';
import { ThemeToggle } from './ui/theme-toggle';

interface TopNavbarProps {
  onSearchClick: () => void;
}

export function TopNavbar({ onSearchClick }: TopNavbarProps) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="flex items-center justify-between p-2 fixed top-0 w-full">
        <div className="flex items-center gap-1 bg-muted rounded-md px-2 py-1">
          <SidebarTrigger
            variant="ghost"
            size="icon"
            className="cursor-pointer"
          />
          <Button
            variant="ghost"
            size="sm"
            className="size-7 cursor-pointer"
            onClick={() => onSearchClick()}
          >
            <Search className="w-4 h-4" />
          </Button>
          <Link
            href="/chat"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'size-7',
            )}
          >
            <PlusIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex items-center gap-1 bg-muted rounded-md px-2 py-1">
          <Link
            href="/settings"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'size-7',
            )}
          >
            <SettingsIcon className="w-4 h-4" />
          </Link>
          <ThemeToggle className="size-7" variant="ghost" />
        </div>
      </header>
    </div>
  );
}
