export const CreateNotesTable = {
    name: '007_create_notes',
    async up(driver) {
        await driver.execute(`
            CREATE TABLE notes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                notable_type VARCHAR(20) NOT NULL,
                notable_id UUID NOT NULL,
                author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                content TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT ck_notes_notable_type CHECK (notable_type IN ('contact', 'deal'))
            )
        `);
        await driver.execute('CREATE INDEX idx_notes_notable ON notes (notable_type, notable_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_notes_author ON notes (author_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_notes_created ON notes (created_at DESC) WHERE deleted_at IS NULL');
    },
    async down(driver) {
        await driver.execute('DROP TABLE IF EXISTS notes CASCADE');
    },
};
//# sourceMappingURL=007_create_notes.js.map