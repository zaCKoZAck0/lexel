import { generateId, Message } from 'ai';
import { RedisClient } from '~/config/redis';

export async function createChat(): Promise<string> {
  const id = generateId();
  const redis = RedisClient();
  // Todo: 1. Create chat needs user id, 2. Add user id to chat
  // await redis.sadd(`user_chats:${"user_id"}`, id);
  await redis.hset(`chat:${id}`, { id, messages: JSON.stringify([]) });
  return id;
}

export async function loadChat(id: string): Promise<Message[]> {
  const redis = RedisClient();
  const chat = await redis.hget(`chat:${id}`, "messages") as Message[] | null;
  if (!chat) {
    throw new Error('No chat found');
  }
  return chat;
}


export async function saveChat({
  id,
  messages,
}: {
  id: string;
  messages: Message[];
}): Promise<void> {
  const redis = RedisClient();
  await redis.hset(`chat:${id}`, {
    id,
    messages: JSON.stringify(messages),
  });
}

export async function deleteChat(id: string): Promise<void> {
  const redis = RedisClient();
  await redis.del(`chat:${id}`);
}


export async function loadStreams(id: string): Promise<string[]> {
  const redis = RedisClient();
  const streams = await redis.hget(`chat:${id}`, "streams") as string | null;
  if (!streams) {
    throw new Error('No streams found');
  }
  return JSON.parse(streams) as string[];
}

export async function appendStream({
  id,
  streamId,
}: {
  id: string;
  streamId: string;
}): Promise<void> {
  const redis = RedisClient();
  const streams = await redis.hget(`chat:${id}`, "streams") as string[] | null ?? [];
  streams.push(streamId);
  await redis.hset(`chat:${id}`, {
    streams: JSON.stringify(streams),
  });
}

export async function deleteStream(id: string, streamId: string): Promise<void> {
  const redis = RedisClient();
  const streams = await loadStreams(id);
  const newStreams = streams.filter((s) => s !== streamId);
  await redis.hset(`chat:${id}`, {
    streams: JSON.stringify(newStreams),
  });
}

export async function deleteAllStreams(id: string): Promise<void> {
  const redis = RedisClient();
  await redis.hset(`chat:${id}`, {
    streams: JSON.stringify([]),
  });
}
