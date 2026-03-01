export const CreateCompaniesTable = {
    name: '002_create_companies',
    async up(driver) {
        await driver.execute(`
            CREATE TABLE companies (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                industry VARCHAR(100),
                website VARCHAR(500),
                phone VARCHAR(30),
                email VARCHAR(255),
                address TEXT,
                city VARCHAR(100),
                country VARCHAR(100),
                notes TEXT,
                employee_count INTEGER,
                annual_revenue DECIMAL(15, 2),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ
            )
        `);
        await driver.execute('CREATE INDEX idx_companies_name ON companies (name) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_companies_industry ON companies (industry) WHERE deleted_at IS NULL');
        await driver.execute('CREATE INDEX idx_companies_city ON companies (city) WHERE deleted_at IS NULL');
    },
    async down(driver) {
        await driver.execute('DROP TABLE IF EXISTS companies CASCADE');
    },
};
//# sourceMappingURL=002_create_companies.js.map