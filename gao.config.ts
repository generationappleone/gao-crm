import { defineConfig } from '@gao/core';

export default defineConfig({
    app: {
        name: 'GAO CRM',
        port: 3000,
        environment: 'development',
        debug: true,
    },
    database: {
        driver: 'postgres',
        host: 'localhost',
        port: 5432,
        database: 'gaocrm',
        user: 'postgres',
        password: process.env.DB_PASSWORD ?? 'root',
    },
    security: {
        cors: { origin: '*' },
        rateLimit: { windowMs: 60_000, maxRequests: 100 },
    },
});
