import { PriceList } from '../models/price-list.model.js';
import { PriceListItem } from '../models/price-list-item.model.js';

interface CreatePriceListInput {
    name: string;
    description?: string;
    discount_percent?: number;
}

export class PriceListService {
    async list(): Promise<PriceList[]> {
        return PriceList.where('deleted_at', null).orderBy('name', 'ASC').get();
    }

    async findById(id: string): Promise<PriceList | null> {
        return PriceList.where('id', id).where('deleted_at', null).first();
    }

    async getItems(priceListId: string): Promise<PriceListItem[]> {
        return PriceListItem.where('price_list_id', priceListId).get();
    }

    async create(data: CreatePriceListInput): Promise<PriceList> {
        return PriceList.create({
            name: data.name,
            description: data.description,
            discount_percent: data.discount_percent ?? 0,
            is_default: false,
            is_active: true,
        });
    }

    async update(id: string, data: Partial<CreatePriceListInput> & { is_active?: boolean }): Promise<PriceList | null> {
        const list = await PriceList.where('id', id).first();
        if (!list) return null;
        if (data.name !== undefined) list.name = data.name;
        if (data.description !== undefined) list.description = data.description;
        if (data.discount_percent !== undefined) list.discount_percent = data.discount_percent;
        if (data.is_active !== undefined) list.is_active = data.is_active;
        await list.save();
        return list;
    }

    async delete(id: string): Promise<boolean> {
        const list = await PriceList.where('id', id).first();
        if (!list || list.is_default) return false;
        list.deleted_at = new Date().toISOString();
        await list.save();
        return true;
    }

    async setItemPrice(priceListId: string, productId: string, customPrice: number): Promise<PriceListItem> {
        const existing = await PriceListItem.where('price_list_id', priceListId).where('product_id', productId).first();
        if (existing) {
            existing.custom_price = customPrice;
            await existing.save();
            return existing;
        }
        return PriceListItem.create({ price_list_id: priceListId, product_id: productId, custom_price: customPrice });
    }
}
