/**
 * GAO CRM — Activity Controller (REDIRECT + CREATE FORM)
 *
 * Activity list is now integrated into CRM Overview.
 * This controller redirects list but keeps the create form.
 */

import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { ContactService } from '../services/contact.service.js';
import { escapeHtml } from '../helpers/escape.js';
import { cardStyle, inputStyle, labelStyle } from '../helpers/crm-shared.js';
import { url } from '../helpers/url.js';

const contactService = new ContactService();

@Controller('/activities')
export class ActivityController {
    @Get('/')
    async list(_req: GaoRequest, res: GaoResponse) {
        return res.redirect(url('/crm'));
    }

    @Get('/create')
    async create(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;

        // Load contacts for dropdown
        let contactOptions = '<option value="">No contact</option>';
        try {
            const contacts = await contactService.list({ page: 1, perPage: 200 });
            contactOptions += contacts.contacts.map(c =>
                `<option value="${c.id}">${escapeHtml(c.first_name + ' ' + c.last_name)}</option>`
            ).join('');
        } catch { /* table may not exist */ }

        const content = `
        <div style="padding:8px;max-width:640px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                <a href="/crm" style="color:#94a3b8;text-decoration:none;font-size:13px;">← Back to CRM</a>
                <h1 style="font-size:24px;font-weight:700;color:#e2e8f0;">Log Activity</h1>
            </div>
            <div style="${cardStyle}">
                <form id="activityForm">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
                        <div><label style="${labelStyle}">Subject *</label><input name="subject" required style="${inputStyle}" /></div>
                        <div>
                            <label style="${labelStyle}">Type *</label>
                            <select name="type" required style="${inputStyle}">
                                <option value="call">📞 Call</option>
                                <option value="meeting">🤝 Meeting</option>
                                <option value="email">📧 Email</option>
                                <option value="task">✅ Task</option>
                                <option value="note">📝 Note</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
                        <div><label style="${labelStyle}">Contact</label><select name="contact_id" style="${inputStyle}">${contactOptions}</select></div>
                        <div><label style="${labelStyle}">Due Date</label><input name="due_at" type="datetime-local" style="${inputStyle}" /></div>
                    </div>
                    <div style="margin-bottom:24px;">
                        <label style="${labelStyle}">Notes</label>
                        <textarea name="description" rows="3" style="${inputStyle}resize:vertical;"></textarea>
                    </div>
                    <div style="display:flex;gap:12px;">
                        <button type="submit" style="padding:10px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">Log Activity</button>
                        <a href="/crm" style="padding:10px 24px;background:rgba(255,255,255,0.06);color:#94a3b8;border-radius:8px;text-decoration:none;font-size:14px;display:flex;align-items:center;">Cancel</a>
                    </div>
                </form>
            </div>
            <script>
            document.getElementById('activityForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                const fd = new FormData(this);
                const body = {
                    subject: fd.get('subject'),
                    type: fd.get('type'),
                    contact_id: fd.get('contact_id') || null,
                    deal_id: null,
                    due_at: fd.get('due_at') || null,
                    description: fd.get('description') || null,
                    owner_id: null,
                };
                const res = await fetch('/api/activities', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                if (res.ok) { showToast('Activity logged!', 'success'); setTimeout(() => window.location.href = '/crm', 600); }
                else { showToast('Error logging activity', 'error'); }
            });
            </script>
        </div>`;

        return res.html(renderPage({ title: 'Log Activity', content, activePath: '/crm', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
