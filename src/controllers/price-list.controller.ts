import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { PriceListService } from '../services/price-list.service.js';
import { escapeHtml } from '../helpers/escape.js';

const service = new PriceListService();

@Controller('/products/price-lists')
export class PriceListController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        let lists: Array<Record<string, unknown>> = [];
        try { lists = (await service.list()) as unknown as Array<Record<string, unknown>>; } catch { /* */ }

        const rows = lists.map(l => `
            <tr>
                <td style="font-weight:600;">${escapeHtml(String(l.name))}</td>
                <td>${Number(l.discount_percent)}%</td>
                <td><span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;color:#fff;background:${l.is_default ? '#6366f1' : l.is_active ? '#22c55e' : '#94a3b8'};">${l.is_default ? '⭐ Default' : l.is_active ? 'Active' : 'Inactive'}</span></td>
            </tr>`).join('');

        const content = `
        <div style="padding:8px;">
            <a href="/products" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back to Products</a>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Price Lists</h1>
                <button onclick="document.getElementById('newPLModal').style.display='flex'" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">+ New Price List</button>
            </div>
            <div class="gao-card" style="padding:24px;">
                ${lists.length > 0 ? `
                <div class="gao-admin-table-wrapper"><table class="gao-admin-table">
                    <thead><tr><th>Name</th><th>Default Discount</th><th>Status</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table></div>` : '<p style="color:#64748b;font-size:13px;text-align:center;padding:20px;">No price lists configured.</p>'}
            </div>
        </div>
        <div id="newPLModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:1000;align-items:center;justify-content:center;">
            <div class="gao-card" style="padding:32px;max-width:480px;width:100%;">
                <h3 style="font-size:18px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">New Price List</h3>
                <form onsubmit="event.preventDefault();const d={name:this.name.value,discount_percent:Number(this.discount_percent.value)};fetch('/api/price-lists',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>{if(r.ok){showToast('Price list created','success');location.reload()}else r.json().then(e=>showToast(e.error?.message||'Failed','error'))})">
                    <div><label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Name</label><input type="text" name="name" required style="width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;"></div>
                    <div style="margin-top:16px;"><label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Default Discount (%)</label><input type="number" name="discount_percent" value="0" min="0" max="100" style="width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;"></div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">Create</button>
                        <button type="button" onclick="document.getElementById('newPLModal').style.display='none'" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border:none;border-radius:10px;cursor:pointer;font-size:14px;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Price Lists', content, activePath: '/products', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
