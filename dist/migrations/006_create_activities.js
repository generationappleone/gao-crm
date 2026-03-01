export const CreateActivitiesTable = {
    name: '006_create_activities',
    async up(driver) {
        await driver.execute(`
            CREATE TABLE activities (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
                deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
                owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                type VARCHAR(20) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                description TEXT,
                is_completed BOOLEAN NOT NULL DEFAULT false,
                due_at TIMESTAMPTZ,
                completed_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT ck_activities_type CHECK (type IN ('call', 'meeting', 'email', 'task', 'note'))
            )
        `);
        await driver.execute('CREATE INDEX idx_activities_contact ON activities (contact_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_activities_deal ON activities (deal_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_activities_owner ON activities (owner_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_activities_type ON activities (type) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_activities_completed ON activities (is_completed) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_activities_due ON activities (due_at) WHERE deleted_at IS NULL AND is_completed = false');
        await driver.execute('CREATE INDEX idx_activities_created ON activities (created_at DESC) WHERE deleted_at IS NULL');
    },
    async down(driver) {
        await driver.execute('DROP TABLE IF EXISTS activities CASCADE');
    },
};
//# sourceMappingURL=006_create_activities.js.map