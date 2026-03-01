/**
 * Win/Loss Analysis Service
 *
 * Provides analytics on why deals are won or lost.
 */

import { Deal } from '../models/deal.model.js';

export interface WinLossFilters {
    period?: 'last_30' | 'last_90' | 'last_365' | 'all';
    productId?: string;
    ownerId?: string;
}

export interface WinLossSummary {
    totalWon: number;
    totalLost: number;
    winRate: number;
    avgDealValue: number;
    topLostReasons: Array<{ reason: string; count: number }>;
}

export class WinLossService {
    async getSummary(_filters: WinLossFilters): Promise<WinLossSummary> {
        const wonQuery = Deal.where('status', 'won');
        const lostQuery = Deal.where('status', 'lost');

        // Apply period filter would require date filtering, simplified here
        const wonDeals = await wonQuery.get();
        const lostDeals = await lostQuery.get();

        const totalWon = wonDeals.length;
        const totalLost = lostDeals.length;
        const total = totalWon + totalLost;
        const winRate = total > 0 ? (totalWon / total) * 100 : 0;

        const totalValue = wonDeals.reduce((s, d) => s + (d.value ?? 0), 0);
        const avgDealValue = totalWon > 0 ? totalValue / totalWon : 0;

        // Count lost reasons
        const reasonMap = new Map<string, number>();
        for (const d of lostDeals) {
            const reason = (d as unknown as Record<string, string>).lost_reason || 'Unknown';
            reasonMap.set(reason, (reasonMap.get(reason) ?? 0) + 1);
        }
        const topLostReasons = [...reasonMap.entries()]
            .map(([reason, count]) => ({ reason, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return { totalWon, totalLost, winRate, avgDealValue, topLostReasons };
    }
}
