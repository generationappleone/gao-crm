/**
 * GAO CRM — CRM Overview Service
 *
 * Aggregates data from multiple CRM services for the unified
 * CRM Overview dashboard page. Extends the existing DashboardService
 * stats with CRM-specific aggregations.
 */

import { Contact } from '../models/contact.model.js';
import { Company } from '../models/company.model.js';
import { Deal } from '../models/deal.model.js';
import { DealStage } from '../models/deal-stage.model.js';
import { Activity } from '../models/activity.model.js';

// ─── Interfaces ──────────────────────────────────────────────────

export interface CrmStats {
    totalContacts: number;
    totalCompanies: number;
    totalActiveDeals: number;
    totalDealValue: number;
    wonDeals: number;
    lostDeals: number;
    winRate: number;
    totalRevenue: number;
    pendingActivities: number;
    overdueActivities: number;
}

export interface PipelineSnapshot {
    name: string;
    slug: string;
    color: string;
    count: number;
    value: number;
}

export interface HotContact {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    company_name: string | null;
    deal_title: string;
    deal_value: number;
    deal_stage: string;
    deal_stage_color: string;
    deal_currency: string;
}

export interface MonthlyRevenue {
    month: string;
    revenue: number;
}

export interface EnrichedActivity {
    id: string;
    contact_id?: string;
    deal_id?: string;
    owner_id: string;
    type: string;
    subject: string;
    due_at?: string;
    is_completed: boolean;
    completed_at?: string;
    created_at: string;
    contact_name?: string;
    deal_title?: string;
}

export interface EnrichedDeal {
    id: string;
    title: string;
    value: number;
    currency: string;
    probability: number;
    contact_id: string;
    company_id?: string;
    pipeline_id: string;
    stage_id: string;
    created_at: string;
    contact_name?: string;
    stage_name?: string;
    stage_color?: string;
}

export interface CrmOverviewData {
    stats: CrmStats;
    pipeline: PipelineSnapshot[];
    todayActivities: EnrichedActivity[];
    overdueActivities: EnrichedActivity[];
    hotContacts: HotContact[];
    recentActivities: EnrichedActivity[];
    revenueByMonth: MonthlyRevenue[];
    topDeals: EnrichedDeal[];
}

// ─── Service ─────────────────────────────────────────────────────

export class CrmOverviewService {
    async getData(): Promise<CrmOverviewData> {
        // ─── Fetch all core data in parallel ─────────────
        const [contacts, companies, deals, stages, activities] = await Promise.all([
            Contact.where('deleted_at', 'IS', null).get(),
            Company.where('deleted_at', 'IS', null).get(),
            Deal.where('deleted_at', 'IS', null).get(),
            DealStage.where('deleted_at', 'IS', null).orderBy('display_order', 'ASC').get(),
            Activity.where('deleted_at', 'IS', null).orderBy('created_at', 'DESC').get(),
        ]);

        // ─── Stage maps ─────────────────────────────────
        const wonStageIds = new Set(stages.filter((s: DealStage) => s.is_won).map((s: DealStage) => s.id));
        const lostStageIds = new Set(stages.filter((s: DealStage) => s.is_lost).map((s: DealStage) => s.id));
        const stageMap = new Map(stages.map((s: DealStage) => [s.id, s]));
        const contactMap = new Map(contacts.map((c: Contact) => [c.id, c]));
        const companyMap = new Map(companies.map((c: Company) => [c.id, c]));

        // ─── Stats ───────────────────────────────────────
        const wonDeals = deals.filter((d: Deal) => wonStageIds.has(d.stage_id));
        const lostDeals = deals.filter((d: Deal) => lostStageIds.has(d.stage_id));
        const activeDeals = deals.filter((d: Deal) => !wonStageIds.has(d.stage_id) && !lostStageIds.has(d.stage_id));
        const closedCount = wonDeals.length + lostDeals.length;
        const winRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0;
        const totalRevenue = wonDeals.reduce((sum: number, d: Deal) => sum + Number(d.value), 0);
        const totalDealValue = activeDeals.reduce((sum: number, d: Deal) => sum + Number(d.value), 0);

        const pendingActivities = activities.filter((a: Activity) => !a.is_completed);
        const now = new Date();
        const overdueList = pendingActivities.filter((a: Activity) => {
            if (!a.due_at) return false;
            return new Date(a.due_at).getTime() < now.getTime();
        });

        const stats: CrmStats = {
            totalContacts: contacts.length,
            totalCompanies: companies.length,
            totalActiveDeals: activeDeals.length,
            totalDealValue,
            wonDeals: wonDeals.length,
            lostDeals: lostDeals.length,
            winRate,
            totalRevenue,
            pendingActivities: pendingActivities.length,
            overdueActivities: overdueList.length,
        };

        // ─── Pipeline Snapshot (active stages, excluding lost) ───
        const pipeline: PipelineSnapshot[] = stages
            .filter((s: DealStage) => !s.is_lost)
            .sort((a: DealStage, b: DealStage) => a.display_order - b.display_order)
            .map((s: DealStage) => {
                const stageDeals = deals.filter((d: Deal) => d.stage_id === s.id);
                return {
                    name: s.name,
                    slug: s.slug,
                    color: s.color,
                    count: stageDeals.length,
                    value: stageDeals.reduce((sum: number, d: Deal) => sum + Number(d.value), 0),
                };
            });

        // ─── Today's Activities ──────────────────────────
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        const todayActivities = pendingActivities
            .filter((a: Activity) => {
                if (!a.due_at) return false;
                const d = new Date(a.due_at);
                return d >= todayStart && d < todayEnd;
            })
            .slice(0, 10)
            .map((a: Activity) => this.enrichActivity(a, contactMap, deals));

        // Also include recently completed today
        const completedToday = activities
            .filter((a: Activity) => {
                if (!a.is_completed || !a.completed_at) return false;
                const d = new Date(a.completed_at);
                return d >= todayStart && d < todayEnd;
            })
            .slice(0, 5)
            .map((a: Activity) => this.enrichActivity(a, contactMap, deals));

        const allTodayActivities = [...todayActivities, ...completedToday]
            .sort((a, b) => {
                // Pending first, then by date
                if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
                return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
            });

        // ─── Overdue Activities ──────────────────────────
        const overdueActivities = overdueList
            .slice(0, 8)
            .map((a: Activity) => this.enrichActivity(a, contactMap, deals));

        // ─── Hot Contacts (contacts with biggest active deals) ───
        const hotContacts: HotContact[] = activeDeals
            .sort((a: Deal, b: Deal) => Number(b.value) - Number(a.value))
            .slice(0, 6)
            .map((d: Deal) => {
                const contact = contactMap.get(d.contact_id);
                const company = d.company_id ? companyMap.get(d.company_id) : null;
                const stage = stageMap.get(d.stage_id);
                return {
                    id: contact?.id ?? d.contact_id,
                    first_name: contact?.first_name ?? 'Unknown',
                    last_name: contact?.last_name ?? '',
                    email: contact?.email ?? '',
                    company_name: company?.name ?? null,
                    deal_title: d.title,
                    deal_value: Number(d.value),
                    deal_stage: stage?.name ?? '—',
                    deal_stage_color: stage?.color ?? '#6366f1',
                    deal_currency: d.currency ?? 'IDR',
                };
            })
            .filter((h, i, arr) => arr.findIndex(x => x.id === h.id) === i); // dedupe by contact

        // ─── Recent Activity Feed ────────────────────────
        const recentActivities = activities
            .slice(0, 12)
            .map((a: Activity) => this.enrichActivity(a, contactMap, deals));

        // ─── Revenue by Month (last 6 months) ────────────
        const revenueByMonth: MonthlyRevenue[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });

