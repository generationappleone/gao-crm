import { Translation } from '../models/translation.model.js';

export class I18nService {
    async getTranslations(locale: string, namespace = 'common'): Promise<Record<string, string>> {
        const rows = await Translation.where('locale', locale).where('namespace', namespace).get();
        const result: Record<string, string> = {};
        for (const row of rows) result[row.key] = row.value;
        return result;
    }

    async setTranslation(locale: string, namespace: string, key: string, value: string): Promise<Translation> {
        const existing = await Translation.where('locale', locale).where('namespace', namespace).where('key', key).first();
        if (existing) { existing.value = value; await existing.save(); return existing; }
        return Translation.create({ locale, namespace, key, value });
    }

    async getLocales(): Promise<string[]> {
        const rows = await Translation.where('id', 'IS NOT', null).get();
        return [...new Set(rows.map((r) => r.locale))];
    }
}
