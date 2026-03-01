import { Controller, Get, Post } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { AiSalesService } from '../../services/ai-sales.service.js';

const service = new AiSalesService();

@Controller('/api/ai')
export class AiSalesApiController {
    @Post('/suggest-pricing')
    async suggestPricing(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const result = await service.suggestPricing(
            body.product_id as string,
            body.company_id as string | undefined,
        );
        return res.json({ data: result });
    }

    @Post('/suggest-bundles')
    async suggestBundles(_req: GaoRequest, res: GaoResponse) {
        const result = await service.suggestBundles();
        return res.json({ data: result });
    }

    @Get('/deal-coach/:dealId')
    async coachDeal(req: GaoRequest, res: GaoResponse) {
        const result = await service.coachDeal(req.params.dealId);
        return res.json({ data: result });
    }

    @Post('/write-quote-note')
    async writeQuoteNote(req: GaoRequest, res: GaoResponse) {
        const body = req.body as Record<string, unknown>;
        const result = await service.writeQuoteNote(
            body.quotation_id as string,
            (body.tone as string) ?? 'professional',
            (body.language as string) ?? 'id',
        );
        return res.json({ data: result });
    }

    @Get('/monthly-insights')
    async monthlyInsights(_req: GaoRequest, res: GaoResponse) {
        const result = await service.getMonthlyInsights();
        return res.json({ data: result });
    }
}
