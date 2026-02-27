import { Controller, Post, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { AuthService } from '../../services/auth.service.js';

const authService = new AuthService();

@Controller('/api/auth')
export class AuthApiController {

    @Post('/login')
    async login(req: GaoRequest, res: GaoResponse) {
        const { email, password } = req.body as { email?: string; password?: string };

        if (!email || !password) {
            return res.error(422, 'VALIDATION', 'Email and password are required');
        }

        try {
            const result = await authService.login(email, password);

            // Store token in session for page-based auth
            req.session?.set('accessToken', result.accessToken);
            req.session?.set('userId', result.user.id);

            return res.json(result);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            return res.error(401, 'AUTH_FAILED', message);
        }
    }

    @Post('/logout')
    async logout(req: GaoRequest, res: GaoResponse) {
        req.session?.set('accessToken', null);
        req.session?.set('userId', null);
        return res.json({ message: 'Logged out successfully' });
    }

    @Get('/me')
    async me(req: GaoRequest, res: GaoResponse) {
        if (!req.user) {
            return res.error(401, 'UNAUTHORIZED', 'Not authenticated');
        }
        return res.json(req.user);
    }
}