            const monthRevenue = wonDeals
                .filter((deal: Deal) => {
                    if (!deal.won_at) return false;
                    const wonDate = new Date(deal.won_at);
                    return wonDate >= d && wonDate <= monthEnd;
                })
                .reduce((sum: number, deal: Deal) => sum + Number(deal.value), 0);

            revenueByMonth.push({ month: monthLabel, revenue: monthRevenue });
        }

        // ─── Top Deals ───────────────────────────────────
        const topDeals: EnrichedDeal[] = activeDeals
            .sort((a: Deal, b: Deal) => Number(b.value) - Number(a.value))
            .slice(0, 5)
            .map((d: Deal) => {
                const contact = contactMap.get(d.contact_id);
                const stage = stageMap.get(d.stage_id);
                return {
                    id: d.id,
                    title: d.title,
                    value: Number(d.value),
                    currency: d.currency ?? 'IDR',
                    probability: d.probability,
                    contact_id: d.contact_id,
                    company_id: d.company_id,
                    pipeline_id: d.pipeline_id,
                    stage_id: d.stage_id,
                    created_at: d.created_at,
                    contact_name: contact ? `${contact.first_name} ${contact.last_name}` : '—',
                    stage_name: stage?.name ?? '—',
                    stage_color: stage?.color ?? '#6366f1',
                };
            });

        return {
            stats,
            pipeline,
            todayActivities: allTodayActivities,
            overdueActivities,
            hotContacts,
            recentActivities,
            revenueByMonth,
            topDeals,
        };
    }

    /**
     * Enrich an activity with contact name and deal title.
     */
    private enrichActivity(
        activity: Activity,
        contactMap: Map<string, Contact>,
        deals: Deal[],
    ): EnrichedActivity {
        const contact = activity.contact_id ? contactMap.get(activity.contact_id) : null;
        const deal = activity.deal_id ? deals.find((d: Deal) => d.id === activity.deal_id) : null;

        return {
            id: activity.id,
            contact_id: activity.contact_id,
            deal_id: activity.deal_id,
            owner_id: activity.owner_id,
            type: activity.type,
            subject: activity.subject,
            due_at: activity.due_at,
            is_completed: activity.is_completed,
            completed_at: activity.completed_at,
            created_at: activity.created_at,
            contact_name: contact ? `${contact.first_name} ${contact.last_name}` : undefined,
            deal_title: deal?.title ?? undefined,
        };
    }
}
