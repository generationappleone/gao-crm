var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Post, Get } from '@gao/http';
import { AuthService } from '../../services/auth.service.js';
const authService = new AuthService();
let AuthApiController = class AuthApiController {
    async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.error(422, 'VALIDATION', 'Email and password are required');
        }
        try {
            const result = await authService.login(email, password);
            // Store token in session for page-based auth
            req.session?.set('accessToken', result.accessToken);
            req.session?.set('userId', result.user.id);
            return res.json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            return res.error(401, 'AUTH_FAILED', message);
        }
    }
    async logout(req, res) {
        req.session?.set('accessToken', null);
        req.session?.set('userId', null);
        return res.json({ message: 'Logged out successfully' });
    }
    async me(req, res) {
        if (!req.user) {
            return res.error(401, 'UNAUTHORIZED', 'Not authenticated');
        }
        return res.json(req.user);
    }
};
__decorate([
    Post('/login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], AuthApiController.prototype, "login", null);
__decorate([
    Post('/logout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], AuthApiController.prototype, "logout", null);
__decorate([
    Get('/me'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], AuthApiController.prototype, "me", null);
AuthApiController = __decorate([
    Controller('/api/auth')
], AuthApiController);
export { AuthApiController };
//# sourceMappingURL=auth.api.controller.js.map