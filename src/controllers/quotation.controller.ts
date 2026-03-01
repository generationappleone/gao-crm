import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { QuotationService } from '../services/quotation.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { formatCurrency, timeAgo, formatDate } from '../helpers/format.js';
import { emptyState } from '../helpers/empty-state.js';
import { url } from '../helpers/url.js';

const service = new QuotationService();

const STATUS_COLORS: Record<string, string> = { draft: '#94a3b8', sent: '#3b82f6', viewed: '#8b5cf6', accepted: '#22c55e', rejected: '#ef4444', revised: '#f59e0b', expired: '#64748b' };
const inputStyle = `width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;`;
const labelStyle = `display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;`;
const btnPrimary = `padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;`;

@Controller('/quotations')
export class QuotationController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const quotes = await service.list();

        const rows = quotes.map(q => `
            <tr>
                <td><a href="/quotations/${q.id}" style="color:#e2e8f0;text-decoration:none;font-weight:600;">${escapeHtml(q.quote_number)}</a></td>
                <td>${escapeHtml(q.title)}</td>
                <td style="font-weight:700;">${formatCurrency(q.total_amount, q.currency)}</td>
                <td><span style="padding:3px 10px;border-radius:10px;font-size:11px;font-weight:700;color:#fff;background:${STATUS_COLORS[q.status] ?? '#6366f1'}">${q.status}</span></td>
                <td style="font-size:12px;color:var(--gao-text-muted,#64748b);">${formatDate(q.valid_until ?? null)}</td>
                <td style="font-size:12px;color:var(--gao-text-muted,#64748b);">${timeAgo(q.created_at)}</td>
            </tr>`).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Quotations</h1>
                <a href="/quotations/create" style="${btnPrimary}text-decoration:none;">+ New Quote</a>
            </div>
            <div class="gao-card" style="padding:24px;">
                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table">
                        <thead><tr><th>Quote #</th><th>Title</th><th>Total</th><th>Status</th><th>Valid Until</th><th>Created</th></tr></thead>
                        <tbody>${rows || '<tr><td colspan="6">' + emptyState({ icon: 'quotations', title: 'No quotations yet', description: 'Create a quotation to send professional proposals to your clients.', action: { label: '+ New Quotation', href: '/quotations/create' } }) + '</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Quotations', content, activePath: '/quotations', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/create')
    async create(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;

        // Load data for dropdowns
        const contactSvc = new (await import('../services/contact.service.js')).ContactService();
        const companySvc = new (await import('../services/company.service.js')).CompanyService();
        const dealSvc = new (await import('../services/deal.service.js')).DealService();
        const productSvc = new (await import('../services/product.service.js')).ProductService();

        const { contacts } = await contactSvc.list({ page: 1, perPage: 200 });
        const { companies } = await companySvc.list({ page: 1, perPage: 200 });
        const { deals } = await dealSvc.list({ page: 1, perPage: 200 });
        const products = await productSvc.list(true);

        // Pre-fill from deal if deal_id is in query params (coming from Pipeline)
        const prefillDealId = req.query.deal_id as string | undefined;
        let prefill: { deal_id?: string; contact_id?: string; company_id?: string; title?: string; currency?: string } = {};
        if (prefillDealId) {
            const prefillDeal = await dealSvc.findById(prefillDealId);
            if (prefillDeal) {
                prefill = {
                    deal_id: prefillDeal.id,
                    contact_id: prefillDeal.contact_id ?? undefined,
                    company_id: prefillDeal.company_id ?? undefined,
                    title: `Quotation for ${prefillDeal.title}`,
                    currency: prefillDeal.currency ?? 'IDR',
                };
            }
        }
        const prefillJson = JSON.stringify(prefill);

        const contactOpts = contacts.map(c => `<option value="${c.id}" data-company="${c.company_id ?? ''}">${escapeHtml(c.first_name + ' ' + c.last_name)}${c.email ? ' (' + escapeHtml(c.email) + ')' : ''}</option>`).join('');
        const companyOpts = companies.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
        const dealOpts = deals.map(d => `<option value="${d.id}">${escapeHtml(d.title)} — ${formatCurrency(d.value, d.currency)}</option>`).join('');
        const productJson = JSON.stringify(products.map(p => ({ id: p.id, name: p.name, sku: p.sku ?? '', price: p.unit_price ?? 0 })));
        const contactJson = JSON.stringify(contacts.map(c => ({ id: c.id, name: c.first_name + ' ' + c.last_name, email: c.email ?? '', company_id: c.company_id ?? '' })));

        const content = `
        <div style="padding:8px;">
            <a href="/quotations" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back to Quotations</a>
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">New Quotation</h1>
            <form id="createQuoteForm">
                <!-- Contact / Company / Deal -->
                <div class="gao-card" style="padding:24px;margin-bottom:20px;">
                    <h3 style="font-size:15px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">📋 Client Information</h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <div>
                            <label style="${labelStyle}">Contact *</label>
                            <select name="contact_id" required style="${inputStyle}">
                                <option value="">— Select Contact —</option>
                                ${contactOpts}
                            </select>
                        </div>
                        <div>
                            <label style="${labelStyle}">Company</label>
                            <select name="company_id" style="${inputStyle}">
                                <option value="">— None —</option>
                                ${companyOpts}
                            </select>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div>
                            <label style="${labelStyle}">Deal</label>
                            <select name="deal_id" style="${inputStyle}">
                                <option value="">— None —</option>
                                ${dealOpts}
                            </select>
                        </div>
                        <div>
                            <label style="${labelStyle}">Title *</label>
                            <input type="text" name="title" required placeholder="Quotation title" style="${inputStyle}">
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:16px;">
                        <div>
                            <label style="${labelStyle}">Currency</label>
                            <input type="text" name="currency" value="IDR" style="${inputStyle}">
                        </div>
                        <div>
                            <label style="${labelStyle}">Valid Until</label>
                            <input type="date" name="valid_until" style="${inputStyle}">
                        </div>
                        <div>
                            <label style="${labelStyle}">Discount</label>
                            <div style="display:flex;gap:8px;">
                                <select name="discount_type" style="${inputStyle}max-width:120px;">
                                    <option value="">None</option>
                                    <option value="percentage">%</option>
                                    <option value="fixed">Fixed</option>
                                </select>
                                <input type="number" name="discount_value" step="0.01" placeholder="0" style="${inputStyle}">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Line Items -->
                <div class="gao-card" style="padding:24px;margin-bottom:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                        <h3 style="font-size:15px;font-weight:700;color:#e2e8f0;">📦 Line Items</h3>
                        <button type="button" id="addItemBtn" style="padding:8px 16px;background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.3);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">+ Add Item</button>
                    </div>
                    <div style="overflow-x:auto;">
                        <table style="width:100%;border-collapse:collapse;font-size:13px;color:#e2e8f0;">
                            <thead>
                                <tr style="border-bottom:1px solid rgba(100,116,139,0.2);text-align:left;">
                                    <th style="padding:8px;font-weight:600;min-width:120px;">Product</th>
                                    <th style="padding:8px;font-weight:600;min-width:180px;">Description *</th>
                                    <th style="padding:8px;font-weight:600;width:80px;text-align:right;">Qty *</th>
                                    <th style="padding:8px;font-weight:600;width:120px;text-align:right;">Unit Price *</th>
                                    <th style="padding:8px;font-weight:600;width:80px;text-align:right;">Disc %</th>
                                    <th style="padding:8px;font-weight:600;width:80px;text-align:right;">Tax %</th>
                                    <th style="padding:8px;font-weight:600;width:110px;text-align:right;">Total</th>
                                    <th style="padding:8px;width:40px;"></th>
                                </tr>
                            </thead>
                            <tbody id="itemsBody"></tbody>
                        </table>
                    </div>
                    <div style="margin-top:16px;text-align:right;font-size:14px;line-height:2;color:#cbd5e1;">
                        <div>Subtotal: <strong id="subtotalDisplay">Rp 0</strong></div>
                        <div style="font-size:18px;font-weight:800;margin-top:4px;padding-top:8px;border-top:2px solid rgba(100,116,139,0.2);">Est. Total: <strong id="totalDisplay">Rp 0</strong></div>
                    </div>
                </div>

                <!-- Notes & Terms -->
                <div class="gao-card" style="padding:24px;margin-bottom:20px;">
                    <h3 style="font-size:15px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">📝 Notes & Terms</h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <div><label style="${labelStyle}">Notes</label><textarea name="notes" rows="3" placeholder="Internal notes..." style="${inputStyle}resize:vertical;"></textarea></div>
                        <div><label style="${labelStyle}">Terms & Conditions</label><textarea name="terms" rows="3" placeholder="Payment terms..." style="${inputStyle}resize:vertical;"></textarea></div>
                    </div>
                </div>

                <div style="display:flex;gap:12px;">
                    <button type="submit" style="${btnPrimary}">Create Quotation</button>
                    <a href="/quotations" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
                </div>
            </form>
        </div>
        <script>
        (function() {
            var products = ${productJson};
            var allContacts = ${contactJson};
            var itemIdx = 0;
            var iStyle = "${inputStyle.replace(/"/g, "'")}";
            var tbody = document.getElementById('itemsBody');

            // ── Contact ↔ Company Cross-Filter ──
            var contactSel = document.querySelector('[name="contact_id"]');
            var companySel = document.querySelector('[name="company_id"]');
            var allContactOpts = Array.from(contactSel.querySelectorAll('option'));

            contactSel.addEventListener('change', function() {
                var opt = this.options[this.selectedIndex];
                if (opt && opt.value) {
                    var compId = opt.getAttribute('data-company');
                    if (compId) {
                        companySel.value = compId;
                    }
                }
            });

            companySel.addEventListener('change', function() {
                var selCompanyId = this.value;
                var currentContactVal = contactSel.value;
                // Remove all contact options except the default
                while (contactSel.options.length > 1) contactSel.remove(1);
                // Re-add filtered options
                for (var i = 0; i < allContactOpts.length; i++) {
                    var o = allContactOpts[i];
                    if (!o.value) continue; // skip placeholder
                    if (!selCompanyId || o.getAttribute('data-company') === selCompanyId || !o.getAttribute('data-company')) {
                        contactSel.appendChild(o.cloneNode(true));
                    }
                }
                // Try to restore previous selection
                contactSel.value = currentContactVal;
                // If current contact is not in filtered list, reset
                if (contactSel.value !== currentContactVal) {
                    contactSel.selectedIndex = 0;
                }
            });

            // ── Pre-fill from Deal (Pipeline → Quotation) ──
            var prefill = ${prefillJson};
            if (prefill.deal_id) {
                // Set Deal dropdown
                var dealSel = document.querySelector('[name="deal_id"]');
                if (dealSel) dealSel.value = prefill.deal_id;

                // Set Contact dropdown and trigger company auto-select
                if (prefill.contact_id) {
                    contactSel.value = prefill.contact_id;
                    contactSel.dispatchEvent(new Event('change'));
                }

                // Set Company dropdown (override if deal has explicit company)
                if (prefill.company_id) {
                    companySel.value = prefill.company_id;
                }

                // Set Title
                if (prefill.title) {
                    var titleInput = document.querySelector('[name="title"]');
                    if (titleInput) titleInput.value = prefill.title;
                }

                // Set Currency
                if (prefill.currency) {
                    var currencyInput = document.querySelector('[name="currency"]');
                    if (currencyInput) currencyInput.value = prefill.currency;
                }
            }

            function productSelect(idx) {
                var opts = '<option value="">—</option>';
                for (var i = 0; i < products.length; i++) {
                    opts += '<option value="' + products[i].id + '" data-price="' + products[i].price + '" data-name="' + products[i].name + (products[i].sku ? ' (' + products[i].sku + ')' : '') + '">' + products[i].name + (products[i].sku ? ' [' + products[i].sku + ']' : '') + '</option>';
                }
                return '<select data-idx="' + idx + '" class="product-sel" style="' + iStyle + 'font-size:12px;">' + opts + '</select>';
            }

            function addItem() {
                var idx = itemIdx++;
                var tr = document.createElement('tr');
                tr.id = 'item-' + idx;
                tr.style.borderBottom = '1px solid rgba(100,116,139,0.1)';
                tr.innerHTML =
                    '<td style="padding:6px;">' + productSelect(idx) + '</td>' +
                    '<td style="padding:6px;"><input type="text" data-field="desc" data-idx="' + idx + '" required style="' + iStyle + 'font-size:12px;" placeholder="Item description"></td>' +
                    '<td style="padding:6px;"><input type="number" data-field="qty" data-idx="' + idx + '" required min="1" value="1" style="' + iStyle + 'font-size:12px;text-align:right;"></td>' +
                    '<td style="padding:6px;"><input type="number" data-field="price" data-idx="' + idx + '" required step="0.01" min="0" value="0" style="' + iStyle + 'font-size:12px;text-align:right;"></td>' +
                    '<td style="padding:6px;"><input type="number" data-field="disc" data-idx="' + idx + '" step="0.01" min="0" max="100" value="0" style="' + iStyle + 'font-size:12px;text-align:right;"></td>' +
                    '<td style="padding:6px;"><input type="number" data-field="tax" data-idx="' + idx + '" step="0.01" min="0" value="0" style="' + iStyle + 'font-size:12px;text-align:right;"></td>' +
                    '<td style="padding:6px;text-align:right;font-weight:600;" id="total-' + idx + '">0</td>' +
                    '<td style="padding:6px;text-align:center;"><button type="button" onclick="this.closest(\\'tr\\').remove();recalc();" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px;">✕</button></td>';
                tbody.appendChild(tr);
                attachEvents(tr, idx);
                recalc();
            }

            function attachEvents(tr, idx) {
                var sel = tr.querySelector('.product-sel');
                sel.addEventListener('change', function() {
                    var opt = this.options[this.selectedIndex];
                    if (opt.value) {
                        tr.querySelector('[data-field="desc"]').value = opt.getAttribute('data-name');
                        tr.querySelector('[data-field="price"]').value = opt.getAttribute('data-price');
                        recalc();
                    }
                });
                var inputs = tr.querySelectorAll('input[type="number"]');
                for (var i = 0; i < inputs.length; i++) {
                    inputs[i].addEventListener('input', recalc);
                }
            }

            window.recalc = function() {
                var rows = tbody.querySelectorAll('tr');
                var subtotal = 0;
                for (var i = 0; i < rows.length; i++) {
                    var qty = parseFloat(rows[i].querySelector('[data-field="qty"]').value) || 0;
                    var price = parseFloat(rows[i].querySelector('[data-field="price"]').value) || 0;
                    var disc = parseFloat(rows[i].querySelector('[data-field="disc"]').value) || 0;
                    var tax = parseFloat(rows[i].querySelector('[data-field="tax"]').value) || 0;
                    var line = qty * price;
                    line = line - (line * disc / 100);
                    line = line + (line * tax / 100);
                    var idx = rows[i].querySelector('[data-field="qty"]').getAttribute('data-idx');
                    document.getElementById('total-' + idx).textContent = line.toLocaleString('id-ID');
                    subtotal += line;
                }
                document.getElementById('subtotalDisplay').textContent = 'Rp ' + subtotal.toLocaleString('id-ID');
                document.getElementById('totalDisplay').textContent = 'Rp ' + subtotal.toLocaleString('id-ID');
            };

            document.getElementById('addItemBtn').addEventListener('click', addItem);

            // Start with one item row
            addItem();

            document.getElementById('createQuoteForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                var fd = new FormData(e.target);
                var data = {};
                data.title = fd.get('title');
                data.contact_id = fd.get('contact_id');
                data.company_id = fd.get('company_id') || undefined;
                data.deal_id = fd.get('deal_id') || undefined;
                data.currency = fd.get('currency') || 'IDR';
                data.valid_until = fd.get('valid_until') || undefined;
                data.notes = fd.get('notes') || undefined;
                data.terms = fd.get('terms') || undefined;
                data.discount_type = fd.get('discount_type') || undefined;
                data.discount_value = fd.get('discount_value') ? parseFloat(fd.get('discount_value')) : undefined;

                // Collect line items
                var rows = tbody.querySelectorAll('tr');
                var items = [];
                for (var i = 0; i < rows.length; i++) {
                    var sel = rows[i].querySelector('.product-sel');
                    items.push({
                        product_id: sel.value || undefined,
                        description: rows[i].querySelector('[data-field="desc"]').value,
                        quantity: parseFloat(rows[i].querySelector('[data-field="qty"]').value) || 1,
                        unit_price: parseFloat(rows[i].querySelector('[data-field="price"]').value) || 0,
                        discount_percent: parseFloat(rows[i].querySelector('[data-field="disc"]').value) || 0,
                        tax_rate: parseFloat(rows[i].querySelector('[data-field="tax"]').value) || 0,
                    });
                }
                data.items = items;

                if (!data.contact_id) { alert('Please select a contact'); return; }
                if (items.length === 0) { alert('Please add at least one item'); return; }

                var res = await fetch('/api/quotations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
                if (res.ok) { window.location.href = '/quotations'; }
                else { var err = await res.json(); alert(err.error?.message || 'Failed to create quotation'); }
            });
        })();
        </script>`;
        return res.html(renderPage({ title: 'New Quotation', content, activePath: '/quotations', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id')
    async detail(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const quote = await service.findById(req.params.id);
        if (!quote) return res.redirect(url('/quotations'));
        const items = await service.getItems(req.params.id);

        const itemRows = items.map(it => `
            <tr>
                <td>${escapeHtml(it.description)}</td>
                <td style="text-align:right;">${it.quantity}</td>
                <td style="text-align:right;">${formatCurrency(it.unit_price)}</td>
                <td style="text-align:right;">${it.discount_percent > 0 ? it.discount_percent + '%' : '—'}</td>
                <td style="text-align:right;font-weight:600;">${formatCurrency(it.total)}</td>
            </tr>`).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <div>
                    <h1 style="font-size:24px;font-weight:700;">${escapeHtml(quote.quote_number)} — ${escapeHtml(quote.title)}</h1>
                    <span style="padding:4px 12px;border-radius:10px;font-size:11px;font-weight:700;color:#fff;background:${STATUS_COLORS[quote.status] ?? '#6366f1'}">${quote.status.toUpperCase()}</span>
                </div>
                <a href="/quotations" style="padding:8px 16px;background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:8px;text-decoration:none;font-size:13px;">← Back</a>
            </div>
            <div class="gao-card" style="padding:24px;">
                <table class="gao-admin-table">
                    <thead><tr><th>Description</th><th style="text-align:right;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Discount</th><th style="text-align:right;">Total</th></tr></thead>
                    <tbody>${itemRows}</tbody>
                </table>
                <div style="margin-top:24px;text-align:right;font-size:14px;line-height:2;">
                    <div>Subtotal: <strong>${formatCurrency(quote.subtotal, quote.currency)}</strong></div>
                    ${quote.discount_value > 0 ? `<div>Discount: <strong style="color:#ef4444;">-${quote.discount_type === 'percentage' ? quote.discount_value + '%' : formatCurrency(quote.discount_value)}</strong></div>` : ''}
                    ${quote.tax_amount > 0 ? `<div>Tax: <strong>${formatCurrency(quote.tax_amount)}</strong></div>` : ''}
                    <div style="font-size:18px;font-weight:800;margin-top:8px;padding-top:8px;border-top:2px solid rgba(100,116,139,0.2);">Total: ${formatCurrency(quote.total_amount, quote.currency)}</div>
                </div>
                ${quote.notes ? `<div style="margin-top:24px;padding:16px;background:rgba(255,255,255,0.02);border-radius:8px;font-size:13px;color:var(--gao-text-muted,#64748b);"><strong>Notes:</strong> ${escapeHtml(quote.notes)}</div>` : ''}
            </div>

            <!-- Status Workflow Actions -->
            <div class="gao-card" style="padding:20px;margin-top:20px;">
                <h3 style="font-size:14px;font-weight:700;margin-bottom:12px;">Actions</h3>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    ${quote.status === 'draft' ? `
                        <button onclick="fetch('/api/quotations/${quote.id}',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'sent'})}).then(()=>window.location.reload())" style="padding:8px 16px;background:rgba(59,130,246,0.15);color:#3b82f6;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">📤 Send to Client</button>
                    ` : ''}
                    ${quote.status === 'sent' ? `
                        <button onclick="fetch('/api/quotations/${quote.id}',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'accepted'})}).then(()=>window.location.reload())" style="padding:8px 16px;background:rgba(34,197,94,0.15);color:#22c55e;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">✅ Mark Accepted</button>
                        <button onclick="fetch('/api/quotations/${quote.id}',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'rejected'})}).then(()=>window.location.reload())" style="padding:8px 16px;background:rgba(239,68,68,0.15);color:#ef4444;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">❌ Mark Rejected</button>
                    ` : ''}
                    ${quote.status === 'accepted' ? `
                        <button onclick="if(confirm('Convert this quotation to invoice?'))fetch('/api/invoices',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({quotation_id:'${quote.id}',contact_id:'${quote.contact_id ?? ''}',deal_id:'${quote.deal_id ?? ''}',currency:'${quote.currency ?? 'IDR'}',notes:'Converted from ${escapeHtml(quote.quote_number)}'})}).then(r=>r.json()).then(d=>{if(d.data?.id)window.location='/invoices/'+d.data.id;else window.location='/invoices';})" style="padding:8px 16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">💳 Convert to Invoice</button>
                    ` : ''}
                    <button onclick="if(confirm('Delete this quotation?'))fetch('/api/quotations/${quote.id}',{method:'DELETE'}).then(()=>window.location='/quotations')" style="padding:8px 16px;background:rgba(239,68,68,0.15);color:#ef4444;border:none;border-radius:8px;font-size:13px;cursor:pointer;">🗑 Delete</button>
                </div>
            </div>
        </div>`;

        return res.html(renderPage({ title: quote.quote_number, content, activePath: '/quotations', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
