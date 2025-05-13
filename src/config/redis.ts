import { Redis } from '@upstash/redis'

export function RedisClient() {

    const redis = new Redis({
        url: process.env.REDIS_URL!,
        token: process.env.REDIS_TOKEN!,
    })

    return redis;
}