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
    // Get default pipeline ID
    const pipelineRows = await driver.query('SELECT id FROM pipelines WHERE is_default = true LIMIT 1');
    const defaultPipelineId = pipelineRows[0]?.id;
    if (!defaultPipelineId) {
        console.log('⚠️  No default pipeline found. Run migrations first.');
        await driver.disconnect();
        return;
    }
    console.log(`   📌 Default pipeline: ${defaultPipelineId}`);
    const stages = [
        { id: crypto.randomUUID(), pipeline_id: defaultPipelineId, name: 'Lead', slug: 'lead', display_order: 1, color: '#94a3b8', is_won: false, is_lost: false },
        { id: crypto.randomUUID(), pipeline_id: defaultPipelineId, name: 'Qualified', slug: 'qualified', display_order: 2, color: '#3b82f6', is_won: false, is_lost: false },
        { id: crypto.randomUUID(), pipeline_id: defaultPipelineId, name: 'Proposal', slug: 'proposal', display_order: 3, color: '#8b5cf6', is_won: false, is_lost: false },
        { id: crypto.randomUUID(), pipeline_id: defaultPipelineId, name: 'Negotiation', slug: 'negotiation', display_order: 4, color: '#f59e0b', is_won: false, is_lost: false },
        { id: crypto.randomUUID(), pipeline_id: defaultPipelineId, name: 'Won', slug: 'won', display_order: 5, color: '#22c55e', is_won: true, is_lost: false },
        { id: crypto.randomUUID(), pipeline_id: defaultPipelineId, name: 'Lost', slug: 'lost', display_order: 6, color: '#ef4444', is_won: false, is_lost: true },
    ];
    for (const stage of stages) {
        await driver.execute(`INSERT INTO deal_stages (id, pipeline_id, name, slug, display_order, color, is_won, is_lost)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (slug) DO UPDATE SET pipeline_id = $2`, [stage.id, stage.pipeline_id, stage.name, stage.slug, stage.display_order, stage.color, stage.is_won, stage.is_lost]);
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
        await driver.execute(`INSERT INTO users (id, email, name, password, role)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (email) DO NOTHING`, [user.id, user.email, user.name, user.password, user.role]);
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
        await driver.execute(`INSERT INTO companies (id, name, industry, city, country, employee_count, annual_revenue)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`, [company.id, company.name, company.industry, company.city, company.country, company.employee_count, company.annual_revenue]);
    }
    console.log(`   ✅ ${companies.length} companies seeded`);
    // ─── 4. Contacts ──────────────────────────────────────────
    console.log('\n👥 Seeding contacts...');
    const ownerId = users[2].id; // Budi Sales
    const contacts = [
        { id: crypto.randomUUID(), company_id: companies[0].id, owner_id: ownerId, first_name: 'Andi', last_name: 'Wijaya', email: 'andi@majujaya.com', phone: '+6281234567890', position: 'CTO', status: 'customer' },
        { id: crypto.randomUUID(), company_id: companies[0].id, owner_id: ownerId, first_name: 'Sari', last_name: 'Dewi', email: 'sari@majujaya.com', phone: '+6281234567891', position: 'VP Engineering', status: 'customer' },
        { id: crypto.randomUUID(), company_id: companies[1].id, owner_id: ownerId, first_name: 'Rudi', last_name: 'Hartono', email: 'rudi@nusantara.com', phone: '+6281234567892', position: 'CEO', status: 'prospect' },
        { id: crypto.randomUUID(), company_id: companies[1].id, owner_id: ownerId, first_name: 'Mega', last_name: 'Putri', email: 'mega@nusantara.com', phone: '+6281234567893', position: 'Marketing Director', status: 'lead' },
        { id: crypto.randomUUID(), company_id: companies[2].id, owner_id: users[1].id, first_name: 'Bambang', last_name: 'Susanto', email: 'bambang@sentosa.com', phone: '+6281234567894', position: 'CFO', status: 'prospect' },
        { id: crypto.randomUUID(), company_id: companies[2].id, owner_id: users[1].id, first_name: 'Lina', last_name: 'Marlina', email: 'lina@sentosa.com', phone: '+6281234567895', position: 'Procurement Manager', status: 'customer' },
        { id: crypto.randomUUID(), company_id: companies[3].id, owner_id: ownerId, first_name: 'Deni', last_name: 'Prasetyo', email: 'deni@kreatifstudio.com', phone: '+6281234567896', position: 'Creative Director', status: 'lead' },
        { id: crypto.randomUUID(), company_id: companies[3].id, owner_id: ownerId, first_name: 'Fitri', last_name: 'Anggraeni', email: 'fitri@kreatifstudio.com', phone: '+6281234567897', position: 'Project Manager', status: 'lead' },
        { id: crypto.randomUUID(), company_id: companies[4].id, owner_id: users[1].id, first_name: 'Agus', last_name: 'Setiawan', email: 'agus@globalenergi.com', phone: '+6281234567898', position: 'Operations Director', status: 'prospect' },
        { id: crypto.randomUUID(), company_id: companies[4].id, owner_id: users[1].id, first_name: 'Rina', last_name: 'Wulandari', email: 'rina@globalenergi.com', phone: '+6281234567899', position: 'IT Manager', status: 'customer' },
        { id: crypto.randomUUID(), company_id: null, owner_id: ownerId, first_name: 'Hendra', last_name: 'Gunawan', email: 'hendra.gunawan@gmail.com', phone: '+6281234567800', position: 'Freelance Consultant', status: 'lead' },
        { id: crypto.randomUUID(), company_id: null, owner_id: ownerId, first_name: 'Yuni', last_name: 'Rahayu', email: 'yuni.rahayu@outlook.com', phone: '+6281234567801', position: 'Startup Founder', status: 'prospect' },
    ];
    for (const contact of contacts) {
        await driver.execute(`INSERT INTO contacts (id, company_id, owner_id, first_name, last_name, email, phone, position, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [contact.id, contact.company_id, contact.owner_id, contact.first_name, contact.last_name, contact.email, contact.phone, contact.position, contact.status]);
    }
    console.log(`   ✅ ${contacts.length} contacts seeded`);
    // ─── 5. Deals ─────────────────────────────────────────────
    console.log('\n💰 Seeding deals...');
    // Get stage IDs
    const stageRows = await driver.query('SELECT id, slug FROM deal_stages');
    const stageBySlug = new Map(stageRows.map(s => [s.slug, s.id]));
    const deals = [
        { id: crypto.randomUUID(), contact_id: contacts[0].id, company_id: companies[0].id, owner_id: ownerId, pipeline_id: defaultPipelineId, stage_id: stageBySlug.get('won'), title: 'Enterprise SaaS License', value: 150000000, probability: 100, won_at: new Date().toISOString() },
        { id: crypto.randomUUID(), contact_id: contacts[2].id, company_id: companies[1].id, owner_id: ownerId, pipeline_id: defaultPipelineId, stage_id: stageBySlug.get('proposal'), title: 'E-Commerce Platform Build', value: 80000000, probability: 50 },
        { id: crypto.randomUUID(), contact_id: contacts[4].id, company_id: companies[2].id, owner_id: users[1].id, pipeline_id: defaultPipelineId, stage_id: stageBySlug.get('negotiation'), title: 'ERP System Implementation', value: 500000000, probability: 70 },
        { id: crypto.randomUUID(), contact_id: contacts[6].id, company_id: companies[3].id, owner_id: ownerId, pipeline_id: defaultPipelineId, stage_id: stageBySlug.get('lead'), title: 'Brand Identity Package', value: 25000000, probability: 10 },
        { id: crypto.randomUUID(), contact_id: contacts[8].id, company_id: companies[4].id, owner_id: users[1].id, pipeline_id: defaultPipelineId, stage_id: stageBySlug.get('qualified'), title: 'IoT Monitoring Dashboard', value: 200000000, probability: 30 },
        { id: crypto.randomUUID(), contact_id: contacts[1].id, company_id: companies[0].id, owner_id: ownerId, pipeline_id: defaultPipelineId, stage_id: stageBySlug.get('won'), title: 'API Integration Project', value: 75000000, probability: 100, won_at: new Date().toISOString() },
        { id: crypto.randomUUID(), contact_id: contacts[5].id, company_id: companies[2].id, owner_id: users[1].id, pipeline_id: defaultPipelineId, stage_id: stageBySlug.get('lost'), title: 'Supply Chain Optimization', value: 300000000, probability: 0, lost_at: new Date().toISOString(), lost_reason: 'Budget constraints' },
        { id: crypto.randomUUID(), contact_id: contacts[10].id, company_id: null, owner_id: ownerId, pipeline_id: defaultPipelineId, stage_id: stageBySlug.get('lead'), title: 'Consulting Retainer', value: 15000000, probability: 5 },
        { id: crypto.randomUUID(), contact_id: contacts[9].id, company_id: companies[4].id, owner_id: users[1].id, pipeline_id: defaultPipelineId, stage_id: stageBySlug.get('proposal'), title: 'Cloud Migration Service', value: 120000000, probability: 45 },
        { id: crypto.randomUUID(), contact_id: contacts[3].id, company_id: companies[1].id, owner_id: ownerId, pipeline_id: defaultPipelineId, stage_id: stageBySlug.get('qualified'), title: 'Mobile App Development', value: 60000000, probability: 25 },
    ];
    for (const deal of deals) {
        await driver.execute(`INSERT INTO deals (id, contact_id, company_id, owner_id, pipeline_id, stage_id, title, value, probability, position${deal.won_at ? ', won_at' : ''}${deal.lost_at ? ', lost_at, lost_reason' : ''})
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0${deal.won_at ? ', $10' : ''}${deal.lost_at ? `, $${deal.won_at ? 11 : 10}, $${deal.won_at ? 12 : 11}` : ''})`, [
            deal.id, deal.contact_id, deal.company_id, deal.owner_id, deal.pipeline_id, deal.stage_id,
            deal.title, deal.value, deal.probability,
            ...(deal.won_at ? [deal.won_at] : []),
            ...(deal.lost_at ? [deal.lost_at, deal.lost_reason] : []),
        ]);
    }
    console.log(`   ✅ ${deals.length} deals seeded`);
    // ─── 6. Activities ────────────────────────────────────────
    console.log('\n📋 Seeding activities...');
    const activities = [
        { id: crypto.randomUUID(), contact_id: contacts[0].id, deal_id: deals[0].id, owner_id: ownerId, type: 'call', subject: 'Initial discovery call with Andi', is_completed: true },
        { id: crypto.randomUUID(), contact_id: contacts[0].id, deal_id: deals[0].id, owner_id: ownerId, type: 'meeting', subject: 'Product demo for PT Maju Jaya', is_completed: true },
        { id: crypto.randomUUID(), contact_id: contacts[2].id, deal_id: deals[1].id, owner_id: ownerId, type: 'email', subject: 'Sent proposal document to Rudi', is_completed: true },
        { id: crypto.randomUUID(), contact_id: contacts[4].id, deal_id: deals[2].id, owner_id: users[1].id, type: 'meeting', subject: 'ERP requirements workshop', is_completed: true },
        { id: crypto.randomUUID(), contact_id: contacts[4].id, deal_id: deals[2].id, owner_id: users[1].id, type: 'task', subject: 'Prepare SOW for ERP project', is_completed: false },
        { id: crypto.randomUUID(), contact_id: contacts[6].id, deal_id: deals[3].id, owner_id: ownerId, type: 'call', subject: 'Follow up with Deni about brand project', is_completed: false },
        { id: crypto.randomUUID(), contact_id: contacts[8].id, deal_id: deals[4].id, owner_id: users[1].id, type: 'email', subject: 'IoT dashboard technical specs', is_completed: true },
        { id: crypto.randomUUID(), contact_id: contacts[1].id, deal_id: deals[5].id, owner_id: ownerId, type: 'meeting', subject: 'API integration kickoff meeting', is_completed: true },
        { id: crypto.randomUUID(), contact_id: contacts[10].id, deal_id: deals[7].id, owner_id: ownerId, type: 'call', subject: 'Hendra consultation schedule', is_completed: false },
        { id: crypto.randomUUID(), contact_id: contacts[9].id, deal_id: deals[8].id, owner_id: users[1].id, type: 'task', subject: 'Review cloud migration assessment', is_completed: false },
        { id: crypto.randomUUID(), contact_id: contacts[3].id, deal_id: deals[9].id, owner_id: ownerId, type: 'email', subject: 'Mobile app wireframes sent to Mega', is_completed: true },
        { id: crypto.randomUUID(), contact_id: null, deal_id: null, owner_id: ownerId, type: 'task', subject: 'Update CRM pipeline report', is_completed: false },
    ];
    for (const activity of activities) {
        await driver.execute(`INSERT INTO activities (id, contact_id, deal_id, owner_id, type, subject, is_completed)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`, [activity.id, activity.contact_id, activity.deal_id, activity.owner_id, activity.type, activity.subject, activity.is_completed]);
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
        await driver.execute(`INSERT INTO tags (id, name, slug, color) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING`, [tag.id, tag.name, tag.slug, tag.color]);
    }
    console.log(`   ✅ ${tags.length} tags seeded`);
    // ─── 8. Tag Associations ──────────────────────────────────
    console.log('\n🔗 Seeding tag associations...');
    // Tag some contacts
    await driver.execute('INSERT INTO contacts_tags (contact_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [contacts[0].id, tags[1].id]); // VIP
    await driver.execute('INSERT INTO contacts_tags (contact_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [contacts[2].id, tags[0].id]); // Hot Lead
    await driver.execute('INSERT INTO contacts_tags (contact_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [contacts[6].id, tags[2].id]); // Follow Up
    // Tag some deals
    await driver.execute('INSERT INTO deals_tags (deal_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [deals[2].id, tags[0].id]); // Hot Lead
    await driver.execute('INSERT INTO deals_tags (deal_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [deals[4].id, tags[2].id]); // Follow Up
    console.log('   ✅ Tag associations seeded');
    // ─── 9. Products (Phase 2) ────────────────────────────────
    console.log('\n📦 Seeding products...');
    const products = [
        { id: crypto.randomUUID(), name: 'SaaS Platform License', sku: 'SAAS-001', unit_price: 5000000, currency: 'IDR', unit: 'license', tax_rate: 11 },
        { id: crypto.randomUUID(), name: 'Custom Development', sku: 'DEV-001', unit_price: 1500000, currency: 'IDR', unit: 'hour', tax_rate: 11 },
        { id: crypto.randomUUID(), name: 'Cloud Hosting (Monthly)', sku: 'HOST-001', unit_price: 2500000, currency: 'IDR', unit: 'month', tax_rate: 11 },
        { id: crypto.randomUUID(), name: 'Technical Consultation', sku: 'CONS-001', unit_price: 3000000, currency: 'IDR', unit: 'day', tax_rate: 11 },
        { id: crypto.randomUUID(), name: 'UI/UX Design Package', sku: 'UX-001', unit_price: 15000000, currency: 'IDR', unit: 'project', tax_rate: 11 },
        { id: crypto.randomUUID(), name: 'Annual Support Contract', sku: 'SUP-001', unit_price: 24000000, currency: 'IDR', unit: 'year', tax_rate: 11 },
    ];
    for (const product of products) {
        await driver.execute(`INSERT INTO products (id, name, sku, unit_price, currency, unit, tax_rate)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (sku) DO NOTHING`, [product.id, product.name, product.sku, product.unit_price, product.currency, product.unit, product.tax_rate]);
    }
    console.log(`   ✅ ${products.length} products seeded`);
    // ─── 10. Email Templates ───────────────────────────────
    console.log('\n📧 Seeding email templates...');
    const emailTemplates = [
        { id: crypto.randomUUID(), name: 'Welcome Email', subject: 'Welcome to {{company_name}}!', body_html: '<h2>Welcome!</h2><p>Thank you for joining us, {{first_name}}.</p>', category: 'introduction', owner_id: users[0].id, is_shared: true, variables: '["first_name","company_name"]' },
        { id: crypto.randomUUID(), name: 'Follow-up After Meeting', subject: 'Great meeting today, {{first_name}}', body_html: '<p>Hi {{first_name}},</p><p>It was great meeting with you today. Here is a summary...</p>', category: 'follow_up', owner_id: users[0].id, is_shared: true, variables: '["first_name"]' },
        { id: crypto.randomUUID(), name: 'Proposal Sent', subject: 'Your proposal is ready — {{deal_name}}', body_html: '<p>Dear {{first_name}},</p><p>Please find your proposal for {{deal_name}} attached.</p>', category: 'proposal', owner_id: users[0].id, is_shared: true, variables: '["first_name","deal_name"]' },
        { id: crypto.randomUUID(), name: 'Invoice Reminder', subject: 'Invoice {{invoice_number}} — Payment Due', body_html: '<p>Hi {{first_name}},</p><p>This is a friendly reminder that invoice {{invoice_number}} is due.</p>', category: 'general', owner_id: users[0].id, is_shared: true, variables: '["first_name","invoice_number"]' },
    ];
    for (const t of emailTemplates) {
        await driver.execute(`INSERT INTO email_templates (id, name, subject, body_html, category, owner_id, is_shared, variables) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`, [t.id, t.name, t.subject, t.body_html, t.category, t.owner_id, t.is_shared, t.variables]);
    }
    console.log(`   ✅ ${emailTemplates.length} email templates seeded`);
    // ─── 11. Quotations + Items ────────────────────────────
    console.log('\n📝 Seeding quotations...');
    const quotations = [
        { id: crypto.randomUUID(), quote_number: 'QUO-202602-0001', deal_id: deals[0].id, contact_id: contacts[0].id, company_id: companies[0].id, owner_id: users[0].id, title: 'SaaS Platform Implementation', status: 'sent', subtotal: 35000000, discount_type: 'percentage', discount_value: 10, tax_amount: 3465000, total_amount: 34965000, currency: 'IDR', valid_until: '2026-03-31' },
        { id: crypto.randomUUID(), quote_number: 'QUO-202602-0002', deal_id: deals[2].id, contact_id: contacts[2].id, company_id: companies[1].id, owner_id: users[0].id, title: 'Cloud Migration Package', status: 'accepted', subtotal: 50000000, discount_type: null, discount_value: 0, tax_amount: 5500000, total_amount: 55500000, currency: 'IDR', valid_until: '2026-04-15' },
        { id: crypto.randomUUID(), quote_number: 'QUO-202602-0003', deal_id: deals[4].id, contact_id: contacts[4].id, company_id: companies[2].id, owner_id: users[1].id, title: 'UI/UX Design Sprint', status: 'draft', subtotal: 15000000, discount_type: null, discount_value: 0, tax_amount: 1650000, total_amount: 16650000, currency: 'IDR', valid_until: '2026-03-20' },
    ];
    for (const q of quotations) {
        await driver.execute(`INSERT INTO quotations (id, quote_number, deal_id, contact_id, company_id, owner_id, title, status, subtotal, discount_type, discount_value, tax_amount, total_amount, currency, valid_until) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) ON CONFLICT DO NOTHING`, [q.id, q.quote_number, q.deal_id, q.contact_id, q.company_id, q.owner_id, q.title, q.status, q.subtotal, q.discount_type, q.discount_value, q.tax_amount, q.total_amount, q.currency, q.valid_until]);
    }
    // Quotation items
    for (const q of quotations) {
        await driver.execute(`INSERT INTO quotation_items (id, quotation_id, product_id, description, quantity, unit_price, discount_percent, tax_rate, total, display_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING`, [crypto.randomUUID(), q.id, products[0].id, products[0].name, 1, products[0].unit_price, 0, 11, products[0].unit_price * 1.11, 0]);
        await driver.execute(`INSERT INTO quotation_items (id, quotation_id, product_id, description, quantity, unit_price, discount_percent, tax_rate, total, display_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING`, [crypto.randomUUID(), q.id, products[1].id, products[1].name, 10, products[1].unit_price, 0, 11, products[1].unit_price * 10 * 1.11, 1]);
    }
    console.log(`   ✅ ${quotations.length} quotations with items seeded`);
    // ─── 12. Calendar Events ───────────────────────────────
    console.log('\n📅 Seeding calendar events...');
    const now = new Date();
    const calEvents = [
        { id: crypto.randomUUID(), owner_id: users[0].id, contact_id: contacts[0].id, deal_id: deals[0].id, title: 'Kickoff Meeting — SaaS Platform', event_type: 'meeting', start_at: new Date(now.getTime() + 2 * 86400000).toISOString(), end_at: new Date(now.getTime() + 2 * 86400000 + 3600000).toISOString(), status: 'scheduled', location: 'Zoom Call' },
        { id: crypto.randomUUID(), owner_id: users[0].id, contact_id: contacts[2].id, title: 'Follow-up Call — Cloud Migration', event_type: 'call', start_at: new Date(now.getTime() + 3 * 86400000).toISOString(), end_at: new Date(now.getTime() + 3 * 86400000 + 1800000).toISOString(), status: 'scheduled', location: null },
        { id: crypto.randomUUID(), owner_id: users[1].id, contact_id: contacts[4].id, title: 'Design Review Session', event_type: 'meeting', start_at: new Date(now.getTime() + 5 * 86400000).toISOString(), end_at: new Date(now.getTime() + 5 * 86400000 + 7200000).toISOString(), status: 'scheduled', location: 'Google Meet' },
        { id: crypto.randomUUID(), owner_id: users[0].id, title: 'Team Standup', event_type: 'meeting', start_at: new Date(now.getTime() + 1 * 86400000 + 32400000).toISOString(), end_at: new Date(now.getTime() + 1 * 86400000 + 33300000).toISOString(), status: 'scheduled', location: 'Office' },
    ];
    for (const e of calEvents) {
        await driver.execute(`INSERT INTO calendar_events (id, owner_id, contact_id, deal_id, title, event_type, start_at, end_at, status, location) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING`, [e.id, e.owner_id, e.contact_id ?? null, e.deal_id ?? null, e.title, e.event_type, e.start_at, e.end_at, e.status, e.location]);
    }
    console.log(`   ✅ ${calEvents.length} calendar events seeded`);
    // ─── 13. Tickets ───────────────────────────────────────
    console.log('\n🎫 Seeding tickets...');
    const ticketCategories = [
        { id: crypto.randomUUID(), name: 'Technical Support', slug: 'technical-support', color: '#3b82f6', display_order: 0 },
        { id: crypto.randomUUID(), name: 'Billing', slug: 'billing', color: '#f59e0b', display_order: 1 },
        { id: crypto.randomUUID(), name: 'Feature Request', slug: 'feature-request', color: '#8b5cf6', display_order: 2 },
    ];
    for (const tc of ticketCategories) {
        await driver.execute(`INSERT INTO ticket_categories (id, name, slug, color, display_order, is_active) VALUES ($1,$2,$3,$4,$5,true) ON CONFLICT DO NOTHING`, [tc.id, tc.name, tc.slug, tc.color, tc.display_order]);
    }
    const tickets = [
        { id: crypto.randomUUID(), ticket_number: 'TKT-001', contact_id: contacts[0].id, company_id: companies[0].id, category_id: ticketCategories[0].id, assigned_to: users[0].id, created_by: users[0].id, subject: 'Login issue — SAML SSO not working', status: 'open', priority: 'high', channel: 'email', total_messages: 3 },
        { id: crypto.randomUUID(), ticket_number: 'TKT-002', contact_id: contacts[2].id, company_id: companies[1].id, category_id: ticketCategories[1].id, assigned_to: users[1].id, created_by: users[1].id, subject: 'Invoice discrepancy — Q4 billing', status: 'waiting', priority: 'medium', channel: 'web', total_messages: 2 },
        { id: crypto.randomUUID(), ticket_number: 'TKT-003', contact_id: contacts[4].id, company_id: companies[2].id, category_id: ticketCategories[2].id, assigned_to: users[0].id, created_by: users[0].id, subject: 'Request: Dark mode for dashboard', status: 'in_progress', priority: 'low', channel: 'web', total_messages: 5 },
        { id: crypto.randomUUID(), ticket_number: 'TKT-004', contact_id: contacts[1].id, category_id: ticketCategories[0].id, assigned_to: users[0].id, created_by: users[0].id, subject: 'API rate limit exceeded', status: 'resolved', priority: 'urgent', channel: 'email', total_messages: 8 },
    ];
    for (const t of tickets) {
        await driver.execute(`INSERT INTO tickets (id, ticket_number, contact_id, company_id, category_id, assigned_to, created_by, subject, status, priority, channel, total_messages) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT DO NOTHING`, [t.id, t.ticket_number, t.contact_id, t.company_id ?? null, t.category_id, t.assigned_to, t.created_by, t.subject, t.status, t.priority, t.channel, t.total_messages]);
    }
    console.log(`   ✅ ${ticketCategories.length} categories + ${tickets.length} tickets seeded`);
    // ─── 14. Knowledge Base Articles ───────────────────────
    console.log('\n📚 Seeding KB articles...');
    const kbArticles = [
        { id: crypto.randomUUID(), title: 'Getting Started with GAO CRM', slug: 'getting-started', content: 'This guide will walk you through the initial setup of your GAO CRM instance...', excerpt: 'Step-by-step setup guide for new users', category: 'Getting Started', author_id: users[0].id, status: 'published', is_featured: true, view_count: 142, helpful_count: 28, display_order: 0 },
        { id: crypto.randomUUID(), title: 'Managing Contacts & Companies', slug: 'managing-contacts', content: 'Learn how to effectively manage your contacts and companies within GAO CRM...', excerpt: 'Guide to contact and company management', category: 'CRM', author_id: users[0].id, status: 'published', is_featured: false, view_count: 89, helpful_count: 15, display_order: 1 },
        { id: crypto.randomUUID(), title: 'Pipeline Configuration Guide', slug: 'pipeline-config', content: 'Customize your sales pipelines to match your workflows. Create stages, set colors...', excerpt: 'How to set up and customize sales pipelines', category: 'Sales', author_id: users[0].id, status: 'published', is_featured: true, view_count: 67, helpful_count: 12, display_order: 2 },
        { id: crypto.randomUUID(), title: 'Email Templates Best Practices', slug: 'email-templates', content: 'Create effective email templates using merge variables like {{first_name}}...', excerpt: 'Best practices for email template creation', category: 'Marketing', author_id: users[0].id, status: 'published', is_featured: false, view_count: 45, helpful_count: 8, display_order: 3 },
        { id: crypto.randomUUID(), title: 'API Documentation Overview', slug: 'api-overview', content: 'GAO CRM provides a comprehensive REST API for integrating with external systems...', excerpt: 'Overview of the API and authentication', category: 'Developer', author_id: users[0].id, status: 'draft', is_featured: false, view_count: 0, helpful_count: 0, display_order: 4 },
    ];
    for (const a of kbArticles) {
        await driver.execute(`INSERT INTO knowledge_base_articles (id, title, slug, content, excerpt, category, author_id, status, is_featured, view_count, helpful_count, not_helpful_count, display_order, published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,0,$12,$13) ON CONFLICT DO NOTHING`, [a.id, a.title, a.slug, a.content, a.excerpt, a.category, a.author_id, a.status, a.is_featured, a.view_count, a.helpful_count, a.display_order, a.status === 'published' ? new Date().toISOString() : null]);
    }
    console.log(`   ✅ ${kbArticles.length} KB articles seeded`);
    // ─── 15. Campaigns ─────────────────────────────────────
    console.log('\n📣 Seeding campaigns...');
    const campaigns = [
        { id: crypto.randomUUID(), name: 'Q1 2026 Product Launch', owner_id: users[0].id, type: 'email', subject: 'Introducing GAO CRM v2.0', status: 'sent', from_email: 'marketing@gaocrm.com', from_name: 'GAO CRM', source: 'email', medium: 'email', total_recipients: 450, total_sent: 442, total_opens: 187, total_clicks: 63, total_bounces: 8, total_unsubscribes: 3 },
        { id: crypto.randomUUID(), name: 'Customer Success Webinar', owner_id: users[0].id, type: 'email', subject: 'Join Our Webinar: Maximize Your CRM ROI', status: 'scheduled', from_email: 'events@gaocrm.com', from_name: 'GAO Events', source: 'email', medium: 'email', total_recipients: 200, total_sent: 0, total_opens: 0, total_clicks: 0, total_bounces: 0, total_unsubscribes: 0 },
        { id: crypto.randomUUID(), name: 'Win-back Churned Customers', owner_id: users[1].id, type: 'email', subject: 'We miss you — special offer inside', status: 'draft', from_email: 'sales@gaocrm.com', from_name: 'GAO Sales', source: 'email', medium: 'email', total_recipients: 0, total_sent: 0, total_opens: 0, total_clicks: 0, total_bounces: 0, total_unsubscribes: 0 },
    ];
    for (const c of campaigns) {
        await driver.execute(`INSERT INTO campaigns (id, name, owner_id, type, subject, status, from_email, from_name, source, medium, total_recipients, total_sent, total_opens, total_clicks, total_bounces, total_unsubscribes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) ON CONFLICT DO NOTHING`, [c.id, c.name, c.owner_id, c.type, c.subject, c.status, c.from_email, c.from_name, c.source, c.medium, c.total_recipients, c.total_sent, c.total_opens, c.total_clicks, c.total_bounces, c.total_unsubscribes]);
    }
    console.log(`   ✅ ${campaigns.length} campaigns seeded`);
    // ─── 16. Forms ─────────────────────────────────────────
    console.log('\n📋 Seeding forms...');
    const forms = [
        { id: crypto.randomUUID(), name: 'Contact Us', slug: 'contact-us', description: 'Main website contact form', owner_id: users[0].id, status: 'active', success_message: 'Thank you! We will get back to you soon.', submit_button_text: 'Send Message', total_submissions: 34 },
        { id: crypto.randomUUID(), name: 'Request a Demo', slug: 'request-demo', description: 'Schedule a product demo', owner_id: users[0].id, status: 'active', success_message: 'Demo scheduled! Check your email.', submit_button_text: 'Request Demo', total_submissions: 18 },
        { id: crypto.randomUUID(), name: 'Newsletter Signup', slug: 'newsletter', description: 'Monthly newsletter subscription', owner_id: users[1].id, status: 'active', success_message: 'Welcome! Check your inbox.', submit_button_text: 'Subscribe', total_submissions: 156 },
    ];
    for (const f of forms) {
        await driver.execute(`INSERT INTO forms (id, name, slug, description, owner_id, status, success_message, submit_button_text, total_submissions) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING`, [f.id, f.name, f.slug, f.description, f.owner_id, f.status, f.success_message, f.submit_button_text, f.total_submissions]);
    }
    console.log(`   ✅ ${forms.length} forms seeded`);
    // ─── 17. Reports ───────────────────────────────────────
    console.log('\n📊 Seeding reports...');
    const reports = [
        { id: crypto.randomUUID(), name: 'Sales Pipeline Summary', description: 'Overview of deals by stage with total values', owner_id: users[0].id, report_type: 'summary', entity_type: 'deal', chart_type: 'bar', is_public: true, is_favorite: true },
        { id: crypto.randomUUID(), name: 'Contact Growth', description: 'New contacts added per month', owner_id: users[0].id, report_type: 'chart', entity_type: 'contact', chart_type: 'line', is_public: true, is_favorite: false },
        { id: crypto.randomUUID(), name: 'Revenue by Company', description: 'Revenue breakdown by company', owner_id: users[0].id, report_type: 'table', entity_type: 'company', chart_type: null, is_public: false, is_favorite: true },
    ];
    for (const r of reports) {
        await driver.execute(`INSERT INTO reports (id, name, description, owner_id, report_type, entity_type, chart_type, is_public, is_favorite, columns, filters, sort_direction) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'[]','[]','DESC') ON CONFLICT DO NOTHING`, [r.id, r.name, r.description, r.owner_id, r.report_type, r.entity_type, r.chart_type, r.is_public, r.is_favorite]);
    }
    console.log(`   ✅ ${reports.length} reports seeded`);
    // ─── 18. Invoices + Items ──────────────────────────────
    console.log('\n💳 Seeding invoices...');
    const invoices = [
        { id: crypto.randomUUID(), invoice_number: 'INV-202602-0001', contact_id: contacts[0].id, company_id: companies[0].id, deal_id: deals[0].id, owner_id: users[0].id, status: 'paid', subtotal: 20000000, discount_type: null, discount_value: 0, tax_amount: 2200000, total_amount: 22200000, currency: 'IDR', due_date: '2026-02-28', paid_at: '2026-02-20T10:00:00Z', notes: 'Payment received via bank transfer' },
        { id: crypto.randomUUID(), invoice_number: 'INV-202602-0002', contact_id: contacts[2].id, company_id: companies[1].id, deal_id: deals[1].id, owner_id: users[0].id, status: 'sent', subtotal: 15000000, discount_type: 'percentage', discount_value: 5, tax_amount: 1567500, total_amount: 15817500, currency: 'IDR', due_date: '2026-03-15', paid_at: null, notes: 'Net 30 terms' },
        { id: crypto.randomUUID(), invoice_number: 'INV-202602-0003', contact_id: contacts[4].id, company_id: companies[2].id, deal_id: deals[2].id, owner_id: users[1].id, status: 'overdue', subtotal: 45000000, discount_type: null, discount_value: 0, tax_amount: 4950000, total_amount: 49950000, currency: 'IDR', due_date: '2026-02-10', paid_at: null, notes: 'Payment reminder sent 2x' },
        { id: crypto.randomUUID(), invoice_number: 'INV-202602-0004', contact_id: contacts[9].id, company_id: companies[4].id, deal_id: deals[8].id, owner_id: users[1].id, status: 'draft', subtotal: 30000000, discount_type: null, discount_value: 0, tax_amount: 3300000, total_amount: 33300000, currency: 'IDR', due_date: '2026-04-01', paid_at: null, notes: null },
    ];
    for (const inv of invoices) {
        await driver.execute(`INSERT INTO invoices (id, invoice_number, contact_id, company_id, deal_id, owner_id, status, subtotal, discount_type, discount_value, tax_amount, total_amount, currency, due_date, paid_at, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) ON CONFLICT DO NOTHING`, [inv.id, inv.invoice_number, inv.contact_id, inv.company_id, inv.deal_id, inv.owner_id, inv.status, inv.subtotal, inv.discount_type, inv.discount_value, inv.tax_amount, inv.total_amount, inv.currency, inv.due_date, inv.paid_at, inv.notes]);
        // Add 2 line items per invoice
        await driver.execute(`INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_rate, total, display_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING`, [crypto.randomUUID(), inv.id, products[0].id, products[0].name, 2, products[0].unit_price, 0, 11, products[0].unit_price * 2 * 1.11, 0]);
        await driver.execute(`INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_rate, total, display_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING`, [crypto.randomUUID(), inv.id, products[3].id, products[3].name, 1, products[3].unit_price, 0, 11, products[3].unit_price * 1.11, 1]);
    }
    console.log(`   ✅ ${invoices.length} invoices with items seeded`);
    console.log('\n═══════════════════════════════════════════');
    console.log('🎉 Database seeding complete!');
    console.log('═══════════════════════════════════════════');
    console.log(`   👤 Users:         ${users.length}  (login: admin@gaocrm.com / password123)`);
    console.log(`   🏢 Companies:     ${companies.length}`);
    console.log(`   👥 Contacts:      ${contacts.length}`);
    console.log(`   💰 Deals:         ${deals.length}`);
    console.log(`   📋 Activities:    ${activities.length}`);
    console.log(`   📊 Stages:        ${stages.length}`);
    console.log(`   🏷️  Tags:          ${tags.length}`);
    console.log(`   📦 Products:      ${products.length}`);
    console.log(`   📧 Templates:     ${emailTemplates.length}`);
    console.log(`   📝 Quotations:    ${quotations.length}`);
    console.log(`   📅 Calendar:      ${calEvents.length}`);
    console.log(`   🎫 Tickets:       ${tickets.length}`);
    console.log(`   📚 KB Articles:   ${kbArticles.length}`);
    console.log(`   📣 Campaigns:     ${campaigns.length}`);
    console.log(`   📋 Forms:         ${forms.length}`);
    console.log(`   📊 Reports:       ${reports.length}`);
    console.log(`   💳 Invoices:      ${invoices.length}`);
    console.log('═══════════════════════════════════════════\n');
    await driver.disconnect();
}
main().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map