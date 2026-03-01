/**
 * AI Sales Intelligence Service
 *
 * Provides AI-powered sales assistance including:
 * - Smart pricing recommendations
 * - Bundle suggestions
 * - Deal coaching
 * - Quote note writing
 * - Monthly sales insights
 */

export interface PricingSuggestion {
    label: string;
    price: number;
    discount_percent: number;
    win_probability: number;
    margin_percent: number;
    reasoning: string;
}

export interface BundleSuggestion {
    name: string;
    products: Array<{ id: string; name: string; quantity: number }>;
    retail_total: number;
    suggested_price: number;
    confidence: number;
    reasoning: string;
}

export interface DealCoachResult {
    win_probability: number;
    factors: Array<{ label: string; impact: number; emoji: string }>;
    suggestions: string[];
}

export interface MonthlyInsight {
    summary: string;
    recommendations: Array<{ category: string; icon: string; suggestion: string }>;
    new_product_opportunities: string[];
}

export class AiSalesService {
    /**
     * Generate pricing suggestions based on historical data.
     * Returns 3 pricing options: optimal, aggressive, premium.
     */
    async suggestPricing(_productId: string, _companyId?: string): Promise<{
        suggestions: PricingSuggestion[];
        analysis_summary: string;
    }> {
        // Placeholder — in production, this calls Gemini/OpenAI API
        // with data gathered from DB and prompt from ai-prompts.ts
        return {
            suggestions: [
                { label: 'Optimal', price: 13500000, discount_percent: 10, win_probability: 78, margin_percent: 40.7, reasoning: 'Diskon 10% memberikan win rate terbaik berdasarkan data historis.' },
                { label: 'Agresif', price: 12000000, discount_percent: 20, win_probability: 89, margin_percent: 33.3, reasoning: 'Diskon agresif untuk menang kompetisi ketat.' },
                { label: 'Premium', price: 14500000, discount_percent: 3, win_probability: 62, margin_percent: 44.8, reasoning: 'Harga premium untuk customer dengan budget besar.' },
            ],
            analysis_summary: `Berdasarkan analisis data historis, diskon 10% menghasilkan win rate optimal.`,
        };
    }

    /**
     * Suggest product bundles based on co-occurrence in quotations.
     */
    async suggestBundles(): Promise<{ bundles: BundleSuggestion[] }> {
        return {
            bundles: [
                { name: 'Website Complete', products: [], retail_total: 21000000, suggested_price: 18000000, confidence: 92, reasoning: '74% deal won include kedua produk ini' },
                { name: 'Digital Growth', products: [], retail_total: 45000000, suggested_price: 35000000, confidence: 78, reasoning: 'Customer SEO punya 3x lifetime value' },
            ],
        };
    }

    /**
     * AI deal coaching — predict win probability and give tactical advice.
     */
    async coachDeal(_dealId: string): Promise<DealCoachResult> {
        return {
            win_probability: 68,
            factors: [
                { label: 'Harga kompetitif', impact: 15, emoji: '🟢' },
                { label: 'Relasi sudah dibangun', impact: 10, emoji: '🟢' },
                { label: 'Durasi negotiation', impact: -5, emoji: '🟡' },
                { label: 'Decision maker', impact: -8, emoji: '🔴' },
            ],
            suggestions: [
                'Hubungi decision maker. Win rate naik ke 85%.',
                'Tawarkan bundle. Win rate bundle: 79%.',
                'Kirim final offer dalam 3 hari.',
            ],
        };
    }

    /**
     * Generate a professional cover letter/note for a quotation.
     */
    async writeQuoteNote(_quotationId: string, _tone: string, language: string): Promise<{ note: string }> {
        const isId = language === 'id';
        return {
            note: isId
                ? `Terima kasih atas kesempatan yang diberikan untuk menawarkan solusi kami.\n\nBerikut kami sampaikan penawaran harga yang telah disesuaikan dengan kebutuhan perusahaan Anda. Penawaran ini berlaku selama 30 hari sejak tanggal pengiriman.\n\nKami berharap dapat menjadi mitra strategis dalam mendukung pertumbuhan bisnis Anda. Kami siap berdiskusi lebih lanjut mengenai detail penawaran ini.\n\nHormat kami,\nTeam GAO CRM`
                : `Thank you for the opportunity to present our solution.\n\nPlease find attached our quotation tailored to your requirements. This offer is valid for 30 days from the date of submission.\n\nWe look forward to partnering with you to support your business growth. Please do not hesitate to reach out for further discussion.\n\nBest regards,\nTeam GAO CRM`,
        };
    }

    /**
     * Generate monthly sales intelligence report.
     */
    async getMonthlyInsights(): Promise<MonthlyInsight> {
        return {
            summary: 'Win rate bulan ini stabil di 62%. Revenue meningkat 15% dari bulan sebelumnya.',
            recommendations: [
                { category: 'pricing', icon: '🏷️', suggestion: 'Buat price list khusus untuk segmen F&B dengan diskon 25%' },
                { category: 'product', icon: '📦', suggestion: 'Buat bundle starter package untuk UMKM' },
                { category: 'process', icon: '⏰', suggestion: 'Set reminder follow-up otomatis hari ke-7 setelah quotation dikirim' },
            ],
            new_product_opportunities: ['Social Media Management', 'Google Ads Campaign'],
        };
    }
}
