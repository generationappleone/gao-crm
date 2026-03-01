/**
 * GAO CRM — Main Application Entry Point
 *
 * Uses createHttpHandler() + Server from @gao/http to wire controllers
 * and middleware, and GaoApplication from @gao/core for config & DI.
 */

import { createApp } from '@gao/core';
import {
    createHttpHandler,
    Server,
    bodyParserMiddleware,
    corsMiddleware,
    sessionMiddleware,
    errorHandlerMiddleware,
} from '@gao/http';
import { setModelDriver, PostgresDriver } from '@gao/orm';

// Middleware
import { authMiddleware } from './middleware/auth.middleware.js';
import { apiRateLimit } from './middleware/rate-limit.middleware.js';
import { securityHeadersMiddleware } from './middleware/security-headers.middleware.js';

// Page Controllers
import { AuthController } from './controllers/auth.controller.js';
import { DashboardController } from './controllers/dashboard.controller.js';
import { ContactController } from './controllers/contact.controller.js';
import { CompanyController } from './controllers/company.controller.js';
import { DealController } from './controllers/deal.controller.js';
import { ActivityController } from './controllers/activity.controller.js';
import { CommandCenterController } from './controllers/command-center.controller.js';
import { PipelineController } from './controllers/pipeline.controller.js';
import { CrmOverviewController } from './controllers/crm/crm-overview.controller.js';
import { CrmPipelineController } from './controllers/crm/crm-pipeline.controller.js';
import { CrmContactsController } from './controllers/crm/crm-contacts.controller.js';
import { InvoiceController } from './controllers/invoice.controller.js';
import { TicketController } from './controllers/ticket.controller.js';
import { ProjectController } from './controllers/project.controller.js';
import { MessengerController } from './controllers/messenger.controller.js';
import { AnnouncementController } from './controllers/announcement.controller.js';
import { PluginPageController } from './controllers/plugin.controller.js';
import { ProductController } from './controllers/product.controller.js';
import { QuotationController } from './controllers/quotation.controller.js';
import { CalendarController } from './controllers/calendar.controller.js';
import { EmailHubController } from './controllers/email-hub.controller.js';
import { CampaignController } from './controllers/campaign.controller.js';
import { FormController } from './controllers/form.controller.js';
import { TrackingController } from './controllers/tracking.controller.js';
import { KnowledgeBaseController } from './controllers/kb.controller.js';
import { ReportController } from './controllers/report.controller.js';
import { AuditController } from './controllers/audit.controller.js';
import { SettingsController } from './controllers/settings.controller.js';
import { LandingPageController } from './controllers/landing-page.controller.js';
import { LiveChatController } from './controllers/live-chat.controller.js';
import { WinLossController } from './controllers/win-loss.controller.js';
import { PriceListController } from './controllers/price-list.controller.js';
import { AiInsightsController } from './controllers/ai-insights.controller.js';
// API Controllers
import { AuthApiController } from './controllers/api/auth.api.controller.js';
import { ContactApiController } from './controllers/api/contact.api.controller.js';
import { CompanyApiController } from './controllers/api/company.api.controller.js';
import { DealApiController } from './controllers/api/deal.api.controller.js';
import { ActivityApiController } from './controllers/api/activity.api.controller.js';
import { NoteApiController } from './controllers/api/note.api.controller.js';
import { FileApiController } from './controllers/api/file.api.controller.js';
import { TagApiController } from './controllers/api/tag.api.controller.js';
import { DashboardApiController } from './controllers/api/dashboard.api.controller.js';
import { CustomFieldApiController } from './controllers/api/custom-field.api.controller.js';
import { PipelineApiController } from './controllers/api/pipeline.api.controller.js';
import { EmailApiController } from './controllers/api/email.api.controller.js';
import { ProductApiController } from './controllers/api/product.api.controller.js';
import { QuotationApiController } from './controllers/api/quotation.api.controller.js';
import { CalendarApiController } from './controllers/api/calendar.api.controller.js';
import { FormApiController } from './controllers/api/form.api.controller.js';
import { CampaignApiController } from './controllers/api/campaign.api.controller.js';
import { WebTrackingApiController } from './controllers/api/web-tracking.api.controller.js';
import { AiCopilotApiController } from './controllers/api/ai-copilot.api.controller.js';
import { LeadScoringApiController } from './controllers/api/lead-scoring.api.controller.js';
import { AutomationApiController } from './controllers/api/automation.api.controller.js';
import { TicketApiController } from './controllers/api/ticket.api.controller.js';
import { LiveChatApiController } from './controllers/api/live-chat.api.controller.js';
import { KnowledgeBaseApiController } from './controllers/api/knowledge-base.api.controller.js';
import { CsatApiController } from './controllers/api/csat.api.controller.js';
import { ReportApiController } from './controllers/api/report.api.controller.js';
import { WidgetApiController } from './controllers/api/widget.api.controller.js';
import { ExportApiController } from './controllers/api/export.api.controller.js';
import { AuditApiController } from './controllers/api/audit.api.controller.js';
import { NotificationApiController } from './controllers/api/notification.api.controller.js';
import { InvoiceApiController } from './controllers/api/invoice.api.controller.js';
import { PaymentApiController } from './controllers/api/payment.api.controller.js';
import { PluginApiController } from './controllers/api/plugin.api.controller.js';
import { PortalApiController } from './controllers/api/portal.api.controller.js';
import { CurrencyApiController } from './controllers/api/currency.api.controller.js';
import { I18nApiController } from './controllers/api/i18n.api.controller.js';
import { ApprovalApiController } from './controllers/api/approval.api.controller.js';
import { MessengerApiController } from './controllers/api/messenger.api.controller.js';
import { ProjectApiController } from './controllers/api/project.api.controller.js';
import { AnnouncementApiController } from './controllers/api/announcement.api.controller.js';
import { LandingPageApiController } from './controllers/api/landing-page.api.controller.js';
import { BundleApiController } from './controllers/api/bundle.api.controller.js';
import { PriceListApiController } from './controllers/api/price-list.api.controller.js';
import { AiSalesApiController } from './controllers/api/ai-sales.api.controller.js';
// Public Controller (no prefix, no auth)
import { PublicFrontController } from './controllers/public-front.controller.js';
// Error page renderer
import { renderErrorPage } from './views/error-page.js';

