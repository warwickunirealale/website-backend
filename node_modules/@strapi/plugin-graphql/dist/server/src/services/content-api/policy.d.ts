import { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql';
import type { Strapi } from '@strapi/types';
declare const createPoliciesMiddleware: (resolverConfig: any, { strapi }: {
    strapi: Strapi;
}) => (resolve: GraphQLFieldResolver<any, any>, parent: any, args: any, context: any, info: GraphQLResolveInfo) => Promise<any>;
export { createPoliciesMiddleware };
//# sourceMappingURL=policy.d.ts.map