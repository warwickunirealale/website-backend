import { providerFactory, hooks } from '@strapi/utils';
import type { CreateActionPayload } from './index';
import type { Permission } from '../../../../shared/contracts/shared';
type Options = Parameters<typeof providerFactory>['0'];
/**
 * Creates a new instance of an action provider
 */
declare const createActionProvider: (options?: Options) => {
    hooks: {
        appliesPropertyToSubject: {
            call(context: unknown): Promise<any[]>;
            getHandlers(): hooks.Handler[];
            register(handler: hooks.Handler): hooks.Hook<hooks.Handler>;
            delete(handler: hooks.Handler): hooks.Hook<hooks.Handler>;
        };
        willRegister: hooks.AsyncSeriesHook;
        didRegister: hooks.AsyncParallelHook;
        willDelete: hooks.AsyncParallelHook;
        didDelete: hooks.AsyncParallelHook;
    };
    register(actionAttributes: CreateActionPayload): Promise<import("@strapi/utils/dist/provider-factory").Provider>;
    registerMany(actionsAttributes: CreateActionPayload[]): Promise<any>;
    appliesToProperty(property: string, actionId: string, subject: Permission['subject']): Promise<boolean>;
    delete(key: string): Promise<import("@strapi/utils/dist/provider-factory").Provider>;
    get(key: string): {
        [x: string]: unknown;
    } | undefined;
    getWhere(filters?: Record<string, unknown> | undefined): {
        [x: string]: unknown;
    }[];
    values(): {
        [x: string]: unknown;
    }[];
    keys(): string[];
    has(key: string): boolean;
    size(): number;
    clear(): Promise<import("@strapi/utils/dist/provider-factory").Provider>;
};
export default createActionProvider;
//# sourceMappingURL=provider.d.ts.map