async function main() {
    const app = createApp();
    await app.boot();

    // ─── Database ────────────────────────────────────────────
    const driver = new PostgresDriver({
        host: 'localhost',
        port: 5432,
        database: 'gaocrm',
        user: 'postgres',
        password: process.env.DB_PASSWORD ?? 'root',
    });
    await driver.connect();
    setModelDriver(driver, 'postgres');
    console.log('✅ Database connected');

    // ─── App Config ──────────────────────────────────────────
    const APP_DEBUG = (process.env.APP_DEBUG ?? 'true') === 'true';
    console.log(`🔧 Debug mode: ${APP_DEBUG ? 'ON' : 'OFF'}`);

    // ─── Error Handlers ──────────────────────────────────────
    /** Custom 404 handler — returns beautiful HTML error page */
    const handleNotFound = (req: any, res: any) => {
        const acceptsHtml = (req.header?.('accept') ?? '').includes('text/html');
        if (!acceptsHtml) {
            return res.error(404, 'NOT_FOUND', `Route ${req.method} ${req.url.pathname} not found`);
        }
        return res.status(404).html(renderErrorPage({
            statusCode: 404,
            title: 'Page Not Found',
            message: `The route ${req.method} ${req.url.pathname} does not exist.`,
            path: req.url.pathname,
            debug: APP_DEBUG,
        }));
    };

    /** Custom error handler — returns HTML for page requests, JSON for API */
    const handleError = (error: unknown, statusCode: number, req: any, res: any, debug: boolean) => {
        const acceptsHtml = (req.header?.('accept') ?? '').includes('text/html');
        const isApi = req.url.pathname.includes('/api/');

        // For API requests, always return JSON (let default handler take over)
        if (isApi || !acceptsHtml) {
            throw error; // Re-throw to let default errorHandler handle as JSON
        }

        const errMsg = error instanceof Error ? error.message : String(error);
        const errStack = error instanceof Error ? error.stack : undefined;
        const errCode = (error as any)?.code ?? 'INTERNAL_SERVER_ERROR';

        return res.status(statusCode).html(renderErrorPage({
            statusCode,
            title: statusCode === 500 ? 'Internal Server Error'
                : statusCode === 503 ? 'Service Unavailable'
                    : `Error ${statusCode}`,
            message: debug ? errMsg : 'Something went wrong. Please try again later.',
            path: req.url.pathname,
            stack: debug ? errStack : undefined,
            code: debug ? errCode : undefined,
            debug,
        }));
    };

    // ─── Admin Panel Handler (prefixed: /gaocrm/admin-panel) ─
    const adminHandler = createHttpHandler({
        container: app.container,
        prefix: '/gaocrm/admin-panel',
        controllers: [
            AuthController,
            AuthApiController,
            DashboardController,
            ContactController,
            CompanyController,
            DealController,
            ActivityController,
            CommandCenterController,
            PipelineController,
            CrmOverviewController,
            CrmPipelineController,
            CrmContactsController,
            InvoiceController,
            TicketController,
            ProjectController,
            MessengerController,
            AnnouncementController,
            PluginPageController,
            ProductController,
            QuotationController,
            CalendarController,
            EmailHubController,
            CampaignController,
            FormController,
            TrackingController,
            KnowledgeBaseController,
            ReportController,
            AuditController,
            SettingsController,
            LandingPageController,
            LiveChatController,
            WinLossController,
            PriceListController,
            AiInsightsController,
            ContactApiController,
            CompanyApiController,
            DealApiController,
            ActivityApiController,
            NoteApiController,
            FileApiController,
            TagApiController,
            DashboardApiController,
            CustomFieldApiController,
            PipelineApiController,
            EmailApiController,
            ProductApiController,
            QuotationApiController,
            CalendarApiController,
            FormApiController,
            CampaignApiController,
            WebTrackingApiController,
            AiCopilotApiController,
            LeadScoringApiController,
            AutomationApiController,
            TicketApiController,
            LiveChatApiController,
            KnowledgeBaseApiController,
            CsatApiController,
            ReportApiController,
            WidgetApiController,
            ExportApiController,
            AuditApiController,
            NotificationApiController,
            InvoiceApiController,
            PaymentApiController,
            PluginApiController,
            PortalApiController,
            CurrencyApiController,
            I18nApiController,
            ApprovalApiController,
            MessengerApiController,
            ProjectApiController,
            AnnouncementApiController,
            LandingPageApiController,
            BundleApiController,
            PriceListApiController,
            AiSalesApiController,
        ],
        onNotFound: handleNotFound,
        middlewares: [
            securityHeadersMiddleware(),
            errorHandlerMiddleware({ debug: APP_DEBUG, onError: handleError }),
            corsMiddleware({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' }),
            bodyParserMiddleware(),
            sessionMiddleware({ cookieName: 'gao_crm_session', ttl: 86400 }),
            authMiddleware(),
            apiRateLimit(),
        ],
    });

    // ─── Public Handler (no prefix, no auth) ─────────────────
    const publicHandler = createHttpHandler({
        container: app.container,
        controllers: [
            PublicFrontController,
        ],
        onNotFound: handleNotFound,
        middlewares: [
            securityHeadersMiddleware(),
            errorHandlerMiddleware({ debug: APP_DEBUG, onError: handleError }),
            corsMiddleware({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' }),
            bodyParserMiddleware(),
        ],
    });

    // ─── Composite Handler ───────────────────────────────────
    // Routes starting with /gaocrm/admin-panel → admin handler
    // Everything else → public handler
    const compositeHandler: typeof adminHandler = async (req, res) => {
        const pathname = req.url.pathname;
        if (pathname.startsWith('/gaocrm/admin-panel')) {
            return adminHandler(req, res);
        }
        return publicHandler(req, res);
    };

    // ─── Server ──────────────────────────────────────────────
    const port = app.config.app.port ?? 3000;
    const server = new Server(compositeHandler, { port });
    await server.listen();

    console.log(`🚀 GAO CRM running at http://localhost:${port}`);
    console.log(`🌐 Landing Page: http://localhost:${port}/`);
    console.log(`📋 Admin Panel: http://localhost:${port}/gaocrm/admin-panel/`);
    console.log(`🔐 Login: http://localhost:${port}/gaocrm/admin-panel/login`);
}

main().catch((error) => {
    console.error('❌ Failed to start GAO CRM:', error);
    process.exit(1);
});
