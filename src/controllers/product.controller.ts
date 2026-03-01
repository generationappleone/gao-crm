import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { ProductService } from '../services/product.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { formatCurrency } from '../helpers/format.js';
import { emptyState } from '../helpers/empty-state.js';
import { url } from '../helpers/url.js';

const service = new ProductService();

const inputStyle = `width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;`;
const labelStyle = `display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;`;
const btnPrimary = `padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;`;

@Controller('/products')
export class ProductController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const showAll = req.query.all === '1';
        const products = await service.list(!showAll);

        const rows = products.map(p => `
            <tr style="cursor:pointer;" onclick="window.location.href='${url(`/products/${p.id}`)}'"
 data-search="${escapeHtml((p.name + ' ' + (p.sku ?? '')).toLowerCase())}">

                <td style="font-weight:600;">${escapeHtml(p.name)}</td>
                <td style="color:var(--gao-text-muted,#64748b);">${escapeHtml(p.sku ?? '—')}</td>
                <td style="font-weight:700;">${formatCurrency(p.unit_price, p.currency)}</td>
                <td>${escapeHtml(p.unit ?? 'unit')}</td>
                <td>${p.tax_rate > 0 ? p.tax_rate + '%' : '—'}</td>
                <td><span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;color:#fff;background:${p.is_active ? '#22c55e' : '#94a3b8'}">${p.is_active ? 'Active' : 'Inactive'}</span></td>
            </tr>`).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Products & Services</h1>
                <div style="display:flex;align-items:center;gap:12px;">
                    <a href="${url('/products' + (showAll ? '' : '?all=1'))}" style="padding:8px 14px;background:var(--gao-gray-100, rgba(255,255,255,0.06));border:1px solid var(--gao-border, rgba(100,116,139,0.2));border-radius:8px;font-size:12px;color:var(--gao-text-secondary, #94a3b8);text-decoration:none;font-weight:600;transition:all 0.15s;">${showAll ? 'Show Active Only' : 'Show All'}</a>
                    <a href="${url('/products/create')}" style="${btnPrimary}text-decoration:none;">+ Add Product</a>
                </div>
            </div>
            <div class="gao-card" style="padding:24px;">
                <!-- Search Bar -->
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                    <div style="flex:1;position:relative;">
                        <input type="text" id="productSearch" placeholder="Search products by name or SKU..." style="width:100%;padding:10px 14px 10px 36px;background:var(--gao-surface-raised, rgba(15,23,42,0.4));border:1px solid var(--gao-border, rgba(100,116,139,0.2));border-radius:8px;color:var(--gao-text, #e2e8f0);font-size:13px;outline:none;" />
                        <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--gao-text-muted,#64748b);font-size:14px;">🔍</span>
                    </div>
                    <span id="productCount" style="font-size:12px;color:var(--gao-text-muted,#64748b);white-space:nowrap;">${products.length} products</span>
                </div>
                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table" id="productTable">
                        <thead><tr><th>Product</th><th>SKU</th><th>Price</th><th>Unit</th><th>Tax</th><th>Status</th></tr></thead>
                        <tbody>${rows || '<tr><td colspan="6">' + emptyState({ icon: 'products', title: 'No products yet', description: 'Add your first product or service to start creating quotations and invoices.', action: { label: '+ Add Product', href: url('/products/create') } }) + '</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>
        <script>
        (function() {
            var searchInput = document.getElementById('productSearch');
            var table = document.getElementById('productTable');
            var countEl = document.getElementById('productCount');
            if (searchInput && table) {
                searchInput.addEventListener('input', function() {
                    var query = this.value.toLowerCase().trim();
                    var rows = table.querySelectorAll('tbody tr[data-search]');
                    var visible = 0;
                    rows.forEach(function(row) {
                        var match = !query || row.getAttribute('data-search').indexOf(query) !== -1;
                        row.style.display = match ? '' : 'none';
                        if (match) visible++;
                    });
                    if (countEl) countEl.textContent = visible + ' of ${products.length} products';
                });
            }
        })();
        </script>`;

        return res.html(renderPage({ title: 'Products', content, activePath: '/products', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/create')
    async createForm(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;

        const content = `
        <div style="padding:8px;">
            <a href="${url('/products')}" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back to Products</a>
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">New Product</h1>
            <div class="gao-card" style="padding:32px;max-width:640px;">
                <form id="createProductForm">
                    <div><label style="${labelStyle}">Name *</label><input type="text" name="name" required style="${inputStyle}"></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">SKU</label><input type="text" name="sku" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Unit</label><input type="text" name="unit" value="unit" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Unit Price *</label><input type="number" name="unit_price" step="0.01" required style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Tax Rate (%)</label><input type="number" name="tax_rate" value="0" step="0.01" style="${inputStyle}"></div>
                    </div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Description</label><textarea name="description" rows="3" style="${inputStyle}resize:vertical;"></textarea></div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="${btnPrimary}">Save Product</button>
                        <a href="${url('/products')}" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        <script>
            document.getElementById('createProductForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const data = Object.fromEntries(fd.entries());
                data.unit_price = Number(data.unit_price);
                data.tax_rate = Number(data.tax_rate);
                const res = await fetch('/api/products', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
                if (res.ok) window.location.href = '/products';
                else { const err = await res.json(); alert(err.error?.message || 'Failed'); }
            });
        </script>`;

        return res.html(renderPage({ title: 'New Product', content, activePath: '/products', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id/edit')
    async editForm(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const product = await service.findById(req.params.id);
        if (!product) return res.redirect(url('/products'));

        const content = `
        <div style="padding:8px;">
            <a href="${url(`/products/${product.id}`)}" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back</a>
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Edit Product</h1>
            <div class="gao-card" style="padding:32px;max-width:640px;">
                <form id="editProductForm">
                    <div><label style="${labelStyle}">Product Name *</label><input type="text" name="name" required value="${escapeHtml(product.name)}" style="${inputStyle}"></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">SKU</label><input type="text" name="sku" value="${escapeHtml(product.sku ?? '')}" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Unit</label><input type="text" name="unit" value="${escapeHtml(product.unit ?? 'unit')}" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Price *</label><input type="number" name="unit_price" step="0.01" required value="${product.unit_price ?? 0}" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Tax Rate (%)</label><input type="number" name="tax_rate" step="0.01" value="${product.tax_rate ?? 0}" style="${inputStyle}"></div>
                    </div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Description</label><textarea name="description" rows="3" style="${inputStyle}resize:vertical;">${escapeHtml(product.description ?? '')}</textarea></div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="${btnPrimary}">Update Product</button>
                        <a href="${url(`/products/${product.id}`)}" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        <script>
        document.getElementById('editProductForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd.entries());
            if (data.unit_price) data.unit_price = Number(data.unit_price);
            if (data.tax_rate) data.tax_rate = Number(data.tax_rate);
            const res = await fetch('/api/products/${product.id}', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
            if (res.ok) window.location.href = '/products/${product.id}';
            else { const err = await res.json(); alert(err.error?.message || 'Failed'); }
        });
        </script>`;
        return res.html(renderPage({ title: `Edit ${product.name}`, content, activePath: '/products', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id')
    async detail(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const product = await service.findById(req.params.id);
        if (!product) return res.status(404).html(renderPage({ title: 'Not Found', content: '<div style="padding:40px;text-align:center;"><h1 style="font-size:24px;font-weight:700;">Product Not Found</h1><a href="/products" style="color:#818cf8;">← Back to Products</a></div>', activePath: '/products', user: user ? { name: user.name as string, role: user.role as string } : undefined }));

        const content = `
        <div style="padding:8px;">
            <a href="${url('/products')}" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back to Products</a>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">${escapeHtml(product.name)}</h1>
                <span style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;color:#fff;background:${product.is_active ? '#22c55e' : '#94a3b8'}">${product.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div class="gao-card" style="padding:32px;max-width:640px;">
                <div style="display:grid;grid-template-columns:160px 1fr;gap:12px;font-size:14px;">
                    <div style="color:var(--gao-text-muted,#64748b);font-weight:600;">SKU</div><div style="color:#e2e8f0;">${escapeHtml(product.sku ?? '—')}</div>
                    <div style="color:var(--gao-text-muted,#64748b);font-weight:600;">Price</div><div style="color:#e2e8f0;font-weight:700;">${formatCurrency(product.unit_price, product.currency)}</div>
                    <div style="color:var(--gao-text-muted,#64748b);font-weight:600;">Unit</div><div style="color:#e2e8f0;">${escapeHtml(product.unit ?? 'unit')}</div>
                    <div style="color:var(--gao-text-muted,#64748b);font-weight:600;">Tax Rate</div><div style="color:#e2e8f0;">${product.tax_rate > 0 ? product.tax_rate + '%' : 'No tax'}</div>
                    ${product.description ? `<div style="color:var(--gao-text-muted,#64748b);font-weight:600;">Description</div><div style="color:#cbd5e1;">${escapeHtml(product.description)}</div>` : ''}
                </div>
                <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(100,116,139,0.15);display:flex;gap:8px;">
                    <a href="${url(`/products/${product.id}/edit`)}" style="padding:8px 16px;background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.3);border-radius:8px;text-decoration:none;font-size:12px;">✏️ Edit Product</a>
                    <button onclick="if(confirm('Delete this product?'))fetch('/api/products/${product.id}',{method:'DELETE'}).then(r=>{if(r.ok)window.location.href='/products'})" style="padding:8px 16px;background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.2);border-radius:8px;font-size:12px;cursor:pointer;">Delete Product</button>
                </div>
            </div>
        </div>`;
        return res.html(renderPage({ title: product.name, content, activePath: '/products', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
