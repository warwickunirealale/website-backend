/**
 * Returns actions available for a role.
 * @param {string|number} roleId
 * @returns {object[]}
 */
declare const getAllowedActionsForRole: (roleId?: string) => Promise<{
    [x: string]: unknown;
}[]>;
export { getAllowedActionsForRole };
//# sourceMappingURL=action.d.ts.map