import type { UID } from '@strapi/types';
import type { Context } from '../../types';
declare const _default: ({ strapi }: Context) => {
    buildComponentResolver({ contentTypeUID, attributeName, }: {
        contentTypeUID: UID.ContentType;
        attributeName: string;
    }): (parent: any, args: any, ctx: any) => Promise<any>;
};
export default _default;
//# sourceMappingURL=component.d.ts.map