/**
 * GAO CRM — Security Headers Middleware
 *
 * Sets essential security headers on all responses.
 * Replaces Helmet for lightweight header protection.
 */

import type { GaoRequest, GaoResponse, MiddlewareHandler } from '@gao/http';

export function securityHeadersMiddleware(): MiddlewareHandler {
    return async (_req: GaoRequest, res: GaoResponse, next) => {
        // Prevent clickjacking
        res.header('X-Frame-Options', 'DENY');

        // Prevent MIME-type sniffing
        res.header('X-Content-Type-Options', 'nosniff');

        // Enable browser XSS filter
        res.header('X-XSS-Protection', '1; mode=block');

        // Referrer policy — don't leak full URL to third parties
        res.header('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Prevent search engines from caching API responses
        res.header('X-Robots-Tag', 'noindex, nofollow');

        // Content Security Policy — restrictive default
        res.header(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self';"
        );

        // HSTS — enforce HTTPS (only effective behind TLS terminator)
        if (process.env.NODE_ENV === 'production') {
            res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // Remove powered-by header if present
        res.header('X-Powered-By', '');

        return next();
    };
}
