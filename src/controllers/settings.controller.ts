import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { TagService } from '../services/tag.service.js';
import { CurrencyService } from '../services/currency.service.js';
import { ApprovalService } from '../services/approval.service.js';
import { escapeHtml } from '../helpers/escape.js';

const tagService = new TagService();
const currencyService = new CurrencyService();
const approvalService = new ApprovalService();

const inputStyle = `width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;`;
const labelStyle = `display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;`;
const backLink = `<a href="/settings" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;text-decoration:none;margin-bottom:20px;">← Back to Settings</a>`;
const btnPrimary = `padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;`;

function page(req: GaoRequest) {
    const user = req.user as Record<string, unknown>;
    return { user: user ? { name: user.name as string, role: user.role as string } : undefined };
}

@Controller('/settings')
export class SettingsController {
    @Get('/')
    async index(req: GaoRequest, res: GaoResponse) {
        const { user } = page(req);
        const sections = [
            { icon: '👤', title: 'Profile', desc: 'Update your name, email, and avatar', href: '/settings/profile' },
            { icon: '🔑', title: 'Security', desc: 'Change password, enable 2FA, manage sessions', href: '/settings/security' },
            { icon: '🏢', title: 'Company', desc: 'Company name, logo, industry, and address', href: '/settings/company' },
            { icon: '📧', title: 'Email', desc: 'SMTP settings, email signatures, and templates', href: '/settings/email' },
            { icon: '🔗', title: 'Integrations', desc: 'Connect third-party services and APIs', href: '/settings/integrations' },
            { icon: '👥', title: 'Team', desc: 'Manage users, roles, and permissions', href: '/settings/team' },
            { icon: '💱', title: 'Currency', desc: 'Default currency and exchange rates', href: '/settings/currency' },
            { icon: '🌍', title: 'Localization', desc: 'Language, timezone, and date format', href: '/settings/i18n' },
            { icon: '🔔', title: 'Notifications', desc: 'Email, push, and in-app notification preferences', href: '/settings/notifications' },
            { icon: '🛡️', title: 'Approval Chains', desc: 'Set up approval workflows for quotes and deals', href: '/settings/approvals' },
            { icon: '📊', title: 'Pipelines', desc: 'Configure sales pipeline stages and automation', href: '/pipelines' },
            { icon: '🏷️', title: 'Tags', desc: 'Manage tags for contacts, companies, and deals', href: '/settings/tags' },
            { icon: '🤖', title: 'AI Chatbot', desc: 'Configure AI chatbot provider, knowledge base, and behavior', href: '/settings/chatbot' },
        ];

        const cards = sections.map(s => `
            <a href="${s.href}" style="text-decoration:none;">
                <div class="gao-card" style="padding:20px;cursor:pointer;transition:transform 0.15s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
                    <div style="display:flex;align-items:center;gap:14px;">
                        <div style="font-size:28px;">${s.icon}</div>
                        <div>
                            <h3 style="font-size:14px;font-weight:700;color:#e2e8f0;">${s.title}</h3>
                            <p style="font-size:12px;color:var(--gao-text-muted,#64748b);margin-top:2px;">${s.desc}</p>
                        </div>
                    </div>
                </div>
            </a>`).join('');

        const content = `
        <div style="padding:8px;">
            <div style="margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Settings</h1>
                <p style="font-size:14px;color:var(--gao-text-muted,#64748b);margin-top:4px;">Manage your CRM configuration</p>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;">
                ${cards}
            </div>
        </div>`;

        return res.html(renderPage({ title: 'Settings', content, activePath: '/settings', user }));
    }

