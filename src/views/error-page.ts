/**
 * GAO CRM — Error Page Templates
 *
 * Beautiful, branded error pages for 404, 500, and other HTTP errors.
 * - 404: Always shown with full design
 * - 500+: Shows stack trace in debug mode, generic message in production
 */

export interface ErrorPageOptions {
    statusCode: number;
    title: string;
    message: string;
    /** The URL path that was requested */
    path?: string;
    /** Stack trace — only shown when debug=true */
    stack?: string;
    /** Error code (e.g. 'NOT_FOUND', 'INTERNAL_SERVER_ERROR') */
    code?: string;
    /** Show detailed debug information */
    debug?: boolean;
}

const STATUS_EMOJIS: Record<number, string> = {
    400: '🚫',
    401: '🔒',
    403: '⛔',
    404: '🔍',
    405: '🚷',
    408: '⏱️',
    409: '⚡',
    422: '📋',
    429: '🐌',
    500: '💥',
    502: '🌐',
    503: '🔧',
    504: '⏳',
};

const STATUS_SUBTITLES: Record<number, string> = {
    400: 'The request was malformed',
    401: 'You need to sign in first',
    403: 'You don\'t have permission to access this page',
    404: 'The page you\'re looking for doesn\'t exist',
    405: 'This method is not allowed',
    408: 'The request took too long',
    409: 'There was a conflict with the current state',
    422: 'The data provided is invalid',
    429: 'Too many requests — slow down a little',
    500: 'Something went wrong on our end',
    502: 'Bad gateway — upstream server error',
    503: 'Service temporarily unavailable',
    504: 'Gateway timeout — upstream took too long',
};

export function renderErrorPage(options: ErrorPageOptions): string {
    const { statusCode, title, message, path, stack, code, debug } = options;
    const emoji = STATUS_EMOJIS[statusCode] ?? '⚠️';
    const subtitle = STATUS_SUBTITLES[statusCode] ?? 'An unexpected error occurred';
    const is404 = statusCode === 404;
    const isServerError = statusCode >= 500;

    const debugSection = debug && (stack || code) ? `
        <div style="margin-top:32px;text-align:left;max-width:720px;width:100%;">
            <details open style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:12px;overflow:hidden;">
                <summary style="padding:14px 20px;font-size:13px;font-weight:700;color:#f87171;cursor:pointer;user-select:none;">
                    🐛 Debug Information
                </summary>
                <div style="padding:0 20px 20px;">
                    ${code ? `<div style="margin-top:12px;"><span style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Error Code</span><div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#f87171;margin-top:4px;">${escapeHtml(code)}</div></div>` : ''}
                    ${message ? `<div style="margin-top:12px;"><span style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Message</span><div style="font-size:13px;color:#e2e8f0;margin-top:4px;">${escapeHtml(message)}</div></div>` : ''}
                    ${path ? `<div style="margin-top:12px;"><span style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Request Path</span><div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#94a3b8;margin-top:4px;">${escapeHtml(path)}</div></div>` : ''}
                    ${stack ? `<div style="margin-top:12px;"><span style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Stack Trace</span><pre style="margin-top:8px;padding:16px;background:rgba(0,0,0,0.3);border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#94a3b8;line-height:1.6;overflow-x:auto;white-space:pre-wrap;word-break:break-all;">${escapeHtml(stack)}</pre></div>` : ''}
                </div>
            </details>
        </div>` : '';

    return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${statusCode} — ${escapeHtml(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
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
            overflow-x: hidden;
        }
        .error-container {
            text-align: center;
            padding: 40px 24px;
            max-width: 800px;
            width: 100%;
            position: relative;
        }
        .error-code {
            font-size: 140px;
            font-weight: 800;
            line-height: 1;
            position: relative;
            display: inline-block;
            background: linear-gradient(135deg, ${is404 ? '#6366f1, #8b5cf6, #a78bfa' : isServerError ? '#ef4444, #f97316, #eab308' : '#6366f1, #3b82f6, #06b6d4'});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: errorPulse 3s ease-in-out infinite alternate;
        }
        .error-emoji {
            font-size: 48px;
            margin-bottom: 8px;
            display: block;
            animation: errorBounce 2s ease-in-out infinite;
        }
        .error-title {
            font-size: 24px;
            font-weight: 700;
            color: #e2e8f0;
            margin-top: 16px;
        }
        .error-subtitle {
            font-size: 15px;
            color: #94a3b8;
            margin-top: 8px;
            line-height: 1.6;
            max-width: 480px;
            margin-left: auto;
            margin-right: auto;
        }
        .error-actions {
            margin-top: 32px;
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s ease;
            cursor: pointer;
            border: none;
        }
        .btn-primary {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: #fff;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }
        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
        }
        .btn-ghost {
            background: rgba(255, 255, 255, 0.05);
            color: #94a3b8;
            border: 1px solid rgba(100, 116, 139, 0.2);
        }
        .btn-ghost:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #e2e8f0;
        }
        .error-bg {
            position: fixed;
            inset: 0;
            z-index: -1;
            overflow: hidden;
        }
        .error-bg::before {
            content: '';
            position: absolute;
            width: 500px;
            height: 500px;
            border-radius: 50%;
            background: ${is404 ? 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)' : 'radial-gradient(circle, rgba(239,68,68,0.08), transparent 70%)'};
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: bgGlow 4s ease-in-out infinite alternate;
        }
        .error-path {
            margin-top: 16px;
            display: inline-block;
            padding: 6px 14px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(100,116,139,0.15);
            border-radius: 8px;
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            font-size: 12px;
            color: #64748b;
        }
        @keyframes errorPulse {
            0% { opacity: 0.85; transform: scale(1); }
            100% { opacity: 1; transform: scale(1.02); }
        }
        @keyframes errorBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }
        @keyframes bgGlow {
            0% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        }
        @media (max-width: 640px) {
            .error-code { font-size: 80px; }
            .error-title { font-size: 20px; }
        }
    </style>
</head>
<body>
    <div class="error-bg"></div>
    <div class="error-container">
        <span class="error-emoji">${emoji}</span>
        <div class="error-code">${statusCode}</div>
        <h1 class="error-title">${escapeHtml(title)}</h1>
        <p class="error-subtitle">${escapeHtml(subtitle)}</p>

        ${!debug && path && is404 ? `<div class="error-path">${escapeHtml(path)}</div>` : ''}

        <div class="error-actions">
            <a href="javascript:history.back()" class="btn btn-ghost">← Go Back</a>
            <a href="/gaocrm/admin-panel/" class="btn btn-primary">Dashboard</a>
            <a href="/" class="btn btn-ghost">Home</a>
        </div>

        ${debugSection}
    </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
