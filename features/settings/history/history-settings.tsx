'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, ChevronDown, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HistoryList } from './history-list';
import Link from 'next/link';

export function HistorySettings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Custom debounce implementation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'newest' ? 'oldest' : 'newest'));
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(prev => !prev);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground">
          Manage your chat history and conversation data.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          {/* Controls Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your chat history..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Link href="/chat">
              <Button size="sm">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden md:block">New chat</span>
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="xs">
                  Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortOrder('newest')}>
                  Newest first
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('oldest')}>
                  Oldest first
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant={isSelectionMode ? 'default' : 'secondary'}
              size="xs"
              onClick={toggleSelectionMode}
            >
              Select
            </Button>
          </div>

          {/* Search Results Info */}
          {debouncedSearchQuery && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing results for: <strong>"{debouncedSearchQuery}"</strong>
              </p>
              <Button variant="ghost" size="sm" onClick={clearSearch}>
                Clear search
              </Button>
            </div>
          )}

          {/* History List */}
          <HistoryList
            searchQuery={debouncedSearchQuery}
            sortOrder={sortOrder}
            isSelectionMode={isSelectionMode}
            onSelectionModeChange={setIsSelectionMode}
          />
        </CardContent>
      </Card>
    </div>
  );
}
