import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { InvoiceService } from '../services/invoice.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { formatCurrency, timeAgo } from '../helpers/format.js';
import { emptyState } from '../helpers/empty-state.js';
import { url } from '../helpers/url.js';

const service = new InvoiceService();

const STATUS_COLORS: Record<string, string> = {
    draft: '#94a3b8', pending: '#eab308', sent: '#3b82f6', viewed: '#8b5cf6', partial: '#f59e0b',
    paid: '#22c55e', overdue: '#ef4444', cancelled: '#64748b', refunded: '#ec4899',
};

const inputStyle = `width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;`;
const labelStyle = `display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;`;
const btnPrimary = `padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;`;

@Controller('/invoices')
export class InvoiceController {
    @Get('/')
    async list(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const status = req.query.status as string | undefined;
        const invoices = await service.list({ status: status as any });

        const rows = invoices.map(inv => `
            <tr>
                <td><a href="/invoices/${inv.id}" style="color:#e2e8f0;text-decoration:none;font-weight:600;">${escapeHtml(inv.invoice_number)}</a></td>
                <td style="font-weight:700;">${formatCurrency(inv.total)}</td>
                <td style="color:${inv.amount_due > 0 ? '#f59e0b' : '#22c55e'};font-weight:600;">${formatCurrency(inv.amount_due)}</td>
                <td><span style="padding:3px 10px;border-radius:10px;font-size:11px;font-weight:700;color:#fff;background:${STATUS_COLORS[inv.status] ?? '#6366f1'}">${escapeHtml(inv.status)}</span></td>
                <td style="font-size:13px;color:var(--gao-text-muted,#64748b);">${inv.due_at ? timeAgo(inv.due_at) : '—'}</td>
            </tr>`).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Invoices</h1>
                <a href="/invoices/create" style="padding:10px 20px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700;">+ New Invoice</a>
            </div>
            <div class="gao-card" style="padding:24px;">
                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table">
                        <thead><tr><th>Invoice #</th><th>Total</th><th>Due</th><th>Status</th><th>Due Date</th></tr></thead>
                        <tbody>${rows || '<tr><td colspan="5">' + emptyState({ icon: 'invoices', title: 'No invoices yet', description: 'Create your first invoice to start tracking payments.', action: { label: '+ New Invoice', href: '/invoices/create' } }) + '</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Invoices', content, activePath: '/invoices', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/create')
    async create(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;

        // Load data for dropdowns
        const contactSvc = new (await import('../services/contact.service.js')).ContactService();
        const companySvc = new (await import('../services/company.service.js')).CompanyService();
        const productSvc = new (await import('../services/product.service.js')).ProductService();
        const quotationSvc = new (await import('../services/quotation.service.js')).QuotationService();

        const { contacts } = await contactSvc.list({ page: 1, perPage: 200 });
        const { companies } = await companySvc.list({ page: 1, perPage: 200 });
        const products = await productSvc.list(true);

        // Pre-fill from quotation (via URL query param)
        const prefillQuotationId = req.query.quotation_id as string | undefined;

        interface PrefillData { quotation_id?: string; contact_id?: string; company_id?: string; currency?: string; items?: Array<{ product_id?: string; description: string; quantity: number; unit_price: number; discount_percent: number; tax_rate: number }> }
        let prefill: PrefillData = {};

        if (prefillQuotationId) {
            const quote = await quotationSvc.findById(prefillQuotationId);
            if (quote) {
                const quoteItems = await quotationSvc.getItems(quote.id);
                prefill = {
                    quotation_id: quote.id,
                    contact_id: quote.contact_id ?? undefined,
                    company_id: quote.company_id ?? undefined,
                    currency: quote.currency ?? 'IDR',
                    items: quoteItems.map(qi => ({
                        product_id: qi.product_id ?? undefined,
                        description: qi.description,
                        quantity: qi.quantity,
                        unit_price: qi.unit_price,
                        discount_percent: qi.discount_percent ?? 0,
                        tax_rate: qi.tax_rate ?? 0,
                    })),
                };
            }
        }
        const prefillJson = JSON.stringify(prefill);

        const contactOpts = contacts.map(c => `<option value="${c.id}" data-company="${c.company_id ?? ''}">${escapeHtml(c.first_name + ' ' + c.last_name)}${c.email ? ' (' + escapeHtml(c.email) + ')' : ''}</option>`).join('');
        const companyOpts = companies.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
        const quotations = await quotationSvc.list();
        const quotationOpts = quotations.map(q => `<option value="${q.id}">${escapeHtml(q.quote_number)} — ${escapeHtml(q.title)}</option>`).join('');
        const productJson = JSON.stringify(products.map(p => ({ id: p.id, name: p.name, sku: p.sku ?? '', price: p.unit_price ?? 0 })));
        const contactJson = JSON.stringify(contacts.map(c => ({ id: c.id, name: c.first_name + ' ' + c.last_name, email: c.email ?? '', company_id: c.company_id ?? '' })));

        const content = `
        <div style="padding:8px;">
            <a href="/invoices" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back to Invoices</a>
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">New Invoice</h1>
            <form id="createInvoiceForm">
                <!-- Client & Source Information -->
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
                    <div style="margin-top:16px;">
                        <label style="${labelStyle}">From Quotation</label>
                        <select name="quotation_id" id="quotationSelect" style="${inputStyle}">
                            <option value="">— None (manual invoice) —</option>
                            ${quotationOpts}
                        </select>
                        <p style="font-size:12px;color:#94a3b8;margin-top:6px;">Selecting a quotation will auto-fill Client, Currency, and Line Items from that quotation.</p>
                    </div>
                </div>

                <!-- Invoice Details -->
                <div class="gao-card" style="padding:24px;margin-bottom:20px;">
                    <h3 style="font-size:15px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">🧾 Invoice Details</h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px;">
                        <div>
                            <label style="${labelStyle}">Status</label>
                            <select name="status" style="${inputStyle}">
                                <option value="draft">Draft</option>
                                <option value="pending">Pending</option>
                                <option value="sent">Sent</option>
                                <option value="paid">Paid</option>
                                <option value="overdue">Overdue</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label style="${labelStyle}">Currency</label>
                            <input type="text" name="currency" value="IDR" style="${inputStyle}">
                        </div>
                        <div>
                            <label style="${labelStyle}">Due Date</label>
                            <input type="date" name="due_at" style="${inputStyle}">
                        </div>
                        <div>
                            <label style="${labelStyle}">Payment Method</label>
                            <select name="payment_method" style="${inputStyle}">
                                <option value="">— Not Specified —</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="credit_card">Credit Card</option>
                                <option value="cash">Cash</option>
                                <option value="e_wallet">E-Wallet (OVO/GoPay/DANA)</option>
                                <option value="qris">QRIS</option>
                                <option value="virtual_account">Virtual Account</option>
                                <option value="check">Check</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:16px;">
                        <div>
                            <label style="${labelStyle}">Tax Rate (%)</label>
                            <input type="number" name="tax_rate" step="0.01" min="0" value="11" style="${inputStyle}">
                        </div>
                        <div>
                            <label style="${labelStyle}">Discount</label>
                            <input type="number" name="discount_amount" step="0.01" min="0" value="0" placeholder="Discount amount" style="${inputStyle}">
                        </div>
                        <div></div>
                    </div>
                </div>

                <!-- Billing Type -->
                <div class="gao-card" style="padding:24px;margin-bottom:20px;">
                    <h3 style="font-size:15px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">🔄 Billing Type</h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <div>
                            <label style="${labelStyle}">Invoice Type</label>
                            <select name="is_recurring" id="recurringSelect" style="${inputStyle}">
                                <option value="false">One-Time Invoice</option>
                                <option value="true">Recurring Invoice (Monthly)</option>
                            </select>
                        </div>
                        <div id="recurringDayWrapper" style="display:none;">
                            <label style="${labelStyle}">Recurring Day of Month</label>
                            <input type="number" name="recurring_day" min="1" max="28" value="1" style="${inputStyle}" placeholder="1-28">
                            <p style="font-size:11px;color:#94a3b8;margin-top:4px;">Invoice will be generated on this day every month (1-28)</p>
                        </div>
                    </div>
                    <div style="margin-top:16px;">
                        <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
                            <input type="checkbox" name="is_prorated" id="prorateCheck" value="true" style="width:18px;height:18px;accent-color:#6366f1;">
                            <span style="font-size:14px;color:#e2e8f0;font-weight:600;">Enable Prorate</span>
                        </label>
                        <p style="font-size:12px;color:#94a3b8;margin-top:6px;margin-left:28px;">If enabled, the invoice total will be adjusted based on the remaining days in the current month. Useful for mid-month subscriptions.</p>
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
                    <button type="submit" style="${btnPrimary}">Create Invoice</button>
                    <a href="/invoices" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
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

            // ── Recurring toggle ──
            document.getElementById('recurringSelect').addEventListener('change', function() {
                document.getElementById('recurringDayWrapper').style.display = this.value === 'true' ? 'block' : 'none';
            });

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
                while (contactSel.options.length > 1) contactSel.remove(1);
                for (var i = 0; i < allContactOpts.length; i++) {
                    var o = allContactOpts[i];
                    if (!o.value) continue;
                    if (!selCompanyId || o.getAttribute('data-company') === selCompanyId || !o.getAttribute('data-company')) {
                        contactSel.appendChild(o.cloneNode(true));
                    }
                }
                contactSel.value = currentContactVal;
                if (contactSel.value !== currentContactVal) {
                    contactSel.selectedIndex = 0;
                }
            });

            // ── Pre-fill from URL query param ──
            var prefill = ${prefillJson};
            function applyPrefill(p) {
                if (p.quotation_id) {
                    var qSel = document.getElementById('quotationSelect');
                    if (qSel) qSel.value = p.quotation_id;
                }
                if (p.contact_id) {
                    contactSel.value = p.contact_id;
                    contactSel.dispatchEvent(new Event('change'));
                }
                if (p.company_id) {
                    companySel.value = p.company_id;
                }
                if (p.currency) {
                    var currencyInput = document.querySelector('[name="currency"]');
                    if (currencyInput) currencyInput.value = p.currency;
                }
                // Clear existing items and add prefilled ones
                if (p.items && p.items.length > 0) {
                    tbody.innerHTML = '';
                    itemIdx = 0;
                    for (var pi = 0; pi < p.items.length; pi++) {
                        addItem(p.items[pi]);
                    }
                }
            }
            if (prefill.quotation_id) { applyPrefill(prefill); }

            // ── Dynamic Quotation Selector (on change) ──
            document.getElementById('quotationSelect').addEventListener('change', async function() {
                var qId = this.value;
                if (!qId) return; // user selected "— None —"
                try {
                    var resp = await fetch('/api/quotations/' + qId);
                    if (!resp.ok) { alert('Failed to load quotation'); return; }
                    var json = await resp.json();
                    var q = json.data.data || json.data; // handle envelope wrapping
                    applyPrefill({
                        quotation_id: q.id,
                        contact_id: q.contact_id || undefined,
                        company_id: q.company_id || undefined,
                        currency: q.currency || 'IDR',
                        items: (q.items || []).map(function(qi) {
                            return {
                                product_id: qi.product_id || undefined,
                                description: qi.description,
                                quantity: qi.quantity,
                                unit_price: qi.unit_price,
                                discount_percent: qi.discount_percent || 0,
                                tax_rate: qi.tax_rate || 0
                            };
                        })
                    });
                } catch(e) { alert('Error loading quotation: ' + e.message); }
            });

            function productSelect(idx) {
                var opts = '<option value="">—</option>';
                for (var i = 0; i < products.length; i++) {
                    opts += '<option value="' + products[i].id + '" data-price="' + products[i].price + '" data-name="' + products[i].name + (products[i].sku ? ' (' + products[i].sku + ')' : '') + '">' + products[i].name + (products[i].sku ? ' [' + products[i].sku + ']' : '') + '</option>';
                }
                return '<select data-idx="' + idx + '" class="product-sel" style="' + iStyle + 'font-size:12px;">' + opts + '</select>';
            }

            function addItem(prefillItem) {
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

                // Pre-fill item data
                if (prefillItem) {
                    if (prefillItem.product_id) {
                        var sel = tr.querySelector('.product-sel');
                        sel.value = prefillItem.product_id;
                    }
                    tr.querySelector('[data-field="desc"]').value = prefillItem.description || '';
                    tr.querySelector('[data-field="qty"]').value = prefillItem.quantity || 1;
                    tr.querySelector('[data-field="price"]').value = prefillItem.unit_price || 0;
                    tr.querySelector('[data-field="disc"]').value = prefillItem.discount_percent || 0;
                    tr.querySelector('[data-field="tax"]').value = prefillItem.tax_rate || 0;
                }
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

            document.getElementById('addItemBtn').addEventListener('click', function() { addItem(); });

            // Start with one empty item row if no quotation was pre-filled
            if (!prefill.quotation_id) {
                addItem();
            }

            document.getElementById('createInvoiceForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                var fd = new FormData(e.target);
                var data = {};
                data.contact_id = fd.get('contact_id');
                data.company_id = fd.get('company_id') || undefined;
                data.quotation_id = fd.get('quotation_id') || undefined;
                data.status = fd.get('status') || 'draft';
                data.currency = fd.get('currency') || 'IDR';
                data.due_at = fd.get('due_at') || undefined;
                data.tax_rate = fd.get('tax_rate') ? parseFloat(fd.get('tax_rate')) : 0;
                data.discount_amount = fd.get('discount_amount') ? parseFloat(fd.get('discount_amount')) : 0;
                data.is_recurring = fd.get('is_recurring') === 'true';
                data.recurring_day = data.is_recurring ? parseInt(fd.get('recurring_day') || '1') : undefined;
                data.is_prorated = !!fd.get('is_prorated');
                data.notes = fd.get('notes') || undefined;
                data.terms = fd.get('terms') || undefined;

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

                var res = await fetch('/api/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
                if (res.ok) { window.location.href = '/invoices'; }
                else { var err = await res.json(); alert(err.error?.message || 'Failed to create invoice'); }
            });
        })();
        </script>`;
        return res.html(renderPage({ title: 'New Invoice', content, activePath: '/invoices', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }

    @Get('/:id')
    async detail(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const invoice = await service.findById(req.params.id);
        if (!invoice) return res.redirect(url('/invoices'));
        const items = await service.getItems(req.params.id);

        const itemRows = items.map(it => `
            <tr>
                <td>${escapeHtml(it.description)}</td>
                <td style="text-align:right;">${it.quantity}</td>
                <td style="text-align:right;">${formatCurrency(it.unit_price)}</td>
                <td style="text-align:right;">${it.discount_percent > 0 ? it.discount_percent + '%' : '—'}</td>
                <td style="text-align:right;font-weight:600;">${formatCurrency(it.amount)}</td>
            </tr>`).join('');

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <div>
                    <h1 style="font-size:24px;font-weight:700;">${escapeHtml(invoice.invoice_number)}</h1>
                    <span style="padding:4px 12px;border-radius:10px;font-size:11px;font-weight:700;color:#fff;background:${STATUS_COLORS[invoice.status] ?? '#6366f1'}">${escapeHtml(invoice.status.toUpperCase())}</span>
                </div>
                <a href="/invoices" style="padding:8px 16px;background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:8px;text-decoration:none;font-size:13px;">← Back</a>
            </div>
            <div class="gao-card" style="padding:24px;">
                <table class="gao-admin-table">
                    <thead><tr><th>Description</th><th style="text-align:right;">Qty</th><th style="text-align:right;">Unit Price</th><th style="text-align:right;">Discount</th><th style="text-align:right;">Amount</th></tr></thead>
                    <tbody>${itemRows}</tbody>
                </table>
                <div style="margin-top:24px;text-align:right;font-size:14px;line-height:2;">
                    <div>Subtotal: <strong>${formatCurrency(invoice.subtotal)}</strong></div>
                    ${invoice.discount_amount > 0 ? `<div>Discount: <strong style="color:#ef4444;">-${formatCurrency(invoice.discount_amount)}</strong></div>` : ''}
                    ${invoice.tax_amount > 0 ? `<div>Tax (${invoice.tax_rate}%): <strong>${formatCurrency(invoice.tax_amount)}</strong></div>` : ''}
                    ${invoice.is_prorated && invoice.original_total ? `<div style="font-size:12px;color:#94a3b8;">Original Total: <s>${formatCurrency(invoice.original_total)}</s> (Prorated)</div>` : ''}
                    <div style="font-size:18px;font-weight:800;margin-top:8px;padding-top:8px;border-top:2px solid rgba(100,116,139,0.2);">Total: ${formatCurrency(invoice.total)}</div>
                    <div style="color:${invoice.amount_due > 0 ? '#f59e0b' : '#22c55e'};font-weight:700;">Amount Due: ${formatCurrency(invoice.amount_due)}</div>
                </div>
            </div>

            <!-- Billing Info -->
            ${invoice.is_recurring || invoice.is_prorated ? `
            <div class="gao-card" style="padding:20px;margin-top:20px;">
                <h3 style="font-size:14px;font-weight:700;margin-bottom:12px;">🔄 Billing Info</h3>
                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    ${invoice.is_recurring ? `
                        <span style="padding:6px 14px;border-radius:10px;font-size:12px;font-weight:700;background:rgba(99,102,241,0.15);color:#818cf8;">🔄 Recurring — Day ${invoice.recurring_day ?? 1} of every month</span>
                    ` : `
                        <span style="padding:6px 14px;border-radius:10px;font-size:12px;font-weight:700;background:rgba(100,116,139,0.15);color:#94a3b8;">One-Time Invoice</span>
                    `}
                    ${invoice.is_prorated ? `
                        <span style="padding:6px 14px;border-radius:10px;font-size:12px;font-weight:700;background:rgba(245,158,11,0.15);color:#f59e0b;">📊 Prorated</span>
                    ` : ''}
                </div>
            </div>
            ` : ''}

            <!-- Status Workflow + Payment -->
            <div class="gao-card" style="padding:20px;margin-top:20px;">
                <h3 style="font-size:14px;font-weight:700;margin-bottom:12px;">Actions</h3>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;align-items:center;">
                    <label style="font-size:12px;font-weight:600;color:#cbd5e1;margin-right:4px;">Status:</label>
                    <select id="statusSelect" style="padding:6px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:13px;" onchange="fetch('/api/invoices/${invoice.id}/status',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:this.value})}).then(()=>window.location.reload())">
                        ${['draft', 'pending', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded'].map(s => `<option value="${s}" ${invoice.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
                    </select>
                    ${['sent', 'partial', 'overdue'].includes(invoice.status) ? `
                        <button onclick="document.getElementById('paymentForm').style.display=document.getElementById('paymentForm').style.display==='none'?'flex':'none'" style="padding:8px 16px;background:rgba(34,197,94,0.15);color:#22c55e;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">💳 Record Payment</button>
                    ` : ''}
                    <button onclick="if(confirm('Delete this invoice?'))fetch('/api/invoices/${invoice.id}',{method:'DELETE'}).then(()=>window.location='/invoices')" style="padding:8px 16px;background:rgba(239,68,68,0.15);color:#ef4444;border:none;border-radius:8px;font-size:13px;cursor:pointer;">🗑 Delete</button>
                </div>

                <form id="paymentForm" style="display:none;gap:12px;flex-wrap:wrap;align-items:end;padding:16px;background:rgba(255,255,255,0.02);border-radius:8px;" onsubmit="event.preventDefault();fetch('/api/invoices/${invoice.id}/payments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:Number(this.amount.value),payment_method:this.method.value,reference_number:this.reference.value||null,payment_date:this.date.value||new Date().toISOString()})}).then(()=>window.location.reload())">
                    <div><label style="display:block;font-size:12px;font-weight:600;color:#cbd5e1;margin-bottom:4px;">Amount *</label><input name="amount" type="number" step="0.01" required value="${invoice.amount_due}" style="padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:13px;width:140px;" /></div>
                    <div><label style="display:block;font-size:12px;font-weight:600;color:#cbd5e1;margin-bottom:4px;">Method</label><select name="method" style="padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:13px;"><option value="bank_transfer">Bank Transfer</option><option value="cash">Cash</option><option value="credit_card">Credit Card</option><option value="e_wallet">E-wallet</option></select></div>
                    <div><label style="display:block;font-size:12px;font-weight:600;color:#cbd5e1;margin-bottom:4px;">Reference</label><input name="reference" style="padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:13px;width:140px;" /></div>
                    <div><label style="display:block;font-size:12px;font-weight:600;color:#cbd5e1;margin-bottom:4px;">Date</label><input name="date" type="date" style="padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:8px;color:#e2e8f0;font-size:13px;" /></div>
                    <button type="submit" style="padding:8px 16px;background:#22c55e;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Record</button>
                </form>
            </div>
        </div>`;

        return res.html(renderPage({ title: invoice.invoice_number, content, activePath: '/invoices', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}

