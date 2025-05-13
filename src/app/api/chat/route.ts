import { appendClientMessage, appendResponseMessages, createDataStream, createIdGenerator, generateId, streamText } from 'ai';
import { appendStream, loadChat, loadStreams, saveChat } from '~/lib/chat-store';
import { after } from 'next/server';
import { createResumableStreamContext } from '~/lib/resumable-stream';
import { registry } from '~/lib/provider-registry';

const streamContext = createResumableStreamContext({
  waitUntil: after,
});

export async function POST(req: Request) {
  // get the last message from the client:
  const { message, id } = await req.json();

  const streamId = generateId();
  // Record this new stream so we can resume later
  await appendStream({
    id,
    streamId,
  });

  // load the previous messages from the server:
  const previousMessages = await loadChat(id);

  // append the new message to the previous messages:
  const messages = appendClientMessage({
    messages: previousMessages,
    message,
  });

  const stream = createDataStream({
    execute: dataStream => {

      const result = streamText({
        model: registry.languageModel('openai:gpt-4o-mini'),
        messages,
        onFinish: async ({ response }) => {
            dataStream.writeMessageAnnotation({
              model: 'GPT-4o-mini',
          });
          await saveChat({
            id,
            messages: appendResponseMessages({
              messages,
              responseMessages: response.messages,
            }),
          });
        },
        experimental_generateMessageId: createIdGenerator({
          prefix: 'slxl',
          size: 16,
        }),
      });
      // Return a resumable stream to the client
      result.mergeIntoDataStream(dataStream);
    }
  });

  return new Response(
    await streamContext.resumableStream(streamId, () => stream),
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('id is required', { status: 400 });
  }

  const streamIds = await loadStreams(chatId);

  if (!streamIds.length) {
    return new Response('No streams found', { status: 404 });
  }

  const recentStreamId = streamIds.at(-1);

  if (!recentStreamId) {
    return new Response('No recent stream found', { status: 404 });
  }

  const emptyDataStream = createDataStream({
    execute: () => {},
  });

  const stream = await streamContext.resumableStream(
    recentStreamId,
    () => emptyDataStream,
  );

  if (stream) {
    return new Response(stream, { status: 200 });
  }

  /*
   * For when the generation is "active" during SSR but the
   * resumable stream has concluded after reaching this point.
   */

  const messages = await loadChat(chatId);
  const mostRecentMessage = messages.at(-1);

  if (!mostRecentMessage || mostRecentMessage.role !== 'assistant') {
    return new Response(emptyDataStream, { status: 200 });
  }

  const streamWithMessage = createDataStream({
    execute: buffer => {
      buffer.writeData({
        type: 'append-message',
        message: JSON.stringify(mostRecentMessage),
      });
    },
  });

  return new Response(streamWithMessage, { status: 200 });
}