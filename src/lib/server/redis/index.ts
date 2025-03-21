import Redis from 'ioredis';
import { env } from '$env/dynamic/private';

const redisUrl = env.UPSTASH_REDIS_URL;
if (!redisUrl) {
  throw new Error('UPSTASH_REDIS_URL is not defined in the environment variables');
}

// Create a Redis client using Upstash
export const redis = new Redis(redisUrl, {
  tls: { rejectUnauthorized: false },  // Required for Upstash SSL connections
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

// Ping Redis to ensure connection works
redis.on('connect', () => {
  console.log('Connected to Upstash Redis');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export const REDIS_PREFIXES = {
  CACHE: 'cache:',
  SESSION: 'session:',
  RATE_LIMIT: 'rate-limit:',
  TAGGING: 'tagging:',
  SHELF_NAME: 'shelf-name:',
  XP_DAILY: 'xp:daily:',
};

/**
 * Wraps Redis get/set methods with JSON serialization/deserialization
 * @param key The Redis key
 * @returns The parsed value or null
 */
export async function getJson<T = any>(key: string): Promise<T | null> {
  const value = await redis.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    console.error(`Error parsing Redis value for key ${key}:`, e);
    return null;
  }
}

/**
 * Stores a JSON value in Redis
 * @param key The Redis key
 * @param value The value to store
 * @param expireSeconds Optional expiration time in seconds
 * @returns Whether the operation was successful
 */
export async function setJson(key: string, value: any, expireSeconds?: number): Promise<boolean> {
  try {
    const serialized = JSON.stringify(value);
    if (expireSeconds) {
      await redis.set(key, serialized, 'EX', expireSeconds);
    } else {
      await redis.set(key, serialized);
    }
    return true;
  } catch (e) {
    console.error(`Error storing Redis value for key ${key}:`, e);
    return false;
  }
}

/**
 * Deletes a key from Redis
 * @param key The Redis key to delete
 * @returns The number of keys deleted
 */
export async function deleteKey(key: string): Promise<number> {
  return await redis.del(key);
}

/**
 * Gets multiple values for keys with the same prefix
 * @param prefix The Redis key prefix
 * @returns An array of [key, value] pairs
 */
export async function getKeysByPrefix(prefix: string): Promise<[string, string][]> {
  const keys = await redis.keys(`${prefix}*`);
  if (keys.length === 0) return [];
  
  const pipeline = redis.pipeline();
  keys.forEach(key => {
    pipeline.get(key);
  });
  
  const values = await pipeline.exec();
  if (!values) return [];
  
  return keys.map((key, i) => {
    const value = values[i]?.[1] as string | null;
    return [key, value || ''];
  });
}

/**
 * Helper function to ensure Redis connection
 * @returns Whether the connection is working
 */
export async function ensureRedisConnection(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis connection check failed:', error);
    return false;
  }
}
