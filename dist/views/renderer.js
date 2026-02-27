/**
 * GAO CRM — Shared Admin Template Renderer
 */
import { createAdminTemplate, } from '@gao/ui';
export function renderPage(options) {
    const { title, content, activePath, user, notifications } = options;
    const sidebar = [
        { label: 'Dashboard', icon: 'home', section: 'MAIN', href: '/', active: activePath === '/' },
        { label: 'Contacts', icon: 'users', section: 'CRM', href: '/contacts', active: activePath.startsWith('/contacts') },
        { label: 'Companies', icon: 'store', href: '/companies', active: activePath.startsWith('/companies') },
        { label: 'Deals', icon: 'dollar', href: '/deals', active: activePath.startsWith('/deals') },
        { label: 'Activities', icon: 'activity', section: 'ACTIVITY', href: '/activities', active: activePath.startsWith('/activities') },
        { label: 'Tags', icon: 'tag', section: 'SETTINGS', href: '/tags', active: activePath.startsWith('/tags') },
    ];
    return createAdminTemplate.layout({
        title: `${title} — GAO CRM`,
        brandName: 'GAO CRM',
        brandIcon: 'layout',
        sidebar,
        navbar: {
            showSearch: true,
            user: user ? { name: user.name, role: user.role } : { name: 'Guest' },
            notifications: notifications ?? 0,
        },
        content,
        footer: '© 2026 GAO CRM — Built with GAO Framework',
    });
}
//# sourceMappingURL=renderer.js.map