/**
 * GAO CRM — Database Seeder
 *
 * Seeds the database with default data (deal stages, admin user)
 * and sample CRM data for development/demo purposes.
 *
 * Usage:
 *   pnpm seed
 */

import { PostgresDriver } from '@gao/orm';
import { hashPassword } from '@gao/security';

async function main() {
    const driver = new PostgresDriver({
        host: 'localhost',
        port: 5432,
        database: 'gaocrm',
        user: 'postgres',
        password: process.env.DB_PASSWORD ?? 'root',
    });

    await driver.connect();
    console.log('✅ Connected to PostgreSQL');

    // ─── 1. Deal Stages (Configuration Data) ─────────────────
    console.log('\n📊 Seeding deal stages...');
    const stages = [
        { id: crypto.randomUUID(), name: 'Lead', slug: 'lead', display_order: 1, color: '#94a3b8', is_won: false, is_lost: false },
        { id: crypto.randomUUID(), name: 'Qualified', slug: 'qualified', display_order: 2, color: '#3b82f6', is_won: false, is_lost: false },
        { id: crypto.randomUUID(), name: 'Proposal', slug: 'proposal', display_order: 3, color: '#8b5cf6', is_won: false, is_lost: false },
        { id: crypto.randomUUID(), name: 'Negotiation', slug: 'negotiation', display_order: 4, color: '#f59e0b', is_won: false, is_lost: false },
        { id: crypto.randomUUID(), name: 'Won', slug: 'won', display_order: 5, color: '#22c55e', is_won: true, is_lost: false },
        { id: crypto.randomUUID(), name: 'Lost', slug: 'lost', display_order: 6, color: '#ef4444', is_won: false, is_lost: true },
    ];

    for (const stage of stages) {
        await driver.execute(
            `INSERT INTO deal_stages (id, name, slug, display_order, color, is_won, is_lost)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (slug) DO NOTHING`,
            [stage.id, stage.name, stage.slug, stage.display_order, stage.color, stage.is_won, stage.is_lost],
        );
    }
    console.log(`   ✅ ${stages.length} deal stages seeded`);

    // ─── 2. Users ─────────────────────────────────────────────
    console.log('\n👤 Seeding users...');
    const adminPassword = await hashPassword('password123');
    const users = [
        { id: crypto.randomUUID(), email: 'admin@gaocrm.com', name: 'Administrator', password: adminPassword, role: 'admin' },
        { id: crypto.randomUUID(), email: 'manager@gaocrm.com', name: 'Sarah Manager', password: adminPassword, role: 'sales_manager' },
        { id: crypto.randomUUID(), email: 'sales@gaocrm.com', name: 'Budi Sales', password: adminPassword, role: 'sales_rep' },
    ];

    for (const user of users) {
        await driver.execute(
            `INSERT INTO users (id, email, name, password, role)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (email) DO NOTHING`,
            [user.id, user.email, user.name, user.password, user.role],
        );
    }
    console.log(`   ✅ ${users.length} users seeded (password: password123)`);

    // ─── 3. Companies ─────────────────────────────────────────
    console.log('\n🏢 Seeding companies...');
    const companies = [
        { id: crypto.randomUUID(), name: 'PT Maju Jaya Teknologi', industry: 'Technology', city: 'Jakarta', country: 'Indonesia', employee_count: 150, annual_revenue: 25000000000 },
        { id: crypto.randomUUID(), name: 'CV Nusantara Digital', industry: 'E-Commerce', city: 'Bandung', country: 'Indonesia', employee_count: 45, annual_revenue: 8000000000 },
        { id: crypto.randomUUID(), name: 'PT Sentosa Abadi', industry: 'Manufacturing', city: 'Surabaya', country: 'Indonesia', employee_count: 320, annual_revenue: 50000000000 },
        { id: crypto.randomUUID(), name: 'Kreatif Studio Indonesia', industry: 'Creative Agency', city: 'Yogyakarta', country: 'Indonesia', employee_count: 25, annual_revenue: 3000000000 },
        { id: crypto.randomUUID(), name: 'PT Global Energi Mandiri', industry: 'Energy', city: 'Balikpapan', country: 'Indonesia', employee_count: 200, annual_revenue: 100000000000 },
    ];

    for (const company of companies) {
        await driver.execute(
            `INSERT INTO companies (id, name, industry, city, country, employee_count, annual_revenue)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [company.id, company.name, company.industry, company.city, company.country, company.employee_count, company.annual_revenue],
        );
    }
    console.log(`   ✅ ${companies.length} companies seeded`);

    // ─── 4. Contacts ──────────────────────────────────────────
    console.log('\n👥 Seeding contacts...');
    const ownerId = users[2]!.id; // Budi Sales
    const contacts = [
        { id: crypto.randomUUID(), company_id: companies[0]!.id, owner_id: ownerId, first_name: 'Andi', last_name: 'Wijaya', email: 'andi@majujaya.com', phone: '+6281234567890', position: 'CTO', status: 'customer' },
        { id: crypto.randomUUID(), company_id: companies[0]!.id, owner_id: ownerId, first_name: 'Sari', last_name: 'Dewi', email: 'sari@majujaya.com', phone: '+6281234567891', position: 'VP Engineering', status: 'customer' },
        { id: crypto.randomUUID(), company_id: companies[1]!.id, owner_id: ownerId, first_name: 'Rudi', last_name: 'Hartono', email: 'rudi@nusantara.com', phone: '+6281234567892', position: 'CEO', status: 'prospect' },
        { id: crypto.randomUUID(), company_id: companies[1]!.id, owner_id: ownerId, first_name: 'Mega', last_name: 'Putri', email: 'mega@nusantara.com', phone: '+6281234567893', position: 'Marketing Director', status: 'lead' },
        { id: crypto.randomUUID(), company_id: companies[2]!.id, owner_id: users[1]!.id, first_name: 'Bambang', last_name: 'Susanto', email: 'bambang@sentosa.com', phone: '+6281234567894', position: 'CFO', status: 'prospect' },
        { id: crypto.randomUUID(), company_id: companies[2]!.id, owner_id: users[1]!.id, first_name: 'Lina', last_name: 'Marlina', email: 'lina@sentosa.com', phone: '+6281234567895', position: 'Procurement Manager', status: 'customer' },
        { id: crypto.randomUUID(), company_id: companies[3]!.id, owner_id: ownerId, first_name: 'Deni', last_name: 'Prasetyo', email: 'deni@kreatifstudio.com', phone: '+6281234567896', position: 'Creative Director', status: 'lead' },
        { id: crypto.randomUUID(), company_id: companies[3]!.id, owner_id: ownerId, first_name: 'Fitri', last_name: 'Anggraeni', email: 'fitri@kreatifstudio.com', phone: '+6281234567897', position: 'Project Manager', status: 'lead' },
        { id: crypto.randomUUID(), company_id: companies[4]!.id, owner_id: users[1]!.id, first_name: 'Agus', last_name: 'Setiawan', email: 'agus@globalenergi.com', phone: '+6281234567898', position: 'Operations Director', status: 'prospect' },
        { id: crypto.randomUUID(), company_id: companies[4]!.id, owner_id: users[1]!.id, first_name: 'Rina', last_name: 'Wulandari', email: 'rina@globalenergi.com', phone: '+6281234567899', position: 'IT Manager', status: 'customer' },
        { id: crypto.randomUUID(), company_id: null, owner_id: ownerId, first_name: 'Hendra', last_name: 'Gunawan', email: 'hendra.gunawan@gmail.com', phone: '+6281234567800', position: 'Freelance Consultant', status: 'lead' },
        { id: crypto.randomUUID(), company_id: null, owner_id: ownerId, first_name: 'Yuni', last_name: 'Rahayu', email: 'yuni.rahayu@outlook.com', phone: '+6281234567801', position: 'Startup Founder', status: 'prospect' },
    ];

    for (const contact of contacts) {
        await driver.execute(
            `INSERT INTO contacts (id, company_id, owner_id, first_name, last_name, email, phone, position, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [contact.id, contact.company_id, contact.owner_id, contact.first_name, contact.last_name, contact.email, contact.phone, contact.position, contact.status],
        );
    }
    console.log(`   ✅ ${contacts.length} contacts seeded`);

    // ─── 5. Deals ─────────────────────────────────────────────
    console.log('\n💰 Seeding deals...');
    // Get stage IDs
    const stageRows = await driver.query<{ id: string; slug: string }>('SELECT id, slug FROM deal_stages');
    const stageBySlug = new Map(stageRows.map(s => [s.slug, s.id]));

    const deals = [
        { id: crypto.randomUUID(), contact_id: contacts[0]!.id, company_id: companies[0]!.id, owner_id: ownerId, stage_id: stageBySlug.get('won')!, title: 'Enterprise SaaS License', value: 150000000, probability: 100, won_at: new Date().toISOString() },
        { id: crypto.randomUUID(), contact_id: contacts[2]!.id, company_id: companies[1]!.id, owner_id: ownerId, stage_id: stageBySlug.get('proposal')!, title: 'E-Commerce Platform Build', value: 80000000, probability: 50 },
        { id: crypto.randomUUID(), contact_id: contacts[4]!.id, company_id: companies[2]!.id, owner_id: users[1]!.id, stage_id: stageBySlug.get('negotiation')!, title: 'ERP System Implementation', value: 500000000, probability: 70 },
        { id: crypto.randomUUID(), contact_id: contacts[6]!.id, company_id: companies[3]!.id, owner_id: ownerId, stage_id: stageBySlug.get('lead')!, title: 'Brand Identity Package', value: 25000000, probability: 10 },
        { id: crypto.randomUUID(), contact_id: contacts[8]!.id, company_id: companies[4]!.id, owner_id: users[1]!.id, stage_id: stageBySlug.get('qualified')!, title: 'IoT Monitoring Dashboard', value: 200000000, probability: 30 },
        { id: crypto.randomUUID(), contact_id: contacts[1]!.id, company_id: companies[0]!.id, owner_id: ownerId, stage_id: stageBySlug.get('won')!, title: 'API Integration Project', value: 75000000, probability: 100, won_at: new Date().toISOString() },
        { id: crypto.randomUUID(), contact_id: contacts[5]!.id, company_id: companies[2]!.id, owner_id: users[1]!.id, stage_id: stageBySlug.get('lost')!, title: 'Supply Chain Optimization', value: 300000000, probability: 0, lost_at: new Date().toISOString(), lost_reason: 'Budget constraints' },
        { id: crypto.randomUUID(), contact_id: contacts[10]!.id, company_id: null, owner_id: ownerId, stage_id: stageBySlug.get('lead')!, title: 'Consulting Retainer', value: 15000000, probability: 5 },
        { id: crypto.randomUUID(), contact_id: contacts[9]!.id, company_id: companies[4]!.id, owner_id: users[1]!.id, stage_id: stageBySlug.get('proposal')!, title: 'Cloud Migration Service', value: 120000000, probability: 45 },
        { id: crypto.randomUUID(), contact_id: contacts[3]!.id, company_id: companies[1]!.id, owner_id: ownerId, stage_id: stageBySlug.get('qualified')!, title: 'Mobile App Development', value: 60000000, probability: 25 },
    ];

    for (const deal of deals) {
        await driver.execute(
            `INSERT INTO deals (id, contact_id, company_id, owner_id, stage_id, title, value, probability${deal.won_at ? ', won_at' : ''}${deal.lost_at ? ', lost_at, lost_reason' : ''})
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8${deal.won_at ? ', $9' : ''}${deal.lost_at ? `, $${deal.won_at ? 10 : 9}, $${deal.won_at ? 11 : 10}` : ''})`,
            [
                deal.id, deal.contact_id, deal.company_id, deal.owner_id, deal.stage_id,
                deal.title, deal.value, deal.probability,
                ...(deal.won_at ? [deal.won_at] : []),
                ...(deal.lost_at ? [deal.lost_at, deal.lost_reason] : []),
            ],
        );
    }
    console.log(`   ✅ ${deals.length} deals seeded`);

    // ─── 6. Activities ────────────────────────────────────────
    console.log('\n📋 Seeding activities...');
    const activities = [
        { id: crypto.randomUUID(), contact_id: contacts[0]!.id, deal_id: deals[0]!.id, owner_id: ownerId, type: 'call', subject: 'Initial discovery call with Andi', is_completed: true },
        { id: crypto.randomUUID(), contact_id: contacts[0]!.id, deal_id: deals[0]!.id, owner_id: ownerId, type: 'meeting', subject: 'Product demo for PT Maju Jaya', is_completed: true },
        { id: crypto.randomUUID(), contact_id: contacts[2]!.id, deal_id: deals[1]!.id, owner_id: ownerId, type: 'email', subject: 'Sent proposal document to Rudi', is_completed: true },
        { id: crypto.randomUUID(), contact_id: contacts[4]!.id, deal_id: deals[2]!.id, owner_id: users[1]!.id, type: 'meeting', subject: 'ERP requirements workshop', is_completed: true },
        { id: crypto.randomUUID(), contact_id: contacts[4]!.id, deal_id: deals[2]!.id, owner_id: users[1]!.id, type: 'task', subject: 'Prepare SOW for ERP project', is_completed: false },
        { id: crypto.randomUUID(), contact_id: contacts[6]!.id, deal_id: deals[3]!.id, owner_id: ownerId, type: 'call', subject: 'Follow up with Deni about brand project', is_completed: false },
        { id: crypto.randomUUID(), contact_id: contacts[8]!.id, deal_id: deals[4]!.id, owner_id: users[1]!.id, type: 'email', subject: 'IoT dashboard technical specs', is_completed: true },
        { id: crypto.randomUUID(), contact_id: contacts[1]!.id, deal_id: deals[5]!.id, owner_id: ownerId, type: 'meeting', subject: 'API integration kickoff meeting', is_completed: true },
        { id: crypto.randomUUID(), contact_id: contacts[10]!.id, deal_id: deals[7]!.id, owner_id: ownerId, type: 'call', subject: 'Hendra consultation schedule', is_completed: false },
        { id: crypto.randomUUID(), contact_id: contacts[9]!.id, deal_id: deals[8]!.id, owner_id: users[1]!.id, type: 'task', subject: 'Review cloud migration assessment', is_completed: false },
        { id: crypto.randomUUID(), contact_id: contacts[3]!.id, deal_id: deals[9]!.id, owner_id: ownerId, type: 'email', subject: 'Mobile app wireframes sent to Mega', is_completed: true },
        { id: crypto.randomUUID(), contact_id: null, deal_id: null, owner_id: ownerId, type: 'task', subject: 'Update CRM pipeline report', is_completed: false },
    ];

    for (const activity of activities) {
        await driver.execute(
            `INSERT INTO activities (id, contact_id, deal_id, owner_id, type, subject, is_completed)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [activity.id, activity.contact_id, activity.deal_id, activity.owner_id, activity.type, activity.subject, activity.is_completed],
        );
    }
    console.log(`   ✅ ${activities.length} activities seeded`);

    // ─── 7. Tags ──────────────────────────────────────────────
    console.log('\n🏷️  Seeding tags...');
    const tags = [
        { id: crypto.randomUUID(), name: 'Hot Lead', slug: 'hot-lead', color: '#ef4444' },
        { id: crypto.randomUUID(), name: 'VIP', slug: 'vip', color: '#f59e0b' },
        { id: crypto.randomUUID(), name: 'Follow Up', slug: 'follow-up', color: '#3b82f6' },
        { id: crypto.randomUUID(), name: 'Pending', slug: 'pending', color: '#8b5cf6' },
        { id: crypto.randomUUID(), name: 'Archived', slug: 'archived', color: '#64748b' },
    ];

    for (const tag of tags) {
        await driver.execute(
            `INSERT INTO tags (id, name, slug, color) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING`,
            [tag.id, tag.name, tag.slug, tag.color],
        );
    }
    console.log(`   ✅ ${tags.length} tags seeded`);

    // ─── 8. Tag Associations ──────────────────────────────────
    console.log('\n🔗 Seeding tag associations...');
    // Tag some contacts
    await driver.execute('INSERT INTO contacts_tags (contact_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [contacts[0]!.id, tags[1]!.id]); // VIP
    await driver.execute('INSERT INTO contacts_tags (contact_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [contacts[2]!.id, tags[0]!.id]); // Hot Lead
    await driver.execute('INSERT INTO contacts_tags (contact_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [contacts[6]!.id, tags[2]!.id]); // Follow Up

    // Tag some deals
    await driver.execute('INSERT INTO deals_tags (deal_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [deals[2]!.id, tags[0]!.id]); // Hot Lead
    await driver.execute('INSERT INTO deals_tags (deal_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [deals[4]!.id, tags[2]!.id]); // Follow Up
    console.log('   ✅ Tag associations seeded');

    console.log('\n═══════════════════════════════════════════');
    console.log('🎉 Database seeding complete!');
    console.log('═══════════════════════════════════════════');
    console.log(`   👤 Users:       ${users.length}  (login: admin@gaocrm.com / password123)`);
    console.log(`   🏢 Companies:   ${companies.length}`);
    console.log(`   👥 Contacts:    ${contacts.length}`);
    console.log(`   💰 Deals:       ${deals.length}`);
    console.log(`   📋 Activities:  ${activities.length}`);
    console.log(`   📊 Stages:      ${stages.length}`);
    console.log(`   🏷️  Tags:        ${tags.length}`);
    console.log('═══════════════════════════════════════════\n');

    await driver.disconnect();
}

main().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
