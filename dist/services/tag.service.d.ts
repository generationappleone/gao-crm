import { Tag } from '../models/tag.model.js';
export declare class TagService {
    list(): Promise<Tag[]>;
    create(data: {
        name: string;
        color?: string;
    }): Promise<Tag>;
    update(id: string, data: {
        name?: string;
        color?: string;
    }): Promise<Tag | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=tag.service.d.ts.map