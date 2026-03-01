/**
 * GAO CRM — CRM Overview Controller
 *
 * Unified CRM dashboard page that consolidates stats, pipeline snapshot,
 * today's activities, hot contacts, revenue trend, and recent activity feed
 * into a single powerful command center.
 *
 * Route: GET /crm
 */

import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../../views/renderer.js';
import { CrmOverviewService } from '../../services/crm-overview.service.js';
import { escapeHtml } from '../../helpers/escape.js';
import { formatCurrency, formatNumber } from '../../helpers/format.js';
import {
    renderStatCard,
    renderPipelineBar,
    renderActivityItem,
    renderQuickAddDropdown,
    renderSectionHeader,
    renderRevenueChart,
    renderWinRateRing,
    renderAvatar,
    renderBadge,
    renderCrmStyles,
    cardStyle,
} from '../../helpers/crm-shared.js';

const crmOverviewService = new CrmOverviewService();

@Controller('/crm')
export class CrmOverviewController {
    @Get('/')
    async overview(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const data = await crmOverviewService.getData();
        const { stats, pipeline, todayActivities, overdueActivities, hotContacts, recentActivities, revenueByMonth, topDeals } = data;

        // ─── Stat Cards Row ──────────────────────────────
        const statsRow = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:28px;">
            ${renderStatCard({ label: 'Contacts', value: formatNumber(stats.totalContacts), icon: '👥', color: '#6366f1', href: '/crm/contacts' })}
            ${renderStatCard({ label: 'Companies', value: formatNumber(stats.totalCompanies), icon: '🏢', color: '#8b5cf6', href: '/crm/contacts?tab=companies' })}
            ${renderStatCard({ label: 'Active Deals', value: formatNumber(stats.totalActiveDeals), icon: '💰', color: '#f59e0b', href: '/crm/pipeline', subtext: formatCurrency(stats.totalDealValue) })}
            ${renderStatCard({ label: 'Win Rate', value: `${stats.winRate}%`, icon: '📈', color: '#22c55e', subtext: `${stats.wonDeals} won / ${stats.lostDeals} lost` })}
            ${renderStatCard({ label: 'Pending Tasks', value: stats.pendingActivities.toString(), icon: '📋', color: stats.overdueActivities > 0 ? '#ef4444' : '#3b82f6', subtext: stats.overdueActivities > 0 ? `⚠️ ${stats.overdueActivities} overdue` : 'All on track' })}
        </div>`;

        // ─── Pipeline Snapshot ────────────────────────────
        const pipelineSection = `<div style="${cardStyle}margin-bottom:24px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
                <h2 style="font-size:16px;font-weight:700;color:#e2e8f0;margin:0;">📊 Pipeline Snapshot</h2>
                <a href="/crm/pipeline" style="color:#818cf8;text-decoration:none;font-size:13px;font-weight:600;" onmouseover="this.style.color='#a78bfa'" onmouseout="this.style.color='#818cf8'">View Full Board →</a>
            </div>
            ${renderPipelineBar(pipeline)}
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:24px;flex-wrap:wrap;">
                <div style="font-size:13px;color:var(--gao-text-muted,#64748b);">Total Pipeline: <span style="color:#e2e8f0;font-weight:700;">${formatCurrency(stats.totalDealValue)}</span></div>
                <div style="font-size:13px;color:var(--gao-text-muted,#64748b);">Revenue Won: <span style="color:#22c55e;font-weight:700;">${formatCurrency(stats.totalRevenue)}</span></div>
            </div>
        </div>`;

        // ─── Two-column: Revenue + Win/Loss ──────────────
        const revenueSection = `<div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:24px;">
            <div style="${cardStyle}">
                <h2 style="font-size:16px;font-weight:700;color:#e2e8f0;margin:0 0 20px 0;">💰 Revenue Trend (6 Months)</h2>
                ${renderRevenueChart(revenueByMonth)}
            </div>
            <div style="${cardStyle}">
                <h2 style="font-size:16px;font-weight:700;color:#e2e8f0;margin:0 0 20px 0;">🎯 Win Rate</h2>
                <div style="display:flex;align-items:center;justify-content:center;padding:10px 0;">
                    ${renderWinRateRing(stats.winRate, stats.wonDeals, stats.lostDeals)}
                </div>
            </div>
        </div>`;

        // ─── Two-column: Activities + Hot Contacts ───────
        const activitiesHtml = todayActivities.length > 0
            ? todayActivities.map(a => renderActivityItem({
                id: a.id,
                type: a.type,
                subject: a.subject,
                created_at: a.created_at,
                is_completed: a.is_completed,
                contact_id: a.contact_id,
                contact_name: a.contact_name,
                deal_id: a.deal_id,
                deal_title: a.deal_title,
                showToggle: true,
            })).join('')
            : '<div style="text-align:center;padding:30px;color:var(--gao-text-muted,#64748b);font-size:13px;">🎉 No activities scheduled for today</div>';

        const overdueHtml = overdueActivities.length > 0
            ? `<div style="margin-bottom:16px;">
                <div style="font-size:12px;font-weight:700;color:#ef4444;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;padding:0 12px;">⚠️ Overdue (${overdueActivities.length})</div>
                ${overdueActivities.map(a => renderActivityItem({
                id: a.id, type: a.type, subject: a.subject, created_at: a.created_at,
                is_completed: false, contact_id: a.contact_id, contact_name: a.contact_name,
                deal_id: a.deal_id, deal_title: a.deal_title, showToggle: true,
            })).join('')}
            </div>`
            : '';

        const hotContactsHtml = hotContacts.length > 0
            ? hotContacts.map(h => `
                <a href="/crm/contacts/${h.id}" style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;text-decoration:none;color:inherit;transition:all 0.15s;" 
                   onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background=''">
                    ${renderAvatar(h.first_name, h.last_name, 36)}
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:600;color:#e2e8f0;">${escapeHtml(h.first_name)} ${escapeHtml(h.last_name)}</div>
                        <div style="font-size:11px;color:var(--gao-text-muted,#64748b);">${escapeHtml(h.company_name ?? 'Independent')}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:12px;font-weight:700;color:#e2e8f0;">${formatCurrency(h.deal_value, h.deal_currency)}</div>
                        ${renderBadge(h.deal_stage, h.deal_stage_color)}
                    </div>
                </a>
            `).join('')
            : '<div style="text-align:center;padding:30px;color:var(--gao-text-muted,#64748b);font-size:13px;">No active deals yet</div>';

        const middleSection = `<div style="display:grid;grid-template-columns:1.2fr 1fr;gap:20px;margin-bottom:24px;">
            <div style="${cardStyle}">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                    <h2 style="font-size:16px;font-weight:700;color:#e2e8f0;margin:0;">📋 Today's Activities (${todayActivities.length})</h2>
                    <a href="/activities/create" style="color:#818cf8;text-decoration:none;font-size:12px;font-weight:600;">+ Log Activity</a>
                </div>
                ${overdueHtml}
                ${todayActivities.length > 0 ? `<div style="font-size:12px;font-weight:700;color:var(--gao-text-muted,#64748b);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;padding:0 12px;">Today</div>` : ''}
                ${activitiesHtml}
            </div>
            <div style="${cardStyle}">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                    <h2 style="font-size:16px;font-weight:700;color:#e2e8f0;margin:0;">🔥 Hot Contacts</h2>
                    <a href="/crm/contacts" style="color:#818cf8;text-decoration:none;font-size:12px;font-weight:600;">View All →</a>
                </div>
                ${hotContactsHtml}
            </div>
        </div>`;

        // ─── Recent Activity Feed ────────────────────────
        const feedHtml = recentActivities.length > 0
            ? recentActivities.map(a => renderActivityItem({
                id: a.id, type: a.type, subject: a.subject, created_at: a.created_at,
                is_completed: a.is_completed, contact_id: a.contact_id, contact_name: a.contact_name,
                deal_id: a.deal_id, deal_title: a.deal_title, showToggle: false,
            })).join('')
            : '<div style="text-align:center;padding:30px;color:var(--gao-text-muted,#64748b);">No recent activity</div>';

        // ─── Top Deals Table ─────────────────────────────
        const topDealsHtml = topDeals.length > 0
            ? `<table style="width:100%;border-collapse:collapse;">
                <thead><tr>
                    <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--gao-text-muted,#64748b);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.06);">Deal</th>
                    <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--gao-text-muted,#64748b);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.06);">Contact</th>
                    <th style="text-align:right;padding:10px 12px;font-size:11px;color:var(--gao-text-muted,#64748b);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.06);">Value</th>
                    <th style="text-align:center;padding:10px 12px;font-size:11px;color:var(--gao-text-muted,#64748b);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.06);">Stage</th>
                </tr></thead>
                <tbody>
                ${topDeals.map(d => `<tr style="transition:background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background=''">
                    <td style="padding:12px;"><a href="/deals/${d.id}" style="color:#e2e8f0;text-decoration:none;font-weight:600;font-size:13px;">${escapeHtml(d.title)}</a></td>
                    <td style="padding:12px;font-size:13px;color:var(--gao-text-muted,#64748b);">${escapeHtml(d.contact_name ?? '—')}</td>
                    <td style="padding:12px;text-align:right;font-size:13px;font-weight:700;color:#e2e8f0;">${formatCurrency(d.value, d.currency)}</td>
                    <td style="padding:12px;text-align:center;">${renderBadge(d.stage_name ?? '—', d.stage_color ?? '#6366f1')}</td>
                </tr>`).join('')}
                </tbody>
            </table>`
            : '<div style="text-align:center;padding:20px;color:var(--gao-text-muted,#64748b);font-size:13px;">No active deals</div>';

        const bottomSection = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div style="${cardStyle}">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                    <h2 style="font-size:16px;font-weight:700;color:#e2e8f0;margin:0;">🕐 Recent Activity Feed</h2>
                </div>
                ${feedHtml}
            </div>
            <div style="${cardStyle}">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                    <h2 style="font-size:16px;font-weight:700;color:#e2e8f0;margin:0;">🏆 Top Deals</h2>
                    <a href="/crm/pipeline" style="color:#818cf8;text-decoration:none;font-size:12px;font-weight:600;">View Pipeline →</a>
                </div>
                ${topDealsHtml}
            </div>
        </div>`;

        // ─── Assemble page ───────────────────────────────
        const content = `
            ${renderCrmStyles()}
            ${renderSectionHeader('CRM Overview', renderQuickAddDropdown())}
            ${statsRow}
            ${pipelineSection}
            ${revenueSection}
            ${middleSection}
            ${bottomSection}
        `;

        const html = renderPage({
            title: 'CRM Overview',
            content,
            activePath: '/crm',
            user: user ? { name: user.name as string, role: user.role as string } : undefined,
        });

        return res.html(html);
    }
}
