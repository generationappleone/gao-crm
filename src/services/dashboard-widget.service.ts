import { DashboardWidget, type WidgetType } from '../models/dashboard-widget.model.js';

interface CreateWidgetInput {
    user_id: string;
    title: string;
    widget_type: WidgetType;
    data_source: string;
    config?: Record<string, unknown>;
    width?: string;
    refresh_interval?: number;
}

export class DashboardWidgetService {
    async listByUser(userId: string): Promise<DashboardWidget[]> {
        return DashboardWidget.where('user_id', userId).where('is_visible', true).orderBy('position', 'ASC').get();
    }

    async create(data: CreateWidgetInput): Promise<DashboardWidget> {
        const existing = await DashboardWidget.where('user_id', data.user_id).get();
        return DashboardWidget.create({
            user_id: data.user_id,
            title: data.title,
            widget_type: data.widget_type,
            data_source: data.data_source,
            config: JSON.stringify(data.config ?? {}),
            width: data.width ?? 'half',
            position: existing.length,
            is_visible: true,
            refresh_interval: data.refresh_interval ?? 300,
        });
    }

    async update(id: string, data: Partial<CreateWidgetInput & { position: number; is_visible: boolean }>): Promise<DashboardWidget | null> {
        const widget = await DashboardWidget.where('id', id).first();
        if (!widget) return null;

        if (data.title !== undefined) widget.title = data.title;
        if (data.config !== undefined) widget.config = JSON.stringify(data.config);
        if (data.width !== undefined) widget.width = data.width;
        if (data.position !== undefined) widget.position = data.position;
        if (data.is_visible !== undefined) widget.is_visible = data.is_visible;
        if (data.refresh_interval !== undefined) widget.refresh_interval = data.refresh_interval;

        await widget.save();
        return widget;
    }

    async reorder(userId: string, widgetIds: string[]): Promise<void> {
        for (let i = 0; i < widgetIds.length; i++) {
            const widget = await DashboardWidget.where('id', widgetIds[i]!).where('user_id', userId).first();
            if (widget) {
                widget.position = i;
                await widget.save();
            }
        }
    }

    async delete(id: string): Promise<boolean> {
        const widget = await DashboardWidget.where('id', id).first();
        if (!widget) return false;
        await widget.destroy();
        return true;
    }
}
