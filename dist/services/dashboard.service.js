import { Contact } from '../models/contact.model.js';
import { Deal } from '../models/deal.model.js';
import { DealStage } from '../models/deal-stage.model.js';
import { Activity } from '../models/activity.model.js';
import { Company } from '../models/company.model.js';
import { EmailMessage } from '../models/email-message.model.js';
import { Quotation } from '../models/quotation.model.js';
import { CalendarEvent } from '../models/calendar-event.model.js';
export class DashboardService {
    async getStats() {
        // all() automatically applies whereNull('deleted_at')
        const contacts = await Contact.all();
        const companies = await Company.all();
        const deals = await Deal.all();
        const stages = await DealStage.all();
        const activities = await Activity.all();
        const wonStages = stages.filter((s) => s.is_won);
        const lostStages = stages.filter((s) => s.is_lost);
        const wonStageIds = new Set(wonStages.map((s) => s.id));
        const lostStageIds = new Set(lostStages.map((s) => s.id));
        const wonDeals = deals.filter((d) => wonStageIds.has(d.stage_id));
        const lostDeals = deals.filter((d) => lostStageIds.has(d.stage_id));
        const closedDeals = wonDeals.length + lostDeals.length;
        const winRate = closedDeals > 0 ? Math.round((wonDeals.length / closedDeals) * 100) : 0;
        const totalRevenue = wonDeals.reduce((sum, d) => sum + Number(d.value), 0);
        const totalDealValue = deals.reduce((sum, d) => sum + Number(d.value), 0);
        const pendingActivities = activities.filter((a) => !a.is_completed).length;
        // Pipeline breakdown
        const pipeline = stages
            .filter((s) => !s.is_lost)
            .sort((a, b) => a.display_order - b.display_order)
            .map((s) => {
            const stageDeals = deals.filter((d) => d.stage_id === s.id);
            return {
                name: s.name,
                slug: s.slug,
                color: s.color,
                count: stageDeals.length,
                value: stageDeals.reduce((sum, d) => sum + Number(d.value), 0),
            };
        });
        const recentActivities = activities
            .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
            .slice(0, 10);
        // Phase 2: Email stats (graceful if tables don't exist yet)
        let sentEmailsCount = 0;
        let openedEmailsCount = 0;
        let emailOpenRate = 0;
        let quotationsSentCount = 0;
        let quotationsAcceptedCount = 0;
        let quotationValue = 0;
        let upcomingEventsCount = 0;
        try {
            const emails = await EmailMessage.where('deleted_at', 'IS', null).get();
            const sentEmails = emails.filter((e) => e.status === 'sent' || e.status === 'delivered');
            const openedEmails = sentEmails.filter((e) => e.open_count > 0);
            sentEmailsCount = sentEmails.length;
            openedEmailsCount = openedEmails.length;
            emailOpenRate = sentEmails.length > 0
                ? Math.round((openedEmails.length / sentEmails.length) * 100)
                : 0;
        }
        catch { /* table may not exist */ }
        try {
            const quotations = await Quotation.where('deleted_at', 'IS', null).get();
            const sentQuotes = quotations.filter((q) => q.status !== 'draft');
            const acceptedQuotes = quotations.filter((q) => q.status === 'accepted');
            quotationsSentCount = sentQuotes.length;
            quotationsAcceptedCount = acceptedQuotes.length;
            quotationValue = acceptedQuotes.reduce((sum, q) => sum + Number(q.total_amount), 0);
        }
        catch { /* table may not exist */ }
        try {
            const now = new Date().toISOString();
            const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            const upcomingEvents = await CalendarEvent
                .where('deleted_at', 'IS', null)
                .where('start_at', '>=', now)
                .where('start_at', '<=', sevenDays)
                .where('status', '!=', 'cancelled')
                .get();
            upcomingEventsCount = upcomingEvents.length;
        }
        catch { /* table may not exist */ }
        return {
            totalContacts: contacts.length,
            totalCompanies: companies.length,
            totalDeals: deals.length,
            totalDealValue,
            wonDeals: wonDeals.length,
            lostDeals: lostDeals.length,
            winRate,
            totalRevenue,
            pendingActivities,
            pipeline,
            recentActivities,
            // Phase 2
            emailsSent: sentEmailsCount,
            emailsOpened: openedEmailsCount,
            emailOpenRate,
            quotationsSent: quotationsSentCount,
            quotationsAccepted: quotationsAcceptedCount,
            quotationValue,
            upcomingEvents: upcomingEventsCount,
        };
    }
}
//# sourceMappingURL=dashboard.service.js.map