    @Get('/profile')
    async profile(req: GaoRequest, res: GaoResponse) {
        const u = req.user as Record<string, unknown>;
        const { user } = page(req);
        const content = `
        <div style="padding:8px;">
            ${backLink}
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Profile Settings</h1>
            <div class="gao-card" style="padding:32px;max-width:640px;">
                <form id="profileForm">
                    <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px;">
                        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff;">${String(u?.name ?? 'A').charAt(0).toUpperCase()}</div>
                        <div><h3 style="font-size:16px;font-weight:700;color:#e2e8f0;">${escapeHtml(String(u?.name ?? ''))}</h3><p style="font-size:13px;color:var(--gao-text-muted,#64748b);">${escapeHtml(String(u?.email ?? ''))}</p></div>
                    </div>
                    <div><label style="${labelStyle}">Full Name</label><input type="text" name="name" value="${escapeHtml(String(u?.name ?? ''))}" style="${inputStyle}"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Email</label><input type="email" name="email" value="${escapeHtml(String(u?.email ?? ''))}" style="${inputStyle}"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Phone</label><input type="tel" name="phone" style="${inputStyle}" placeholder="+62..."></div>
                    <div style="margin-top:24px;"><button type="submit" style="${btnPrimary}">Save Changes</button></div>
                </form>
            </div>
        </div>
        <script>
        document.getElementById('profileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            alert('Profile update saved (demo mode)');
        });
        </script>`;
        return res.html(renderPage({ title: 'Profile', content, activePath: '/settings', user }));
    }

    @Get('/security')
    async security(req: GaoRequest, res: GaoResponse) {
        const { user } = page(req);
        const content = `
        <div style="padding:8px;">
            ${backLink}
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Security Settings</h1>
            <div class="gao-card" style="padding:32px;max-width:640px;">
                <h3 style="font-size:16px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">Change Password</h3>
                <form id="securityForm">
                    <div><label style="${labelStyle}">Current Password</label><input type="password" name="current_password" required style="${inputStyle}"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">New Password</label><input type="password" name="new_password" required minlength="8" style="${inputStyle}"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Confirm New Password</label><input type="password" name="confirm_password" required minlength="8" style="${inputStyle}"></div>
                    <div style="margin-top:24px;"><button type="submit" style="${btnPrimary}">Update Password</button></div>
                </form>
            </div>
            <div class="gao-card" style="padding:32px;max-width:640px;margin-top:16px;">
                <h3 style="font-size:16px;font-weight:700;color:#e2e8f0;margin-bottom:8px;">Two-Factor Authentication</h3>
                <p style="font-size:13px;color:var(--gao-text-muted,#64748b);margin-bottom:16px;">Add an extra layer of security to your account</p>
                <button style="padding:10px 20px;background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.3);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Enable 2FA</button>
            </div>
        </div>
        <script>
        document.getElementById('securityForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            if (fd.get('new_password') !== fd.get('confirm_password')) { alert('Passwords do not match'); return; }
            alert('Password updated (demo mode)');
        });
        </script>`;
        return res.html(renderPage({ title: 'Security', content, activePath: '/settings', user }));
    }

    @Get('/company')
    async company(req: GaoRequest, res: GaoResponse) {
        const { user } = page(req);
        const content = `
        <div style="padding:8px;">
            ${backLink}
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Company Settings</h1>
            <div class="gao-card" style="padding:32px;max-width:640px;">
                <form id="companyForm">
                    <div><label style="${labelStyle}">Company Name</label><input type="text" name="company_name" value="GAO CRM" style="${inputStyle}"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Industry</label><input type="text" name="industry" value="Technology" style="${inputStyle}"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Website</label><input type="url" name="website" placeholder="https://..." style="${inputStyle}"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Phone</label><input type="tel" name="phone" style="${inputStyle}"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Address</label><textarea name="address" rows="3" style="${inputStyle}resize:vertical;"></textarea></div>
                    <div style="margin-top:24px;"><button type="submit" style="${btnPrimary}">Save Company Info</button></div>
                </form>
            </div>
        </div>
        <script>
        document.getElementById('companyForm').addEventListener('submit', async (e) => { e.preventDefault(); alert('Company settings saved (demo mode)'); });
        </script>`;
        return res.html(renderPage({ title: 'Company', content, activePath: '/settings', user }));
    }

