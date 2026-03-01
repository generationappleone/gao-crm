/**
 * GAO CRM — Plugin Engine Core
 *
 * Discovers, loads, and manages plugins from /plugins/ folder.
 * Provides sandboxed PluginAPI to each plugin.
 * Plugin errors are isolated — they NEVER crash the core CRM.
 */

export interface PluginManifest {
    slug: string;
    name: string;
    version: string;
    author: string;
    description: string;
    homepage?: string;
    min_crm_version?: string;
    category?: string;
    hooks?: string[];
    ui_slots?: string[];
    config_schema?: Record<string, PluginConfigField>;
    permissions?: string[];
}

export interface PluginConfigField {
    type: 'string' | 'number' | 'boolean' | 'select';
    label: string;
    required?: boolean;
    secret?: boolean;
    default?: unknown;
    options?: string[];
}

export type CrmEvent =
    | 'contact.created' | 'contact.updated'
    | 'deal.created' | 'deal.stage_changed' | 'deal.won' | 'deal.lost'
    | 'invoice.created' | 'invoice.paid'
    | 'ticket.created' | 'ticket.status_changed'
    | 'form.submitted'
    | 'chat.message_received';

export type UiSlot =
    | 'contact.detail.sidebar' | 'contact.detail.actions'
    | 'deal.detail.sidebar' | 'deal.detail.actions'
    | 'company.detail.sidebar'
    | 'dashboard.widgets'
    | 'settings.tabs';

export interface PluginAPI {
    getConfig(): Record<string, unknown>;
    on(event: string, handler: (data: unknown) => Promise<void> | void): void;
    ui: {
        registerSlot(slot: string, renderer: (context: unknown) => string): void;
    };
}

interface PluginInstance {
    manifest: PluginManifest;
    config: Record<string, unknown>;
}

type HookEntry = { slug: string; handler: (data: unknown) => Promise<void> | void };
type SlotEntry = { slug: string; renderer: (context: unknown) => string };

export class PluginEngine {
    private plugins = new Map<string, PluginInstance>();
    private hooks = new Map<string, HookEntry[]>();
    private uiSlots = new Map<string, SlotEntry[]>();

    /**
     * Emit an event to all listening plugins.
     * Safe — all handlers wrapped in try/catch.
     */
    async emit(event: string, data: unknown): Promise<void> {
        const handlers = this.hooks.get(event) ?? [];
        for (const { slug, handler } of handlers) {
            try {
                await handler(data);
            } catch (err) {
                console.error(`⚠️ Plugin "${slug}" error on event "${event}":`, err);
            }
        }
    }

    /**
     * Render all UI slot contributions for a given slot name.
     * Returns combined HTML from all plugins that registered for this slot.
     */
    renderSlot(slotName: string, context: unknown): string {
        const renderers = this.uiSlots.get(slotName) ?? [];
        return renderers.map(({ slug, renderer }) => {
            try {
                return renderer(context) || '';
            } catch (err) {
                console.error(`⚠️ Plugin "${slug}" render error in slot "${slotName}":`, err);
                return '';
            }
        }).join('');
    }

    /**
     * Register a hook handler for a plugin.
     */
    registerHook(slug: string, event: string, handler: (data: unknown) => Promise<void> | void): void {
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event)!.push({ slug, handler });
    }

    /**
     * Register a UI slot renderer for a plugin.
     */
    registerSlot(slug: string, slot: string, renderer: (context: unknown) => string): void {
        if (!this.uiSlots.has(slot)) this.uiSlots.set(slot, []);
        this.uiSlots.get(slot)!.push({ slug, renderer });
    }

    /** Get all registered plugins */
    getPlugins(): PluginManifest[] {
        return [...this.plugins.values()].map(p => p.manifest);
    }

    /** Get count of active hooks */
    getHookCount(): number {
        let count = 0;
        for (const entries of this.hooks.values()) count += entries.length;
        return count;
    }
}

// Global singleton
export const pluginEngine = new PluginEngine();
