import { redis, REDIS_PREFIXES } from '$lib/server/redis';
import type { RequestEvent } from '@sveltejs/kit';

// Rate limit configuration by path
const rateLimits: Record<string, {
  maxRequests: number;
  windowSeconds: number;
  identifier: (event: RequestEvent) => string;
}> = {
  '/api/bookmarks': {
    maxRequests: 60,  // 60 requests
    windowSeconds: 60 * 15,  // per 15 minutes
    identifier: (event) => event.locals.user?.id || event.getClientAddress()
  },
  '/api/posts': {
    maxRequests: 30,  // 30 requests
    windowSeconds: 60 * 15,  // per 15 minutes
    identifier: (event) => event.locals.user?.id || event.getClientAddress()
  },
  '/api/auth': {
    maxRequests: 10,  // 10 requests
    windowSeconds: 60 * 15,  // per 15 minutes
    identifier: (event) => event.getClientAddress()
  }
};

/**
 * Checks if a request is rate limited
 * @param event The request event
 * @returns Whether the request is allowed and reset time if rate limited
 */
export async function isRateLimited(event: RequestEvent): Promise<{
  allowed: boolean;
  resetTime?: Date;
}> {
  const path = event.url.pathname;
  
  // Find the matching rate limit configuration
  const matchingPathConfig = Object.entries(rateLimits)
    .find(([configPath, _]) => path.startsWith(configPath));
  
  if (!matchingPathConfig) {
    // No rate limit for this path
    return { allowed: true };
  }
  
  const [_, config] = matchingPathConfig;
  const identifier = config.identifier(event);
  const key = `${REDIS_PREFIXES.RATE_LIMIT}${path}:${identifier}`;
  
  const now = Date.now();
  const result = await redis.get(key);
  
  if (!result) {
    // First request, create new record
    await redis.set(key, '1', 'EX', config.windowSeconds);
    return { allowed: true };
  }
  
  // Increment counter
  const count = parseInt(result) + 1;
  
  // Get TTL to calculate reset time
  const ttl = await redis.ttl(key);
  const resetTime = new Date(now + (ttl * 1000));
  
  // Update counter
  await redis.set(key, count.toString(), 'EX', ttl > 0 ? ttl : config.windowSeconds);
  
  // Check if over limit
  if (count > config.maxRequests) {
    return {
      allowed: false,
      resetTime
    };
  }
  
  return { allowed: true };
}

/**
 * Checks if a user has exceeded bookmark rate limits
 * @param userId The user ID
 * @returns Rate limit status
 */
export async function checkBookmarkRateLimits(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  resetTime?: Date;
}> {
  try {
    const now = Date.now();

    // Check hourly limit
    const hourlyKey = `${REDIS_PREFIXES.RATE_LIMIT}bookmarks:hourly:${userId}`;
    const hourlyCount = await redis.get(hourlyKey);
    
    // Max 30 per hour
    if (hourlyCount && parseInt(hourlyCount) >= 30) {
      const ttl = await redis.ttl(hourlyKey);
      return {
        allowed: false,
        reason: "You've reached the maximum of 30 bookmarks per hour.",
        resetTime: new Date(now + (ttl * 1000))
      };
    }
    
    // Check consecutive bookmarks (max 5 in a short time)
    const recentKey = `${REDIS_PREFIXES.RATE_LIMIT}bookmarks:recent:${userId}`;
    const recentCountStr = await redis.get(recentKey);
    const recentCount = recentCountStr ? parseInt(recentCountStr) : 0;
    
    if (recentCount >= 5) {
      const cooldownKey = `${REDIS_PREFIXES.RATE_LIMIT}bookmarks:cooldown:${userId}`;
      const inCooldown = await redis.exists(cooldownKey);
      
      if (inCooldown) {
        const ttl = await redis.ttl(cooldownKey);
        return {
          allowed: false,
          reason: "You've created too many bookmarks in quick succession. Please wait before creating more.",
          resetTime: new Date(now + (ttl * 1000))
        };
      }
      
      // Start cooldown (15 minutes)
      await redis.set(cooldownKey, '1', 'EX', 15 * 60);
      // Reset recent counter
      await redis.del(recentKey);
    } else {
      // Increment recent counter with 2-minute expiry
      await redis.incr(recentKey);
      await redis.expire(recentKey, 120);
    }
    
    // Increment hourly counter or initialize it
    if (hourlyCount) {
      await redis.incr(hourlyKey);
    } else {
      // Set with 1-hour expiry
      await redis.set(hourlyKey, '1', 'EX', 60 * 60);
    }
    
    return { allowed: true };
  } catch (error) {
    console.error('Error checking bookmark rate limits:', error);
    // Default to allowing in case of Redis error
    return { allowed: true };
  }
}

/**
 * Detect potential bookmark spam patterns
 * @param userId The user ID
 * @returns Whether the activity looks like spam
 */
export async function detectBookmarkSpam(userId: string): Promise<{
  isSpam: boolean;
  confidence: number;
  reason?: string;
}> {
  try {
    const hourlyKey = `${REDIS_PREFIXES.RATE_LIMIT}bookmarks:hourly:${userId}`;
    const hourlyCount = await redis.get(hourlyKey);
    
    // If creating many bookmarks in a short time
    if (hourlyCount && parseInt(hourlyCount) > 20) {
      return {
        isSpam: true,
        confidence: 0.7,
        reason: "Unusually high bookmark creation rate"
      };
    }
    
    return { isSpam: false, confidence: 0 };
  } catch (error) {
    console.error('Error detecting bookmark spam:', error);
    return { isSpam: false, confidence: 0 };
  }
}
