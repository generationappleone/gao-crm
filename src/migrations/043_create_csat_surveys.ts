import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateCsatSurveysTable: Migration = {
    name: '043_create_csat_surveys',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE csat_surveys (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                type VARCHAR(10) NOT NULL DEFAULT 'csat',
                trigger_event VARCHAR(30) NOT NULL DEFAULT 'ticket_closed',
                question TEXT NOT NULL DEFAULT 'How satisfied are you with our support?',
                is_active BOOLEAN NOT NULL DEFAULT true,
                total_responses INTEGER NOT NULL DEFAULT 0,
                average_score DECIMAL(3,2) NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT ck_cs_type CHECK (type IN ('csat', 'nps', 'ces')),
                CONSTRAINT ck_cs_trigger CHECK (trigger_event IN ('ticket_closed', 'chat_ended', 'deal_won', 'manual'))
            )
        `);
        await driver.execute('CREATE INDEX idx_cs_active ON csat_surveys (is_active) WHERE deleted_at IS NULL');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS csat_surveys CASCADE');
    },
};
