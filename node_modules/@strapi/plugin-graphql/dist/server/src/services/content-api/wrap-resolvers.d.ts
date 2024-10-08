import { GraphQLSchema } from 'graphql';
import type { Strapi } from '@strapi/types';
/**
 * Wrap the schema's resolvers if they've been
 * customized using the GraphQL extension service
 * @param {object} options
 * @param {GraphQLSchema} options.schema
 * @param {object} options.strapi
 * @param {object} options.extension
 * @return {GraphQLSchema}
 */
declare const wrapResolvers: ({ schema, strapi, extension, }: {
    schema: GraphQLSchema;
    strapi: Strapi;
    extension: any;
}) => GraphQLSchema;
export { wrapResolvers };
//# sourceMappingURL=wrap-resolvers.d.ts.map