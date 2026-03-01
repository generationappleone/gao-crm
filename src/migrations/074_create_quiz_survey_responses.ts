import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateQuizSurveyResponsesTables: Migration = {
    name: '074_create_quiz_survey_responses',
    async up(d: DatabaseDriver) {
        // ── Quiz Responses ──
        await d.execute(`
            CREATE TABLE quiz_responses (
                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                landing_page_id UUID NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
                participant_name VARCHAR(200) NOT NULL,
                participant_email VARCHAR(300),
                answers         JSONB NOT NULL DEFAULT '[]',
                score           INTEGER NOT NULL DEFAULT 0,
                total_questions INTEGER NOT NULL DEFAULT 0,
                time_taken_ms   INTEGER,
                created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
        await d.execute('CREATE INDEX idx_qr_landing ON quiz_responses (landing_page_id)');
        await d.execute('CREATE INDEX idx_qr_score ON quiz_responses (landing_page_id, score DESC)');
        await d.execute('CREATE INDEX idx_qr_email ON quiz_responses (participant_email) WHERE participant_email IS NOT NULL');

        // ── Survey Responses ──
        await d.execute(`
            CREATE TABLE survey_responses (
                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                landing_page_id UUID NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
                respondent_name VARCHAR(200),
                respondent_email VARCHAR(300),
                answers         JSONB NOT NULL DEFAULT '[]',
                created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
        await d.execute('CREATE INDEX idx_sr_landing ON survey_responses (landing_page_id)');
        await d.execute('CREATE INDEX idx_sr_email ON survey_responses (respondent_email) WHERE respondent_email IS NOT NULL');
    },
    async down(d: DatabaseDriver) {
        await d.execute('DROP TABLE IF EXISTS survey_responses CASCADE');
        await d.execute('DROP TABLE IF EXISTS quiz_responses CASCADE');
    },
};
