import type { Schema } from '@strapi/types';
import type { Context } from '../types';
export type TypeBuildersOptions = {
    builder: any;
    attributeName: string;
    attribute: any;
    contentType: any;
    context: Context;
};
declare const _default: (context: Context) => {
    /**
     * Create a type definition for a given content type
     * @param contentType - The content type used to created the definition
     * @return {NexusObjectTypeDef}
     */
    buildTypeDefinition(contentType: Schema.Any): import("nexus/dist/core").NexusObjectTypeDef<any>;
};
export default _default;
//# sourceMappingURL=type.d.ts.map