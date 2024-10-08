/// <reference types="lodash" />
import type { Strapi, Schema } from '@strapi/types';
declare const _default: ({ strapi }: {
    strapi: Strapi;
}) => {
    /**
     * Get every args for a given content type
     * @param {object} contentType
     * @param {object} options
     * @param {boolean} options.multiple
     * @return {object}
     */
    getContentTypeArgs(contentType: Schema.Any, { multiple }?: {
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
    /**
     * Filter an object entries and keep only those whose value is a unique scalar attribute
     */
    getUniqueScalarAttributes(attributes: Schema.Attributes): {
        [k: string]: import("@strapi/types/dist/types/core/attributes").Any;
    };
    /**
     * Map each value from an attribute to a FiltersInput type name
     * @param {object} attributes - The attributes object to transform
     * @return {Object<string, string>}
     */
    scalarAttributesToFiltersMap(attributes: Schema.Attributes): import("lodash").Dictionary<any>;
    /**
     * Apply basic transform to GQL args
     */
    transformArgs(args: any, { contentType, usePagination, }: {
        contentType: Schema.ContentType;
        usePagination?: boolean | undefined;
    }): import("lodash").Omit<any, "filters" | "pagination">;
};
export default _default;
//# sourceMappingURL=utils.d.ts.map