    @Get('/email')
    async email(req: GaoRequest, res: GaoResponse) {
        const { user } = page(req);
        const content = `
        <div style="padding:8px;">
            ${backLink}
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Email Settings</h1>
            <div class="gao-card" style="padding:32px;max-width:640px;">
                <h3 style="font-size:16px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">SMTP Configuration</h3>
                <form id="emailForm">
                    <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;">
                        <div><label style="${labelStyle}">SMTP Host</label><input type="text" name="smtp_host" placeholder="smtp.gmail.com" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Port</label><input type="number" name="smtp_port" value="587" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Username</label><input type="text" name="smtp_user" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Password</label><input type="password" name="smtp_pass" style="${inputStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">From Email</label><input type="email" name="from_email" placeholder="noreply@company.com" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">From Name</label><input type="text" name="from_name" placeholder="GAO CRM" style="${inputStyle}"></div>
                    </div>
                    <div style="margin-top:16px;"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" name="use_tls"> <span style="font-size:13px;color:#cbd5e1;">Use TLS/SSL encryption</span></label></div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="${btnPrimary}">Save SMTP Settings</button>
                        <button type="button" onclick="alert('Test email sent (demo mode)')" style="padding:12px 24px;background:rgba(34,197,94,0.15);color:#22c55e;border:1px solid rgba(34,197,94,0.3);border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">Send Test Email</button>
                    </div>
                </form>
            </div>
        </div>
        <script>
        document.getElementById('emailForm').addEventListener('submit', async (e) => { e.preventDefault(); alert('Email settings saved (demo mode)'); });
        </script>`;
        return res.html(renderPage({ title: 'Email Settings', content, activePath: '/settings', user }));
    }

    @Get('/integrations')
    async integrations(req: GaoRequest, res: GaoResponse) {
        const { user } = page(req);
        const integrations = [
            { name: 'Google Calendar', icon: '📅', desc: 'Sync events and meetings', connected: false },
            { name: 'Slack', icon: '💬', desc: 'Get deal and activity notifications', connected: false },
            { name: 'Mailchimp', icon: '📧', desc: 'Sync contacts for email campaigns', connected: false },
            { name: 'Zapier', icon: '⚡', desc: 'Connect with 5000+ apps', connected: false },
            { name: 'WhatsApp Business', icon: '📱', desc: 'Send messages and notifications', connected: false },
            { name: 'Stripe', icon: '💳', desc: 'Process payments and invoices', connected: false },
        ];
        const cards = integrations.map(i => `
            <div class="gao-card" style="padding:20px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:24px;">${i.icon}</span>
                        <div><h4 style="font-size:14px;font-weight:700;color:#e2e8f0;">${i.name}</h4><p style="font-size:12px;color:var(--gao-text-muted,#64748b);">${i.desc}</p></div>
                    </div>
                    <button style="padding:8px 16px;background:${i.connected ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)'};color:${i.connected ? '#ef4444' : '#818cf8'};border:1px solid ${i.connected ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'};border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">${i.connected ? 'Disconnect' : 'Connect'}</button>
                </div>
            </div>`).join('');
        const content = `
        <div style="padding:8px;">
            ${backLink}
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Integrations</h1>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:12px;">${cards}</div>
        </div>`;
        return res.html(renderPage({ title: 'Integrations', content, activePath: '/settings', user }));
    }

    @Get('/team')
    async team(req: GaoRequest, res: GaoResponse) {
        const { user } = page(req);
        const content = `
        <div style="padding:8px;">
            ${backLink}
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Team Management</h1>
                <button onclick="document.getElementById('inviteModal').style.display='flex'" style="${btnPrimary}">+ Invite User</button>
            </div>
            <div class="gao-card" style="padding:24px;">
                <div class="gao-admin-table-wrapper"><table class="gao-admin-table">
                    <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        <tr><td style="font-weight:600;">Administrator</td><td>Admin</td><td><span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;color:#fff;background:#22c55e;">Active</span></td><td style="color:var(--gao-text-muted,#64748b);font-size:12px;">Current User</td></tr>
                    </tbody>
                </table></div>
            </div>
        </div>
        <div id="inviteModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:1000;align-items:center;justify-content:center;">
            <div class="gao-card" style="padding:32px;max-width:480px;width:100%;">
                <h3 style="font-size:18px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">Invite Team Member</h3>
                <form onsubmit="event.preventDefault();alert('Invite sent (demo mode)');document.getElementById('inviteModal').style.display='none';">
                    <div><label style="${labelStyle}">Email</label><input type="email" required style="${inputStyle}" placeholder="user@company.com"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Role</label><select style="${inputStyle}"><option>Admin</option><option>Manager</option><option>Sales Rep</option><option>Viewer</option></select></div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="${btnPrimary}">Send Invite</button>
                        <button type="button" onclick="document.getElementById('inviteModal').style.display='none'" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border:none;border-radius:10px;cursor:pointer;font-size:14px;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>`;
        return res.html(renderPage({ title: 'Team', content, activePath: '/settings', user }));
    }

