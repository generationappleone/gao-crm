/**
 * GAO CRM — CRM Pipeline Board Controller
 *
 * Merged Pipeline + Deals into a single, powerful Kanban board view.
 * Features: pipeline selector, drag-drop, rich deal cards, inline
 * deal creation, pipeline summary footer, and column totals.
 *
 * Routes:
 *   GET /crm/pipeline        → default pipeline kanban
 *   GET /crm/pipeline/:id    → specific pipeline kanban
 */

import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../../views/renderer.js';
import { PipelineService } from '../../services/pipeline.service.js';
import { ContactService } from '../../services/contact.service.js';
import { ActivityService } from '../../services/activity.service.js';
import { CompanyService } from '../../services/company.service.js';
import { escapeHtml } from '../../helpers/escape.js';
import { formatCurrency, timeAgo } from '../../helpers/format.js';
import { renderSectionHeader, renderAvatar, renderCrmStyles, cardStyle, inputStyle, btnPrimary } from '../../helpers/crm-shared.js';
import { url } from '../../helpers/url.js';
import type { DealStage } from '../../models/deal-stage.model.js';
import type { Deal } from '../../models/deal.model.js';
import type { Pipeline } from '../../models/pipeline.model.js';

const pipelineService = new PipelineService();
const contactService = new ContactService();
const activityService = new ActivityService();
const companyService = new CompanyService();

@Controller('/crm/pipeline')
export class CrmPipelineController {
    @Get('/')
    async defaultBoard(req: GaoRequest, res: GaoResponse) {
        // Find the default pipeline
        const pipelines = await pipelineService.list();
        const defaultPipeline = pipelines.find(p => p.is_default) ?? pipelines[0];
        if (!defaultPipeline) {
            return res.html(renderPage({
                title: 'Pipeline Board',
                content: '<div style="text-align:center;padding:60px;color:var(--gao-text-muted,#64748b);"><h2>No pipelines found</h2><p>Create your first pipeline to get started.</p><a href="/pipelines/create" style="color:#818cf8;">+ Create Pipeline</a></div>',
                activePath: '/crm/pipeline',
                user: this.getUser(req),
            }));
        }
        return this.renderBoard(req, res, defaultPipeline, pipelines);
    }

    @Get('/:id')
    async pipelineBoard(req: GaoRequest, res: GaoResponse) {
        const pipelines = await pipelineService.list();
        const pipeline = pipelines.find(p => p.id === req.params.id);
        if (!pipeline) return res.redirect(url('/crm/pipeline'));
        return this.renderBoard(req, res, pipeline, pipelines);
    }

