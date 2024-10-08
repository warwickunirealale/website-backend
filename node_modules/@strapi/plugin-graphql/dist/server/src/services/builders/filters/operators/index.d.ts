/// <reference types="lodash" />
import type { Strapi } from '@strapi/types';
declare const _default: ({ strapi }: {
    strapi: Strapi;
}) => import("lodash").Dictionary<{
    fieldName: string;
    strapiOperator: string;
    add(t: import("nexus/dist/core").ObjectDefinitionBlock<string>, type: string): void;
}>;
export default _default;
//# sourceMappingURL=index.d.ts.map