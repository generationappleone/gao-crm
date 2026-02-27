/**
 * GAO CRM — Main Application Entry Point
 *
 * Uses createHttpHandler() + Server from @gao/http to wire controllers
 * and middleware, and GaoApplication from @gao/core for config & DI.
 */

import { createApp } from '@gao/core';
import {
    createHttpHandler,
    Server,
    bodyParserMiddleware,
    corsMiddleware,
    sessionMiddleware,
    errorHandlerMiddleware,
} from '@gao/http';
import { setModelDriver, PostgresDriver } from '@gao/orm';

// Middleware
import { authMiddleware } from './middleware/auth.middleware.js';

// Page Controllers
import { AuthController } from './controllers/auth.controller.js';
import { DashboardController } from './controllers/dashboard.controller.js';
import { ContactController } from './controllers/contact.controller.js';
import { CompanyController } from './controllers/company.controller.js';
import { DealController } from './controllers/deal.controller.js';
import { ActivityController } from './controllers/activity.controller.js';

// API Controllers
import { AuthApiController } from './controllers/api/auth.api.controller.js';
import { ContactApiController } from './controllers/api/contact.api.controller.js';
import { CompanyApiController } from './controllers/api/company.api.controller.js';
import { DealApiController } from './controllers/api/deal.api.controller.js';
import { ActivityApiController } from './controllers/api/activity.api.controller.js';
import { NoteApiController } from './controllers/api/note.api.controller.js';
import { TagApiController } from './controllers/api/tag.api.controller.js';
import { DashboardApiController } from './controllers/api/dashboard.api.controller.js';

async function main() {
    const app = createApp();
    await app.boot();

    // ─── Database ────────────────────────────────────────────
    const driver = new PostgresDriver({
        host: 'localhost',
        port: 5432,
        database: 'gaocrm',
        user: 'postgres',
        password: process.env.DB_PASSWORD ?? 'root',
    });
    await driver.connect();
    setModelDriver(driver, 'postgres');
    console.log('✅ Database connected');

    // ─── HTTP Handler ────────────────────────────────────────
    const handler = createHttpHandler({
        container: app.container,
        controllers: [
            AuthController,
            AuthApiController,
            DashboardController,
            ContactController,
            CompanyController,
            DealController,
            ActivityController,
            ContactApiController,
            CompanyApiController,
            DealApiController,
            ActivityApiController,
            NoteApiController,
            TagApiController,
            DashboardApiController,
        ],
        middlewares: [
            errorHandlerMiddleware(),
            corsMiddleware({ origin: '*' }),
            bodyParserMiddleware(),
            sessionMiddleware({ cookieName: 'gao_crm_session', ttl: 86400 }),
            authMiddleware(),
        ],
    });

    // ─── Server ──────────────────────────────────────────────
    const port = app.config.app.port ?? 3000;
    const server = new Server(handler, { port });
    await server.listen();

    console.log(`🚀 GAO CRM running at http://localhost:${port}`);
    console.log(`📋 Dashboard: http://localhost:${port}/`);
    console.log(`🔐 Login: http://localhost:${port}/login`);
}

main().catch((error) => {
    console.error('❌ Failed to start GAO CRM:', error);
    process.exit(1);
});