    private async renderBoard(req: GaoRequest, res: GaoResponse, pipeline: Pipeline, allPipelines: Pipeline[]) {
        const user = this.getUser(req);
        const board = await pipelineService.getBoard(pipeline.id);
        if (!board) return res.redirect(url('/crm/pipeline'));

        // Fetch contacts for enrichment
        const contactResult = await contactService.list({ page: 1, perPage: 500 });
        const contactMap = new Map(contactResult.contacts.map(c => [c.id, c]));

        // Fetch companies for contact enrichment
        const companyResult = await companyService.list({ page: 1, perPage: 500 });
        const companyMap = new Map(companyResult.companies.map(c => [c.id, c]));

        // Fetch recent activities for deal cards
        const activityResult = await activityService.list({ page: 1, perPage: 200 });
        const activitiesByDeal = new Map<string, number>();
        for (const a of activityResult.activities) {
            if (a.deal_id && !a.is_completed) {
                activitiesByDeal.set(a.deal_id, (activitiesByDeal.get(a.deal_id) ?? 0) + 1);
            }
        }

        // Pipeline selector dropdown
        const pipelineSelector = allPipelines.length > 1
            ? `<select onchange="window.location.href='/crm/pipeline/'+this.value" style="${inputStyle}max-width:240px;">
                ${allPipelines.map(p => `<option value="${p.id}" ${p.id === pipeline.id ? 'selected' : ''}>${escapeHtml(p.name)}${p.is_default ? ' (Default)' : ''}</option>`).join('')}
            </select>`
            : `<span style="font-size:14px;color:var(--gao-text-muted,#64748b);">${escapeHtml(pipeline.name)}</span>`;

        // Calculate totals
        let totalDeals = 0;
        let totalValue = 0;
        let wonDeals = 0;
        let wonValue = 0;
        let lostDeals = 0;

        // Build kanban columns
        // Prepare contact options for inline deal creation
        const contactOptions = contactResult.contacts.map(c => {
            const company = c.company_id ? companyMap.get(c.company_id) : null;
            const companyLabel = company ? ` — ${escapeHtml(company.name)}` : '';
            return `<option value="${c.id}">${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}${companyLabel}</option>`;
        }).join('');

        const columns = board.stages.map((col: { stage: DealStage; deals: Deal[] }) => {
            const colValue = col.deals.reduce((s, d) => s + Number(d.value), 0);
            totalDeals += col.deals.length;
            totalValue += colValue;
            if (col.stage.is_won) { wonDeals += col.deals.length; wonValue += colValue; }
            if (col.stage.is_lost) { lostDeals += col.deals.length; }

            const dealCards = col.deals.map((d: Deal) => {
                const contact = contactMap.get(d.contact_id);
                const pendingTasks = activitiesByDeal.get(d.id) ?? 0;
                const contactName = contact ? `${contact.first_name} ${contact.last_name}` : '—';
                const contactCompany = contact?.company_id ? companyMap.get(contact.company_id) : null;

                return `
                <div draggable="true" data-deal-id="${d.id}" data-deal-value="${d.value}" data-search-text="${escapeHtml(`${d.title} ${contactName} ${contactCompany?.name ?? ''}`.toLowerCase())}"
                     style="background:rgba(255,255,255,0.65);border:1px solid rgba(100,116,139,0.12);border-radius:12px;padding:16px;margin-bottom:10px;cursor:grab;transition:all 0.25s cubic-bezier(.4,0,.2,1);position:relative;"
                     ondragstart="event.dataTransfer.setData('text/plain',this.dataset.dealId);this.style.opacity='0.4';this.style.transform='scale(0.95)'"
                     ondragend="this.style.opacity='1';this.style.transform=''"
                     onmouseover="this.style.background='rgba(30,27,75,0.95)';this.style.borderColor='rgba(129,140,248,0.5)';this.style.boxShadow='0 8px 25px rgba(99,102,241,0.25), 0 0 0 1px rgba(129,140,248,0.15)';this.style.transform='translateY(-2px)';this.querySelectorAll('[data-hover-light]').forEach(function(e){e.style.color='#e2e8f0'});this.querySelectorAll('[data-hover-muted]').forEach(function(e){e.style.color='#94a3b8'});this.querySelector('[data-detail-btn]').style.opacity='1'"
                     onmouseout="this.style.background='rgba(255,255,255,0.65)';this.style.borderColor='rgba(100,116,139,0.12)';this.style.boxShadow='';this.style.transform='';this.querySelectorAll('[data-hover-light]').forEach(function(e){e.style.color='#1e293b'});this.querySelectorAll('[data-hover-muted]').forEach(function(e){e.style.color='#64748b'});this.querySelector('[data-detail-btn]').style.opacity='0.4'">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                        <span data-hover-light style="font-size:13px;font-weight:700;color:#1e293b;flex:1;transition:color 0.25s;">${escapeHtml(d.title)}</span>
                        <a href="/deals/${d.id}" data-detail-btn onclick="event.stopPropagation()" style="opacity:0.4;transition:opacity 0.2s;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:rgba(99,102,241,0.12);color:#6366f1;text-decoration:none;font-size:14px;flex-shrink:0;margin-left:8px;" title="View detail" onmouseover="this.style.background='rgba(99,102,241,0.25)';this.style.opacity='1'" onmouseout="this.style.background='rgba(99,102,241,0.12)'">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </a>
                    </div>
                    <div style="font-size:16px;font-weight:800;color:#a78bfa;margin-bottom:10px;">${formatCurrency(d.value, d.currency)}</div>
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:${contactCompany ? '4' : '8'}px;">
                        ${renderAvatar(contact?.first_name ?? '?', contact?.last_name ?? '', 22)}
                        <span data-hover-muted style="font-size:11px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color 0.25s;">${escapeHtml(contactName)}</span>
                    </div>
                    ${contactCompany ? `<div data-hover-muted style="font-size:10px;color:#94a3b8;margin-bottom:8px;padding-left:30px;transition:color 0.25s;">🏢 ${escapeHtml(contactCompany.name)}</div>` : ''}
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;">
                        <div style="display:flex;gap:8px;align-items:center;">
                            <span style="font-size:10px;padding:2px 6px;border-radius:4px;background:rgba(139,92,246,0.12);color:#a78bfa;font-weight:600;">${d.probability}%</span>
                            ${pendingTasks > 0 ? `<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:rgba(245,158,11,0.12);color:#f59e0b;font-weight:600;">📋 ${pendingTasks}</span>` : ''}
                        </div>
                        <span data-hover-muted style="font-size:10px;color:#64748b;transition:color 0.25s;">${timeAgo(d.created_at)}</span>
                    </div>
                </div>`;
            }).join('');

            // Column header with count and value
            const isWon = col.stage.is_won;
            const isLost = col.stage.is_lost;

            return `
            <div data-stage-id="${col.stage.id}" 
                 style="flex:0 0 300px;background:rgba(255,255,255,0.02);border:1px solid rgba(100,116,139,0.1);border-radius:14px;padding:16px;transition:all 0.2s;min-height:200px;"
                 ondragover="event.preventDefault();this.style.background='rgba(99,102,241,0.06)';this.style.borderColor='rgba(99,102,241,0.25)'"
                 ondragleave="this.style.background='rgba(255,255,255,0.02)';this.style.borderColor='rgba(100,116,139,0.1)'"
                 ondrop="event.preventDefault();this.style.background='rgba(255,255,255,0.02)';this.style.borderColor='rgba(100,116,139,0.1)';moveDeal(event.dataTransfer.getData('text/plain'),this.dataset.stageId)">
                <!-- Column Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div style="width:12px;height:12px;border-radius:50%;background:${col.stage.color};${isWon ? 'box-shadow:0 0 8px rgba(34,197,94,0.4);' : ''}"></div>
                        <span style="font-size:14px;font-weight:700;color:#e2e8f0;">${escapeHtml(col.stage.name)}</span>
                        <span style="font-size:11px;font-weight:700;color:var(--gao-text-muted,#64748b);background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:10px;">${col.deals.length}</span>
                    </div>
                    ${!isWon && !isLost ? `
                    <button onclick="toggleInlineForm('${col.stage.id}')"
                       style="width:26px;height:26px;border-radius:8px;background:rgba(99,102,241,0.12);color:#818cf8;display:flex;align-items:center;justify-content:center;border:none;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.2s;" 
                       onmouseover="this.style.background='rgba(99,102,241,0.25)';this.style.transform='scale(1.1)'" 
                       onmouseout="this.style.background='rgba(99,102,241,0.12)';this.style.transform=''" 
                       title="Quick add deal to ${escapeHtml(col.stage.name)}">+</button>
                    ` : ''}
                </div>
                <!-- Column Value Total -->
                <div style="font-size:11px;color:var(--gao-text-muted,#64748b);margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.04);">
                    ${formatCurrency(colValue)} total
                </div>
                <!-- Deal Cards -->
                <div style="min-height:60px;">
                    ${dealCards || '<div style="text-align:center;padding:30px 0;color:var(--gao-text-muted,#64748b);font-size:12px;">No deals in this stage</div>'}
                </div>
                ${!isWon && !isLost ? `
                <!-- Inline Deal Creation Form (hidden by default) -->
                <div id="inline-form-${col.stage.id}" style="display:none;background:rgba(15,23,42,0.8);border:1px solid rgba(99,102,241,0.25);border-radius:12px;padding:14px;margin-top:10px;animation:fadeIn 0.2s ease-out;">
                    <input type="text" id="inline-title-${col.stage.id}" placeholder="Deal title..." style="${inputStyle}padding:8px 12px;font-size:12px;margin-bottom:8px;" />
                    <input type="number" id="inline-value-${col.stage.id}" placeholder="Value (Rp)" style="${inputStyle}padding:8px 12px;font-size:12px;margin-bottom:8px;" />
                    <select id="inline-contact-${col.stage.id}" style="${inputStyle}padding:8px 12px;font-size:12px;margin-bottom:10px;">
                        <option value="">— No contact —</option>
                        ${contactOptions}
                    </select>
                    <div style="display:flex;gap:6px;">
                        <button onclick="submitInlineDeal('${col.stage.id}','${pipeline.id}')" style="flex:1;padding:7px 12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;">Create</button>
                        <button onclick="toggleInlineForm('${col.stage.id}')" style="padding:7px 12px;background:rgba(255,255,255,0.06);color:#94a3b8;border:none;border-radius:8px;font-size:11px;cursor:pointer;">Cancel</button>
                    </div>
                </div>
                ` : ''}
            </div>`;
        }).join('');

        // Pipeline Summary Footer
        const activeDeals = totalDeals - wonDeals - lostDeals;
        const closedDeals = wonDeals + lostDeals;
        const winRate = closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0;
        const avgDealSize = activeDeals > 0 ? Math.round((totalValue - wonValue) / activeDeals) : 0;

        const summaryFooter = `<div style="${cardStyle}margin-top:24px;">
            <div style="display:flex;gap:32px;flex-wrap:wrap;align-items:center;justify-content:center;">
                <div style="text-align:center;">
                    <div style="font-size:11px;color:var(--gao-text-muted,#64748b);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Total Deals</div>
                    <div style="font-size:22px;font-weight:800;color:#e2e8f0;">${totalDeals}</div>
                </div>
                <div style="width:1px;height:40px;background:rgba(255,255,255,0.06);"></div>
                <div style="text-align:center;">
                    <div style="font-size:11px;color:var(--gao-text-muted,#64748b);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Pipeline Value</div>
                    <div style="font-size:22px;font-weight:800;color:#a78bfa;">${formatCurrency(totalValue)}</div>
                </div>
                <div style="width:1px;height:40px;background:rgba(255,255,255,0.06);"></div>
                <div style="text-align:center;">
                    <div style="font-size:11px;color:var(--gao-text-muted,#64748b);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Avg Deal Size</div>
                    <div style="font-size:22px;font-weight:800;color:#e2e8f0;">${formatCurrency(avgDealSize)}</div>
                </div>
                <div style="width:1px;height:40px;background:rgba(255,255,255,0.06);"></div>
                <div style="text-align:center;">
                    <div style="font-size:11px;color:var(--gao-text-muted,#64748b);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Won</div>
                    <div style="font-size:22px;font-weight:800;color:#22c55e;">${wonDeals} <span style="font-size:13px;font-weight:600;">(${formatCurrency(wonValue)})</span></div>
                </div>
                <div style="width:1px;height:40px;background:rgba(255,255,255,0.06);"></div>
                <div style="text-align:center;">
                    <div style="font-size:11px;color:var(--gao-text-muted,#64748b);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Win Rate</div>
                    <div style="font-size:22px;font-weight:800;color:${winRate >= 50 ? '#22c55e' : '#f59e0b'};">${winRate}%</div>
                </div>
            </div>
        </div>`;

        // Assemble page
        const headerRight = `<div style="display:flex;align-items:center;gap:12px;">
            ${pipelineSelector}
            <a href="/deals/create?pipeline_id=${pipeline.id}" style="${btnPrimary}display:inline-flex;align-items:center;gap:6px;font-size:13px;padding:10px 20px;text-decoration:none;">
                <span>+</span> New Deal
            </a>
        </div>`;

        const content = `
            ${renderCrmStyles()}
            ${renderSectionHeader('Sales Pipeline', headerRight)}
            <!-- Filter Bar -->
            <div style="display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap;">
                <input id="pipelineSearch" type="text" placeholder="🔍 Filter by deal or contact name..." 
                    style="${inputStyle}max-width:280px;padding:8px 14px;font-size:12px;" oninput="filterDeals()" />
                <select id="pipelineValueFilter" style="${inputStyle}max-width:180px;padding:8px 14px;font-size:12px;" onchange="filterDeals()">
                    <option value="">All Values</option>
                    <option value="0-50000000">< Rp 50M</option>
                    <option value="50000000-200000000">Rp 50M - 200M</option>
                    <option value="200000000-500000000">Rp 200M - 500M</option>
                    <option value="500000000-999999999999">Rp 500M+</option>
                </select>
                <button onclick="document.getElementById('pipelineSearch').value='';document.getElementById('pipelineValueFilter').value='';filterDeals();" 
                    style="padding:8px 14px;background:rgba(255,255,255,0.06);color:#94a3b8;border:1px solid rgba(100,116,139,0.2);border-radius:8px;font-size:12px;cursor:pointer;">Clear</button>
            </div>
            <div style="display:flex;gap:16px;overflow-x:auto;padding-bottom:20px;scroll-behavior:smooth;">
                ${columns}
            </div>
            ${summaryFooter}
            <script>
            function moveDeal(dealId, stageId) {
                fetch('/api/pipelines/deals/' + dealId + '/move', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ stage_id: stageId, position: 0 })
                }).then(function(r) { 
                    if (r.ok) {
                        showToast('Deal moved successfully', 'success');
                        setTimeout(function() { window.location.reload(); }, 600);
                    } else {
                        showToast('Failed to move deal', 'error');
                    }
                });
            }
            function toggleInlineForm(stageId) {
                var form = document.getElementById('inline-form-' + stageId);
                if (form) {
                    form.style.display = form.style.display === 'none' ? 'block' : 'none';
                    if (form.style.display === 'block') {
                        var titleInput = document.getElementById('inline-title-' + stageId);
                        if (titleInput) titleInput.focus();
                    }
                }
            }
            function submitInlineDeal(stageId, pipelineId) {
                var title = document.getElementById('inline-title-' + stageId).value.trim();
                var value = document.getElementById('inline-value-' + stageId).value || '0';
                var contactId = document.getElementById('inline-contact-' + stageId).value || null;
                if (!title) { showToast('Please enter a deal title', 'error'); return; }
                fetch('/api/deals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: title,
                        value: parseFloat(value),
                        currency: 'IDR',
                        pipeline_id: pipelineId,
                        stage_id: stageId,
                        contact_id: contactId,
                        probability: 10,
                        status: 'open',
                    })
                }).then(function(r) {
                    if (r.ok) {
                        showToast('Deal created!', 'success');
                        setTimeout(function() { window.location.reload(); }, 600);
                    } else {
                        r.json().then(function(err) { showToast(err.error?.message || 'Failed to create deal', 'error'); });
                    }
                });
            }
            function filterDeals() {
                var search = (document.getElementById('pipelineSearch').value || '').toLowerCase();
                var valueRange = document.getElementById('pipelineValueFilter').value;
                var minVal = 0, maxVal = Infinity;
                if (valueRange) {
                    var parts = valueRange.split('-');
                    minVal = parseFloat(parts[0]);
                    maxVal = parseFloat(parts[1]);
                }
                var cards = document.querySelectorAll('[data-deal-id]');
                cards.forEach(function(card) {
                    var searchText = card.getAttribute('data-search-text') || '';
                    var dealValue = parseFloat(card.getAttribute('data-deal-value') || '0');
                    var matchSearch = !search || searchText.indexOf(search) !== -1;
                    var matchValue = dealValue >= minVal && dealValue <= maxVal;
                    card.style.display = (matchSearch && matchValue) ? '' : 'none';
                });
            }
            </script>
            <style>
            @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
            </style>
        `;

        return res.html(renderPage({
            title: `Pipeline — ${pipeline.name}`,
            content,
            activePath: '/crm/pipeline',
            user,
        }));
    }

    private getUser(req: GaoRequest) {
        const user = req.user as Record<string, unknown>;
        return user ? { name: user.name as string, role: user.role as string } : undefined;
    }
}
