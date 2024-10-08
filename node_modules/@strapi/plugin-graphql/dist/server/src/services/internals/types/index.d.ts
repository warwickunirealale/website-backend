import type { Context } from '../../types';
declare const _default: (context: Context) => () => {
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
export default _default;
//# sourceMappingURL=index.d.ts.map