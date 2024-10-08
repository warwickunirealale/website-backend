import type { Attribute } from '@strapi/types';
import type { Context } from '../types';
declare const _default: ({ strapi }: Context) => {
    /**
     * Build a Nexus dynamic zone type from a Strapi dz attribute
     * @param {object} definition - The definition of the dynamic zone
     * @param {string} name - the name of the dynamic zone
     * @param {string} inputName - the name of the dynamic zone's input
     * @return {[NexusUnionTypeDef, NexusScalarTypeDef]}
     */
    buildDynamicZoneDefinition(definition: Attribute.DynamicZone, name: string, inputName: string): (import("nexus/dist/core").NexusScalarTypeDef<string> | import("nexus/dist/core").NexusUnionTypeDef<string>)[];
};
export default _default;
//# sourceMappingURL=dynamic-zones.d.ts.map