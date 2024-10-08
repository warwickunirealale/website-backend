import type { Attribute, Schema } from '@strapi/types';
import type { Context } from '../types';
declare const _default: ({ strapi }: Context) => {
    getEnumName: (contentType: Schema.Any, attributeName: string) => string;
    getTypeName: (contentType: Schema.Any, { plurality, }?: {
        plurality?: "singular" | "plural" | undefined;
    }) => string;
    getEntityName: (contentType: Schema.Any) => string;
    getEntityMetaName: (contentType: Schema.Any) => string;
    getEntityResponseName: (contentType: Schema.Any) => string;
    getEntityResponseCollectionName: (contentType: Schema.Any) => string;
    getRelationResponseCollectionName: (contentType: Schema.Any) => string;
    getComponentName: (contentType: Schema.Any) => string;
    getComponentNameFromAttribute: (attribute: Attribute.Component) => string;
    getDynamicZoneName: (contentType: Schema.Any, attributeName: string) => string;
    getDynamicZoneInputName: (contentType: Schema.Any, attributeName: string) => string;
    getComponentInputName: (contentType: Schema.Any) => string;
    getContentTypeInputName: (contentType: Schema.Any) => string;
    getEntityQueriesTypeName: (contentType: Schema.Any) => string;
    getEntityMutationsTypeName: (contentType: Schema.Any) => string;
    getFiltersInputTypeName: (contentType: Schema.Any) => string;
    getScalarFilterInputTypeName: (scalarType: string) => string;
    getMorphRelationTypeName: (contentType: Schema.Any, attributeName: string) => string;
    buildCustomTypeNameGenerator: (options: {
        prefix?: string;
        suffix?: string;
        firstLetterCase?: 'upper' | 'lower';
        plurality?: 'plural' | 'singular';
    }) => (contentType: Schema.Any) => string;
    getFindQueryName: (contentType: Schema.Any) => string;
    getFindOneQueryName: (contentType: Schema.Any) => string;
    getCreateMutationTypeName: (contentType: Schema.Any) => string;
    getUpdateMutationTypeName: (contentType: Schema.Any) => string;
    getDeleteMutationTypeName: (contentType: Schema.Any) => string;
};
export default _default;
//# sourceMappingURL=naming.d.ts.map