/// <reference types="lodash" />
import type { Strapi } from '@strapi/types';
import type { TypeRegistry } from '../type-registry';
declare const _default: ({ strapi }: {
    strapi: Strapi;
}) => {
    /**
     * Instantiate every builder with a strapi instance & a type registry
     */
    new(name: string, registry: TypeRegistry): unknown;
    /**
     * Delete a set of builders instances from
     * the builders map for a given name
     */
    delete(name: string): void;
    /**
     * Retrieve a set of builders instances from
     * the builders map for a given name
     */
    get(name: string): any;
    filters: {
        operators: import("lodash").Dictionary<{
            fieldName: string;
            strapiOperator: string;
            add(t: import("nexus/dist/core").ObjectDefinitionBlock<string>, type: string): void;
        }>;
    };
    utils: {
        getContentTypeArgs(contentType: import("@strapi/types/dist/types/core/schemas").Any, { multiple }?: {
            multiple?: boolean | undefined;
        }): {
            filters?: undefined;
            pagination?: undefined;
            sort?: undefined;
            id?: undefined;
        } | {
            filters: any;
            pagination: any;
            sort: any;
            id?: undefined;
        } | {
            id: string;
            filters?: undefined;
            pagination?: undefined;
            sort?: undefined;
        } | undefined;
        getUniqueScalarAttributes(attributes: import("@strapi/types/dist/types/core/schemas").Attributes): {
            [k: string]: import("@strapi/types/dist/types/core/attributes").Any;
        };
        scalarAttributesToFiltersMap(attributes: import("@strapi/types/dist/types/core/schemas").Attributes): import("lodash").Dictionary<any>;
        transformArgs(args: any, { contentType, usePagination, }: {
            contentType: import("@strapi/types/dist/types/core/schemas").ContentType;
            usePagination?: boolean | undefined;
        }): import("lodash").Omit<any, "filters" | "pagination">;
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map