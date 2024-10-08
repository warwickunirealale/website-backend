import type { Entity } from '@strapi/types';
declare const _default: () => {
    entityToResponseEntity: (entity: {
        [key: string]: unknown;
        [key: number]: unknown;
        [key: symbol]: unknown;
        id: Entity.ID;
    }) => {
        id: Entity.ID;
        attributes: {
            [key: string]: unknown;
            [key: number]: unknown;
            [key: symbol]: unknown;
            id: Entity.ID;
        };
    };
    entitiesToResponseEntities: import("lodash/fp").LodashMap1x1<{
        [key: string]: unknown;
        [key: number]: unknown;
        [key: symbol]: unknown;
        id: Entity.ID;
    }, {
        id: Entity.ID;
        attributes: {
            [key: string]: unknown;
            [key: number]: unknown;
            [key: symbol]: unknown;
            id: Entity.ID;
        };
    }>;
};
export default _default;
//# sourceMappingURL=entity-to-response-entity.d.ts.map