'use client';

import { memo } from 'react';
import { ExternalLinkIcon } from './icons';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';

interface WebSearchResult {
  title: string;
  url: string;
  content: string;
  publishedDate?: string;
}

interface WebSearchProps {
  query?: string;
  results?: WebSearchResult[];
  isLoading?: boolean;
}

const PureWebSearch = ({ query, results, isLoading }: WebSearchProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">
          Searching the web...
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 w-48 bg-muted rounded-lg animate-pulse"
            />
          ))}
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
    <div className="space-y-3">
      {query && (
        <div className="text-sm text-muted-foreground">
          Web search results for: <span className="font-medium">{query}</span>
        </div>
      )}

      <div className="flex gap-3 overflow-x-auto pb-2">
        {results.slice(0, 5).map((result, index) => (
          <Card
            key={index}
            className={cn(
              'min-w-[280px] max-w-[320px] hover:bg-muted/50 transition-colors cursor-pointer group',
              'border-l-4 border-l-blue-500',
            )}
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.open(result.url, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {result.title}
                </h3>
                <ExternalLinkIcon className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <p className="text-xs text-muted-foreground line-clamp-3">
                {result.content}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate">{new URL(result.url).hostname}</span>
                {result.publishedDate && (
                  <span className="shrink-0">
                    {new Date(result.publishedDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {results.length > 5 && (
        <div className="text-xs text-muted-foreground text-center">
          Showing 5 of {results.length} results
        </div>
      )}

      <div className="text-xs text-muted-foreground border-t pt-2">
        Sources: Web search results
      </div>
    </div>
  );
};

export const WebSearch = memo(PureWebSearch);
