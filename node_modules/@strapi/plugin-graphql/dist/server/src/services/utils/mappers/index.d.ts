import type { Context } from '../../types';
declare const _default: (context: Context) => {
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
export default _default;
//# sourceMappingURL=index.d.ts.map