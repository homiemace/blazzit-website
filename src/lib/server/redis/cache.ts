import { redis, REDIS_PREFIXES, getJson, setJson } from '$lib/server/redis';

// Cache TTL configuration (in seconds)
export const CACHE_TTL = {
  SHELF_NAMES: 60 * 60 * 24, // 24 hours
  AI_TAGS: 60 * 60 * 24 * 7, // 7 days
  FEED: 60 * 5, // 5 minutes
  USER_PROFILE: 60 * 15, // 15 minutes
  POPULAR_POSTS: 60 * 10, // 10 minutes
  SHELF_ITEMS: 60 * 5, // 5 minutes
};

/**
 * Gets a value from the cache
 * @param key The cache key (without prefix)
 * @returns The cached value or null if not found
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  return await getJson<T>(`${REDIS_PREFIXES.CACHE}${key}`);
}

/**
 * Sets a value in the cache
 * @param key The cache key (without prefix)
 * @param value The value to cache
 * @param ttlSeconds The time-to-live in seconds
 * @returns Whether the operation was successful
 */
export async function setCache(key: string, value: any, ttlSeconds: number): Promise<boolean> {
  return await setJson(`${REDIS_PREFIXES.CACHE}${key}`, value, ttlSeconds);
}

/**
 * Invalidates a cache entry
 * @param key The cache key (without prefix)
 * @returns Whether the operation was successful
 */
export async function invalidateCache(key: string): Promise<boolean> {
  try {
    await redis.del(`${REDIS_PREFIXES.CACHE}${key}`);
    return true;
  } catch (error) {
    console.error('Error invalidating cache:', error);
    return false;
  }
}

/**
 * Invalidates all cache entries with a specific prefix
 * @param prefix The cache key prefix
 * @returns The number of keys invalidated
 */
export async function invalidateCacheByPrefix(prefix: string): Promise<number> {
  try {
    const keys = await redis.keys(`${REDIS_PREFIXES.CACHE}${prefix}*`);
    if (keys.length === 0) return 0;
    
    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    console.error('Error invalidating cache by prefix:', error);
    return 0;
  }
}

/**
 * Gets or sets a value in the cache
 * @param key The cache key (without prefix)
 * @param fetchFn Function to fetch the value if not cached
 * @param ttlSeconds The time-to-live in seconds
 * @returns The cached or fetched value
 */
export async function getCacheOrSet<T = any>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const cached = await getCache<T>(key);
  if (cached !== null) return cached;
  
  const value = await fetchFn();
  await setCache(key, value, ttlSeconds);
  return value;
}

/**
 * Clears expired cache entries (for maintenance)
 * Should be run periodically
 * @returns The number of keys checked
 */
export async function clearExpiredCache(): Promise<number> {
  // Redis handles TTL expiration automatically
  // This function exists for compatibility/future extensions
  return 0;
}
