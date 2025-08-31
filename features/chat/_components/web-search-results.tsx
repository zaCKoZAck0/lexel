'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ShinyText } from '@/components/ui/shiny-text';
import { cn } from '@/lib/utils/utils';
import { GlobeIcon, Search } from 'lucide-react';
import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export type WebResult = {
  id: string;
  title?: string;
  url: string;
  publishedDate?: string;
  author?: string;
  text?: string;
  image?: string | null;
  favicon?: string | null;
  content?: string;
};

export type WebSearchPart = {
  type: 'tool-webSearch';
  state: 'output-available' | 'input-available';
  toolCallId: string;
  input: { query: string };
  output?: WebResult[];
  error?: string;
};

export function WebSearchResults({
  className,
  part,
}: {
  className?: string;
  part: WebSearchPart;
}) {
  const results = part.output ?? [];

  const hostname = (url: string) => {
    return new URL(url).hostname;
  };

  const formatted = useMemo(() => {
    return results.map(r => ({
      key: r.id || r.url,
      site: hostname(r.url),
      title: r.title || r.url,
      url: r.url,
      author: r.author,
      date: r.publishedDate ? new Date(r.publishedDate) : undefined,
      snippet: r.content || r.text || '',
      image: r.image || null,
      favicon: r.favicon || null,
    }));
  }, [results]);

  if (part.state === 'output-available') {
    return (
      <Accordion type="single" collapsible className={className}>
        <AccordionItem
          value="item-1"
          className="data-[state=closed]:hover:bg-muted rounded-md border last:border-b transition-colors"
        >
          <AccordionTrigger className="hover:no-underline px-3 py-2 text-muted-foreground">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 max-w-[80%]">
                <GlobeIcon className="w-4 h-4 text-foreground" />
                <span className="truncate">{part.input.query}</span>
              </div>
              <p>{formatted.length} results</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-1">
            <ScrollArea className="h-[200px] pr-2">
              {formatted.map(r => (
                <a
                  href={r.url}
                  key={r.key}
                  className="hover:bg-muted rounded-md transition-colors block px-1 py-1.5 w-full"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {r.favicon && (
                      <img
                        src={r.favicon}
                        alt={r.title}
                        className="w-4 h-4 shrink-0"
                      />
                    )}
                    <p className="flex items-center gap-2 min-w-0 w-full">
                      <span className="flex-1 truncate">{r.title}</span>
                      <span className="text-xs text-muted-foreground pl-2 shrink-0 max-w-[40%] truncate">
                        {r.site}
                      </span>
                    </p>
                  </div>
                </a>
              ))}
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <div className={cn('border px-3 py-1 rounded-md', className)}>
      <div className="flex items-center gap-3">
        <GlobeIcon className="w-4 h-4 text-muted-foreground" />
        <ShinyText speed={1} text={'Searching the web...'} />
      </div>
    </div>
  );
}

export default WebSearchResults;
