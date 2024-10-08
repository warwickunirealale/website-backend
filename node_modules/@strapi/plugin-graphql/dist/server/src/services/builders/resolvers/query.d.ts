import type { Schema } from '@strapi/types';
import type { Context } from '../../types';
declare const _default: ({ strapi }: Context) => {
    buildQueriesResolvers({ contentType }: {
        contentType: Schema.ContentType;
    }): {
        find(parent: any, args: any, ctx: any): Promise<({
            id: import("@strapi/types/dist/types/core/entity").ID;
        } & {
            [key: string]: any;
        }) | ({
            id: import("@strapi/types/dist/types/core/entity").ID;
        } & {
            [key: string]: any;
        })[] | null>;
        findOne(parent: any, args: any, ctx: any): Promise<({
            id: import("@strapi/types/dist/types/core/entity").ID;
        } & {
            [key: string]: any;
        }) | null>;
    };
};
export default _default;
//# sourceMappingURL=query.d.ts.map