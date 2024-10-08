/// <reference types="lodash" />
import { bootstrap } from './bootstrap';
declare const _default: {
    config: {
        default: {
            shadowCRUD: boolean;
            endpoint: string;
            subscriptions: boolean;
            maxLimit: number;
            apolloServer: {};
        };
    };
    bootstrap: typeof bootstrap;
    services: {
        builders: ({ strapi }: {
            strapi: import("@strapi/types").Strapi;
        }) => {
            new(name: string, registry: import("./services/type-registry").TypeRegistry): unknown;
            delete(name: string): void;
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
        'content-api': ({ strapi }: {
            strapi: import("@strapi/types").Strapi;
        }) => {
            buildSchema: () => import("graphql").GraphQLSchema;
        };
        constants: () => {
            PAGINATION_TYPE_NAME: string;
            RESPONSE_COLLECTION_META_TYPE_NAME: string;
            PUBLICATION_STATE_TYPE_NAME: string;
            GRAPHQL_SCALARS: readonly ["ID", "Boolean", "Int", "String", "Long", "Float", "JSON", "Date", "Time", "DateTime"];
            STRAPI_SCALARS: readonly ["boolean", "integer", "string", "richtext", "blocks", "enumeration", "biginteger", "float", "decimal", "json", "date", "time", "datetime", "timestamp", "uid", "email", "password", "text"];
            GENERIC_MORPH_TYPENAME: string;
            KINDS: {
                readonly type: "type";
                readonly component: "component";
                readonly dynamicZone: "dynamic-zone";
                readonly enum: "enum";
                readonly entity: "entity";
                readonly entityResponse: "entity-response";
                readonly entityResponseCollection: "entity-response-collection";
                readonly relationResponseCollection: "relation-response-collection";
                readonly query: "query";
                readonly mutation: "mutation";
                readonly input: "input";
                readonly filtersInput: "filters-input";
                readonly scalar: "scalar";
                readonly morph: "polymorphic";
                readonly internal: "internal";
            };
            GRAPHQL_SCALAR_OPERATORS: {
                readonly ID: readonly ["and", "or", "not", "eq", "eqi", "ne", "nei", "startsWith", "endsWith", "contains", "notContains", "containsi", "notContainsi", "gt", "gte", "lt", "lte", "null", "notNull", "in", "notIn", "between"];
                readonly Boolean: readonly ["and", "or", "not", "eq", "eqi", "ne", "nei", "startsWith", "endsWith", "contains", "notContains", "containsi", "notContainsi", "gt", "gte", "lt", "lte", "null", "notNull", "in", "notIn", "between"];
                readonly String: readonly ["and", "or", "not", "eq", "eqi", "ne", "nei", "startsWith", "endsWith", "contains", "notContains", "containsi", "notContainsi", "gt", "gte", "lt", "lte", "null", "notNull", "in", "notIn", "between"];
                readonly Int: readonly ["and", "or", "not", "eq", "eqi", "ne", "nei", "startsWith", "endsWith", "contains", "notContains", "containsi", "notContainsi", "gt", "gte", "lt", "lte", "null", "notNull", "in", "notIn", "between"];
                readonly Long: readonly ["and", "or", "not", "eq", "eqi", "ne", "nei", "startsWith", "endsWith", "contains", "notContains", "containsi", "notContainsi", "gt", "gte", "lt", "lte", "null", "notNull", "in", "notIn", "between"];
                readonly Float: readonly ["and", "or", "not", "eq", "eqi", "ne", "nei", "startsWith", "endsWith", "contains", "notContains", "containsi", "notContainsi", "gt", "gte", "lt", "lte", "null", "notNull", "in", "notIn", "between"];
                readonly Date: readonly ["and", "or", "not", "eq", "eqi", "ne", "nei", "startsWith", "endsWith", "contains", "notContains", "containsi", "notContainsi", "gt", "gte", "lt", "lte", "null", "notNull", "in", "notIn", "between"];
                readonly Time: readonly ["and", "or", "not", "eq", "eqi", "ne", "nei", "startsWith", "endsWith", "contains", "notContains", "containsi", "notContainsi", "gt", "gte", "lt", "lte", "null", "notNull", "in", "notIn", "between"];
                readonly DateTime: readonly ["and", "or", "not", "eq", "eqi", "ne", "nei", "startsWith", "endsWith", "contains", "notContains", "containsi", "notContainsi", "gt", "gte", "lt", "lte", "null", "notNull", "in", "notIn", "between"];
                readonly JSON: readonly ["and", "or", "not", "eq", "eqi", "ne", "nei", "startsWith", "endsWith", "contains", "notContains", "containsi", "notContainsi", "gt", "gte", "lt", "lte", "null", "notNull", "in", "notIn", "between"];
            };
            SCALARS_ASSOCIATIONS: {
                readonly uid: "String";
                readonly email: "String";
                readonly password: "String";
                readonly text: "String";
                readonly boolean: "Boolean";
                readonly integer: "Int";
                readonly string: "String";
                readonly enumeration: "String";
                readonly richtext: "String";
                readonly blocks: "JSON";
                readonly biginteger: "Long";
                readonly float: "Float";
                readonly decimal: "Float";
                readonly json: "JSON";
                readonly date: "Date";
                readonly time: "Time";
                readonly datetime: "DateTime";
                readonly timestamp: "DateTime";
            };
            ERROR_CODES: {
                readonly emptyDynamicZone: "dynamiczone.empty";
            };
            ERROR_TYPE_NAME: string;
        };
        extension: ({ strapi }: {
            strapi: import("@strapi/types").Strapi;
        }) => {
            shadowCRUD: (uid: string) => {
                isEnabled(): boolean;
                isDisabled(): boolean;
                areQueriesEnabled(): boolean;
                areQueriesDisabled(): boolean;
                areMutationsEnabled(): boolean;
                areMutationsDisabled(): boolean;
                isActionEnabled(action: string): boolean;
                isActionDisabled(action: string): boolean;
                disable(): any;
                disableQueries(): any;
                disableMutations(): any;
                disableAction(action: string): any;
                disableActions(actions?: never[]): any;
                field(fieldName: string): {
                    isEnabled(): boolean;
                    hasInputEnabled(): boolean;
                    hasOutputEnabled(): boolean;
                    hasFiltersEnabeld(): boolean;
                    disable(): any;
                    disableOutput(): any;
                    disableInput(): any;
                    disableFilters(): any;
                };
            };
            use(configuration: import("./services/extension/extension").Configuration | import("./services/extension/extension").ConfigurationFactory): any;
            generate({ typeRegistry }: {
                typeRegistry: object;
            }): import("./services/extension/extension").Extension;
        };
        format: () => {
            returnTypes: {
                toEntityResponse(value: unknown, info?: import("./services/format/return-types").InfoType): {
                    value: unknown;
                    info: {
                        args: unknown;
                        resourceUID: string | undefined;
                    };
                };
                toEntityResponseCollection(nodes: unknown[], info?: import("./services/format/return-types").InfoType): {
                    nodes: unknown[];
                    info: {
                        args: unknown;
                        resourceUID: string | undefined;
                    };
                };
            };
        };
        internals: (context: import("./services/types").Context) => {
            args: {
                SortArg: import("nexus/dist/core").NexusArgDef<any>;
                PaginationArg: import("nexus/dist/core").NexusArgDef<any>;
                PublicationStateArg: import("nexus/dist/core").NexusArgDef<any>;
            };
            scalars: {
                JSON: any;
                DateTime: any;
                Time: import("nexus/dist/core").AllNexusOutputTypeDefs;
                Date: any;
                Long: any;
                Upload: import("graphql").GraphQLScalarType | import("graphql").GraphQLEnumType | import("graphql").GraphQLInputObjectType | import("graphql").GraphQLList<any> | import("nexus/dist/core").NexusUnionTypeDef<any> | import("nexus/dist/core").NexusObjectTypeDef<any> | import("graphql").GraphQLNonNull<any> | import("nexus/dist/core").NexusListDef<any> | import("nexus/dist/core").NexusNonNullDef<any> | import("nexus/dist/core").NexusNullDef<any> | import("nexus/dist/core").NexusInputObjectTypeDef<any> | import("nexus/dist/core").NexusEnumTypeDef<any> | import("nexus/dist/core").NexusScalarTypeDef<any> | import("nexus/dist/core").NexusInterfaceTypeDef<any>;
            };
            buildInternalTypes: () => {
                [x: number]: {
                    error: import("nexus/dist/core").NexusObjectTypeDef<any>;
                    pagination: {
                        Pagination: import("nexus/dist/core").NexusObjectTypeDef<any>;
                    };
                    responseCollectionMeta: {
                        ResponseCollectionMeta: import("nexus/dist/core").NexusObjectTypeDef<any>;
                    };
                    publicationState?: undefined;
                } | {
                    publicationState: {
                        PublicationState: import("nexus/dist/core").NexusEnumTypeDef<any>;
                    };
                    error?: undefined;
                    pagination?: undefined;
                    responseCollectionMeta?: undefined;
                } | {
                    scalars: any;
                    error?: undefined;
                    pagination?: undefined;
                    responseCollectionMeta?: undefined;
                    publicationState?: undefined;
                };
            };
            helpers: {
                getEnabledScalars: () => (string | readonly ["and", "or", "not", "eq", "eqi", "ne", "nei", "startsWith", "endsWith", "contains", "notContains", "containsi", "notContainsi", "gt", "gte", "lt", "lte", "null", "notNull", "in", "notIn", "between"] | undefined)[];
            };
        };
        'type-registry': () => {
            new: () => import("./services/type-registry").TypeRegistry;
        };
        utils: (context: import("./services/types").Context) => {
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
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map