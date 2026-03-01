import { Product } from '../models/product.model.js';

interface CreateProductInput {
    name: string;
    sku?: string;
    description?: string;
    unit_price: number;
    currency?: string;
    unit?: string;
    tax_rate?: number;
}

export class ProductService {
    async list(activeOnly = true): Promise<Product[]> {
        let query = Product.where('deleted_at', 'IS', null);
        if (activeOnly) {
            query = query.where('is_active', true);
        }
        return query.orderBy('name', 'ASC').get();
    }

    async findById(id: string): Promise<Product | null> {
        return Product.where('id', id).whereNull('deleted_at').first() ?? null;
    }

    async create(data: CreateProductInput): Promise<Product> {
        return Product.create({
            name: data.name,
            sku: data.sku,
            description: data.description,
            unit_price: data.unit_price,
            currency: data.currency ?? 'IDR',
            unit: data.unit ?? 'unit',
            tax_rate: data.tax_rate ?? 0,
            is_active: true,
        });
    }

    async update(id: string, data: Partial<CreateProductInput & { is_active: boolean }>): Promise<Product | null> {
        const product = await Product.where('id', id).whereNull('deleted_at').first();
        if (!product) return null;

        if (data.name !== undefined) product.name = data.name;
        if (data.sku !== undefined) product.sku = data.sku;
        if (data.description !== undefined) product.description = data.description;
        if (data.unit_price !== undefined) product.unit_price = data.unit_price;
        if (data.currency !== undefined) product.currency = data.currency;
        if (data.unit !== undefined) product.unit = data.unit;
        if (data.tax_rate !== undefined) product.tax_rate = data.tax_rate;
        if (data.is_active !== undefined) product.is_active = data.is_active;

        await product.save();
        return product;
    }

    async delete(id: string): Promise<boolean> {
        const product = await Product.where('id', id).whereNull('deleted_at').first();
        if (!product) return false;
        await product.destroy();
        return true;
    }
}
