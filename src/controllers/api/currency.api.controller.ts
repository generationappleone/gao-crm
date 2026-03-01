import { Controller, Get, Post, Patch } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { CurrencyService } from '../../services/currency.service.js';

const service = new CurrencyService();

@Controller('/api/currencies')
export class CurrencyApiController {
    @Get('/') async list(_req: GaoRequest, res: GaoResponse) { return res.json({ data: (await service.list()).map((c) => c.toJSON()) }); }
    @Post('/') async create(req: GaoRequest, res: GaoResponse) { const b = req.body as any; if (!b.code || !b.name || !b.symbol) return res.error(422, 'VALIDATION', 'code, name, symbol required'); return res.status(201).json({ data: (await service.create(b)).toJSON() }); }
    @Patch('/:code/default') async setDefault(req: GaoRequest, res: GaoResponse) { await service.setDefault(req.params.code); return res.json({ data: { default: req.params.code } }); }
    @Post('/rates') async addRate(req: GaoRequest, res: GaoResponse) { const b = req.body as any; if (!b.from || !b.to || !b.rate) return res.error(422, 'VALIDATION', 'from, to, rate required'); const r = await service.addRate(b.from, b.to, b.rate); return res.status(201).json({ data: r.toJSON() }); }
    @Get('/convert') async convert(req: GaoRequest, res: GaoResponse) { const { amount, from, to } = req.query as any; try { const result = await service.convert(Number(amount), from, to); return res.json({ data: { amount: Number(amount), from, to, result } }); } catch { return res.error(404, 'NOT_FOUND', 'Exchange rate not found'); } }
}
