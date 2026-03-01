import { Currency } from '../models/currency.model.js';
import { ExchangeRate } from '../models/exchange-rate.model.js';

export class CurrencyService {
    async list(): Promise<Currency[]> {
        return Currency.where('is_active', true).orderBy('code', 'ASC').get();
    }

    async create(data: { code: string; name: string; symbol: string; decimal_places?: number }): Promise<Currency> {
        return Currency.create({ code: data.code, name: data.name, symbol: data.symbol, decimal_places: data.decimal_places ?? 2, is_default: false, is_active: true });
    }

    async setDefault(code: string): Promise<void> {
        const all = await Currency.where('is_default', true).get();
        for (const c of all) { c.is_default = false; await c.save(); }
        const currency = await Currency.where('code', code).first();
        if (currency) { currency.is_default = true; await currency.save(); }
    }

    async addRate(from: string, to: string, rate: number): Promise<ExchangeRate> {
        return ExchangeRate.create({ from_currency: from, to_currency: to, rate, effective_at: new Date().toISOString() });
    }

    async convert(amount: number, from: string, to: string): Promise<number> {
        if (from === to) return amount;
        const rate = await ExchangeRate.where('from_currency', from).where('to_currency', to).orderBy('effective_at', 'DESC').first();
        if (!rate) throw new Error(`No exchange rate found for ${from} → ${to}`);
        return Math.round(amount * rate.rate * 100) / 100;
    }
}
