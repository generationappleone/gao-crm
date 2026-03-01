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
import { AddDeletedAtToStagesAndTags } from './migrations/010_add_deleted_at.js';
import { CreateCustomFieldDefinitionsTable } from './migrations/011_create_custom_field_definitions.js';
import { CreateCustomFieldValuesTable } from './migrations/012_create_custom_field_values.js';
import { CreatePipelinesTable } from './migrations/013_create_pipelines.js';
import { AddPipelineToDealStagesAndDeals } from './migrations/014_add_pipeline_to_deal_stages_and_deals.js';
import { CreateEmailTemplatesTable } from './migrations/015_create_email_templates.js';
import { CreateEmailMessagesTable } from './migrations/016_create_email_messages.js';
import { CreateEmailLinkClicksTable } from './migrations/017_create_email_link_clicks.js';
import { CreateProductsTable } from './migrations/018_create_products.js';
import { CreateQuotationsTable } from './migrations/019_create_quotations.js';
import { CreateQuotationItemsTable } from './migrations/020_create_quotation_items.js';
import { CreateCalendarEventsTable } from './migrations/021_create_calendar_events.js';
import { CreateCalendarEventAttendeesTable } from './migrations/022_create_calendar_event_attendees.js';
import { CreateFormsTable } from './migrations/023_create_forms.js';
import { CreateFormFieldsTable } from './migrations/024_create_form_fields.js';
import { CreateFormSubmissionsTable } from './migrations/025_create_form_submissions.js';
import { CreateCampaignsTable } from './migrations/026_create_campaigns.js';
import { CreateCampaignRecipientsTable } from './migrations/027_create_campaign_recipients.js';
import { CreateWebTrackingSessionsTable } from './migrations/028_create_web_tracking_sessions.js';
import { CreateWebTrackingEventsTable } from './migrations/029_create_web_tracking_events.js';
import { CreateAiConversationsTable } from './migrations/030_create_ai_conversations.js';
import { CreateAiMessagesTable } from './migrations/031_create_ai_messages.js';
import { CreateScoringRulesTable } from './migrations/032_create_scoring_rules.js';
import { CreateLeadScoresTable } from './migrations/033_create_lead_scores.js';
import { CreateAutomationsTable } from './migrations/034_create_automations.js';
import { CreateAutomationStepsTable } from './migrations/035_create_automation_steps.js';
import { CreateAutomationLogsTable } from './migrations/036_create_automation_logs.js';
import { CreateTicketCategoriesTable } from './migrations/037_create_ticket_categories.js';
import { CreateTicketsTable } from './migrations/038_create_tickets.js';
import { CreateTicketMessagesTable } from './migrations/039_create_ticket_messages.js';
import { CreateLiveChatSessionsTable } from './migrations/040_create_live_chat_sessions.js';
import { CreateLiveChatMessagesTable } from './migrations/041_create_live_chat_messages.js';
import { CreateKnowledgeBaseArticlesTable } from './migrations/042_create_knowledge_base_articles.js';
import { CreateCsatSurveysTable } from './migrations/043_create_csat_surveys.js';
import { CreateCsatResponsesTable } from './migrations/044_create_csat_responses.js';
import { CreateReportsTable } from './migrations/045_create_reports.js';
import { CreateDashboardWidgetsTable } from './migrations/046_create_dashboard_widgets.js';
import { CreateExportJobsTable } from './migrations/047_create_export_jobs.js';
import { CreateAuditLogsTable } from './migrations/048_create_audit_logs.js';
import { CreateNotificationsTable } from './migrations/049_create_notifications.js';
import { CreateInvoicesTable } from './migrations/050_create_invoices.js';
import { CreateInvoiceItemsTable } from './migrations/051_create_invoice_items.js';
import { CreatePaymentMethodsTable } from './migrations/052_create_payment_methods.js';
import { CreatePaymentsTable } from './migrations/053_create_payments.js';
import { CreatePluginsTable } from './migrations/054_create_plugins.js';
import { CreatePluginVersionsTable } from './migrations/055_create_plugin_versions.js';
import { CreateClientPortalUsersTable } from './migrations/056_create_client_portal_users.js';
import { CreateSharedDocumentsTable } from './migrations/057_create_shared_documents.js';
import { CreateTenantsTable } from './migrations/058_create_tenants.js';
import { CreateCurrenciesTable } from './migrations/059_create_currencies.js';
import { CreateExchangeRatesTable } from './migrations/060_create_exchange_rates.js';
import { CreateTranslationsTable } from './migrations/061_create_translations.js';
import { CreateTerritoriesTable } from './migrations/062_create_territories.js';
import { CreateApprovalChainsTable } from './migrations/063_create_approval_chains.js';
import { CreateApprovalRequestsTable } from './migrations/064_create_approval_requests.js';
import { CreateChannelsTable } from './migrations/065_create_channels.js';
import { CreateChannelMembersTable } from './migrations/066_create_channel_members.js';
import { CreateMessagesTable } from './migrations/067_create_messages.js';
import { CreateFilesTable } from './migrations/068_create_files.js';
import { CreateFileAttachmentsTable } from './migrations/069_create_file_attachments.js';
import { CreateProjectsTable } from './migrations/070_create_projects.js';
import { CreateProjectTasksTable } from './migrations/071_create_project_tasks.js';
import { CreateAnnouncementsTable } from './migrations/072_create_announcements.js';
import { CreateLandingPagesTable } from './migrations/073_create_landing_pages.js';
import { CreateQuizSurveyResponsesTables } from './migrations/074_create_quiz_survey_responses.js';

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
    AddDeletedAtToStagesAndTags,
    CreateCustomFieldDefinitionsTable,
    CreateCustomFieldValuesTable,
    CreatePipelinesTable,
    AddPipelineToDealStagesAndDeals,
    CreateEmailTemplatesTable,
    CreateEmailMessagesTable,
    CreateEmailLinkClicksTable,
    CreateProductsTable,
    CreateQuotationsTable,
    CreateQuotationItemsTable,
    CreateCalendarEventsTable,
    CreateCalendarEventAttendeesTable,
    CreateFormsTable,
    CreateFormFieldsTable,
    CreateFormSubmissionsTable,
    CreateCampaignsTable,
    CreateCampaignRecipientsTable,
    CreateWebTrackingSessionsTable,
    CreateWebTrackingEventsTable,
    CreateAiConversationsTable,
    CreateAiMessagesTable,
    CreateScoringRulesTable,
    CreateLeadScoresTable,
    CreateAutomationsTable,
    CreateAutomationStepsTable,
    CreateAutomationLogsTable,
    CreateTicketCategoriesTable,
    CreateTicketsTable,
    CreateTicketMessagesTable,
    CreateLiveChatSessionsTable,
    CreateLiveChatMessagesTable,
    CreateKnowledgeBaseArticlesTable,
    CreateCsatSurveysTable,
    CreateCsatResponsesTable,
    CreateReportsTable,
    CreateDashboardWidgetsTable,
    CreateExportJobsTable,
    CreateAuditLogsTable,
    CreateNotificationsTable,
    CreateInvoicesTable,
    CreateInvoiceItemsTable,
    CreatePaymentMethodsTable,
    CreatePaymentsTable,
    CreatePluginsTable,
    CreatePluginVersionsTable,
    CreateClientPortalUsersTable,
    CreateSharedDocumentsTable,
    CreateTenantsTable,
    CreateCurrenciesTable,
    CreateExchangeRatesTable,
    CreateTranslationsTable,
    CreateTerritoriesTable,
    CreateApprovalChainsTable,
    CreateApprovalRequestsTable,
    CreateChannelsTable,
    CreateChannelMembersTable,
    CreateMessagesTable,
    CreateFilesTable,
    CreateFileAttachmentsTable,
    CreateProjectsTable,
    CreateProjectTasksTable,
    CreateAnnouncementsTable,
    CreateLandingPagesTable,
    CreateQuizSurveyResponsesTables,
];

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

    const engine = new MigrationEngine(driver);
    await engine.setup();

    const isFresh = process.argv.includes('--fresh');

    if (isFresh) {
        console.log('🔄 Fresh migration: resetting all...');
        const result = await engine.refresh(migrations);
        console.log(`↩️  Rolled back: ${result.rolledBack.length} migration(s)`);
        console.log(`✅ Applied: ${result.applied.length} migration(s)`);
    } else {
        const applied = await engine.up(migrations);
        if (applied.length === 0) {
            console.log('ℹ️  No pending migrations.');
        } else {
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
