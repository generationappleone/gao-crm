/**
 * GAO CRM — URL Prefix Helper
 *
 * All admin-panel routes live under /gaocrm/admin-panel.
 * This helper ensures every server-side redirect and <a href>
 * resolves correctly regardless of the handler prefix.
 */

export const APP_PREFIX = '/gaocrm/admin-panel';

/**
 * Prepend the admin panel prefix to a path.
 * Idempotent — will not double-prefix.
 *
 * @example url('/crm/contacts')        → '/gaocrm/admin-panel/crm/contacts'
 * @example url('/gaocrm/admin-panel/x') → '/gaocrm/admin-panel/x'  (no change)
 * @example url('https://example.com')   → 'https://example.com'   (no change)
 */
export function url(path: string): string {
    if (!path || !path.startsWith('/') || path.startsWith(APP_PREFIX)) return path;
    return APP_PREFIX + path;
}
