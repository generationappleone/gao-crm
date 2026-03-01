/**
 * GAO CRM — Onboarding Wizard Helper
 * Guides new users through their first CRM setup.
 */

export interface OnboardingStep {
    key: string;
    number: number;
    title: string;
    subtitle: string;
    emoji: string;
    href: string;
    buttonLabel: string;
    completed: boolean;
    locked: boolean;
}

export function getOnboardingSteps(progress: Record<string, boolean>): OnboardingStep[] {
    return [
        {
            key: 'products_added',
            number: 1,
            title: 'Daftarkan Produk/Jasa Anda',
            subtitle: 'Apa yang perusahaan Anda jual? Daftarkan produk atau jasa Anda beserta harganya.',
            emoji: '📦',
            href: '/products/create',
            buttonLabel: '→ Tambah Produk Pertama',
            completed: progress.products_added ?? false,
            locked: false,
        },
        {
            key: 'contacts_added',
            number: 2,
            title: 'Tambah Kontak Pertama',
            subtitle: 'Siapa calon pelanggan Anda? Tambahkan nama, email, dan nomor telepon mereka.',
            emoji: '👤',
            href: '/contacts/create',
            buttonLabel: '→ Tambah Contact',
            completed: progress.contacts_added ?? false,
            locked: !progress.products_added,
        },
        {
            key: 'deals_created',
            number: 3,
            title: 'Buat Peluang Penjualan (Deal)',
            subtitle: 'Catat peluang bisnis yang sedang Anda kejar. Deal membantu melacak proses penjualan dari awal hingga closing.',
            emoji: '💰',
            href: '/deals/create',
            buttonLabel: '→ Buat Deal Pertama',
            completed: progress.deals_created ?? false,
            locked: !progress.contacts_added,
        },
        {
            key: 'quotations_sent',
            number: 4,
            title: 'Kirim Penawaran Harga (Quotation)',
            subtitle: 'Buat surat penawaran profesional dengan detail produk, harga, dan pajak.',
            emoji: '📋',
            href: '/quotations/create',
            buttonLabel: '→ Buat Quotation',
            completed: progress.quotations_sent ?? false,
            locked: !progress.deals_created,
        },
        {
            key: 'invoices_created',
            number: 5,
            title: 'Buat Invoice & Terima Pembayaran',
            subtitle: 'Setelah deal disetujui, buat invoice untuk menagih pembayaran. Catat pembayaran yang masuk.',
            emoji: '💳',
            href: '/invoices/create',
            buttonLabel: '→ Buat Invoice',
            completed: progress.invoices_created ?? false,
            locked: !progress.quotations_sent,
        },
    ];
}

/**
 * Render welcome mode HTML for the dashboard.
 */
