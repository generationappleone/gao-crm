export const CreateUsersTable = {
    name: '001_create_users',
    async up(driver) {
        await driver.execute(`
            CREATE TABLE users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) NOT NULL,
                name VARCHAR(150) NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'sales_rep',
                avatar_url VARCHAR(500),
                is_active BOOLEAN NOT NULL DEFAULT true,
                last_login_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ,

                CONSTRAINT uq_users_email UNIQUE (email),
                CONSTRAINT ck_users_role CHECK (role IN ('admin', 'sales_manager', 'sales_rep'))
            );

            CREATE INDEX idx_users_email ON users (email) WHERE deleted_at IS NULL;
            CREATE INDEX idx_users_name ON users (name) WHERE deleted_at IS NULL;
            CREATE INDEX idx_users_role ON users (role) WHERE deleted_at IS NULL;
        `);
    },
    async down(driver) {
        await driver.execute('DROP TABLE IF EXISTS users CASCADE');
    },
};
//# sourceMappingURL=001_create_users.js.map