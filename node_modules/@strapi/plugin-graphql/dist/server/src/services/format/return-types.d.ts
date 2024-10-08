export type InfoType = {
    args?: unknown;
    resourceUID?: string;
};
declare const _default: () => {
    toEntityResponse(value: unknown, info?: InfoType): {
        value: unknown;
        info: {
            args: unknown;
            resourceUID: string | undefined;
        };
    };
    toEntityResponseCollection(nodes: unknown[], info?: InfoType): {
        nodes: unknown[];
        info: {
            args: unknown;
            resourceUID: string | undefined;
        };
    };
};
export default _default;
//# sourceMappingURL=return-types.d.ts.map