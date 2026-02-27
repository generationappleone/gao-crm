import { Controller, Get } from '@gao/http';
import type { GaoRequest, GaoResponse } from '@gao/http';

@Controller('/')
export class AuthController {

    @Get('/login')
    async loginPage(_req: GaoRequest, res: GaoResponse) {
        const html = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login — GAO CRM</title>
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
        .login-container {
            width: 100%;
            max-width: 420px;
            padding: 40px;
        }
        .login-card {
            background: rgba(30, 41, 59, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(100, 116, 139, 0.2);
            border-radius: 16px;
            padding: 40px;
        }
        .brand {
            text-align: center;
            margin-bottom: 32px;
        }
        .brand h1 {
            font-size: 28px;
            font-weight: 800;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .brand p { color: #94a3b8; font-size: 14px; margin-top: 8px; }
        .form-group { margin-bottom: 20px; }
        .form-group label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #cbd5e1;
            margin-bottom: 8px;
        }
        .form-group input {
            width: 100%;
            padding: 12px 16px;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 10px;
            color: #e2e8f0;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }
        .form-group input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .btn-login {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border: none;
            border-radius: 10px;
            color: #fff;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: opacity 0.2s, transform 0.1s;
        }
        .btn-login:hover { opacity: 0.9; }
        .btn-login:active { transform: scale(0.98); }
        .error-msg {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            color: #fca5a5;
            padding: 12px;
            font-size: 13px;
            margin-bottom: 20px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="brand">
                <h1>GAO CRM</h1>
                <p>Customer Relationship Management</p>
            </div>
            <div class="error-msg" id="errorMsg"></div>
            <form id="loginForm">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" placeholder="admin@gaocrm.com" required autocomplete="email">
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Enter your password" required autocomplete="current-password">
                </div>
                <button type="submit" class="btn-login" id="btnLogin">Sign In</button>
            </form>
        </div>
    </div>
    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnLogin');
            const errorEl = document.getElementById('errorMsg');
            btn.textContent = 'Signing in...';
            btn.disabled = true;
            errorEl.style.display = 'none';

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: document.getElementById('email').value,
                        password: document.getElementById('password').value,
                    }),
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error?.message || 'Login failed');
                }
                window.location.href = '/';
            } catch (err) {
                errorEl.textContent = err.message;
                errorEl.style.display = 'block';
            } finally {
                btn.textContent = 'Sign In';
                btn.disabled = false;
            }
        });
    </script>
</body>
</html>`;
        return res.html(html);
    }
}
