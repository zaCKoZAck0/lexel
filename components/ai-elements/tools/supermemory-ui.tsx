'use client';

import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { SupermemoryIcon } from '@/components/icons/supermemory-icon';
import { ShinyText } from '@/components/ui/shiny-text';

export type MemoryResult = {
  id: string;
  content: string;
  createdAt: string;
  similarity?: number;
};

export type SearchMemoryPart = {
  type: 'tool-search_memories';
  state: 'output-available' | 'input-available';
  toolCallId: string;
  input: { informationToGet: string };
  output?: {
    success: boolean;
    results: MemoryResult[];
    count: number;
  };
  error?: string;
};

export type AddMemoryPart = {
  type: 'tool-add_memory';
  state: 'output-available' | 'input-available';
  toolCallId: string;
  input: {
    memory: string;
  };
  output?: {
    success: boolean;
    memory: {
      id: string;
      status: string;
    };
  };
  error?: string;
};

export function SearchMemoryUI({
  className,
  part,
}: {
  className?: string;
  part: SearchMemoryPart;
}) {
  const { state, input, output, error } = part;

  if (state === 'input-available') {
    return (
      <div className={cn('rounded-md border p-3', className)}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Search className="size-4" />
          <span className="text-sm">Searching memories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('rounded-md border p-3', className)}>
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-4" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!output?.results || output.results.length === 0) {
    return (
      <Accordion type="single" collapsible className={className}>
        <AccordionItem
          value="search-results"
          className="data-[state=closed]:hover:bg-muted rounded-md border last:border-b transition-colors"
        >
          <AccordionTrigger className="hover:no-underline px-3 py-2 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Search className="size-4" />
              <span>{input?.informationToGet}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-2">
            <div className="text-muted-foreground text-sm">
              No memories found matching your query.
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="search-results"
      className={className}
    >
      <AccordionItem
        value="search-results"
        className="data-[state=closed]:hover:bg-muted rounded-md border last:border-b transition-colors"
      >
        <AccordionTrigger className="hover:no-underline px-3 py-2 text-muted-foreground">
          <div className="flex items-center w-full justify-between">
            <SupermemoryIcon className="h-4" />
            <p className="flex items-center gap-2 hidden md:inline-flex">
              <Search className="size-3" />
              {
                <span className="w-[200px] truncate">
                  `&quot;{input.informationToGet}&quot;`
                </span>
              }
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-3 pb-2">
          <div className="space-y-2 py-2">
            {output.results.slice(0, 5).map(result => (
              <div
                key={result.id}
                className="rounded-md bg-muted border shadow text-muted-foreground py-1 px-2 text-sm"
              >
                <div className="space-y-1">
                  <div className="flex-1">
                    <p className="text-foreground font-serif font-semibold italic line-clamp-1">
                      `&quot;{result.content}&quot;`
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {output.results.length > 5 && (
              <div className="text-sm font-semibold text-muted-foreground text-right">
                +{output.results.length - 5} more
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function AddMemoryUI({
  className,
  part,
}: {
  className?: string;
  part: AddMemoryPart;
}) {
  const { state, input, output, error } = part;

  if (state === 'input-available') {
    return (
      <div className={cn('rounded-md border p-3', className)}>
        <div className="flex items-center justify-between w-full">
          <SupermemoryIcon className="h-4" />
          <ShinyText text="Adding memory..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('rounded-md border p-3', className)}>
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-4" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (output?.success === false) {
    return (
      <div className={cn('rounded-md border p-3', className)}>
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-4" />
          <span className="text-sm">Failed to add memory.</span>
        </div>
      </div>
    );
  }

  if (output?.success) {
    return (
      <Accordion
        type="single"
        collapsible
        defaultValue="add-memory-result"
        className={className}
      >
        <AccordionItem
          value="add-memory-result"
          className="data-[state=closed]:hover:bg-muted rounded-md border last:border-b transition-colors"
        >
          <AccordionTrigger className="hover:no-underline px-3 py-2 text-muted-foreground">
            <div className="flex items-center justify-between w-full">
              <SupermemoryIcon className="h-4" />
              <Badge variant="success">Memory Added</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-2">
            <div className="space-y-2">
              <div className="rounded-md bg-muted text-muted-foreground border shadow py-1 px-2 text-sm">
                <p className="font-serif font-semibold italic line-clamp-1">
                  `&quot;{input.memory}&quot;`
                </p>
              </div>
              <small className="text-muted-foreground text-sm">
                *You can refer to this context later in other chats
              </small>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return null;
}
