/**
 * GAO CRM — Format Utilities
 */
export function formatCurrency(value, currency = 'IDR') {
    if (currency === 'IDR') {
        // Indonesian Rupiah: no decimals, dot as thousand separator
        // Example: 24000000 → "Rp 24.000.000"
        const rounded = Math.round(value);
        const formatted = formatIDR(rounded);
        return `Rp ${formatted}`;
    }
    // For other currencies, try Intl, fallback to manual
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
    }
    catch {
        return `${currency} ${formatIDR(Math.round(value))}`;
    }
}
/**
 * Format a number with dots as thousand separators (Indonesian style).
 * Example: 24000000 → "24.000.000"
 */
function formatIDR(num) {
    const isNegative = num < 0;
    const abs = Math.abs(num).toString();
    let result = '';
    let count = 0;
    for (let i = abs.length - 1; i >= 0; i--) {
        if (count > 0 && count % 3 === 0) {
            result = '.' + result;
        }
        result = abs[i] + result;
        count++;
    }
    return isNegative ? '-' + result : result;
}
export function formatNumber(value) {
    return formatIDR(Math.round(value));
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