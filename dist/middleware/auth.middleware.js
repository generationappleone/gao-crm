/**
 * GAO CRM — Authentication Middleware
 *
 * Extracts JWT from Authorization header or session cookie,
 * verifies it, and populates req.user.
 */
import { AuthService } from '../services/auth.service.js';
const authService = new AuthService();
// Routes that don't require authentication
// Exact paths or specific prefixes — NOT broad prefixes that expose admin CRUD
const PUBLIC_EXACT = ['/gaocrm/admin-panel/login', '/gaocrm/admin-panel/api/auth/login', '/gaocrm/admin-panel/api/auth/logout', '/gaocrm/admin-panel/health', '/health'];
const PUBLIC_PREFIXES = [
    '/gaocrm/admin-panel/api/email/track', // Open tracking pixel
    '/gaocrm/admin-panel/api/tracking', // Web tracking (visitor JS snippet)
    '/gaocrm/admin-panel/api/forms', // Public form submission + embed
    '/gaocrm/admin-panel/api/chat/sessions', // Chat start + visitor messages (POST only gated in controller)
    '/gaocrm/admin-panel/api/kb/articles/slug/', // Public KB article by slug
    '/gaocrm/admin-panel/api/csat/surveys/', // Public CSAT response submission (POST /:id/respond)
    '/gaocrm/admin-panel/api/portal/auth/', // Client portal login (separate auth)
    '/gaocrm/admin-panel/api/payments/webhook', // Payment gateway webhooks (Midtrans, Xendit, Stripe)
];
export function authMiddleware() {
    return async (req, res, next) => {
        // Skip auth for public routes
        const pathname = req.url.pathname;
        if (PUBLIC_EXACT.includes(pathname)) {
            return next();
        }
        if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
            return next();
        }
        // Try Bearer token first
        const authHeader = req.header('authorization');
        let token;
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }
        // Fallback: check session
        if (!token && req.session) {
            token = req.session.get('accessToken');
        }
        if (!token) {
            // For HTML pages, redirect to login
            const acceptHeader = req.header('accept') ?? '';
            if (acceptHeader.includes('text/html')) {
                return res.redirect('/gaocrm/admin-panel/login');
            }
            return res.error(401, 'UNAUTHORIZED', 'Authentication required');
        }
        try {
            const payload = await authService.verifyToken(token);
            const user = await authService.getUserById(payload.sub);
            if (!user || !user.is_active) {
                if ((req.header('accept') ?? '').includes('text/html')) {
                    return res.redirect('/gaocrm/admin-panel/login');
                }
                return res.error(401, 'UNAUTHORIZED', 'Invalid or expired token');
            }
            req.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar_url: user.avatar_url,
            };
            return next();
        }
        catch {
            if ((req.header('accept') ?? '').includes('text/html')) {
                return res.redirect('/gaocrm/admin-panel/login');
            }
            return res.error(401, 'UNAUTHORIZED', 'Invalid or expired token');
        }
    };
}
export function requireRole(...roles) {
    return async (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !roles.includes(userRole)) {
            return res.error(403, 'FORBIDDEN', 'Insufficient permissions');
        }
        return next();
    };
}
//# sourceMappingURL=auth.middleware.js.map