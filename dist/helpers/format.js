/**
 * GAO CRM — Format Utilities
 */
export function formatCurrency(value, currency = 'IDR') {
    if (currency === 'IDR') {
        return `Rp ${value.toLocaleString('id-ID')}`;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}
export function formatNumber(value) {
    return value.toLocaleString('id-ID');
}
export function formatDate(dateString) {
    if (!dateString)
        return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
export function formatDateTime(dateString) {
    if (!dateString)
        return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}
export function timeAgo(dateString) {
    const now = Date.now();
    const diff = now - new Date(dateString).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 30)
        return formatDate(dateString);
    if (days > 0)
        return `${days}d ago`;
    if (hours > 0)
        return `${hours}h ago`;
    if (minutes > 0)
        return `${minutes}m ago`;
    return 'just now';
}
export function formatPercentage(value) {
    return `${value}%`;
}
//# sourceMappingURL=format.js.map