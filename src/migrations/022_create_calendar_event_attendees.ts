import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateCalendarEventAttendeesTable: Migration = {
    name: '022_create_calendar_event_attendees',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE calendar_event_attendees (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
                attendee_type VARCHAR(10) NOT NULL,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
                email VARCHAR(255),
                name VARCHAR(150),
                rsvp_status VARCHAR(20) NOT NULL DEFAULT 'pending',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_cea_type CHECK (attendee_type IN ('user', 'contact', 'external')),
                CONSTRAINT ck_cea_rsvp CHECK (rsvp_status IN ('pending', 'accepted', 'declined', 'tentative'))
            )
        `);
        await driver.execute('CREATE INDEX idx_cea_event ON calendar_event_attendees (event_id)');
        await driver.execute('CREATE INDEX idx_cea_user ON calendar_event_attendees (user_id)');
        await driver.execute('CREATE INDEX idx_cea_contact ON calendar_event_attendees (contact_id)');
        await driver.execute('CREATE UNIQUE INDEX uq_cea_event_user ON calendar_event_attendees (event_id, user_id) WHERE user_id IS NOT NULL');
        await driver.execute('CREATE UNIQUE INDEX uq_cea_event_contact ON calendar_event_attendees (event_id, contact_id) WHERE contact_id IS NOT NULL');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS calendar_event_attendees CASCADE');
    },
};
