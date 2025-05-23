'use client';

import { useChat } from '@ai-sdk/react';
import { createIdGenerator, UIMessage } from 'ai';
import { useAutoResume } from '~/hooks/use-auto-resume';

export function Chat({
  id,
  initialMessages,
}: { id?: string | undefined; initialMessages?: UIMessage[] } = {}) {
  const { input, handleInputChange, handleSubmit, messages, experimental_resume, data, setMessages } = useChat({
      id,
    initialMessages,
      sendExtraMessageFields: true, // send id and createdAt for each message
      generateId: createIdGenerator({
        prefix: 'lxl',
        size: 16,
      }), // generate unique id for each message
      experimental_prepareRequestBody({ messages, id }) {
        return { message: messages[messages.length - 1], id };
      },
  });
    
    useAutoResume({
        autoResume: true,
        initialMessages: initialMessages || [],
        experimental_resume,
        data,
        setMessages,
      });

  // simplified rendering code, extend as needed:
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
            }
          })}
              {message.annotations && <>{JSON.stringify(message.annotations)}</>}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}