import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateNotificationsTable: Migration = {
    name: '049_create_notifications',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(30) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT,
                entity_type VARCHAR(30),
                entity_id UUID,
                action_url VARCHAR(500),
                is_read BOOLEAN NOT NULL DEFAULT false,
                read_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT ck_n_type CHECK (type IN (
                    'deal_assigned', 'deal_won', 'deal_lost', 'ticket_assigned', 'ticket_reply',
                    'chat_waiting', 'mention', 'task_due', 'form_submitted', 'campaign_completed',
                    'system', 'custom'
                ))
            )
        `);
        await driver.execute('CREATE INDEX idx_n_user ON notifications (user_id, is_read, created_at DESC)');
        await driver.execute('CREATE INDEX idx_n_unread ON notifications (user_id) WHERE is_read = false');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS notifications CASCADE');
    },
};
