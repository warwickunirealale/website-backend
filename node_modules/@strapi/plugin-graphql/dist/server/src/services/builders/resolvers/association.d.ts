import type { UID } from '@strapi/types';
import type { Context } from '../../types';
declare const _default: ({ strapi }: Context) => {
    buildAssociationResolver({ contentTypeUID, attributeName, }: {
        contentTypeUID: UID.ContentType;
        attributeName: string;
    }): (parent: any, args?: any, context?: any) => Promise<any>;
};
export default _default;
//# sourceMappingURL=association.d.ts.map