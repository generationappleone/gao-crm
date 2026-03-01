import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { renderPage } from '../views/renderer.js';
import { CalendarService } from '../services/calendar.service.js';
import { escapeHtml } from '../helpers/escape.js';

const service = new CalendarService();

const TYPE_ICONS: Record<string, string> = { meeting: '🤝', call: '📞', task: '✅', reminder: '⏰', other: '📌' };
const STATUS_COLORS: Record<string, string> = { scheduled: '#3b82f6', confirmed: '#22c55e', cancelled: '#ef4444', completed: '#64748b' };

@Controller('/calendar')
export class CalendarController {
    @Get('/')
    async index(req: GaoRequest, res: GaoResponse) {
        const user = req.user as Record<string, unknown>;
        const userId = (user?.id as string) ?? '';

        // Parse month from query or use current
        const now = new Date();
        const monthParam = req.query.month as string | undefined;
        let viewYear = now.getFullYear();
        let viewMonth = now.getMonth();
        if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
            const parts = monthParam.split('-').map(Number);
            viewYear = parts[0]!;
            viewMonth = parts[1]! - 1;
        }

        const startOfMonth = new Date(viewYear, viewMonth, 1).toISOString();
        const endOfMonth = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59).toISOString();

        const events = userId ? await service.listEvents(userId, startOfMonth, endOfMonth) : [];
        const upcoming = userId ? await service.getUpcoming(userId, 10) : [];

        const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const prevMonth = viewMonth === 0 ? `${viewYear - 1}-12` : `${viewYear}-${String(viewMonth).padStart(2, '0')}`;
        const nextMonth = viewMonth === 11 ? `${viewYear + 1}-01` : `${viewYear}-${String(viewMonth + 2).padStart(2, '0')}`;
        const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

        // Generate simple calendar grid
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const today = isCurrentMonth ? now.getDate() : -1;

        const eventDays = new Set(events.map(e => new Date(e.start_at).getDate()));

        let calendarCells = '';
        for (let i = 0; i < firstDay; i++) calendarCells += '<div></div>';
        for (let d = 1; d <= daysInMonth; d++) {
            const isToday = d === today;
            const hasEvent = eventDays.has(d);
            calendarCells += `
            <div style="padding:8px;text-align:center;border-radius:8px;cursor:pointer;position:relative;${isToday ? 'background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;' : 'color:var(--gao-text-secondary, #cbd5e1);'}" onmouseover="if(!this.dataset.today)this.style.background='var(--gao-gray-50, rgba(255,255,255,0.05))'" onmouseout="if(!this.dataset.today)this.style.background=''" ${isToday ? 'data-today="1"' : ''}>
                ${d}
                ${hasEvent ? '<div style="width:6px;height:6px;border-radius:50%;background:#f59e0b;margin:2px auto 0;"></div>' : ''}
            </div>`;
        }

        const upcomingList = upcoming.map(e => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(100,116,139,0.1);">
                <span style="font-size:20px;">${TYPE_ICONS[e.event_type] ?? '📌'}</span>
                <div style="flex:1;">
                    <div style="font-size:13px;font-weight:600;color:var(--gao-text, #e2e8f0);">${escapeHtml(e.title)}</div>
                    <div style="font-size:11px;color:var(--gao-text-muted,#64748b);">${new Date(e.start_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <span style="padding:2px 6px;border-radius:6px;font-size:10px;font-weight:700;color:#fff;background:${STATUS_COLORS[e.status] ?? '#6366f1'}">${e.status}</span>
            </div>`).join('');

        const iStyle = `width:100%;padding:10px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:8px;color:#e2e8f0;font-size:14px;outline:none;`;
        const lStyle = `display:block;font-size:13px;font-weight:600;color:#cbd5e1;margin-bottom:6px;`;

        const content = `
        <div style="padding:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 style="font-size:24px;font-weight:700;">Calendar</h1>
                <button onclick="document.getElementById('newEventModal').style.display='flex'" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">+ New Event</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 360px;gap:20px;">
                <div class="gao-card" style="padding:24px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                        <a href="/calendar?month=${prevMonth}" style="padding:6px 12px;background:var(--gao-gray-100, rgba(255,255,255,0.06));border:1px solid var(--gao-border, rgba(100,116,139,0.2));border-radius:8px;font-size:13px;color:var(--gao-text-secondary, #94a3b8);text-decoration:none;font-weight:600;">◀ Prev</a>
                        <div style="display:flex;align-items:center;gap:12px;">
                            <h3 style="font-size:16px;font-weight:700;">${monthName}</h3>
                            ${!isCurrentMonth ? '<a href="/calendar" style="padding:4px 10px;background:var(--gao-primary-bg, rgba(99,102,241,0.12));color:var(--gao-primary, #6366f1);border-radius:6px;font-size:11px;font-weight:600;text-decoration:none;">Today</a>' : ''}
                        </div>
                        <a href="/calendar?month=${nextMonth}" style="padding:6px 12px;background:var(--gao-gray-100, rgba(255,255,255,0.06));border:1px solid var(--gao-border, rgba(100,116,139,0.2));border-radius:8px;font-size:13px;color:var(--gao-text-secondary, #94a3b8);text-decoration:none;font-weight:600;">Next ▶</a>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;margin-bottom:8px;">
                        <div style="font-size:11px;font-weight:700;color:var(--gao-text-muted,#64748b);">Sun</div>
                        <div style="font-size:11px;font-weight:700;color:var(--gao-text-muted,#64748b);">Mon</div>
                        <div style="font-size:11px;font-weight:700;color:var(--gao-text-muted,#64748b);">Tue</div>
                        <div style="font-size:11px;font-weight:700;color:var(--gao-text-muted,#64748b);">Wed</div>
                        <div style="font-size:11px;font-weight:700;color:var(--gao-text-muted,#64748b);">Thu</div>
                        <div style="font-size:11px;font-weight:700;color:var(--gao-text-muted,#64748b);">Fri</div>
                        <div style="font-size:11px;font-weight:700;color:var(--gao-text-muted,#64748b);">Sat</div>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">${calendarCells}</div>
                </div>
                <div class="gao-card" style="padding:24px;">
                    <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Upcoming Events</h3>
                    ${upcomingList || '<p style="color:var(--gao-text-muted,#64748b);font-size:13px;">No upcoming events</p>'}
                </div>
            </div>
        </div>
        <div id="newEventModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:1000;align-items:center;justify-content:center;">
            <div class="gao-card" style="padding:32px;max-width:500px;width:100%;">
                <h3 style="font-size:18px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">New Event</h3>
                <form id="createEventForm">
                    <div><label style="${lStyle}">Title *</label><input type="text" name="title" required style="${iStyle}"></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
                        <div><label style="${lStyle}">Type</label><select name="event_type" style="${iStyle}"><option value="meeting">Meeting</option><option value="call">Call</option><option value="task">Task</option><option value="reminder">Reminder</option></select></div>
                        <div><label style="${lStyle}">Location</label><input type="text" name="location" style="${iStyle}"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
                        <div><label style="${lStyle}">Start *</label><input type="datetime-local" name="start_at" required style="${iStyle}"></div>
                        <div><label style="${lStyle}">End *</label><input type="datetime-local" name="end_at" required style="${iStyle}"></div>
                    </div>
                    <div style="margin-top:12px;"><label style="${lStyle}">Description</label><textarea name="description" rows="2" style="${iStyle}resize:vertical;"></textarea></div>
                    <div style="margin-top:20px;display:flex;gap:12px;">
                        <button type="submit" style="padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">Create Event</button>
                        <button type="button" onclick="document.getElementById('newEventModal').style.display='none'" style="padding:12px 24px;background:rgba(255,255,255,0.05);color:#94a3b8;border:none;border-radius:10px;cursor:pointer;font-size:14px;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
        <script>
        document.getElementById('createEventForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd.entries());
            data.start_at = new Date(data.start_at).toISOString();
            data.end_at = new Date(data.end_at).toISOString();
            const res = await fetch('/api/calendar/events', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
            if (res.ok) location.reload();
            else { const err = await res.json(); alert(err.error?.message || 'Failed'); }
        });
        </script>`;

        return res.html(renderPage({ title: 'Calendar', content, activePath: '/calendar', user: user ? { name: user.name as string, role: user.role as string } : undefined }));
    }
}
