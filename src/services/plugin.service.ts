import { Plugin } from '../models/plugin.model.js';
import { PluginVersion } from '../models/plugin-version.model.js';

interface RegisterPluginInput {
    slug: string;
    name: string;
    description?: string;
    author?: string;
    homepage?: string;
    icon_url?: string;
    category?: string;
}

export class PluginService {
    async list(activeOnly = false): Promise<Plugin[]> {
        let query = Plugin.where('is_installed', true);
        if (activeOnly) query = query.where('is_active', true);
        return query.orderBy('name', 'ASC').get();
    }

    async findBySlug(slug: string): Promise<Plugin | null> {
        return Plugin.where('slug', slug).first() ?? null;
    }

    async register(data: RegisterPluginInput): Promise<Plugin> {
        return Plugin.create({
            slug: data.slug,
            name: data.name,
            description: data.description,
            author: data.author,
            homepage: data.homepage,
            icon_url: data.icon_url,
            category: data.category ?? 'general',
            is_installed: false,
            is_active: false,
            config: JSON.stringify({}),
        });
    }

    async install(slug: string): Promise<Plugin | null> {
        const plugin = await Plugin.where('slug', slug).first();
        if (!plugin) return null;
        plugin.is_installed = true;
        plugin.installed_at = new Date().toISOString();
        await plugin.save();
        return plugin;
    }

    async activate(slug: string): Promise<Plugin | null> {
        const plugin = await Plugin.where('slug', slug).where('is_installed', true).first();
        if (!plugin) return null;
        plugin.is_active = true;
        await plugin.save();
        return plugin;
    }

    async deactivate(slug: string): Promise<Plugin | null> {
        const plugin = await Plugin.where('slug', slug).first();
        if (!plugin) return null;
        plugin.is_active = false;
        await plugin.save();
        return plugin;
    }

    async uninstall(slug: string): Promise<boolean> {
        const plugin = await Plugin.where('slug', slug).first();
        if (!plugin) return false;
        plugin.is_installed = false;
        plugin.is_active = false;
        await plugin.save();
        return true;
    }

    async addVersion(pluginId: string, version: string, changelog?: string): Promise<PluginVersion> {
        const pv = await PluginVersion.create({
            plugin_id: pluginId,
            version,
            changelog,
            released_at: new Date().toISOString(),
        });

        const plugin = await Plugin.where('id', pluginId).first();
        if (plugin) {
            plugin.current_version = version;
            await plugin.save();
        }

        return pv;
    }

    async getVersions(pluginId: string): Promise<PluginVersion[]> {
        return PluginVersion.where('plugin_id', pluginId).orderBy('released_at', 'DESC').get();
    }
}
