import type { Schema } from '@strapi/types';
import type { Context } from '../types';
declare const _default: ({ strapi }: Context) => {
    /**
     * Build a higher level type for a content type which contains the attributes, the ID and the metadata
     * @param {object} contentType The content type which will be used to build its entity type
     * @return {NexusObjectTypeDef}
     */
    buildEntityDefinition(contentType: Schema.ContentType): import("nexus/dist/core").NexusObjectTypeDef<any>;
};
export default _default;
//# sourceMappingURL=entity.d.ts.map