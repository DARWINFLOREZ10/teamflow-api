import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true
});

redis.on('error', (error) => {
  console.error('Redis error:', error.message);
});

export async function ensureRedisConnection(): Promise<void> {
  if (redis.status === 'ready' || redis.status === 'connecting') {
    return;
  }
  await redis.connect();
}

export async function invalidateByPrefix(prefix: string): Promise<void> {
  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100);
    cursor = nextCursor;
    if (keys.length) {
      await redis.del(...keys);
    }
  } while (cursor !== '0');
}
