import type { Strapi, Schema } from '@strapi/types';
import type { TypeRegistry } from '../../type-registry';
declare const registerCollectionType: (contentType: Schema.CollectionType, { registry, strapi, builders, }: {
    registry: TypeRegistry;
    strapi: Strapi;
    builders: any;
}) => void;
export { registerCollectionType };
//# sourceMappingURL=collection-type.d.ts.map