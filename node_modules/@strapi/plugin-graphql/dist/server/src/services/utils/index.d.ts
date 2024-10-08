import type { Context } from '../types';
declare const _default: (context: Context) => {
    naming: {
        getEnumName: (contentType: import("@strapi/types/dist/types/core/schemas").Any, attributeName: string) => string;
        getTypeName: (contentType: import("@strapi/types/dist/types/core/schemas").Any, { plurality, }?: {
            plurality?: "singular" | "plural" | undefined;
        }) => string;
        getEntityName: (contentType: import("@strapi/types/dist/types/core/schemas").Any) => string;
        getEntityMetaName: (contentType: import("@strapi/types/dist/types/core/schemas").Any) => string;
        getEntityResponseName: (contentType: import("@strapi/types/dist/types/core/schemas").Any) => string;
        getEntityResponseCollectionName: (contentType: import("@strapi/types/dist/types/core/schemas").Any) => string;
        getRelationResponseCollectionName: (contentType: import("@strapi/types/dist/types/core/schemas").Any) => string;
        getComponentName: (contentType: import("@strapi/types/dist/types/core/schemas").Any) => string;
        getComponentNameFromAttribute: (attribute: import("@strapi/types/dist/types/core/attributes").Component<`${string}.${string}`, false>) => string;
        getDynamicZoneName: (contentType: import("@strapi/types/dist/types/core/schemas").Any, attributeName: string) => string;
        getDynamicZoneInputName: (contentType: import("@strapi/types/dist/types/core/schemas").Any, attributeName: string) => string;
        getComponentInputName: (contentType: import("@strapi/types/dist/types/core/schemas").Any) => string;
        getContentTypeInputName: (contentType: import("@strapi/types/dist/types/core/schemas").Any) => string;
        getEntityQueriesTypeName: (contentType: import("@strapi/types/dist/types/core/schemas").Any) => string;
        getEntityMutationsTypeName: (contentType: import("@strapi/types/dist/types/core/schemas").Any) => string;
        getFiltersInputTypeName: (contentType: import("@strapi/types/dist/types/core/schemas").Any) => string;
        getScalarFilterInputTypeName: (scalarType: string) => string;
        getMorphRelationTypeName: (contentType: import("@strapi/types/dist/types/core/schemas").Any, attributeName: string) => string;
        buildCustomTypeNameGenerator: (options: {
            prefix?: string | undefined;
            suffix?: string | undefined;
            firstLetterCase?: "upper" | "lower" | undefined;
            plurality?: "singular" | "plural" | undefined;
        }) => (contentType: import("@strapi/types/dist/types/core/schemas").Any) => string;
        getFindQueryName: (contentType: import("@strapi/types/dist/types/core/schemas").Any) => string;
        getFindOneQueryName: (contentType: import("@strapi/types/dist/types/core/schemas").Any) => string;
        getCreateMutationTypeName: (contentType: import("@strapi/types/dist/types/core/schemas").Any) => string;
        getUpdateMutationTypeName: (contentType: import("@strapi/types/dist/types/core/schemas").Any) => string;
        getDeleteMutationTypeName: (contentType: import("@strapi/types/dist/types/core/schemas").Any) => string;
    };
    attributes: {
        isStrapiScalar: (attribute: import("@strapi/types/dist/types/core/attributes").Any) => any;
        isGraphQLScalar: (attribute: import("@strapi/types/dist/types/core/attributes").Any) => any;
        isMorphRelation: (attribute: import("@strapi/types/dist/types/core/attributes").Any) => boolean;
        isMedia: (value: any) => boolean;
        isRelation: (value: any) => boolean;
        isEnumeration: (value: any) => boolean;
        isComponent: (value: any) => boolean;
        isDynamicZone: (value: any) => boolean;
    };
    mappers: {
        entityToResponseEntity: (entity: {
            [key: string]: unknown;
            [key: number]: unknown;
            [key: symbol]: unknown;
            id: import("@strapi/types/dist/types/core/entity").ID;
        }) => {
            id: import("@strapi/types/dist/types/core/entity").ID;
            attributes: {
                [key: string]: unknown;
                [key: number]: unknown;
                [key: symbol]: unknown;
                id: import("@strapi/types/dist/types/core/entity").ID;
            };
        };
        entitiesToResponseEntities: import("lodash/fp").LodashMap1x1<{
            [key: string]: unknown;
            [key: number]: unknown;
            [key: symbol]: unknown;
            id: import("@strapi/types/dist/types/core/entity").ID;
        }, {
            id: import("@strapi/types/dist/types/core/entity").ID;
            attributes: {
                [key: string]: unknown;
                [key: number]: unknown;
                [key: symbol]: unknown;
                id: import("@strapi/types/dist/types/core/entity").ID;
            };
        }>;
        graphqlScalarToOperators(graphqlScalar: string): boolean;
        graphQLFiltersToStrapiQuery(filters: any, contentType: import("@strapi/types/dist/types/core/schemas").Any): any;
        strapiScalarToGraphQLScalar(strapiScalar: string): any;
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map