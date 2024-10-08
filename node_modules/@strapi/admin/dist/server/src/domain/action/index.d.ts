/// <reference types="lodash" />
import { Utils } from '@strapi/types';
export type Action = {
    actionId: string;
    section: string;
    displayName: string;
    category: string;
    subCategory?: string;
    pluginName?: string;
    subjects?: string[];
    options: {
        applyToProperties: string[] | null;
    };
};
/**
 * Set of attributes used to create a new {@link Action} object
 * @typedef {Action, { uid: string }} CreateActionPayload
 */
export type CreateActionPayload = Utils.Object.PartialBy<Omit<Action, 'actionId'>, 'options'> & {
    uid: string;
};
declare const _default: {
    actionFields: readonly ["section", "displayName", "category", "subCategory", "pluginName", "subjects", "options", "actionId"];
    appliesToProperty: import("lodash").CurriedFunction2<string, Action, boolean>;
    appliesToSubject: import("lodash").CurriedFunction2<string, Action, boolean>;
    assignActionId: (attrs: CreateActionPayload) => CreateActionPayload;
    assignOrOmitSubCategory: (action: Action) => Action;
    create: (payload: CreateActionPayload) => Action;
    computeActionId: (attributes: CreateActionPayload) => string;
    getDefaultActionAttributes: () => Partial<Action>;
    sanitizeActionAttributes: (action: Action | CreateActionPayload) => Action;
};
export default _default;
//# sourceMappingURL=index.d.ts.map