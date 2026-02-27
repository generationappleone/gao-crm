/**
 * GAO CRM — HTML Escape Utility
 */
const ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};
export function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (char) => ESCAPE_MAP[char] ?? char);
}
//# sourceMappingURL=escape.js.map