export function renderOnboardingWizard(userName: string, steps: OnboardingStep[]): string {
    const completedCount = steps.filter(s => s.completed).length;
    const totalSteps = steps.length;
    const progressPercent = Math.round((completedCount / totalSteps) * 100);
    const allDone = completedCount === totalSteps;

    if (allDone) {
        return `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;">
            <div style="font-size:72px;margin-bottom:24px;animation:gaoBounce 0.6s ease;">🎉</div>
            <h1 style="font-size:28px;font-weight:800;color:#e2e8f0;margin-bottom:12px;">Selamat! CRM Anda Siap Digunakan!</h1>
            <p style="font-size:15px;color:var(--gao-text-muted,#94a3b8);max-width:480px;line-height:1.7;margin-bottom:28px;">
                Anda telah menyelesaikan semua langkah setup. Sekarang Anda bisa mulai mengelola pelanggan, deal, dan penjualan Anda.
            </p>
            <button onclick="fetch('/api/users/me/onboarding-complete',{method:'POST'}).then(()=>window.location='/')" style="padding:14px 36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 4px 20px rgba(99,102,241,0.3);">
                🚀 Mulai Menggunakan GAO CRM
            </button>
        </div>
        <style>@keyframes gaoBounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }</style>`;
    }

    const stepCards = steps.map(s => {
        const statusIcon = s.completed ? '✅' : s.locked ? '🔒' : '☐';
        const opacity = s.locked ? '0.4' : '1';
        const border = s.completed ? 'border-left:4px solid #22c55e;' : s.locked ? '' : 'border-left:4px solid #6366f1;';

        return `
        <div style="padding:16px 20px;background:rgba(255,255,255,0.02);border:1px solid rgba(100,116,139,0.12);border-radius:10px;${border}opacity:${opacity};transition:all 0.2s;">
            <div style="display:flex;align-items:flex-start;gap:14px;">
                <span style="font-size:24px;flex-shrink:0;">${s.completed ? '✅' : s.emoji}</span>
                <div style="flex:1;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                        <span style="font-size:11px;font-weight:700;color:#64748b;">STEP ${s.number}</span>
                        ${s.completed ? '<span style="font-size:10px;color:#22c55e;font-weight:700;">SELESAI</span>' : ''}
                    </div>
                    <h4 style="font-size:15px;font-weight:700;color:#e2e8f0;margin-bottom:4px;">${statusIcon === '🔒' ? '🔒 ' : ''}${s.title}</h4>
                    <p style="font-size:13px;color:var(--gao-text-muted,#94a3b8);line-height:1.5;margin-bottom:${!s.completed && !s.locked ? '12px' : '0'};">${s.subtitle}</p>
                    ${!s.completed && !s.locked ? `
                        <a href="${s.href}" style="display:inline-block;padding:8px 18px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700;">
                            ${s.buttonLabel}
                        </a>
                    ` : ''}
                    ${s.locked ? '<p style="font-size:11px;color:#64748b;font-style:italic;margin-top:4px;">Selesaikan step sebelumnya dulu</p>' : ''}
                </div>
            </div>
        </div>`;
    }).join('');

    return `
    <div style="max-width:680px;margin:0 auto;padding:20px 0;">
        <div style="text-align:center;margin-bottom:32px;">
            <div style="font-size:40px;margin-bottom:12px;">👋</div>
            <h1 style="font-size:26px;font-weight:800;color:#e2e8f0;margin-bottom:8px;">Selamat datang di GAO CRM, ${userName}!</h1>
            <p style="font-size:14px;color:var(--gao-text-muted,#94a3b8);max-width:480px;margin:0 auto;line-height:1.7;">
                GAO CRM membantu Anda mengelola pelanggan dan penjualan.<br>
                Mari setup CRM Anda dalam <strong style="color:#e2e8f0;">5 langkah mudah</strong>:
            </p>
        </div>

        <!-- Progress Bar -->
        <div style="margin-bottom:24px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span style="font-size:13px;font-weight:600;color:#94a3b8;">Progress</span>
                <span style="font-size:13px;font-weight:700;color:#818cf8;">${completedCount} of ${totalSteps} steps (${progressPercent}%)</span>
            </div>
            <div style="height:8px;background:rgba(255,255,255,0.06);border-radius:8px;overflow:hidden;">
                <div style="height:100%;width:${progressPercent}%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:8px;transition:width 0.5s ease;"></div>
            </div>
        </div>

        <!-- Step Cards -->
        <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:32px;">
            ${stepCards}
        </div>

        <!-- Skip -->
        <div style="text-align:center;">
            <button onclick="if(confirm('Yakin skip panduan? Anda bisa buka lagi dari Settings.'))fetch('/api/users/me/onboarding-complete',{method:'POST'}).then(()=>window.location='/')" style="padding:8px 20px;background:none;color:#64748b;border:1px solid rgba(100,116,139,0.2);border-radius:8px;font-size:12px;cursor:pointer;">
                Lewati Panduan →
            </button>
        </div>
    </div>`;
}
