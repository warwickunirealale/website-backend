import type { Schema } from '@strapi/types';
import type { Context } from '../types';
declare const _default: ({ strapi }: Context) => {
    /**
     * Build a type definition for a content API relation's collection response for a given content type
     */
    buildRelationResponseCollectionDefinition(contentType: Schema.ContentType): import("nexus/dist/core").NexusObjectTypeDef<any>;
};
export default _default;
//# sourceMappingURL=relation-response-collection.d.ts.map