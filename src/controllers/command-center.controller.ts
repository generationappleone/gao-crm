import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { url } from '../helpers/url.js';

@Controller('/command-center')
export class CommandCenterController {
    @Get('/')
    async index(_req: GaoRequest, res: GaoResponse) {
        // Command Center merged into Dashboard — redirect
        return res.redirect(url('/'));
    }
}
