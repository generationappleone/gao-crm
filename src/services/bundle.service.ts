import { ProductBundle } from '../models/product-bundle.model.js';
import { ProductBundleItem } from '../models/product-bundle-item.model.js';

interface CreateBundleInput {
    name: string;
    description?: string;
    bundle_price: number;
    currency?: string;
    created_by?: string;
}

export class BundleService {
    async list(): Promise<ProductBundle[]> {
        return ProductBundle.where('deleted_at', null).orderBy('created_at', 'DESC').get();
    }

    async findById(id: string): Promise<ProductBundle | null> {
        return ProductBundle.where('id', id).where('deleted_at', null).first();
    }

    async getItems(bundleId: string): Promise<ProductBundleItem[]> {
        return ProductBundleItem.where('bundle_id', bundleId).orderBy('display_order', 'ASC').get();
    }

    async create(data: CreateBundleInput): Promise<ProductBundle> {
        return ProductBundle.create({
            name: data.name,
            description: data.description,
            bundle_price: data.bundle_price,
            currency: data.currency ?? 'IDR',
            is_active: true,
            created_by: data.created_by,
        });
    }

    async update(id: string, data: Partial<CreateBundleInput> & { is_active?: boolean }): Promise<ProductBundle | null> {
        const bundle = await ProductBundle.where('id', id).first();
        if (!bundle) return null;
        if (data.name !== undefined) bundle.name = data.name;
        if (data.description !== undefined) bundle.description = data.description;
        if (data.bundle_price !== undefined) bundle.bundle_price = data.bundle_price;
        if (data.is_active !== undefined) bundle.is_active = data.is_active;
        await bundle.save();
        return bundle;
    }

    async delete(id: string): Promise<boolean> {
        const bundle = await ProductBundle.where('id', id).first();
        if (!bundle) return false;
        bundle.deleted_at = new Date().toISOString();
        await bundle.save();
        return true;
    }

    async addItem(bundleId: string, productId: string, quantity: number, order: number): Promise<ProductBundleItem> {
        return ProductBundleItem.create({
            bundle_id: bundleId,
            product_id: productId,
            quantity,
            display_order: order,
        });
    }

    async removeItem(itemId: string): Promise<boolean> {
        const item = await ProductBundleItem.where('id', itemId).first();
        if (!item) return false;
        await item.destroy();
        return true;
    }
}
