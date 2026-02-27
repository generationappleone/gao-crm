/**
 * GAO CRM — Authentication Service
 *
 * Handles login, password verification, JWT generation, and user lookup.
 */

import { JwtService, hashPassword, verifyPassword } from '@gao/security';
import { User } from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'gao-crm-dev-secret-change-in-production';
const secretKey = new TextEncoder().encode(JWT_SECRET);

const jwt = new JwtService({
    secretKey,
    accessTokenTtl: '15m',
    refreshTokenTtl: '7d',
});

export interface LoginResult {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        avatar_url: string | undefined;
    };
}

export class AuthService {
    async login(email: string, password: string): Promise<LoginResult> {
        const user = await User.where('email', email).whereNull('deleted_at').first();

        if (!user) {
            throw new Error('Invalid email or password');
        }

        if (!user.is_active) {
            throw new Error('Account is deactivated');
        }

        const isValid = await verifyPassword(user.password, password);
        if (!isValid) {
            throw new Error('Invalid email or password');
        }

        // Update last login
        user.last_login_at = new Date().toISOString();
        user.updated_at = new Date().toISOString();
        await user.save();

        const tokens = await jwt.generateTokens(user.id, { role: user.role });

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar_url: user.avatar_url,
            },
        };
    }

    async getUserById(userId: string): Promise<User | null> {
        return User.where('id', userId).whereNull('deleted_at').first();
    }

    async verifyToken(token: string): Promise<{ sub: string; role: string }> {
        const payload = await jwt.verify(token);
        return { sub: payload.sub as string, role: payload.role as string };
    }

    async hashUserPassword(plainPassword: string): Promise<string> {
        return hashPassword(plainPassword);
    }
}