    @Get('/currency')
    async currency(req: GaoRequest, res: GaoResponse) {
        const { user } = page(req);
        let currencies: Array<Record<string, unknown>> = [];
        try { currencies = await currencyService.list() as unknown as Array<Record<string, unknown>>; } catch { /* table may not exist */ }
        const rows = currencies.map(c => `<tr>
            <td style="font-weight:600;">${escapeHtml(String(c.code))}</td>
            <td>${escapeHtml(String(c.name))}</td>
            <td>${escapeHtml(String(c.symbol))}</td>
            <td>${c.is_default ? '<span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;color:#fff;background:#22c55e;">Default</span>' : '<button style="padding:3px 8px;border-radius:6px;font-size:10px;background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.3);cursor:pointer;">Set Default</button>'}</td>
        </tr>`).join('');
        const content = `
        <div style="padding:8px;">
            ${backLink}
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Currency Settings</h1>
            <div class="gao-card" style="padding:24px;">
                ${currencies.length > 0 ? `<div class="gao-admin-table-wrapper"><table class="gao-admin-table"><thead><tr><th>Code</th><th>Name</th><th>Symbol</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<p style="color:var(--gao-text-muted,#64748b);padding:20px;text-align:center;font-size:13px;">No currencies configured. The default currency is IDR.</p>'}
            </div>
        </div>`;
        return res.html(renderPage({ title: 'Currency', content, activePath: '/settings', user }));
    }

    @Get('/i18n')
    async i18n(req: GaoRequest, res: GaoResponse) {
        const { user } = page(req);
        const content = `
        <div style="padding:8px;">
            ${backLink}
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Localization Settings</h1>
            <div class="gao-card" style="padding:32px;max-width:640px;">
                <form id="i18nForm">
                    <div><label style="${labelStyle}">Language</label><select name="language" style="${inputStyle}"><option value="id">Bahasa Indonesia</option><option value="en">English</option><option value="zh">中文</option><option value="ja">日本語</option></select></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Timezone</label><select name="timezone" style="${inputStyle}"><option value="Asia/Jakarta">Asia/Jakarta (WIB, UTC+7)</option><option value="Asia/Makassar">Asia/Makassar (WITA, UTC+8)</option><option value="Asia/Jayapura">Asia/Jayapura (WIT, UTC+9)</option><option value="Asia/Singapore">Asia/Singapore (SGT, UTC+8)</option></select></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Date Format</label><select name="date_format" style="${inputStyle}"><option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option></select></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Number Format</label><select name="number_format" style="${inputStyle}"><option value="1.000,00">1.000,00 (ID)</option><option value="1,000.00">1,000.00 (US)</option></select></div>
                    <div style="margin-top:24px;"><button type="submit" style="${btnPrimary}">Save Localization</button></div>
                </form>
            </div>
        </div>
        <script>
        document.getElementById('i18nForm').addEventListener('submit', async (e) => { e.preventDefault(); alert('Localization saved (demo mode)'); });
        </script>`;
        return res.html(renderPage({ title: 'Localization', content, activePath: '/settings', user }));
    }

    @Get('/notifications')
    async notifications(req: GaoRequest, res: GaoResponse) {
        const { user } = page(req);
        const events = [
            { label: 'New deal assigned', email: true, push: true, inApp: true },
            { label: 'Deal stage changed', email: true, push: false, inApp: true },
            { label: 'New contact created', email: false, push: false, inApp: true },
            { label: 'Task due reminder', email: true, push: true, inApp: true },
            { label: 'Quotation approved/rejected', email: true, push: true, inApp: true },
            { label: 'Ticket assigned', email: true, push: false, inApp: true },
            { label: 'Campaign completed', email: true, push: false, inApp: true },
            { label: 'Invoice payment received', email: true, push: true, inApp: true },
        ];
        const rows = events.map(e => `<tr>
            <td style="font-weight:600;">${e.label}</td>
            <td style="text-align:center;"><input type="checkbox" ${e.email ? 'checked' : ''} style="accent-color:#6366f1;width:16px;height:16px;cursor:pointer;"></td>
            <td style="text-align:center;"><input type="checkbox" ${e.push ? 'checked' : ''} style="accent-color:#6366f1;width:16px;height:16px;cursor:pointer;"></td>
            <td style="text-align:center;"><input type="checkbox" ${e.inApp ? 'checked' : ''} style="accent-color:#6366f1;width:16px;height:16px;cursor:pointer;"></td>
        </tr>`).join('');
        const content = `
        <div style="padding:8px;">
            ${backLink}
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Notification Preferences</h1>
            <div class="gao-card" style="padding:24px;">
                <div class="gao-admin-table-wrapper"><table class="gao-admin-table">
                    <thead><tr><th>Event</th><th style="text-align:center;">📧 Email</th><th style="text-align:center;">🔔 Push</th><th style="text-align:center;">💬 In-App</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table></div>
                <div style="margin-top:20px;"><button onclick="alert('Notification preferences saved (demo mode)')" style="${btnPrimary}">Save Preferences</button></div>
            </div>
        </div>`;
        return res.html(renderPage({ title: 'Notifications', content, activePath: '/settings', user }));
    }

    @Get('/approvals')
    async approvals(req: GaoRequest, res: GaoResponse) {
        const { user } = page(req);
        let chains: Array<Record<string, unknown>> = [];
        try { chains = await approvalService.listChains() as unknown as Array<Record<string, unknown>>; } catch { /* table may not exist */ }
        const rows = chains.map(c => `<tr>
            <td style="font-weight:600;">${escapeHtml(String(c.name))}</td>
            <td>${escapeHtml(String(c.entity_type))}</td>
            <td><span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;color:#fff;background:${c.is_active ? '#22c55e' : '#94a3b8'};">${c.is_active ? 'Active' : 'Inactive'}</span></td>
        </tr>`).join('');
        const content = `
        <div style="padding:8px;">
            ${backLink}
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">Approval Chains</h1>
            <div class="gao-card" style="padding:24px;">
                ${chains.length > 0 ? `<div class="gao-admin-table-wrapper"><table class="gao-admin-table"><thead><tr><th>Chain Name</th><th>Entity Type</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<p style="color:var(--gao-text-muted,#64748b);padding:20px;text-align:center;font-size:13px;">No approval chains configured. Create one via the API.</p>'}
            </div>
        </div>`;
        return res.html(renderPage({ title: 'Approval Chains', content, activePath: '/settings', user }));
    }

    @Get('/tags')
    async tags(req: GaoRequest, res: GaoResponse) {
        const { user } = page(req);
        let tags: Array<Record<string, unknown>> = [];
        try { tags = await tagService.list() as unknown as Array<Record<string, unknown>>; } catch { /* table may not exist */ }
        const tagCards = tags.map(t => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:rgba(15,23,42,0.4);border-radius:10px;border:1px solid rgba(100,116,139,0.15);">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:14px;height:14px;border-radius:50%;background:${escapeHtml(String(t.color ?? '#6366f1'))};"></div>
                    <span style="font-size:14px;font-weight:600;color:#e2e8f0;">${escapeHtml(String(t.name))}</span>
                    <span style="font-size:11px;color:var(--gao-text-muted,#64748b);">${escapeHtml(String(t.slug ?? ''))}</span>
                </div>
                <button onclick="if(confirm('Delete this tag?'))fetch('/api/tags/${t.id}',{method:'DELETE'}).then(()=>location.reload())" style="padding:4px 10px;background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.2);border-radius:6px;font-size:11px;cursor:pointer;">Delete</button>
            </div>`).join('');
        const content = `
        <div style="padding:8px;">
            ${backLink}
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Tags</h1>
                <button onclick="document.getElementById('newTagModal').style.display='flex'" style="${btnPrimary}">+ New Tag</button>
            </div>
            <div class="gao-card" style="padding:20px;">
                <div style="display:flex;flex-direction:column;gap:8px;">${tagCards || '<p style="color:var(--gao-text-muted,#64748b);padding:20px;text-align:center;font-size:13px;">No tags yet</p>'}</div>
            </div>
        </div>
        <div id="newTagModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:1000;align-items:center;justify-content:center;">
            <div class="gao-card" style="padding:32px;max-width:400px;width:100%;">
                <h3 style="font-size:18px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">New Tag</h3>
                <form onsubmit="event.preventDefault();const d={name:this.name.value,color:this.color.value};fetch('/api/tags',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>{if(r.ok)location.reload();else r.json().then(e=>alert(e.error?.message||'Failed'))})">
                    <div><label style="${labelStyle}">Name</label><input type="text" name="name" required style="${inputStyle}"></div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">Color</label><input type="color" name="color" value="#6366f1" style="width:60px;height:36px;border:none;cursor:pointer;background:transparent;"></div>
                    <div style="margin-top:24px;display:flex;gap:12px;">
                        <button type="submit" style="${btnPrimary}">Create Tag</button>
                        <button type="button" onclick="document.getElementById('newTagModal').style.display='none'" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border:none;border-radius:10px;cursor:pointer;font-size:14px;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>`;
        return res.html(renderPage({ title: 'Tags', content, activePath: '/settings', user }));
    }

    @Get('/chatbot')
    async chatbot(req: GaoRequest, res: GaoResponse) {
        const { user } = page(req);
        const content = `
        <div style="padding:8px;">
            ${backLink}
            <h1 style="font-size:24px;font-weight:700;margin-bottom:24px;">AI Chatbot Settings</h1>

            <!-- Provider Settings -->
            <div class="gao-card" style="padding:32px;max-width:720px;margin-bottom:16px;">
                <h3 style="font-size:16px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">🤖 Provider Configuration</h3>
                <form id="chatbotForm">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <div><label style="${labelStyle}">AI Provider</label><select name="provider" style="${inputStyle}"><option value="none">None (Manual only)</option><option value="gemini">Google Gemini</option><option value="openai">OpenAI</option></select></div>
                        <div><label style="${labelStyle}">Model</label><select name="model" style="${inputStyle}"><option value="gemini-2.0-flash">gemini-2.0-flash</option><option value="gpt-4o-mini">gpt-4o-mini</option><option value="gpt-4o">gpt-4o</option></select></div>
                    </div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">API Key</label><input type="password" name="api_key" placeholder="sk-... or AIza..." style="${inputStyle}"></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
                        <div><label style="${labelStyle}">Temperature</label><input type="number" name="temperature" value="0.3" min="0" max="2" step="0.1" style="${inputStyle}"></div>
                        <div><label style="${labelStyle}">Max Tokens</label><input type="number" name="max_tokens" value="500" min="50" max="4096" style="${inputStyle}"></div>
                    </div>
                    <div style="margin-top:16px;"><label style="${labelStyle}">System Prompt</label><textarea name="system_prompt" rows="4" style="${inputStyle}resize:vertical;" placeholder="Kamu adalah customer service PT ABC. Jawab dengan sopan dan informatif dalam Bahasa Indonesia. Gunakan knowledge base yang tersedia untuk menjawab pertanyaan tentang produk dan layanan.">Kamu adalah customer service GAO CRM. Jawab dengan sopan dan informatif dalam Bahasa Indonesia.</textarea></div>
                    <div style="margin-top:24px;"><button type="submit" style="${btnPrimary}">Save Provider Settings</button></div>
                </form>
            </div>

            <!-- Bot Behavior -->
            <div class="gao-card" style="padding:32px;max-width:720px;margin-bottom:16px;">
                <h3 style="font-size:16px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">💬 Bot Behavior</h3>
                <div>
                    <label style="${labelStyle}">Greeting Message</label>
                    <input type="text" value="Halo! Ada yang bisa saya bantu hari ini?" style="${inputStyle}">
                </div>
                <div style="margin-top:12px;">
                    <label style="${labelStyle}">Fallback Message</label>
                    <input type="text" value="Maaf, saya belum bisa menjawab pertanyaan ini. Mau dihubungkan ke tim kami?" style="${inputStyle}">
                </div>
                <div style="margin-top:12px;">
                    <label style="${labelStyle}">Handoff Keywords (comma-separated)</label>
                    <input type="text" value="agent, manusia, cs, operator, help, tolong" style="${inputStyle}">
                </div>
                <div style="margin-top:12px;">
                    <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:#e2e8f0;cursor:pointer;">
                        <input type="checkbox" checked style="accent-color:#6366f1;width:16px;height:16px;"> Auto-create Contact from chat visitor
                    </label>
                </div>
            </div>

            <!-- Knowledge Sources -->
            <div class="gao-card" style="padding:32px;max-width:720px;">
                <h3 style="font-size:16px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">📚 Knowledge Sources</h3>

                <div style="padding:16px;background:rgba(255,255,255,0.02);border:1px solid rgba(100,116,139,0.15);border-radius:10px;margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <span style="font-size:20px;">📦</span>
                            <div>
                                <h4 style="font-size:14px;font-weight:700;color:#e2e8f0;">Products</h4>
                                <p style="font-size:12px;color:#64748b;">Auto-sync all products as knowledge base</p>
                            </div>
                        </div>
                        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                            <input type="checkbox" checked style="accent-color:#6366f1;width:16px;height:16px;">
                            <span style="font-size:12px;color:#94a3b8;">Sync</span>
                        </label>
                    </div>
                </div>

                <div style="padding:16px;background:rgba(255,255,255,0.02);border:1px solid rgba(100,116,139,0.15);border-radius:10px;margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <span style="font-size:20px;">📖</span>
                            <div>
                                <h4 style="font-size:14px;font-weight:700;color:#e2e8f0;">Knowledge Base Articles</h4>
                                <p style="font-size:12px;color:#64748b;">Auto-sync KB articles as knowledge</p>
                            </div>
                        </div>
                        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                            <input type="checkbox" checked style="accent-color:#6366f1;width:16px;height:16px;">
                            <span style="font-size:12px;color:#94a3b8;">Sync</span>
                        </label>
                    </div>
                </div>

                <div style="padding:16px;background:rgba(255,255,255,0.02);border:1px solid rgba(100,116,139,0.15);border-radius:10px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <span style="font-size:20px;">✍️</span>
                            <div>
                                <h4 style="font-size:14px;font-weight:700;color:#e2e8f0;">Custom Knowledge</h4>
                                <p style="font-size:12px;color:#64748b;">Add FAQ, operating hours, etc.</p>
                            </div>
                        </div>
                        <button onclick="document.getElementById('addKnowledge').style.display=document.getElementById('addKnowledge').style.display==='none'?'block':'none'" style="padding:6px 14px;background:rgba(99,102,241,0.15);color:#818cf8;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;">+ Add Entry</button>
                    </div>
                    <div id="addKnowledge" style="display:none;margin-top:12px;">
                        <input type="text" placeholder="Title (e.g. FAQ Umum)" style="${inputStyle}margin-bottom:8px;">
                        <textarea rows="3" placeholder="Content (e.g. Q: Free trial? A: Ya, 14 hari gratis...)" style="${inputStyle}resize:vertical;margin-bottom:8px;"></textarea>
                        <button onclick="showToast('Knowledge entry added','success');document.getElementById('addKnowledge').style.display='none'" style="padding:6px 14px;background:#6366f1;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">Save Entry</button>
                    </div>
                </div>

                <div style="margin-top:16px;display:flex;gap:12px;">
                    <button onclick="showToast('Test chat window coming soon','info')" style="padding:10px 20px;background:rgba(34,197,94,0.15);color:#22c55e;border:1px solid rgba(34,197,94,0.3);border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">🧪 Test Bot</button>
                </div>
            </div>
        </div>
        <script>
        document.getElementById('chatbotForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            showToast('Chatbot settings saved', 'success');
        });
        </script>`;
        return res.html(renderPage({ title: 'AI Chatbot', content, activePath: '/settings', user }));
    }
}
