var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Get } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { ContactService } from '../services/contact.service.js';
import { parsePagination } from '../helpers/pagination.js';
import { renderPaginationHtml } from '../helpers/pagination.js';
import { escapeHtml } from '../helpers/escape.js';
import { timeAgo } from '../helpers/format.js';
const contactService = new ContactService();
const STATUS_COLORS = {
    lead: '#94a3b8',
    prospect: '#3b82f6',
    customer: '#22c55e',
    churned: '#ef4444',
};
let ContactController = class ContactController {
    async list(req, res) {
        const pagination = parsePagination(req.query);
        const { search, status } = req.query;
        const result = await contactService.list(pagination, search, status);
        const user = req.user;
        const tableRows = result.contacts.map((c) => `<tr>
            <td>
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:36px;height:36px;border-radius:50%;background:#6366f1;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;">${escapeHtml(c.first_name[0] ?? '')}${escapeHtml(c.last_name[0] ?? '')}</div>
                    <div>
                        <div style="font-weight:600;"><a href="/contacts/${c.id}" style="color:inherit;text-decoration:none;">${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}</a></div>
                        <div style="font-size:12px;color:var(--gao-text-muted,#64748b);">${escapeHtml(c.email ?? '—')}</div>
                    </div>
                </div>
            </td>
            <td>${escapeHtml(c.position ?? '—')}</td>
            <td><span style="padding:4px 10px;border-radius:12px;font-size:11px;font-weight:700;color:#fff;background:${STATUS_COLORS[c.status] ?? '#6366f1'}">${escapeHtml(c.status)}</span></td>
            <td style="font-size:13px;color:var(--gao-text-muted,#64748b);">${timeAgo(c.created_at)}</td>
        </tr>`).join('');
        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Contacts</h1>
                <a href="/contacts/create" style="padding:10px 20px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700;">+ New Contact</a>
            </div>

            <div class="gao-card" style="padding:24px;">
                <div class="gao-admin-table-wrapper">
                    <table class="gao-admin-table">
                        <thead><tr><th>Contact</th><th>Position</th><th>Status</th><th>Created</th></tr></thead>
                        <tbody>${tableRows || '<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--gao-text-muted,#64748b);">No contacts found</td></tr>'}</tbody>
                    </table>
                </div>
                ${renderPaginationHtml(result.meta, '/contacts')}
            </div>
        </div>`;
        return res.html(renderPage({
            title: 'Contacts',
            content,
            activePath: '/contacts',
            user: user ? { name: user.name, role: user.role } : undefined,
        }));
    }
    async createForm(req, res) {
        const user = req.user;
        const content = `
        <div style="padding:8px;">
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">New Contact</h1>
            <div class="gao-card" style="padding:32px;max-width:640px;">
                <form id="createContactForm">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <div class="form-group"><label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">First Name *</label><input type="text" name="first_name" required style="width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;"></div>
                        <div class="form-group"><label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Last Name *</label><input type="text" name="last_name" required style="width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div class="form-group"><label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Email</label><input type="email" name="email" style="width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;"></div>
                        <div class="form-group"><label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Phone</label><input type="tel" name="phone" style="width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div class="form-group"><label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Position</label><input type="text" name="position" style="width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;"></div>
                        <div class="form-group"><label style="display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;">Status</label><select name="status" style="width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;"><option value="lead">Lead</option><option value="prospect">Prospect</option><option value="customer">Customer</option></select></div>
                    </div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">Save Contact</button>
                        <a href="/contacts" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        <script>
            document.getElementById('createContactForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const form = new FormData(e.target);
                const data = Object.fromEntries(form.entries());
                const res = await fetch('/api/contacts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, owner_id: '${user?.id ?? ''}' }),
                });
                if (res.ok) { window.location.href = '/contacts'; }
                else { const err = await res.json(); alert(err.error?.message || 'Failed to create contact'); }
            });
        </script>`;
        return res.html(renderPage({
            title: 'New Contact',
            content,
            activePath: '/contacts',
            user: user ? { name: user.name, role: user.role } : undefined,
        }));
    }
    async detail(req, res) {
        const contact = await contactService.findById(req.params.id);
        if (!contact) {
            return res.redirect('/contacts');
        }
        const user = req.user;
        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <div style="display:flex;align-items:center;gap:16px;">
                    <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:700;">${escapeHtml(contact.first_name[0] ?? '')}${escapeHtml(contact.last_name[0] ?? '')}</div>
                    <div>
                        <h1 style="font-size:24px;font-weight:700;">${escapeHtml(contact.first_name)} ${escapeHtml(contact.last_name)}</h1>
                        <p style="color:var(--gao-text-muted,#64748b);font-size:14px;">${escapeHtml(contact.position ?? 'No position')} ${contact.email ? '· ' + escapeHtml(contact.email) : ''}</p>
                    </div>
                </div>
                <span style="padding:6px 14px;border-radius:12px;font-size:12px;font-weight:700;color:#fff;background:${STATUS_COLORS[contact.status] ?? '#6366f1'}">${escapeHtml(contact.status)}</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <div class="gao-card" style="padding:24px;">
                    <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Details</h3>
                    <div style="display:grid;gap:12px;font-size:14px;">
                        <div><span style="color:var(--gao-text-muted,#64748b);">Phone:</span> ${escapeHtml(contact.phone ?? '—')}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);">City:</span> ${escapeHtml(contact.city ?? '—')}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);">Source:</span> ${escapeHtml(contact.source ?? '—')}</div>
                        <div><span style="color:var(--gao-text-muted,#64748b);">Created:</span> ${timeAgo(contact.created_at)}</div>
                    </div>
                </div>
                <div class="gao-card" style="padding:24px;">
                    <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Notes</h3>
                    <p style="color:var(--gao-text-muted,#64748b);font-size:14px;">${escapeHtml(contact.notes ?? 'No notes yet.')}</p>
                </div>
            </div>
        </div>`;
        return res.html(renderPage({
            title: `${contact.first_name} ${contact.last_name}`,
            content,
            activePath: '/contacts',
            user: user ? { name: user.name, role: user.role } : undefined,
        }));
    }
};
__decorate([
    Get('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "list", null);
__decorate([
    Get('/create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "createForm", null);
__decorate([
    Get('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "detail", null);
ContactController = __decorate([
    Controller('/contacts')
], ContactController);
export { ContactController };
//# sourceMappingURL=contact.controller.js.map