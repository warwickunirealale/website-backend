import type { Context } from '../types';
declare const _default: (context: Context) => {
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
export default _default;
//# sourceMappingURL=index.d.ts.map