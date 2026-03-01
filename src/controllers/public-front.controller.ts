/**
 * GAO CRM — Public Front Controller
 *
 * Serves published landing pages at the root URL (/).
 * Handles quiz submissions with scoring + leaderboard.
 * Handles survey form submissions.
 */

import { Controller, Get, Post } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';
import { LandingPageService } from '../services/landing-page.service.js';
import { LandingPage } from '../models/landing-page.model.js';
import { QuizResponse } from '../models/quiz-response.model.js';
import { SurveyResponse } from '../models/survey-response.model.js';
import { escapeHtml } from '../helpers/escape.js';

const service = new LandingPageService();

@Controller('/')
export class PublicFrontController {

    @Get('/')
    async homepage(_req: GaoRequest, res: GaoResponse) {
        const pages = await LandingPage
            .where('status', 'published')
            .where('deleted_at', null)
            .orderBy('published_at', 'DESC')
            .limit(1)
            .get();

        const page = pages[0] ?? null;

        if (page) {
            await service.incrementViews(page.id);
            return res.html(this.renderLandingPage(page));
        }

        return res.html(this.renderWelcomePage());
    }

    @Get('/p/:slug')
    async publicPage(req: GaoRequest, res: GaoResponse) {
        const page = await service.findBySlug(req.params.slug);
        if (!page) return res.html(this.render404());

        await service.incrementViews(page.id);
        return res.html(this.renderLandingPage(page));
    }

    // ── Quiz Submission ──
    @Post('/p/:slug/submit')
    async submitQuizOrSurvey(req: GaoRequest, res: GaoResponse) {
        const page = await service.findBySlug(req.params.slug);
        if (!page) return res.error(404, 'NOT_FOUND', 'Page not found');

        const body = req.body as Record<string, unknown>;

        // Determine type from sections
        let sections: Record<string, unknown>[] = [];
        try {
            sections = typeof page.sections === 'string' ? JSON.parse(page.sections) : (page.sections ?? []);
        } catch { /* invalid sections */ }

        const quizSection = sections.find((s: Record<string, unknown>) => s.type === 'quiz');
        const surveySection = sections.find((s: Record<string, unknown>) => s.type === 'survey');

        if (quizSection) {
            return this.handleQuizSubmission(page, quizSection, body, res);
        } else if (surveySection) {
            return this.handleSurveySubmission(page, body, res);
        }

        return res.error(400, 'INVALID', 'This page does not accept submissions');
    }

    // ── Leaderboard API ──
    @Get('/p/:slug/leaderboard')
    async getLeaderboard(req: GaoRequest, res: GaoResponse) {
        const page = await service.findBySlug(req.params.slug);
        if (!page) return res.error(404, 'NOT_FOUND', 'Page not found');

        const responses = await QuizResponse
            .where('landing_page_id', page.id)
            .orderBy('score', 'DESC')
            .orderBy('time_taken_ms', 'ASC')
            .limit(20)
            .get();

        return res.json(
            responses.map((r, i) => ({
                rank: i + 1,
                name: r.participant_name,
                score: r.score,
                total: r.total_questions,
                percentage: r.total_questions > 0 ? Math.round((r.score / r.total_questions) * 100) : 0,
                time_taken_ms: r.time_taken_ms,
                created_at: r.created_at,
            })),
        );
    }

    // ── Private: Handle quiz submission ──
    private async handleQuizSubmission(
        page: LandingPage,
        quizSection: Record<string, unknown>,
        body: Record<string, unknown>,
        res: GaoResponse,
    ) {
        const name = String(body.name ?? '').trim();
        const email = body.email ? String(body.email).trim() : undefined;
        const answers = body.answers as number[] | undefined;
        const timeTaken = body.time_taken_ms as number | undefined;

        if (!name) return res.error(400, 'VALIDATION', 'Name is required');
        if (!answers || !Array.isArray(answers)) return res.error(400, 'VALIDATION', 'Answers are required');

        const questions = (quizSection.questions ?? []) as Array<{ correct: number }>;
        let score = 0;
        for (let i = 0; i < questions.length; i++) {
            if (answers[i] === questions[i]?.correct) score++;
        }

        const response = await QuizResponse.create({
            landing_page_id: page.id,
            participant_name: name,
            participant_email: email,
            answers: JSON.stringify(answers),
            score,
            total_questions: questions.length,
            time_taken_ms: timeTaken ?? null,
        });

        // Increment conversions
        page.total_conversions = (page.total_conversions ?? 0) + 1;
        await page.save();

        // Get rank — count entries with higher score
        const allResponses = await QuizResponse
            .where('landing_page_id', page.id)
            .orderBy('score', 'DESC')
            .get();
        const rank = allResponses.filter(r => r.score > score).length + 1;

        return res.json({
            id: response.id,
            score,
            total: questions.length,
            percentage: questions.length > 0 ? Math.round((score / questions.length) * 100) : 0,
            rank,
        });
    }

