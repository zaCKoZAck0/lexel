'use client';

import { memo, } from 'react';
import { Button } from './ui/button';
import type { SearchResult } from 'exa-js';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface WebSearchProps {
  query?: string;
  results?: SearchResult<{
    livecrawl: 'always';
    numResults: number;
  }>[];
  isLoading?: boolean;
}

function formatRelativeDate(dateStr?: string) {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return undefined;
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((now.setHours(0,0,0,0) - date.setHours(0,0,0,0)) / msPerDay);
  const absolute = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  if (diffDays === 0) return `Today — ${absolute}`;
  if (diffDays === 1) return `Yesterday — ${absolute}`;
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago — ${absolute}`;
  return absolute;
}

const PureWebSearch = ({ query, results = [], isLoading }: WebSearchProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">
          Searching the web...
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No search results found.
      </div>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size='sm' variant='secondary' className='rounded-full'>Sources
          <div className='flex items-center -space-x-1.5'>
            {results
              .filter(result => !!result.favicon)
              .slice(0, 3)
              .map((result, i) => (
                <img
                  key={result.id}
                  src={result.favicon}
                  alt={(() => { try { return new URL(result.url).hostname; } catch { return 'favicon'; } })()}
                  className='size-5 rounded-full border border-border bg-secondary'
                />
              ))}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Sources</SheetTitle>
          <SheetDescription>
            Query: &quot;{query}&quot;
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-1">
          {results.map((result) => {
            const hostname = (() => { try { return new URL(result.url).hostname; } catch { return result.url; } })();
            const relDate = formatRelativeDate(result.publishedDate);
            return (
              <a
                href={result.url}
                key={result.id}
                className="group block cursor-pointer rounded-lg hover:bg-muted px-3 py-2 transition-colors"
              >
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  {result.favicon &&
                  <img
                    src={result.favicon}
                    alt="favicon"
                    className="size-4 rounded-full border bg-background"
                  />
                  }
                  <span className="text-xs">{hostname}</span>
                </div>
                <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                   {result.title}
                 </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {relDate && `${relDate} — `}{result.author && `[${result.author}] `}{result.text}
                 </p>
              </a>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
};

export const WebSearch = memo(PureWebSearch);
