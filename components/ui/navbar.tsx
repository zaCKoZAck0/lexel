'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Home, MessageSquare, Settings } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { TopNavbar } from '../top-navbar';
import { ChatSearchModal } from './chat-search-modal';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

export function Nav({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_searchQuery, _setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.code === 'KeyO') {
        e.preventDefault();
        window.location.href = '/chat';
      } else if (e.metaKey && e.code === 'KeyK') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SidebarProvider
      defaultOpen={false}
      className="flex flex-col h-screen w-full"
    >
      <TopNavbar
        onSearchClick={() => setIsSearchModalOpen(!isSearchModalOpen)}
      />
      <div className="flex w-full">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-lg">Lexel</div>
              <SidebarTrigger />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === '/'}
                      tooltip="Home"
                    >
                      <Link href="/">
                        <Home className="w-4 h-4" />
                        <span>Home</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === '/chat'}
                      tooltip="Chat"
                    >
                      <Link href="/chat">
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === '/settings'}
                      tooltip="Settings"
                    >
                      <Link href="/settings">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setIsSearchModalOpen(true)}
                      tooltip="Search"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="p-2">
              <div className="flex items-center gap-2 p-2 rounded-md bg-sidebar-accent">
                <Avatar>
                  <AvatarImage src={session?.user?.image ?? ''} />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-accent-foreground">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-sidebar-accent-foreground/70">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        {children}
      </div>

      <ChatSearchModal
        isSearchModalOpen={isSearchModalOpen}
        setIsSearchModalOpen={setIsSearchModalOpen}
      />
    </SidebarProvider>
  );
}