    // ── Private: Handle survey submission ──
    private async handleSurveySubmission(
        page: LandingPage,
        body: Record<string, unknown>,
        res: GaoResponse,
    ) {
        const name = body.name ? String(body.name).trim() : undefined;
        const email = body.email ? String(body.email).trim() : undefined;
        const answers = body.answers;

        if (!answers || !Array.isArray(answers)) {
            return res.error(400, 'VALIDATION', 'Answers are required');
        }

        await SurveyResponse.create({
            landing_page_id: page.id,
            respondent_name: name,
            respondent_email: email,
            answers: JSON.stringify(answers),
        });

        page.total_conversions = (page.total_conversions ?? 0) + 1;
        await page.save();

        return res.json({ success: true, message: 'Thank you for your response!' });
    }

    // ── Render landing page ──
    private renderLandingPage(page: LandingPage): string {
        const seoTitle = escapeHtml(page.seo_title || page.title);
        const seoDescription = escapeHtml(page.seo_description || page.description || '');
        const customCss = page.custom_css ?? '';

        let sectionsHtml = '';
        if (page.sections) {
            try {
                const sections = typeof page.sections === 'string' ? JSON.parse(page.sections) : page.sections;
                if (Array.isArray(sections)) {
                    sectionsHtml = sections.map((s: Record<string, string>) => {
                        const type = s.type ?? 'text';

                        if (type === 'hero') {
                            return `<section style="padding:80px 20px;text-align:center;background:linear-gradient(135deg,#1e1b4b,#312e81);">
                                <h1 style="font-size:48px;font-weight:800;margin-bottom:16px;background:linear-gradient(135deg,#c7d2fe,#e0e7ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${escapeHtml(s.title ?? '')}</h1>
                                <p style="font-size:18px;color:#a5b4fc;max-width:600px;margin:0 auto 32px;">${escapeHtml(s.subtitle ?? '')}</p>
                                ${s.cta ? `<a href="${escapeHtml(s.cta_link ?? '#')}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:12px;font-weight:700;text-decoration:none;font-size:16px;">${escapeHtml(s.cta)}</a>` : ''}
                            </section>`;
                        }

                        if (type === 'features') {
                            const items = s.items ? JSON.parse(s.items) : [];
                            return `<section style="padding:60px 20px;max-width:1100px;margin:0 auto;">
                                <h2 style="text-align:center;font-size:32px;font-weight:700;margin-bottom:40px;color:#e2e8f0;">${escapeHtml(s.title ?? 'Features')}</h2>
                                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">
                                    ${items.map((f: Record<string, string>) => `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(100,116,139,0.15);border-radius:16px;padding:28px;">
                                        <div style="font-size:28px;margin-bottom:12px;">${f.icon ?? '✨'}</div>
                                        <h3 style="font-size:18px;font-weight:700;color:#e2e8f0;margin-bottom:8px;">${escapeHtml(f.title ?? '')}</h3>
                                        <p style="font-size:14px;color:#94a3b8;line-height:1.6;">${escapeHtml(f.description ?? '')}</p>
                                    </div>`).join('')}
                                </div>
                            </section>`;
                        }

                        if (type === 'cta') {
                            return `<section style="padding:60px 20px;text-align:center;background:linear-gradient(135deg,#312e81,#1e1b4b);">
                                <h2 style="font-size:32px;font-weight:700;color:#e2e8f0;margin-bottom:12px;">${escapeHtml(s.title ?? '')}</h2>
                                <p style="font-size:16px;color:#a5b4fc;margin-bottom:24px;">${escapeHtml(s.subtitle ?? '')}</p>
                                <a href="${escapeHtml(s.cta_link ?? '#')}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:12px;font-weight:700;text-decoration:none;">${escapeHtml(s.cta ?? 'Get Started')}</a>
                            </section>`;
                        }

                        // ── QUIZ section ──
                        if (type === 'quiz') {
                            return this.renderQuizSection(s, page.slug);
                        }

                        // ── LEADERBOARD section ──
                        if (type === 'leaderboard') {
                            return this.renderLeaderboardSection(s, page.slug);
                        }

                        // ── SURVEY section ──
                        if (type === 'survey') {
                            return this.renderSurveySection(s, page.slug);
                        }

                        // Default: text block
                        return `<section style="padding:40px 20px;max-width:800px;margin:0 auto;">
                            <div style="font-size:15px;color:#cbd5e1;line-height:1.8;">${escapeHtml(s.content ?? '')}</div>
                        </section>`;
                    }).join('');
                }
            } catch { /* Invalid JSON — skip sections */ }
        }

        if (!sectionsHtml) {
            sectionsHtml = `
            <section style="padding:100px 20px;text-align:center;background:linear-gradient(135deg,#1e1b4b,#312e81);">
                <h1 style="font-size:52px;font-weight:800;margin-bottom:16px;background:linear-gradient(135deg,#c7d2fe,#e0e7ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${escapeHtml(page.title)}</h1>
                ${page.description ? `<p style="font-size:18px;color:#a5b4fc;max-width:600px;margin:0 auto;">${escapeHtml(page.description)}</p>` : ''}
            </section>`;
        }

        return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${seoTitle}</title>
    ${seoDescription ? `<meta name="description" content="${seoDescription}">` : ''}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            min-height: 100vh;
        }
        a { transition: opacity 0.2s; }
        a:hover { opacity: 0.9; }
        .quiz-option { display:block;width:100%;padding:14px 18px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:2px solid rgba(100,116,139,0.2);border-radius:12px;color:#e2e8f0;font-size:15px;text-align:left;cursor:pointer;transition:all 0.2s; }
        .quiz-option:hover { border-color:#6366f1;background:rgba(99,102,241,0.08); }
        .quiz-option.selected { border-color:#6366f1;background:rgba(99,102,241,0.15); }
        .quiz-option.correct { border-color:#22c55e;background:rgba(34,197,94,0.15); }
        .quiz-option.wrong { border-color:#ef4444;background:rgba(239,68,68,0.1); }
        .lb-row { display:grid;grid-template-columns:50px 1fr 80px 80px;gap:12px;padding:12px 16px;border-bottom:1px solid rgba(100,116,139,0.1);align-items:center; }
        .lb-row:hover { background:rgba(99,102,241,0.05); }
        .lb-rank { font-size:18px;font-weight:800;color:#6366f1; }
        .survey-input { width:100%;padding:12px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.25);border-radius:10px;color:#e2e8f0;font-size:14px;outline:none;transition:border-color 0.2s; }
        .survey-input:focus { border-color:#6366f1; }
        .scale-btn { width:48px;height:48px;border-radius:12px;border:2px solid rgba(100,116,139,0.2);background:rgba(255,255,255,0.03);color:#e2e8f0;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.2s; }
        .scale-btn:hover, .scale-btn.active { border-color:#6366f1;background:rgba(99,102,241,0.15);color:#a5b4fc; }
        ${customCss}
    </style>
</head>
<body>
    ${sectionsHtml}

    <footer style="padding:24px 20px;text-align:center;font-size:12px;color:#475569;border-top:1px solid rgba(100,116,139,0.1);">
        Powered by GAO CRM
    </footer>
</body>
</html>`;
    }

    // ── Render quiz section ──
    private renderQuizSection(s: Record<string, unknown>, slug: string): string {
        const questions = (s.questions ?? []) as Array<{ question: string; options: string[]; correct: number }>;
        const collectName = s.collect_name !== false;
        const collectEmail = s.collect_email !== false;

        const questionsHtml = questions.map((q, qi) => {
            const optionsHtml = q.options.map((opt, oi) =>
                `<button type="button" class="quiz-option" data-q="${qi}" data-o="${oi}" onclick="selectQuizOption(${qi},${oi})">${escapeHtml(opt)}</button>`
            ).join('');
            return `<div class="quiz-question" data-qi="${qi}" style="margin-bottom:32px;">
                <h3 style="font-size:16px;font-weight:700;color:#e2e8f0;margin-bottom:14px;">
                    <span style="color:#6366f1;margin-right:8px;">Q${qi + 1}.</span>${escapeHtml(q.question)}
                </h3>
                <div>${optionsHtml}</div>
            </div>`;
        }).join('');

        return `<section id="quiz-section" style="padding:60px 20px;max-width:700px;margin:0 auto;">
            <div id="quiz-form">
                ${collectName ? `<div style="margin-bottom:20px;">
                    <label style="display:block;font-size:13px;font-weight:600;color:#94a3b8;margin-bottom:6px;">Your Name *</label>
                    <input type="text" id="quiz-name" class="survey-input" placeholder="Enter your name" required>
                </div>` : ''}
                ${collectEmail ? `<div style="margin-bottom:28px;">
                    <label style="display:block;font-size:13px;font-weight:600;color:#94a3b8;margin-bottom:6px;">Email Address</label>
                    <input type="email" id="quiz-email" class="survey-input" placeholder="you@example.com">
                </div>` : ''}

                ${questionsHtml}

                <button id="quiz-submit-btn" onclick="submitQuiz()" style="width:100%;padding:16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.2s;">
                    Submit Answers
                </button>
            </div>

            <div id="quiz-result" style="display:none;text-align:center;padding:40px 0;">
                <div style="font-size:64px;margin-bottom:16px;" id="result-emoji">🎉</div>
                <h2 style="font-size:32px;font-weight:800;margin-bottom:8px;" id="result-title">Great Job!</h2>
                <p style="font-size:18px;color:#a5b4fc;margin-bottom:24px;" id="result-desc"></p>
                <div style="display:inline-flex;gap:24px;background:rgba(255,255,255,0.04);border:1px solid rgba(100,116,139,0.15);border-radius:16px;padding:24px 40px;">
                    <div><div style="font-size:36px;font-weight:800;color:#6366f1;" id="result-score">0</div><div style="font-size:12px;color:#64748b;">Score</div></div>
                    <div style="width:1px;background:rgba(100,116,139,0.15);"></div>
                    <div><div style="font-size:36px;font-weight:800;color:#22c55e;" id="result-pct">0%</div><div style="font-size:12px;color:#64748b;">Accuracy</div></div>
                    <div style="width:1px;background:rgba(100,116,139,0.15);"></div>
                    <div><div style="font-size:36px;font-weight:800;color:#f59e0b;" id="result-rank">#1</div><div style="font-size:12px;color:#64748b;">Rank</div></div>
                </div>
            </div>
        </section>

        <script>
        var quizAnswers = {};
        var quizStartTime = Date.now();

        function selectQuizOption(qi, oi) {
            quizAnswers[qi] = oi;
            document.querySelectorAll('.quiz-option[data-q="'+qi+'"]').forEach(function(b){b.classList.remove('selected')});
            document.querySelector('.quiz-option[data-q="'+qi+'"][data-o="'+oi+'"]').classList.add('selected');
        }

        function submitQuiz() {
            var nameEl = document.getElementById('quiz-name');
            var emailEl = document.getElementById('quiz-email');
            var name = nameEl ? nameEl.value.trim() : 'Anonymous';
            var email = emailEl ? emailEl.value.trim() : '';
            if (nameEl && !name) { nameEl.focus(); nameEl.style.borderColor='#ef4444'; return; }

            var totalQ = ${questions.length};
            var answers = [];
            for (var i = 0; i < totalQ; i++) {
                if (quizAnswers[i] === undefined) {
                    var el = document.querySelector('.quiz-question[data-qi="'+i+'"]');
                    if (el) el.scrollIntoView({behavior:'smooth',block:'center'});
                    return;
                }
                answers.push(quizAnswers[i]);
            }

            var btn = document.getElementById('quiz-submit-btn');
            btn.textContent = 'Submitting...';
            btn.disabled = true;

            fetch('/p/${escapeHtml(slug)}/submit', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ name: name, email: email, answers: answers, time_taken_ms: Date.now() - quizStartTime })
            })
            .then(function(r){ return r.json(); })
            .then(function(j){
                if (j.data) {
                    document.getElementById('result-score').textContent = j.data.score + '/' + j.data.total;
                    document.getElementById('result-pct').textContent = j.data.percentage + '%';
                    document.getElementById('result-rank').textContent = '#' + j.data.rank;

                    if (j.data.percentage >= 80) {
                        document.getElementById('result-emoji').textContent = '🏆';
                        document.getElementById('result-title').textContent = 'Excellent!';
                    } else if (j.data.percentage >= 50) {
                        document.getElementById('result-emoji').textContent = '👏';
                        document.getElementById('result-title').textContent = 'Good Job!';
                    } else {
                        document.getElementById('result-emoji').textContent = '💪';
                        document.getElementById('result-title').textContent = 'Keep Trying!';
                    }
                    document.getElementById('result-desc').textContent = 'You scored ' + j.data.score + ' out of ' + j.data.total + ' correctly';

                    document.getElementById('quiz-form').style.display = 'none';
                    document.getElementById('quiz-result').style.display = 'block';

                    // Refresh leaderboard if exists
                    if (document.getElementById('leaderboard-body')) loadLeaderboard();
                }
            })
            .catch(function(){ btn.textContent = 'Submit Answers'; btn.disabled = false; });
        }
        </script>`;
    }

    // ── Render leaderboard section ──
    private renderLeaderboardSection(s: Record<string, unknown>, slug: string): string {
        const title = String(s.title ?? '🏆 Leaderboard');

        return `<section style="padding:60px 20px;max-width:700px;margin:0 auto;">
            <h2 style="font-size:28px;font-weight:800;text-align:center;margin-bottom:24px;color:#e2e8f0;">${escapeHtml(title)}</h2>
            <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(100,116,139,0.15);border-radius:16px;overflow:hidden;">
                <div class="lb-row" style="background:rgba(99,102,241,0.08);font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">
                    <div>#</div><div>Name</div><div style="text-align:center;">Score</div><div style="text-align:center;">%</div>
                </div>
                <div id="leaderboard-body">
                    <div style="padding:32px;text-align:center;color:#64748b;font-size:14px;">Loading leaderboard...</div>
                </div>
            </div>
        </section>

        <script>
        function loadLeaderboard() {
            fetch('/p/${escapeHtml(slug)}/leaderboard')
            .then(function(r){ return r.json(); })
            .then(function(j){
                var body = document.getElementById('leaderboard-body');
                if (!j.data || j.data.length === 0) {
                    body.innerHTML = '<div style="padding:32px;text-align:center;color:#64748b;font-size:14px;">No entries yet. Be the first to take the quiz!</div>';
                    return;
                }
                var html = '';
                for (var i = 0; i < j.data.length; i++) {
                    var d = j.data[i];
                    var medal = d.rank <= 3 ? ['🥇','🥈','🥉'][d.rank-1] : d.rank;
                    html += '<div class="lb-row">';
                    html += '<div class="lb-rank">' + medal + '</div>';
                    html += '<div style="font-weight:600;color:#e2e8f0;">' + d.name + '</div>';
                    html += '<div style="text-align:center;font-weight:700;color:#a5b4fc;">' + d.score + '/' + d.total + '</div>';
                    html += '<div style="text-align:center;font-weight:700;color:#22c55e;">' + d.percentage + '%</div>';
                    html += '</div>';
                }
                body.innerHTML = html;
            })
            .catch(function(){
                document.getElementById('leaderboard-body').innerHTML = '<div style="padding:24px;text-align:center;color:#64748b;">Could not load leaderboard</div>';
            });
        }
        loadLeaderboard();
        </script>`;
    }

    // ── Render survey section ──
    private renderSurveySection(s: Record<string, unknown>, slug: string): string {
        const questions = (s.questions ?? []) as Array<Record<string, unknown>>;
        const successMessage = String(s.success_message ?? 'Thank you for your response! 🙏');

        const fieldsHtml = questions.map((q, qi) => {
            const label = escapeHtml(String(q.label ?? ''));
            const required = q.required ? '<span style="color:#ef4444;margin-left:4px;">*</span>' : '';
            const ph = escapeHtml(String(q.placeholder ?? ''));

            if (q.type === 'text' || q.type === 'email') {
                return `<div style="margin-bottom:20px;">
                    <label style="display:block;font-size:14px;font-weight:600;color:#cbd5e1;margin-bottom:8px;">${label}${required}</label>
                    <input type="${q.type}" class="survey-input survey-field" data-qi="${qi}" ${q.required ? 'required' : ''} placeholder="${ph}">
                </div>`;
            }

            if (q.type === 'textarea') {
                return `<div style="margin-bottom:20px;">
                    <label style="display:block;font-size:14px;font-weight:600;color:#cbd5e1;margin-bottom:8px;">${label}${required}</label>
                    <textarea class="survey-input survey-field" data-qi="${qi}" rows="3" ${q.required ? 'required' : ''} placeholder="${ph}" style="resize:vertical;"></textarea>
                </div>`;
            }

            if (q.type === 'radio') {
                const options = (q.options ?? []) as string[];
                const optHtml = options.map((opt) =>
                    `<label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(100,116,139,0.15);border-radius:10px;cursor:pointer;transition:all 0.15s;" onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='rgba(100,116,139,0.15)'">
                        <input type="radio" name="survey_q${qi}" value="${escapeHtml(opt)}" class="survey-field" data-qi="${qi}" ${q.required ? 'required' : ''} style="accent-color:#6366f1;">
                        <span style="color:#e2e8f0;font-size:14px;">${escapeHtml(opt)}</span>
                    </label>`
                ).join('');
                return `<div style="margin-bottom:20px;">
                    <label style="display:block;font-size:14px;font-weight:600;color:#cbd5e1;margin-bottom:8px;">${label}${required}</label>
                    <div style="display:flex;flex-direction:column;gap:8px;">${optHtml}</div>
                </div>`;
            }

            if (q.type === 'checkbox') {
                const options = (q.options ?? []) as string[];
                const optHtml = options.map((opt) =>
                    `<label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(100,116,139,0.15);border-radius:10px;cursor:pointer;transition:all 0.15s;" onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='rgba(100,116,139,0.15)'">
                        <input type="checkbox" name="survey_q${qi}" value="${escapeHtml(opt)}" class="survey-field survey-checkbox" data-qi="${qi}" style="accent-color:#6366f1;">
                        <span style="color:#e2e8f0;font-size:14px;">${escapeHtml(opt)}</span>
                    </label>`
                ).join('');
                return `<div style="margin-bottom:20px;">
                    <label style="display:block;font-size:14px;font-weight:600;color:#cbd5e1;margin-bottom:8px;">${label}${required}</label>
                    <div style="display:flex;flex-direction:column;gap:8px;">${optHtml}</div>
                </div>`;
            }

            if (q.type === 'scale') {
                const min = Number(q.min ?? 1);
                const max = Number(q.max ?? 5);
                const minLabel = escapeHtml(String(q.min_label ?? ''));
                const maxLabel = escapeHtml(String(q.max_label ?? ''));
                let btns = '';
                for (let v = min; v <= max; v++) {
                    btns += `<button type="button" class="scale-btn" data-qi="${qi}" data-val="${v}" onclick="selectScale(${qi},${v})">${v}</button>`;
                }
                return `<div style="margin-bottom:20px;">
                    <label style="display:block;font-size:14px;font-weight:600;color:#cbd5e1;margin-bottom:8px;">${label}${required}</label>
                    <div style="display:flex;gap:8px;align-items:center;">
                        ${minLabel ? `<span style="font-size:12px;color:#64748b;">${minLabel}</span>` : ''}
                        ${btns}
                        ${maxLabel ? `<span style="font-size:12px;color:#64748b;">${maxLabel}</span>` : ''}
                    </div>
                    <input type="hidden" class="survey-field survey-scale" data-qi="${qi}">
                </div>`;
            }

            return '';
        }).join('');

        return `<section style="padding:60px 20px;max-width:700px;margin:0 auto;">
            <div id="survey-form-container">
                <form id="survey-form" onsubmit="submitSurvey(event)">
                    ${fieldsHtml}
                    <button type="submit" id="survey-submit-btn" style="width:100%;padding:16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;margin-top:8px;transition:all 0.2s;">
                        Submit Survey
                    </button>
                </form>
            </div>

            <div id="survey-success" style="display:none;text-align:center;padding:60px 0;">
                <div style="font-size:64px;margin-bottom:16px;">🙏</div>
                <h2 style="font-size:28px;font-weight:800;color:#e2e8f0;margin-bottom:12px;">${escapeHtml(successMessage)}</h2>
                <p style="font-size:14px;color:#64748b;">Your response has been recorded.</p>
            </div>
        </section>

        <script>
        var surveyScales = {};

        function selectScale(qi, val) {
            surveyScales[qi] = val;
            document.querySelectorAll('.scale-btn[data-qi="'+qi+'"]').forEach(function(b){ b.classList.remove('active'); });
            document.querySelector('.scale-btn[data-qi="'+qi+'"][data-val="'+val+'"]').classList.add('active');
            var hidden = document.querySelector('.survey-scale[data-qi="'+qi+'"]');
            if (hidden) hidden.value = val;
        }

        function submitSurvey(e) {
            e.preventDefault();
            var answers = [];
            var totalQ = ${questions.length};

            for (var i = 0; i < totalQ; i++) {
                var field = document.querySelector('.survey-field[data-qi="'+i+'"]');
                if (!field) { answers.push(null); continue; }

                if (field.type === 'radio') {
                    var checked = document.querySelector('input[name="survey_q'+i+'"]:checked');
                    answers.push(checked ? checked.value : null);
                } else if (field.classList.contains('survey-checkbox')) {
                    var vals = [];
                    document.querySelectorAll('input[name="survey_q'+i+'"]:checked').forEach(function(c){ vals.push(c.value); });
                    answers.push(vals);
                } else if (field.classList.contains('survey-scale')) {
                    answers.push(surveyScales[i] !== undefined ? surveyScales[i] : null);
                } else {
                    answers.push(field.value || null);
                }
            }

            // Extract name & email from the first text/email fields
            var nameField = document.querySelector('.survey-field[data-qi="0"]');
            var emailField = document.querySelector('.survey-field[data-qi="1"]');

            var btn = document.getElementById('survey-submit-btn');
            btn.textContent = 'Submitting...';
            btn.disabled = true;

            fetch('/p/${escapeHtml(slug)}/submit', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ name: nameField ? nameField.value : null, email: emailField ? emailField.value : null, answers: answers })
            })
            .then(function(r){ return r.json(); })
            .then(function(j){
                if (j.data && j.data.success) {
                    document.getElementById('survey-form-container').style.display = 'none';
                    document.getElementById('survey-success').style.display = 'block';
                } else {
                    btn.textContent = 'Submit Survey';
                    btn.disabled = false;
                }
            })
            .catch(function(){ btn.textContent = 'Submit Survey'; btn.disabled = false; });
        }
        </script>`;
    }

    private renderWelcomePage(): string {
        return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome — GAO CRM</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container { text-align: center; padding: 40px; }
        h1 {
            font-size: 48px; font-weight: 800;
            background: linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            margin-bottom: 12px;
        }
        p { font-size: 16px; color: #94a3b8; margin-bottom: 32px; max-width: 480px; line-height: 1.6; }
        .btn {
            display: inline-block; padding: 14px 32px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: #fff; border-radius: 12px; font-weight: 700; text-decoration: none;
            font-size: 15px; transition: all 0.2s;
        }
        .btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(99,102,241,0.3); }
        .sub { font-size: 13px; color: #475569; margin-top: 20px; }
        .sub a { color: #818cf8; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1>GAO CRM</h1>
        <p>No landing page has been published yet. Create and publish a landing page from the admin panel to make it visible here.</p>
        <a href="/gaocrm/admin-panel/login" class="btn">Go to Admin Panel →</a>
        <p class="sub">Admin Panel: <a href="/gaocrm/admin-panel/">/gaocrm/admin-panel/</a></p>
    </div>
</body>
</html>`;
    }

    private render404(): string {
        return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found</title>
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; background: #0f172a; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .c { text-align: center; }
        h1 { font-size: 72px; font-weight: 800; color: #4338ca; }
        p { color: #94a3b8; margin: 12px 0 24px; }
        a { color: #818cf8; text-decoration: none; }
    </style>
</head>
<body><div class="c"><h1>404</h1><p>Page not found</p><a href="/">← Go Home</a></div></body>
</html>`;
    }
}
