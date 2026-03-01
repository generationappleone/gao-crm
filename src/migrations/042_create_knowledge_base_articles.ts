import type { Migration, DatabaseDriver } from '@gao/orm';

export const CreateKnowledgeBaseArticlesTable: Migration = {
    name: '042_create_knowledge_base_articles',

    async up(driver: DatabaseDriver) {
        await driver.execute(`
            CREATE TABLE knowledge_base_articles (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(500) NOT NULL,
                slug VARCHAR(600) NOT NULL,
                content TEXT NOT NULL,
                excerpt TEXT,
                category VARCHAR(100),
                author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                status VARCHAR(20) NOT NULL DEFAULT 'draft',
                is_featured BOOLEAN NOT NULL DEFAULT false,
                view_count INTEGER NOT NULL DEFAULT 0,
                helpful_count INTEGER NOT NULL DEFAULT 0,
                not_helpful_count INTEGER NOT NULL DEFAULT 0,
                display_order INTEGER NOT NULL DEFAULT 0,
                published_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT uq_kba_slug UNIQUE (slug),
                CONSTRAINT ck_kba_status CHECK (status IN ('draft', 'published', 'archived'))
            )
        `);
        await driver.execute('CREATE INDEX idx_kba_status ON knowledge_base_articles (status) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_kba_category ON knowledge_base_articles (category) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_kba_author ON knowledge_base_articles (author_id) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_kba_featured ON knowledge_base_articles (is_featured) WHERE deleted_at IS NULL AND status = \'published\'');
    },

    async down(driver: DatabaseDriver) {
        await driver.execute('DROP TABLE IF EXISTS knowledge_base_articles CASCADE');
    },
};
