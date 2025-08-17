'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';

import { saveChatModelAsCookie } from '@/app/(chat)/actions';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chatModels } from '@/lib/ai/models';
import { cn } from '@/lib/utils';

import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import type { Session } from 'next-auth';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLinkIcon, InfoIcon } from 'lucide-react';

export function ModelSelector({
  session,
  selectedModelId,
  className,
}: {
  session: Session;
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  const userType = session.user.type;
  const { availableChatModelIds } = entitlementsByUserType[userType];
  const availableChatModels = chatModels.filter((chatModel) =>
    availableChatModelIds.includes(chatModel.id),

  );

  const selectedChatModel = useMemo(
    () =>
      availableChatModels.find(
        (chatModel) => chatModel.id === optimisticModelId,
      ),
    [optimisticModelId, availableChatModels],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          data-testid="model-selector"
          variant="outline"
          className="md:px-2 md:h-[34px]"
        >
          <Image
            className="size-5 rounded-full bg-white"
            src={selectedChatModel?.providerDetails.iconUrl || ''}
            alt={selectedChatModel?.name || 'Model Icon'}
            width={24}
            height={24}
          />
          {selectedChatModel?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {availableChatModels.map((chatModel) => {
          const { id } = chatModel;

          return (
            <DropdownMenuItem
              data-testid={`model-selector-item-${id}`}
              key={id}
              onSelect={() => {
                setOpen(false);

                startTransition(() => {
                  setOptimisticModelId(id);
                  saveChatModelAsCookie(id);
                });
              }}
              data-active={id === optimisticModelId}
              asChild
            >
              <button
                type="button"
                className="gap-4 group/item flex flex-row justify-between items-center w-full"
              >
                <div className="flex flex gap-2 items-center">
                  <Image className='size-6 rounded-full bg-white' src={chatModel.providerDetails.iconUrl} alt={chatModel.name} width={40} height={40} />
                  <div className='text-base'>{chatModel.name}</div>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger className='cursor-default'>
                      <InfoIcon className='size-4 text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className='max-w-[250px] text-left space-y-1'>
                        <div className='flex items-start gap-2'>
                          <a href={chatModel.providerDetails.url} className='flex flex-col items-center w-fit'>
                          <Image className='size-8 rounded-full bg-white' src={chatModel.providerDetails.iconUrl} alt={chatModel.name} width={40} height={40} />
                          <p>{chatModel.providerDetails.name}</p>
                          </a>
                          <div>
                            <p>{chatModel.name}</p>
                            <p className='text-xs text-muted-foreground'>${chatModel.priceInUsd.input} {chatModel.priceInUsd.unit} Input</p>
                            <p className='text-xs text-muted-foreground'>${chatModel.priceInUsd.output} {chatModel.priceInUsd.unit} Output</p>
                          </div>
                        </div>
                        <p className='text-xs'>{chatModel.description}</p>
                        <div>
                          <div className='flex items-center justify-between'>
                            <p className='text-xs text-muted-foreground'>{new Intl.NumberFormat('en-US').format(chatModel.contextWindow || 0)} context window</p>
                            <a className={cn(buttonVariants({ variant: 'link' }), "p-0 h-fit w-fit")} href={chatModel.modelUrl}>Read more <ExternalLinkIcon className='size-3 text-muted-foreground' /></a>
                          </div>  
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                  <CheckCircleFillIcon />
                </div>
              </button>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
