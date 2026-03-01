import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateApprovalChainsTable: Migration = {
    name: '063_create_approval_chains',
    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE approval_chains (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(200) NOT NULL,
                entity_type VARCHAR(30) NOT NULL,
                conditions JSONB NOT NULL DEFAULT '{}',
                steps JSONB NOT NULL DEFAULT '[]',
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT ck_ac_entity CHECK (entity_type IN ('deal', 'quotation', 'invoice', 'discount'))
            )
        `);
    },
    async down(driver: DatabaseDriver) { await driver.execute('DROP TABLE IF EXISTS approval_chains CASCADE'); },
};
