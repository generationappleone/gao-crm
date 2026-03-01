/**
 * Pricing Simulator — Calculate margin and discount impact
 */

export interface SimulationResult {
    originalPrice: number;
    discountAmount: number;
    discountPercent: number;
    sellingPrice: number;
    costPrice: number;
    grossProfit: number;
    marginPercent: number;
    marginLevel: 'excellent' | 'acceptable' | 'low' | 'danger';
}

export function simulatePrice(
    unitPrice: number,
    costPrice: number,
    discountPercent: number,
): SimulationResult {
    const discountAmount = unitPrice * (discountPercent / 100);
    const sellingPrice = unitPrice - discountAmount;
    const grossProfit = sellingPrice - costPrice;
    const marginPercent = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;

    let marginLevel: SimulationResult['marginLevel'];
    if (marginPercent > 30) marginLevel = 'excellent';
    else if (marginPercent > 20) marginLevel = 'acceptable';
    else if (marginPercent > 10) marginLevel = 'low';
    else marginLevel = 'danger';

    return {
        originalPrice: unitPrice,
        discountAmount,
        discountPercent,
        sellingPrice,
        costPrice,
        grossProfit,
        marginPercent,
        marginLevel,
    };
}

export function getMarginEmoji(level: SimulationResult['marginLevel']): string {
    switch (level) {
        case 'excellent': return '🟢';
        case 'acceptable': return '🟡';
        case 'low': return '🟠';
        case 'danger': return '🔴';
    }
}
