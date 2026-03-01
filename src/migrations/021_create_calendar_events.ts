import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateCalendarEventsTable: Migration = {
    name: '021_create_calendar_events',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE calendar_events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
                deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                event_type VARCHAR(30) NOT NULL DEFAULT 'meeting',
                location VARCHAR(500),
                meeting_url VARCHAR(500),
                start_at TIMESTAMPTZ NOT NULL,
                end_at TIMESTAMPTZ NOT NULL,
                is_all_day BOOLEAN NOT NULL DEFAULT false,
                color VARCHAR(7),
                reminder_minutes INTEGER,
                recurrence_rule TEXT,
                status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT ck_ce_type CHECK (event_type IN ('meeting', 'call', 'task', 'deadline', 'follow_up', 'demo', 'other')),
                CONSTRAINT ck_ce_status CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
                CONSTRAINT ck_ce_dates CHECK (end_at >= start_at)
            )
        `);
        await driver.execute('CREATE INDEX idx_ce_owner ON calendar_events (owner_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_ce_contact ON calendar_events (contact_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_ce_deal ON calendar_events (deal_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_ce_start ON calendar_events (start_at) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_ce_range ON calendar_events (start_at, end_at) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_ce_type ON calendar_events (event_type) WHERE deleted_at IS NULL');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS calendar_events CASCADE');
    },
};
