import { Activity } from '../models/activity.model.js';
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
    pipeline: Array<{
        name: string;
        slug: string;
        color: string;
        count: number;
        value: number;
    }>;
    recentActivities: Activity[];
    emailsSent: number;
    emailsOpened: number;
    emailOpenRate: number;
    quotationsSent: number;
    quotationsAccepted: number;
    quotationValue: number;
    upcomingEvents: number;
}
export declare class DashboardService {
    getStats(): Promise<DashboardStats>;
}
//# sourceMappingURL=dashboard.service.d.ts.map