import type { Schema } from '@strapi/types';
import type { Context } from '../types';
declare const _default: ({ strapi }: Context) => {
    /**
     * Build a type definition for a content API collection response for a given content type
     * @param {Schema.ContentType} contentType The content type which will be used to build its content API response definition
     * @return {NexusObjectTypeDef}
     */
    buildResponseCollectionDefinition(contentType: Schema.ContentType): import("nexus/dist/core").NexusObjectTypeDef<any>;
};
export default _default;
//# sourceMappingURL=response-collection.d.ts.map