/**
 * GAO CRM — Rate Limiting Middleware
 *
 * In-memory sliding window rate limiter keyed by IP address.
 * For production, replace the in-memory Map with Redis.
 */

import type { GaoRequest, GaoResponse, MiddlewareHandler } from '@gao/http';

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
        if (entry.resetAt <= now) store.delete(key);
    }
}, 5 * 60 * 1000);

interface RateLimitOptions {
    windowMs: number;      // Time window in milliseconds
    maxRequests: number;   // Max requests per window
    keyPrefix?: string;    // Prefix for the rate limit key
}

/**
 * Creates a rate limiting middleware.
 * Different limits can be applied to different route groups.
 */
export function rateLimitMiddleware(options: RateLimitOptions): MiddlewareHandler {
    const { windowMs, maxRequests, keyPrefix = 'rl' } = options;

    return async (req: GaoRequest, res: GaoResponse, next) => {
        const ip = req.header('x-forwarded-for')?.split(',')[0]?.trim()
            ?? req.header('x-real-ip')
            ?? 'unknown';

        const key = `${keyPrefix}:${ip}`;
        const now = Date.now();

        let entry = store.get(key);
        if (!entry || entry.resetAt <= now) {
            entry = { count: 0, resetAt: now + windowMs };
            store.set(key, entry);
        }

        entry.count++;

        // Set rate limit headers
        const remaining = Math.max(0, maxRequests - entry.count);
        res.header('X-RateLimit-Limit', String(maxRequests));
        res.header('X-RateLimit-Remaining', String(remaining));
        res.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

        if (entry.count > maxRequests) {
            const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
            res.header('Retry-After', String(retryAfter));
            return res.error(429, 'RATE_LIMITED', 'Too many requests. Please try again later.');
        }

        return next();
    };
}

// ─── Pre-configured Limiters ────────────────────────────────

/** Strict limit for auth endpoints: 10 requests per 15 minutes */
export function authRateLimit(): MiddlewareHandler {
    return rateLimitMiddleware({ windowMs: 15 * 60 * 1000, maxRequests: 10, keyPrefix: 'auth' });
}

/** Moderate limit for public form/chat/tracking: 60 requests per minute */
export function publicApiRateLimit(): MiddlewareHandler {
    return rateLimitMiddleware({ windowMs: 60 * 1000, maxRequests: 60, keyPrefix: 'pub' });
}

/** General API limit: 200 requests per minute */
export function apiRateLimit(): MiddlewareHandler {
    return rateLimitMiddleware({ windowMs: 60 * 1000, maxRequests: 200, keyPrefix: 'api' });
}
