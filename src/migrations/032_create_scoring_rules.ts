import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateScoringRulesTable: Migration = {
    name: '032_create_scoring_rules',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE scoring_rules (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                entity_type VARCHAR(20) NOT NULL DEFAULT 'contact',
                category VARCHAR(30) NOT NULL,
                condition_field VARCHAR(100) NOT NULL,
                condition_operator VARCHAR(20) NOT NULL,
                condition_value TEXT NOT NULL,
                score_delta INTEGER NOT NULL DEFAULT 0,
                is_active BOOLEAN NOT NULL DEFAULT true,
                display_order INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT ck_sr_entity CHECK (entity_type IN ('contact', 'company', 'deal')),
                CONSTRAINT ck_sr_category CHECK (category IN ('demographic', 'behavioral', 'engagement', 'firmographic', 'custom')),
                CONSTRAINT ck_sr_operator CHECK (condition_operator IN ('equals', 'not_equals', 'contains', 'gt', 'lt', 'gte', 'lte', 'is_set', 'is_not_set', 'in'))
            )
        `);
        await driver.execute('CREATE INDEX idx_sr_entity ON scoring_rules (entity_type) WHERE deleted_at IS NULL AND is_active = true');
        await driver.execute('CREATE INDEX idx_sr_category ON scoring_rules (category) WHERE deleted_at IS NULL');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS scoring_rules CASCADE');
    },
};
