/**
 * Rate limiting utility to prevent RPC rate limit errors
 * Tracks request timing and provides throttling for RPC calls
 */

interface RateLimitEntry {
  lastRequest: number;
  requestCount: number;
  windowStart: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private requestMap: Map<string, RateLimitEntry> = new Map();
  private readonly defaultWindowMs = 1000; // 1 second window
  private readonly defaultMaxRequests = 20; // 20 requests per window

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Check if a request can be made for the given key
   * @param key - Unique identifier for the rate limit (e.g., contract address, method name)
   * @param maxRequests - Maximum requests per window (default: 20)
   * @param windowMs - Time window in milliseconds (default: 1000ms)
   * @returns true if request can be made, false if rate limited
   */
  canMakeRequest(
    key: string, 
    maxRequests: number = this.defaultMaxRequests, 
    windowMs: number = this.defaultWindowMs
  ): boolean {
    const now = Date.now();
    const entry = this.requestMap.get(key);

    if (!entry) {
      // First request for this key
      this.requestMap.set(key, {
        lastRequest: now,
        requestCount: 1,
        windowStart: now
      });
      return true;
    }

    // Check if we're in a new time window
    if (now - entry.windowStart >= windowMs) {
      // Reset the window
      entry.requestCount = 1;
      entry.windowStart = now;
      entry.lastRequest = now;
      return true;
    }

    // Check if we've exceeded the rate limit
    if (entry.requestCount >= maxRequests) {
      console.warn(`Rate limit exceeded for key: ${key}. Requests: ${entry.requestCount}/${maxRequests}`);
      return false;
    }

    // Increment request count
    entry.requestCount++;
    entry.lastRequest = now;
    return true;
  }

  /**
   * Wait for the rate limit window to reset
   * @param key - Unique identifier for the rate limit
   * @param windowMs - Time window in milliseconds
   * @returns Promise that resolves when the window resets
   */
  async waitForWindowReset(key: string, windowMs: number = this.defaultWindowMs): Promise<void> {
    const entry = this.requestMap.get(key);
    if (!entry) return;

    const now = Date.now();
    const timeSinceWindowStart = now - entry.windowStart;
    const remainingTime = windowMs - timeSinceWindowStart;

    if (remainingTime > 0) {
      console.log(`Waiting ${remainingTime}ms for rate limit window to reset for key: ${key}`);
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
  }

  /**
   * Get current rate limit status for a key
   * @param key - Unique identifier for the rate limit
   * @returns Object with current request count and time until window reset
   */
  getStatus(key: string): { requestCount: number; timeUntilReset: number } {
    const entry = this.requestMap.get(key);
    if (!entry) {
      return { requestCount: 0, timeUntilReset: 0 };
    }

    const now = Date.now();
    const timeSinceWindowStart = now - entry.windowStart;
    const timeUntilReset = Math.max(0, this.defaultWindowMs - timeSinceWindowStart);

    return {
      requestCount: entry.requestCount,
      timeUntilReset
    };
  }

  /**
   * Clear all rate limit entries
   */
  clear(): void {
    this.requestMap.clear();
    console.log('Rate limiter cleared');
  }

  /**
   * Clear rate limit entry for a specific key
   * @param key - Unique identifier for the rate limit
   */
  clearKey(key: string): void {
    this.requestMap.delete(key);
    console.log(`Rate limit cleared for key: ${key}`);
  }
}

export const rateLimiter = RateLimiter.getInstance();

/**
 * Decorator function to add rate limiting to async functions
 * @param key - Unique identifier for rate limiting
 * @param maxRequests - Maximum requests per window
 * @param windowMs - Time window in milliseconds
 */
export function withRateLimit<T extends any[], R>(
  key: string,
  maxRequests: number = 20,
  windowMs: number = 1000
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: T): Promise<R> {
      if (!rateLimiter.canMakeRequest(key, maxRequests, windowMs)) {
        await rateLimiter.waitForWindowReset(key, windowMs);
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Utility function to execute a function with rate limiting
 * @param fn - Function to execute
 * @param key - Unique identifier for rate limiting
 * @param maxRequests - Maximum requests per window
 * @param windowMs - Time window in milliseconds
 */
export async function executeWithRateLimit<T>(
  fn: () => Promise<T>,
  key: string,
  maxRequests: number = 20,
  windowMs: number = 1000
): Promise<T> {
  if (!rateLimiter.canMakeRequest(key, maxRequests, windowMs)) {
    await rateLimiter.waitForWindowReset(key, windowMs);
  }
  return fn();
}


