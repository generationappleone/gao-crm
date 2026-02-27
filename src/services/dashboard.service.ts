import { Contact } from '../models/contact.model.js';
import { Deal } from '../models/deal.model.js';
import { DealStage } from '../models/deal-stage.model.js';
import { Activity } from '../models/activity.model.js';
import { Company } from '../models/company.model.js';

export interface DashboardStats {
    totalContacts: number;
    totalCompanies: number;
    totalDeals: number;
    totalDealValue: number;
    wonDeals: number;
    lostDeals: number;
    winRate: number;
    totalRevenue: number;
    pendingActivities: number;
    pipeline: Array<{ name: string; slug: string; color: string; count: number; value: number }>;
    recentActivities: Activity[];
}

export class DashboardService {
    async getStats(): Promise<DashboardStats> {
        // all() automatically applies whereNull('deleted_at')
        const contacts = await Contact.all();
        const companies = await Company.all();
        const deals = await Deal.all();
        const stages = await DealStage.all();
        const activities = await Activity.all();

        const wonStages = stages.filter((s: DealStage) => s.is_won);
        const lostStages = stages.filter((s: DealStage) => s.is_lost);
        const wonStageIds = new Set(wonStages.map((s: DealStage) => s.id));
        const lostStageIds = new Set(lostStages.map((s: DealStage) => s.id));

        const wonDeals = deals.filter((d: Deal) => wonStageIds.has(d.stage_id));
        const lostDeals = deals.filter((d: Deal) => lostStageIds.has(d.stage_id));
        const closedDeals = wonDeals.length + lostDeals.length;
        const winRate = closedDeals > 0 ? Math.round((wonDeals.length / closedDeals) * 100) : 0;
        const totalRevenue = wonDeals.reduce((sum: number, d: Deal) => sum + Number(d.value), 0);
        const totalDealValue = deals.reduce((sum: number, d: Deal) => sum + Number(d.value), 0);
        const pendingActivities = activities.filter((a: Activity) => !a.is_completed).length;

        // Pipeline breakdown
        const pipeline = stages
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

        const recentActivities = activities
            .sort((a: Activity, b: Activity) =>
                new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
            )
            .slice(0, 10);

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
        };
    }
}
