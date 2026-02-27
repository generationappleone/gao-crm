export const CreateTagsTable = {
    name: '008_create_tags',
    async up(driver) {
        await driver.execute(`
            CREATE TABLE tags (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(50) NOT NULL,
                slug VARCHAR(60) NOT NULL,
                color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT uq_tags_slug UNIQUE (slug)
            );
        `);
    },
    async down(driver) {
        await driver.execute('DROP TABLE IF EXISTS tags CASCADE');
    },
};
//# sourceMappingURL=008_create_tags.js.map