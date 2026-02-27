/**
 * GAO CRM — Authentication Service
 *
 * Handles login, password verification, JWT generation, and user lookup.
 */
import { User } from '../models/user.model.js';
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
export declare class AuthService {
    login(email: string, password: string): Promise<LoginResult>;
    getUserById(userId: string): Promise<User | null>;
    verifyToken(token: string): Promise<{
        sub: string;
        role: string;
    }>;
    hashUserPassword(plainPassword: string): Promise<string>;
}
//# sourceMappingURL=auth.service.d.ts.map