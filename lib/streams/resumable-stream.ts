import { RedisClient } from '../config/redis';

const STREAM_DONE = '__DONE__';

export interface ResumableStreamContext {
  resumableStream: (
    streamId: string,
    makeStream: () => ReadableStream<string>,
    skipCharacters?: number,
  ) => Promise<ReadableStream<string> | null>;
}

interface Options {
  keyPrefix?: string;
  waitUntil: (promise: Promise<unknown>) => void;
}

export function createResumableStreamContext(
  options: Options,
): ResumableStreamContext {
  const redis = RedisClient();
  const keyPrefix = `${options.keyPrefix || 'resumable-stream'}:rs`;

  return {
    async resumableStream(streamId, makeStream, skipChars = 0) {
      const sentinelKey = `${keyPrefix}:status:${streamId}`;
      const chunksKey = `${keyPrefix}:chunks:${streamId}`;

      const status = await redis.get(sentinelKey);
      if (status === STREAM_DONE) {
        return null;
      }

      const currentCount = await redis.incr(sentinelKey).catch(err => {
        if (String(err).includes('ERR value is not an integer'))
          return STREAM_DONE;
        throw err;
      });

      if (currentCount === STREAM_DONE) return null;

      if ((currentCount as number) > 1) {
        // Resume logic
        const full = await redis.get(chunksKey);
        if (!full || typeof full !== 'string') return null;

        const resumed = full.slice(skipChars);
        return new ReadableStream<string>({
          start(controller) {
            controller.enqueue(resumed);
            controller.close();
          },
        });
      }

      // Stream not in progress yet
      if (skipChars > 0) {
        throw new Error("Can't skip characters on a new stream");
      }

      const chunks: string[] = [];

      const stream = new ReadableStream<string>({
        async start(controller) {
          const reader = makeStream().getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            chunks.push(value);
            controller.enqueue(value);
          }

          controller.close();

          // Persist and mark as done
          options.waitUntil(
            Promise.all([
              redis.set(chunksKey, chunks.join(''), { ex: 86400 }),
              redis.set(sentinelKey, STREAM_DONE, { ex: 86400 }),
            ]),
          );
        },
      });

      return stream;
    },
  };
}
