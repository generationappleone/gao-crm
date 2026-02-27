/**
 * GAO CRM — Authentication Middleware
 *
 * Extracts JWT from Authorization header or session cookie,
 * verifies it, and populates req.user.
 */
import type { MiddlewareHandler } from '@gao/http';
export declare function authMiddleware(): MiddlewareHandler;
export declare function requireRole(...roles: string[]): MiddlewareHandler;
//# sourceMappingURL=auth.middleware.d.ts.map