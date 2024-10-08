import type { Context } from '../../types';
declare const _default: (context: Context) => {
    buildDynamicZoneResolver({ contentTypeUID, attributeName, }: {
        contentTypeUID: `admin::${string}` | `strapi::${string}` | `api::${string}.${string}` | `plugin::${string}.${string}`;
        attributeName: string;
    }): (parent: any) => Promise<any>;
    buildComponentResolver({ contentTypeUID, attributeName, }: {
        contentTypeUID: `admin::${string}` | `strapi::${string}` | `api::${string}.${string}` | `plugin::${string}.${string}`;
        attributeName: string;
    }): (parent: any, args: any, ctx: any) => Promise<any>;
    buildQueriesResolvers({ contentType }: {
        contentType: import("@strapi/types/dist/types/core/schemas").ContentType;
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
    buildMutationsResolvers({ contentType }: {
        contentType: import("@strapi/types/dist/types/core/schemas").ContentType;
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
    buildAssociationResolver({ contentTypeUID, attributeName, }: {
        contentTypeUID: `admin::${string}` | `strapi::${string}` | `api::${string}.${string}` | `plugin::${string}.${string}`;
        attributeName: string;
    }): (parent: any, args?: any, context?: any) => Promise<any>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map