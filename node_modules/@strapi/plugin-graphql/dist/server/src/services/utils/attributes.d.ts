import type { Attribute } from '@strapi/types';
import type { Context } from '../types';
declare const _default: ({ strapi }: Context) => {
    isStrapiScalar: (attribute: Attribute.Any) => any;
    isGraphQLScalar: (attribute: Attribute.Any) => any;
    isMorphRelation: (attribute: Attribute.Any) => boolean;
    isMedia: (value: any) => boolean;
    isRelation: (value: any) => boolean;
    isEnumeration: (value: any) => boolean;
    isComponent: (value: any) => boolean;
    isDynamicZone: (value: any) => boolean;
};
export default _default;
//# sourceMappingURL=attributes.d.ts.map