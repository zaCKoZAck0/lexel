'use client';

import { memo, useMemo } from 'react';
import { ExternalLinkIcon } from './icons';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { SearchResult } from 'exa-js';
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
  if (isNaN(date.getTime())) return undefined;
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
            {results.filter(result => !!result.favicon).slice(0, 3).map(result => <img src={result.favicon} className='size-5 rounded-full border border-border bg-secondary' />)}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Sources</SheetTitle>
          <SheetDescription>
            Query: "{query}"
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-1">
          {results.map((result) => {
            const hostname = (() => { try { return new URL(result.url).hostname; } catch { return result.url; } })();
            const relDate = formatRelativeDate(result.publishedDate);
            return (
              <div
                key={result.id || result.url}
                className="group cursor-pointer rounded-lg hover:bg-muted px-3 py-2 transition-colors"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.open(result.url, '_blank', 'noopener,noreferrer');
                  }
                }}
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
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  )

  // return (
  //   <div className="space-y-3">
  //     {query && (
  //       <div className="text-sm text-muted-foreground">
  //         Web search results for: <span className="font-medium">{query}</span>
  //       </div>
  //     )}

  //     <div className="flex gap-3 overflow-x-auto pb-2">
  //       {results.slice(0, 5).map((result, index) => (
  //         <Card
  //           key={index}
  //           className={cn(
  //             'min-w-[280px] max-w-[320px] hover:bg-muted/50 transition-colors cursor-pointer group',
  //             'border-l-4 border-l-blue-500',
  //           )}
  //           onClick={() => {
  //             if (typeof window !== 'undefined') {
  //               window.open(result.url, '_blank', 'noopener,noreferrer');
  //             }
  //           }}
  //         >
  //           <CardContent className="p-4 space-y-2">
  //             <div className="flex items-start justify-between gap-2">
  //               <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
  //                 {result.title}
  //               </h3>
  //               <ExternalLinkIcon className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
  //             </div>

  //             <p className="text-xs text-muted-foreground line-clamp-3">
  //               {result.content}
  //             </p>

  //             <div className="flex items-center justify-between text-xs text-muted-foreground">
  //               <span className="truncate">{new URL(result.url).hostname}</span>
  //               {result.publishedDate && (
  //                 <span className="shrink-0">
  //                   {new Date(result.publishedDate).toLocaleDateString()}
  //                 </span>
  //               )}
  //             </div>
  //           </CardContent>
  //         </Card>
  //       ))}
  //     </div>

  //     {results.length > 5 && (
  //       <div className="text-xs text-muted-foreground text-center">
  //         Showing 5 of {results.length} results
  //       </div>
  //     )}

  //     <div className="text-xs text-muted-foreground border-t pt-2">
  //       Sources: Web search results
  //     </div>
  //   </div>
  // );
};

export const WebSearch = memo(PureWebSearch);
