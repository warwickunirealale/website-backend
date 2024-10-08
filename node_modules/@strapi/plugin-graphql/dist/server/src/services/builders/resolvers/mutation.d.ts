import type { Schema } from '@strapi/types';
import type { Context } from '../../types';
declare const _default: ({ strapi }: Context) => {
    buildMutationsResolvers({ contentType }: {
        contentType: Schema.ContentType;
    }): {
        create(parent: any, args: any): Promise<{
            id: import("@strapi/types/dist/types/core/entity").ID;
        } & {
            [key: string]: any;
        }>;
        update(parent: any, args: any): Promise<({
            id: import("@strapi/types/dist/types/core/entity").ID;
        } & {
            [key: string]: any;
        }) | null>;
        delete(parent: any, args: any, ctx: any): Promise<({
            id: import("@strapi/types/dist/types/core/entity").ID;
        } & {
            [key: string]: any;
        }) | null>;
    };
};
export default _default;
//# sourceMappingURL=mutation.d.ts.map