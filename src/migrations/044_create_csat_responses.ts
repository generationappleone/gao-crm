import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateCsatResponsesTable: Migration = {
    name: '044_create_csat_responses',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE csat_responses (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                survey_id UUID NOT NULL REFERENCES csat_surveys(id) ON DELETE CASCADE,
                contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
                ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
                chat_session_id UUID REFERENCES live_chat_sessions(id) ON DELETE SET NULL,
                score INTEGER NOT NULL,
                comment TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_cr_score CHECK (score >= 0 AND score <= 10)
            )
        `);
        await driver.execute('CREATE INDEX idx_cr_survey ON csat_responses (survey_id)');
        await driver.execute('CREATE INDEX idx_csat_resp_contact ON csat_responses (contact_id)');
        await driver.execute('CREATE INDEX idx_cr_created ON csat_responses (created_at)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS csat_responses CASCADE');
    },
};
