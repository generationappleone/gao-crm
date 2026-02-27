import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { DashboardService } from '../../services/dashboard.service.js';

const dashboardService = new DashboardService();

@Controller('/api/dashboard')
export class DashboardApiController {
    @Get('/stats')
    async stats(_req: GaoRequest, res: GaoResponse) {
        const stats = await dashboardService.getStats();
        return res.json(stats);
    }
}
