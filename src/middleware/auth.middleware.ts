/**
 * GAO CRM — Authentication Middleware
 *
 * Extracts JWT from Authorization header or session cookie,
 * verifies it, and populates req.user.
 */

import type { GaoRequest, GaoResponse, MiddlewareHandler } from '@gao/http';
import { AuthService } from '../services/auth.service.js';

const authService = new AuthService();

// Routes that don't require authentication
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout', '/health'];

export function authMiddleware(): MiddlewareHandler {
    return async (req: GaoRequest, res: GaoResponse, next) => {
        // Skip auth for public routes
        const pathname = req.url.pathname;
        if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
            return next();
        }

        // Try Bearer token first
        const authHeader = req.header('authorization');
        let token: string | undefined;

        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }

        // Fallback: check session
        if (!token && req.session) {
            token = req.session.get('accessToken') as string | undefined;
        }

        if (!token) {
            // For HTML pages, redirect to login
            const acceptHeader = req.header('accept') ?? '';
            if (acceptHeader.includes('text/html')) {
                return res.redirect('/login');
            }
            return res.error(401, 'UNAUTHORIZED', 'Authentication required');
        }

        try {
            const payload = await authService.verifyToken(token);
            const user = await authService.getUserById(payload.sub);

            if (!user || !user.is_active) {
                if ((req.header('accept') ?? '').includes('text/html')) {
                    return res.redirect('/login');
                }
                return res.error(401, 'UNAUTHORIZED', 'Invalid or expired token');
            }

            (req as any).user = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar_url: user.avatar_url,
            };

            return next();
        } catch {
            if ((req.header('accept') ?? '').includes('text/html')) {
                return res.redirect('/login');
            }
            return res.error(401, 'UNAUTHORIZED', 'Invalid or expired token');
        }
    };
}

export function requireRole(...roles: string[]): MiddlewareHandler {
    return async (req: GaoRequest, res: GaoResponse, next) => {
        const userRole = (req as any).user?.role as string | undefined;

        if (!userRole || !roles.includes(userRole)) {
            return res.error(403, 'FORBIDDEN', 'Insufficient permissions');
        }

        return next();
    };
}
