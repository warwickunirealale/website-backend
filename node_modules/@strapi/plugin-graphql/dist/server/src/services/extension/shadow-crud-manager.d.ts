export type ContentTypeConfig = {
    enabled: boolean;
    mutations: boolean;
    queries: boolean;
    disabledActions: string[];
    fields: Map<string, FieldConfig>;
};
export type FieldConfig = {
    enabled: boolean;
    input: boolean;
    output: boolean;
    filters: boolean;
};
declare const _default: () => (uid: string) => {
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
export default _default;
//# sourceMappingURL=shadow-crud-manager.d.ts.map