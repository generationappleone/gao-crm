/**
 * GAO CRM — Migration Runner
 *
 * Usage:
 *   pnpm migrate          → Apply pending migrations
 *   pnpm migrate:fresh    → Reset and re-apply all migrations
 */
import { PostgresDriver, MigrationEngine } from '@gao/orm';
import { CreateUsersTable } from './migrations/001_create_users.js';
import { CreateCompaniesTable } from './migrations/002_create_companies.js';
import { CreateContactsTable } from './migrations/003_create_contacts.js';
import { CreateDealStagesTable } from './migrations/004_create_deal_stages.js';
import { CreateDealsTable } from './migrations/005_create_deals.js';
import { CreateActivitiesTable } from './migrations/006_create_activities.js';
import { CreateNotesTable } from './migrations/007_create_notes.js';
import { CreateTagsTable } from './migrations/008_create_tags.js';
import { CreateJunctionTables } from './migrations/009_create_junction_tables.js';
const migrations = [
    CreateUsersTable,
    CreateCompaniesTable,
    CreateContactsTable,
    CreateDealStagesTable,
    CreateDealsTable,
    CreateActivitiesTable,
    CreateNotesTable,
    CreateTagsTable,
    CreateJunctionTables,
];
async function main() {
    const driver = new PostgresDriver({
        host: 'localhost',
        port: 5432,
        database: 'gao_crm',
        user: 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
    });
    await driver.connect();
    console.log('✅ Connected to PostgreSQL');
    const engine = new MigrationEngine(driver);
    await engine.setup();
    const isFresh = process.argv.includes('--fresh');
    if (isFresh) {
        console.log('🔄 Fresh migration: resetting all...');
        const result = await engine.refresh(migrations);
        console.log(`↩️  Rolled back: ${result.rolledBack.length} migration(s)`);
        console.log(`✅ Applied: ${result.applied.length} migration(s)`);
    }
    else {
        const applied = await engine.up(migrations);
        if (applied.length === 0) {
            console.log('ℹ️  No pending migrations.');
        }
        else {
            console.log(`✅ Applied ${applied.length} migration(s):`);
            for (const m of applied) {
                console.log(`   → ${m}`);
            }
        }
    }
    // Show status
    const status = await engine.status(migrations);
    console.log('\n📋 Migration Status:');
    for (const s of status) {
        const icon = s.status === 'executed' ? '✅' : '⏳';
        console.log(`   ${icon} ${s.name} — ${s.status}${s.executedAt ? ` (${s.executedAt})` : ''}`);
    }
    await driver.disconnect();
    console.log('\n🏁 Done.');
}
main().catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map