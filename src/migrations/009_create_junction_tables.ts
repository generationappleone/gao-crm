import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateJunctionTables: Migration = {
    name: '009_create_junction_tables',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE contacts_tags (
                contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
                tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
                PRIMARY KEY (contact_id, tag_id)
            )
        `);
        await driver.execute('CREATE INDEX idx_contacts_tags_tag ON contacts_tags (tag_id)');

        await driver.execute(`
            CREATE TABLE deals_tags (
                deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
                tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
                PRIMARY KEY (deal_id, tag_id)
            )
        `);
        await driver.execute('CREATE INDEX idx_deals_tags_tag ON deals_tags (tag_id)');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS deals_tags CASCADE');
        await driver.execute('DROP TABLE IF EXISTS contacts_tags CASCADE');
    },
};
