import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateTranslationsTable: Migration = {
    name: '061_create_translations',
    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE translations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                locale VARCHAR(10) NOT NULL,
                namespace VARCHAR(50) NOT NULL DEFAULT 'common',
                key VARCHAR(200) NOT NULL,
                value TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT uq_tr_key UNIQUE (locale, namespace, key)
            )
        `);
        await driver.execute('CREATE INDEX idx_tr_locale ON translations (locale, namespace)');
    },
    async down(driver: DatabaseDriver) { await driver.execute('DROP TABLE IF EXISTS translations CASCADE'); },
};
