import type { Strapi, Schema } from '@strapi/types';
import type { TypeRegistry } from '../../type-registry';
declare const registerSingleType: (contentType: Schema.SingleType, { registry, strapi, builders, }: {
    registry: TypeRegistry;
    strapi: Strapi;
    builders: any;
}) => void;
export { registerSingleType };
//# sourceMappingURL=single-type.d.ts.map