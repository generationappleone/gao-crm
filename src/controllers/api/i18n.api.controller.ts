import { Controller, Get, Post } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { I18nService } from '../../services/i18n.service.js';

const service = new I18nService();

@Controller('/api/i18n')
export class I18nApiController {
    @Get('/locales') async locales(_req: GaoRequest, res: GaoResponse) { return res.json({ data: await service.getLocales() }); }
    @Get('/:locale') async get(req: GaoRequest, res: GaoResponse) { const ns = (req.query.namespace as string) ?? 'common'; return res.json({ data: await service.getTranslations(req.params.locale, ns) }); }
    @Post('/') async set(req: GaoRequest, res: GaoResponse) { const b = req.body as any; if (!b.locale || !b.key || !b.value) return res.error(422, 'VALIDATION', 'locale, key, value required'); const t = await service.setTranslation(b.locale, b.namespace ?? 'common', b.key, b.value); return res.status(201).json({ data: t.toJSON() }); }
}
