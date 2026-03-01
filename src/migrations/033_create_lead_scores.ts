import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateLeadScoresTable: Migration = {
    name: '033_create_lead_scores',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE lead_scores (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                entity_type VARCHAR(20) NOT NULL,
                entity_id UUID NOT NULL,
                total_score INTEGER NOT NULL DEFAULT 0,
                demographic_score INTEGER NOT NULL DEFAULT 0,
                behavioral_score INTEGER NOT NULL DEFAULT 0,
                engagement_score INTEGER NOT NULL DEFAULT 0,
                grade VARCHAR(2),
                last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                score_breakdown JSONB,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_ls_entity CHECK (entity_type IN ('contact', 'company', 'deal')),
                CONSTRAINT ck_ls_grade CHECK (grade IS NULL OR grade IN ('A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'))
            )
        `);
        await driver.execute('CREATE UNIQUE INDEX uq_ls_entity ON lead_scores (entity_type, entity_id)');
        await driver.execute('CREATE INDEX idx_ls_total ON lead_scores (total_score DESC)');
        await driver.execute('CREATE INDEX idx_ls_grade ON lead_scores (grade)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS lead_scores CASCADE');
    },
};
