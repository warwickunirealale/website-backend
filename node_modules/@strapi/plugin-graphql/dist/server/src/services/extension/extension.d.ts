import * as nexus from 'nexus';
import type { Strapi } from '@strapi/types';
import type * as Nexus from 'nexus';
export type Configuration = {
    types?: NexusGen[];
    typeDefs?: string;
    resolvers?: object;
    resolversConfig?: object;
    plugins?: Nexus.PluginConfig[];
};
export type ConfigurationFactory = (options: {
    strapi: Strapi;
    nexus: typeof nexus;
    typeRegistry: object;
}) => Configuration;
export type Extension = {
    types: NexusGen[];
    typeDefs: string[];
    resolvers: object;
    resolversConfig: object;
    plugins: Nexus.PluginConfig[];
};
declare const createExtension: ({ strapi }: {
    strapi: Strapi;
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
    /**
     * Register a new extension configuration
     */
    use(configuration: Configuration | ConfigurationFactory): any;
    /**
     * Convert the registered configuration into a single extension object & return it
     */
    generate({ typeRegistry }: {
        typeRegistry: object;
    }): Extension;
};
export default createExtension;
//# sourceMappingURL=extension.d.ts.map