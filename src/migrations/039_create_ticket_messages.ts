import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateTicketMessagesTable: Migration = {
    name: '039_create_ticket_messages',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE ticket_messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
                sender_type VARCHAR(10) NOT NULL,
                sender_id UUID,
                content TEXT NOT NULL,
                is_internal BOOLEAN NOT NULL DEFAULT false,
                attachments JSONB,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_tm_sender CHECK (sender_type IN ('agent', 'contact', 'system'))
            )
        `);
        await driver.execute('CREATE INDEX idx_tm_ticket ON ticket_messages (ticket_id, created_at ASC)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS ticket_messages CASCADE');
    },
};
