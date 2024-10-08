export type TypeRegistry = {
    register(name: string, definition: any, config?: object): TypeRegistry;
    registerMany(definitionsEntries: [string, any][], config?: object | ((...args: any[]) => any)): TypeRegistry;
    has(name: string): boolean;
    get(name: string): any;
    toObject(): Record<string, any>;
    types: string[];
    definitions: any[];
    where(predicate: (item: any) => boolean): any[];
};
declare const _default: () => {
    new: () => TypeRegistry;
};
export default _default;
//# sourceMappingURL=type-registry.d.ts.map