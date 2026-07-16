/**
 * Sliding-window rate limiter.
 *
 * Uses Upstash Redis (distributed — safe across multiple serverless
 * instances/regions) when UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN are
 * set. Otherwise falls back to an in-memory Map, which only rate-limits
 * correctly within a single running instance.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitConfig {
  /** Maximum requests allowed within the window. */
  maxRequests: number;
  /** Time window in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

// ─── Upstash-backed limiter (preferred) ─────────────────────────

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const useUpstash = Boolean(upstashUrl && upstashToken);

if (useUpstash) {
  console.info("[rate-limit] Upstash Redis configured — using distributed rate limiting.");
} else {
  console.warn(
    "[rate-limit] UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not set — " +
      "falling back to in-memory rate limiting. This is NOT safe across " +
      "multiple serverless instances/regions; set Upstash credentials before going to production."
  );
}

const redis = useUpstash ? new Redis({ url: upstashUrl!, token: upstashToken! }) : null;

// Upstash's Ratelimit instance bakes in the window/limit, so cache one per
// distinct config instead of constructing it on every call.
const upstashLimiterCache = new Map<string, Ratelimit>();
function getUpstashLimiter(config: RateLimitConfig): Ratelimit {
  const cacheKey = `${config.maxRequests}:${config.windowMs}`;
  let limiter = upstashLimiterCache.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(config.maxRequests, `${config.windowMs} ms`),
      analytics: false,
      prefix: "vendorhub",
    });
    upstashLimiterCache.set(cacheKey, limiter);
  }
  return limiter;
}

// ─── In-memory fallback ──────────────────────────────────────────

interface RateLimitEntry {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of memoryStore) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      memoryStore.delete(key);
    }
  }
}

function checkRateLimitInMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  cleanupStaleEntries(config.windowMs);

  let entry = memoryStore.get(identifier);
  if (!entry) {
    entry = { timestamps: [] };
    memoryStore.set(identifier, entry);
  }

  const cutoff = now - config.windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + config.windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(retryAfterMs, 0),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Checks whether a request from the given identifier is within the
 * configured rate limit. Returns the result without throwing. 
 * In production, strictly requires Upstash Redis and fails closed if unavailable.
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const isProduction = process.env.NODE_ENV === "production";

  if (useUpstash) {
    try {
      const limiter = getUpstashLimiter(config);
      const result = await limiter.limit(identifier);
      return {
        allowed: result.success,
        remaining: result.remaining,
        retryAfterMs: result.success ? 0 : Math.max(result.reset - Date.now(), 0),
      };
    } catch (error) {
      console.error("[rate-limit] Upstash request failed:", error);
      if (isProduction) {
        // Fail closed in production to prevent abuse if Redis is down
        throw new Error("Rate limiting service unavailable in production.");
      }
      return checkRateLimitInMemory(identifier, config);
    }
  }

  if (isProduction) {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in production.");
  }

  return checkRateLimitInMemory(identifier, config);
}

// ─── Pre-configured limiters ────────────────────────────────────

/** General API routes: 30 requests per 60 seconds per IP. */
export const API_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 30,
  windowMs: 60_000,
};

/** Webhook endpoints: 60 requests per 60 seconds per IP. */
export const WEBHOOK_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60_000,
};

/** Server actions: 20 requests per 60 seconds per user. */
export const ACTION_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 20,
  windowMs: 60_000,
};
