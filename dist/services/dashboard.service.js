import { Contact } from '../models/contact.model.js';
import { Deal } from '../models/deal.model.js';
import { DealStage } from '../models/deal-stage.model.js';
import { Activity } from '../models/activity.model.js';
import { Company } from '../models/company.model.js';
export class DashboardService {
    async getStats() {
        const contacts = await Contact.where('id', '!=', '').whereNull('deleted_at').get();
        const companies = await Company.where('id', '!=', '').whereNull('deleted_at').get();
        const deals = await Deal.where('id', '!=', '').whereNull('deleted_at').get();
        const stages = await DealStage.all();
        const activities = await Activity.where('id', '!=', '').whereNull('deleted_at').get();
        const wonStages = stages.filter(s => s.is_won);
        const lostStages = stages.filter(s => s.is_lost);
        const wonStageIds = new Set(wonStages.map(s => s.id));
        const lostStageIds = new Set(lostStages.map(s => s.id));
        const wonDeals = deals.filter(d => wonStageIds.has(d.stage_id));
        const lostDeals = deals.filter(d => lostStageIds.has(d.stage_id));
        const closedDeals = wonDeals.length + lostDeals.length;
        const winRate = closedDeals > 0 ? Math.round((wonDeals.length / closedDeals) * 100) : 0;
        const totalRevenue = wonDeals.reduce((sum, d) => sum + Number(d.value), 0);
        const totalDealValue = deals.reduce((sum, d) => sum + Number(d.value), 0);
        const pendingActivities = activities.filter(a => !a.is_completed).length;
        // Pipeline breakdown
        const pipeline = stages
            .filter(s => !s.is_lost)
            .sort((a, b) => a.display_order - b.display_order)
            .map(s => {
            const stageDeals = deals.filter(d => d.stage_id === s.id);
            return {
                name: s.name,
                slug: s.slug,
                color: s.color,
                count: stageDeals.length,
                value: stageDeals.reduce((sum, d) => sum + Number(d.value), 0),
            };
        });
        const recentActivities = activities
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
//# sourceMappingURL=dashboard.service.js.map