import { isEmpty, toUpper, snakeCase, pick, mergeWith, isArray, propOr, get, getOr, first, isFunction, isNil, prop, startsWith, difference, propEq, isDate, isObject, has, mapValues, map, upperFirst, camelCase, pipe, lowerFirst, set, omit, identity, constant, isUndefined, isString, defaultTo, entries, reduce, merge as merge$1 } from "lodash/fp";
import { ForbiddenError as ForbiddenError$2, UserInputError, ApolloError, ApolloServer } from "apollo-server-koa";
import { ApolloServerPluginLandingPageDisabled, ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import depthLimit from "graphql-depth-limit";
import { graphqlUploadKoa, GraphQLUpload } from "graphql-upload";
import { errors, policy, parseType, validate, sanitize, toRegressedEnumValue, contentTypes, pipeAsync, pagination as pagination$1 } from "@strapi/utils";
import { GraphQLError, GraphQLObjectType, GraphQLScalarType, Kind, valueFromASTUntyped } from "graphql";
import { pruneSchema } from "@graphql-tools/utils";
import * as nexus from "nexus";
import { unionType, makeSchema, arg, list, inputObjectType, asNexusMethod, objectType, enumType, scalarType, nonNull, extendType } from "nexus";
import { singular } from "pluralize";
import { GraphQLDate, GraphQLJSON, GraphQLDateTime, GraphQLLong } from "graphql-scalars";
const defaultConfig = {
  shadowCRUD: true,
  endpoint: "/graphql",
  subscriptions: false,
  maxLimit: -1,
  apolloServer: {}
};
const config = {
  default: defaultConfig
};
const { HttpError, ForbiddenError: ForbiddenError$1, UnauthorizedError, ApplicationError: ApplicationError$5, ValidationError: ValidationError$3 } = errors;
const formatToCode = (name) => `STRAPI_${toUpper(snakeCase(name))}`;
const formatErrorToExtension = (error2) => ({
  error: pick(["name", "message", "details"])(error2)
});
function formatGraphqlError(error2) {
  const { originalError } = error2;
  if (isEmpty(originalError)) {
    return error2;
  }
  if (originalError instanceof ForbiddenError$1 || originalError instanceof UnauthorizedError) {
    return new ForbiddenError$2(originalError.message, formatErrorToExtension(originalError));
  }
  if (originalError instanceof ValidationError$3) {
    return new UserInputError(originalError.message, formatErrorToExtension(originalError));
  }
  if (originalError instanceof ApplicationError$5 || originalError instanceof HttpError) {
    const name = formatToCode(originalError.name);
    return new ApolloError(originalError.message, name, formatErrorToExtension(originalError));
  }
  if (originalError instanceof ApolloError || originalError instanceof GraphQLError) {
    return error2;
  }
  strapi.log.error(originalError);
  return new ApolloError("Internal Server Error", "INTERNAL_SERVER_ERROR");
}
const merge = mergeWith((a, b) => {
  if (isArray(a) && isArray(b)) {
    return a.concat(b);
  }
});
const useUploadMiddleware = (strapi2, path) => {
  const uploadMiddleware = graphqlUploadKoa();
  strapi2.server.app.use((ctx, next) => {
    if (ctx.path === path) {
      return uploadMiddleware(ctx, next);
    }
    return next();
  });
};
async function bootstrap({ strapi: strapi2 }) {
  const schema = strapi2.plugin("graphql").service("content-api").buildSchema();
  if (isEmpty(schema)) {
    strapi2.log.warn("The GraphQL schema has not been generated because it is empty");
    return;
  }
  const { config: config2 } = strapi2.plugin("graphql");
  const path = config2("endpoint");
  const defaultServerConfig = {
    // Schema
    schema,
    // Initialize loaders for this request.
    context: ({ ctx }) => ({
      state: ctx.state,
      koaContext: ctx
    }),
    // Validation
    validationRules: [depthLimit(config2("depthLimit"))],
    // Errors
    formatError: formatGraphqlError,
    // Misc
    cors: false,
    uploads: false,
    bodyParserConfig: true,
    plugins: [
      process.env.NODE_ENV === "production" && !config2("playgroundAlways") ? ApolloServerPluginLandingPageDisabled() : ApolloServerPluginLandingPageGraphQLPlayground()
    ],
    cache: "bounded"
  };
  const serverConfig = merge(defaultServerConfig, config2("apolloServer"));
  const server = new ApolloServer(serverConfig);
  useUploadMiddleware(strapi2, path);
  try {
    await server.start();
  } catch (error2) {
    if (error2 instanceof Error) {
      strapi2.log.error("Failed to start the Apollo server", error2.message);
    }
    throw error2;
  }
  strapi2.server.routes([
    {
      method: "ALL",
      path,
      handler: [
        (ctx, next) => {
          ctx.state.route = {
            info: {
              // Indicate it's a content API route
              type: "content-api"
            }
          };
          return strapi2.auth.authenticate(ctx, next);
        },
        // Apollo Server
        server.getMiddleware({
          path,
          cors: serverConfig.cors,
          bodyParserConfig: serverConfig.bodyParserConfig
        })
      ],
      config: {
        auth: false
      }
    }
  ]);
  strapi2.plugin("graphql").destroy = async () => {
    await server.stop();
  };
}
const { PolicyError } = errors;
const getPoliciesConfig = propOr([], "policies");
const createPoliciesMiddleware = (resolverConfig, { strapi: strapi2 }) => {
  const resolverPolicies = getPoliciesConfig(resolverConfig);
  const policies = policy.resolve(resolverPolicies, {});
  return async (resolve, parent, args2, context, info) => {
    const policyContext = createGraphQLPolicyContext(parent, args2, context, info);
    for (const { handler, config: config2 } of policies) {
      const result = await handler(policyContext, config2, { strapi: strapi2 });
      if (![true, void 0].includes(result)) {
        throw new PolicyError();
      }
    }
    return resolve(parent, args2, context, info);
  };
};
const createGraphQLPolicyContext = (parent, args2, context, info) => {
  const policyContext = {
    get parent() {
      return parent;
    },
    get args() {
      return args2;
    },
    get context() {
      return context;
    },
    get info() {
      return info;
    },
    get state() {
      return this.context.state;
    },
    get http() {
      return this.context.koaContext;
    }
  };
  return policy.createPolicyContext("graphql", policyContext);
};
const { ForbiddenError } = errors;
const introspectionQueries = [
  "__Schema",
  "__Type",
  "__Field",
  "__InputValue",
  "__EnumValue",
  "__Directive"
];
const parseMiddlewares = (resolverConfig, strapi2) => {
  const resolverMiddlewares = getOr([], "middlewares", resolverConfig);
  return resolverMiddlewares.map(
    (middleware) => {
      if (isFunction(middleware)) {
        return middleware;
      }
      if (typeof middleware === "string") {
        return strapi2.middleware(middleware);
      }
      if (typeof middleware === "object") {
        const { name, options = {} } = middleware;
        return strapi2.middleware(name)(options, { strapi: strapi2 });
      }
      throw new Error(
        `Invalid middleware type, expected (function,string,object), received ${typeof middleware}`
      );
    }
  );
};
const wrapResolvers = ({
  schema,
  strapi: strapi2,
  extension = {}
}) => {
  const { resolversConfig = {} } = extension;
  const isValidFieldName = (field) => !field.startsWith("__");
  const typeMap = schema.getTypeMap();
  Object.entries(typeMap).forEach(([type, definition]) => {
    const isGraphQLObjectType = definition instanceof GraphQLObjectType;
    const isIgnoredType = introspectionQueries.includes(type);
    if (!isGraphQLObjectType || isIgnoredType) {
      return;
    }
    const fields = definition.getFields();
    const fieldsToProcess = Object.entries(fields).filter(([field]) => isValidFieldName(field));
    for (const [fieldName, fieldDefinition] of fieldsToProcess) {
      const defaultResolver = get(fieldName);
      const path = `${type}.${fieldName}`;
      const resolverConfig = getOr({}, path, resolversConfig);
      const { resolve: baseResolver = defaultResolver } = fieldDefinition;
      const middlewares = parseMiddlewares(resolverConfig, strapi2);
      const policyMiddleware = createPoliciesMiddleware(resolverConfig, { strapi: strapi2 });
      middlewares.push(policyMiddleware);
      const boundMiddlewares = middlewares.map((middleware, index2, collection) => {
        return (parents, args2, context, info) => middleware(
          // Make sure the last middleware in the list calls the baseResolver
          index2 >= collection.length - 1 ? baseResolver : boundMiddlewares[index2 + 1],
          parents,
          args2,
          context,
          info
        );
      });
      const authorize = async ({ context }) => {
        const authConfig = get("auth", resolverConfig);
        const authContext = get("state.auth", context);
        const isValidType = ["Mutation", "Query", "Subscription"].includes(type);
        const hasConfig = !isNil(authConfig);
        const isAuthDisabled = authConfig === false;
        if ((isValidType || hasConfig) && !isAuthDisabled) {
          try {
            await strapi2.auth.verify(authContext, authConfig);
          } catch (error2) {
            throw new ForbiddenError();
          }
        }
      };
      fieldDefinition.resolve = async (parent, args2, context, info) => {
        await authorize({ context });
        return first(boundMiddlewares)(parent, args2, context, info);
      };
    }
  });
  return schema;
};
const registerCollectionType = (contentType2, {
  registry,
  strapi: strapi2,
  builders: builders2
}) => {
  const { service: getService } = strapi2.plugin("graphql");
  const { naming: naming2 } = getService("utils");
  const { KINDS: KINDS2 } = getService("constants");
  const extension = getService("extension");
  const types2 = {
    base: naming2.getTypeName(contentType2),
    entity: naming2.getEntityName(contentType2),
    response: naming2.getEntityResponseName(contentType2),
    responseCollection: naming2.getEntityResponseCollectionName(contentType2),
    relationResponseCollection: naming2.getRelationResponseCollectionName(contentType2),
    queries: naming2.getEntityQueriesTypeName(contentType2),
    mutations: naming2.getEntityMutationsTypeName(contentType2)
  };
  const getConfig = (kind) => ({ kind, contentType: contentType2 });
  registry.register(types2.base, builders2.buildTypeDefinition(contentType2), getConfig(KINDS2.type));
  registry.register(
    types2.entity,
    builders2.buildEntityDefinition(contentType2),
    getConfig(KINDS2.entity)
  );
  registry.register(
    types2.response,
    builders2.buildResponseDefinition(contentType2),
    getConfig(KINDS2.entityResponse)
  );
  registry.register(
    types2.responseCollection,
    builders2.buildResponseCollectionDefinition(contentType2),
    getConfig(KINDS2.entityResponseCollection)
  );
  registry.register(
    types2.relationResponseCollection,
    builders2.buildRelationResponseCollectionDefinition(contentType2),
    getConfig(KINDS2.relationResponseCollection)
  );
  if (extension.shadowCRUD(contentType2.uid).areQueriesEnabled()) {
    registry.register(
      types2.queries,
      builders2.buildCollectionTypeQueries(contentType2),
      getConfig(KINDS2.query)
    );
  }
  if (extension.shadowCRUD(contentType2.uid).areMutationsEnabled()) {
    registry.register(
      types2.mutations,
      builders2.buildCollectionTypeMutations(contentType2),
      getConfig(KINDS2.mutation)
    );
  }
};
const registerSingleType = (contentType2, {
  registry,
  strapi: strapi2,
  builders: builders2
}) => {
  const { service: getService } = strapi2.plugin("graphql");
  const { naming: naming2 } = getService("utils");
  const { KINDS: KINDS2 } = getService("constants");
  const extension = getService("extension");
  const types2 = {
    base: naming2.getTypeName(contentType2),
    entity: naming2.getEntityName(contentType2),
    response: naming2.getEntityResponseName(contentType2),
    responseCollection: naming2.getEntityResponseCollectionName(contentType2),
    relationResponseCollection: naming2.getRelationResponseCollectionName(contentType2),
    queries: naming2.getEntityQueriesTypeName(contentType2),
    mutations: naming2.getEntityMutationsTypeName(contentType2)
  };
  const getConfig = (kind) => ({ kind, contentType: contentType2 });
  registry.register(types2.base, builders2.buildTypeDefinition(contentType2), getConfig(KINDS2.type));
  registry.register(
    types2.entity,
    builders2.buildEntityDefinition(contentType2),
    getConfig(KINDS2.entity)
  );
  registry.register(
    types2.response,
    builders2.buildResponseDefinition(contentType2),
    getConfig(KINDS2.entityResponse)
  );
  registry.register(
    types2.responseCollection,
    builders2.buildResponseCollectionDefinition(contentType2),
    getConfig(KINDS2.entityResponseCollection)
  );
  registry.register(
    types2.relationResponseCollection,
    builders2.buildRelationResponseCollectionDefinition(contentType2),
    getConfig(KINDS2.relationResponseCollection)
  );
  if (extension.shadowCRUD(contentType2.uid).areQueriesEnabled()) {
    registry.register(
      types2.queries,
      builders2.buildSingleTypeQueries(contentType2),
      getConfig(KINDS2.query)
    );
  }
  if (extension.shadowCRUD(contentType2.uid).areMutationsEnabled()) {
    registry.register(
      types2.mutations,
      builders2.buildSingleTypeMutations(contentType2),
      getConfig(KINDS2.mutation)
    );
  }
};
const registerComponent = (contentType2, {
  registry,
  strapi: strapi2,
  builders: builders2
}) => {
  const { service: getService } = strapi2.plugin("graphql");
  const { getComponentName } = getService("utils").naming;
  const { KINDS: KINDS2 } = getService("constants");
  const name = getComponentName(contentType2);
  const definition = builders2.buildTypeDefinition(contentType2);
  registry.register(name, definition, { kind: KINDS2.component, contentType: contentType2 });
};
const registerPolymorphicContentType = (contentType2, { registry, strapi: strapi2 }) => {
  const { service: getService } = strapi2.plugin("graphql");
  const {
    naming: naming2,
    attributes: { isMorphRelation }
  } = getService("utils");
  const { KINDS: KINDS2 } = getService("constants");
  const { attributes: attributes2 = {} } = contentType2;
  const morphAttributes = Object.entries(attributes2).filter(
    ([, attribute]) => isMorphRelation(attribute)
  );
  for (const [attributeName, attribute] of morphAttributes) {
    const name = naming2.getMorphRelationTypeName(contentType2, attributeName);
    const { target } = attribute;
    if (!Array.isArray(target)) {
      continue;
    }
    const members = target.map((uid) => strapi2.getModel(uid)).map((contentType22) => naming2.getTypeName(contentType22));
    registry.register(
      name,
      unionType({
        name,
        resolveType(obj) {
          const contentType22 = strapi2.getModel(obj.__type);
          if (!contentType22) {
            return null;
          }
          if (contentType22.modelType === "component") {
            return naming2.getComponentName(contentType22);
          }
          return naming2.getTypeName(contentType22);
        },
        definition(t) {
          t.members(...members);
        }
      }),
      { kind: KINDS2.morph, contentType: contentType2, attributeName }
    );
  }
};
const registerScalars = ({ registry, strapi: strapi2 }) => {
  const { service: getService } = strapi2.plugin("graphql");
  const { scalars: scalars2 } = getService("internals");
  const { KINDS: KINDS2 } = getService("constants");
  Object.entries(scalars2).forEach(([name, definition]) => {
    registry.register(name, definition, { kind: KINDS2.scalar });
  });
};
const registerInternals = ({ registry, strapi: strapi2 }) => {
  const { buildInternalTypes } = strapi2.plugin("graphql").service("internals");
  const internalTypes = buildInternalTypes({ strapi: strapi2 });
  for (const [kind, definitions] of Object.entries(internalTypes)) {
    registry.registerMany(Object.entries(definitions), { kind });
  }
};
const registerDynamicZonesDefinition$1 = (contentType2, {
  registry,
  strapi: strapi2,
  builders: builders2
}) => {
  const { service: getService } = strapi2.plugin("graphql");
  const {
    naming: naming2,
    attributes: { isDynamicZone }
  } = getService("utils");
  const { KINDS: KINDS2 } = getService("constants");
  const { attributes: attributes2 } = contentType2;
  const dynamicZoneAttributes = Object.keys(attributes2).filter(
    (attributeName) => isDynamicZone(attributes2[attributeName])
  );
  for (const attributeName of dynamicZoneAttributes) {
    const attribute = attributes2[attributeName];
    const dzName = naming2.getDynamicZoneName(contentType2, attributeName);
    const dzInputName = naming2.getDynamicZoneInputName(contentType2, attributeName);
    const [type, input] = builders2.buildDynamicZoneDefinition(attribute, dzName, dzInputName);
    const baseConfig = {
      contentType: contentType2,
      attributeName,
      attribute
    };
    registry.register(dzName, type, { kind: KINDS2.dynamicZone, ...baseConfig });
    registry.register(dzInputName, input, { kind: KINDS2.input, ...baseConfig });
  }
};
const registerEnumsDefinition$1 = (contentType2, {
  registry,
  strapi: strapi2,
  builders: builders2
}) => {
  const { service: getService } = strapi2.plugin("graphql");
  const {
    naming: naming2,
    attributes: { isEnumeration }
  } = getService("utils");
  const { KINDS: KINDS2 } = getService("constants");
  const { attributes: attributes2 } = contentType2;
  const enumAttributes = Object.keys(attributes2).filter(
    (attributeName) => isEnumeration(attributes2[attributeName])
  );
  for (const attributeName of enumAttributes) {
    const attribute = attributes2[attributeName];
    const enumName = naming2.getEnumName(contentType2, attributeName);
    const enumDefinition = builders2.buildEnumTypeDefinition(attribute, enumName);
    registry.register(enumName, enumDefinition, {
      kind: KINDS2.enum,
      contentType: contentType2,
      attributeName,
      attribute
    });
  }
};
const registerInputsDefinition$1 = (contentType2, {
  registry,
  strapi: strapi2,
  builders: builders2
}) => {
  const { service: getService } = strapi2.plugin("graphql");
  const { getComponentInputName, getContentTypeInputName } = getService("utils").naming;
  const { KINDS: KINDS2 } = getService("constants");
  const { modelType } = contentType2;
  const type = (modelType === "component" ? getComponentInputName : getContentTypeInputName).call(
    null,
    contentType2
  );
  const definition = builders2.buildInputType(contentType2);
  registry.register(type, definition, { kind: KINDS2.input, contentType: contentType2 });
};
const registerFiltersDefinition$1 = (contentType2, {
  registry,
  strapi: strapi2,
  builders: builders2
}) => {
  const { service: getService } = strapi2.plugin("graphql");
  const { getFiltersInputTypeName } = getService("utils").naming;
  const { KINDS: KINDS2 } = getService("constants");
  const type = getFiltersInputTypeName(contentType2);
  const definition = builders2.buildContentTypeFilters(contentType2);
  registry.register(type, definition, { kind: KINDS2.filtersInput, contentType: contentType2 });
};
const contentType$1 = {
  registerDynamicZonesDefinition: registerDynamicZonesDefinition$1,
  registerFiltersDefinition: registerFiltersDefinition$1,
  registerInputsDefinition: registerInputsDefinition$1,
  registerEnumsDefinition: registerEnumsDefinition$1
};
const {
  registerEnumsDefinition,
  registerInputsDefinition,
  registerFiltersDefinition,
  registerDynamicZonesDefinition
} = contentType$1;
const contentAPI = ({ strapi: strapi2 }) => {
  const { mergeSchemas, addResolversToSchema } = require("@graphql-tools/schema");
  const { service: getGraphQLService } = strapi2.plugin("graphql");
  const { config: config2 } = strapi2.plugin("graphql");
  const { KINDS: KINDS2, GENERIC_MORPH_TYPENAME: GENERIC_MORPH_TYPENAME2 } = getGraphQLService("constants");
  const extensionService = getGraphQLService("extension");
  let registry;
  let builders2;
  const buildSchema = () => {
    const isShadowCRUDEnabled = !!config2("shadowCRUD");
    registry = getGraphQLService("type-registry").new();
    builders2 = getGraphQLService("builders").new("content-api", registry);
    registerScalars({ registry, strapi: strapi2 });
    registerInternals({ registry, strapi: strapi2 });
    if (isShadowCRUDEnabled) {
      shadowCRUD();
    }
    const schema = buildMergedSchema({ registry });
    const extension = extensionService.generate({ typeRegistry: registry });
    const schemaWithResolvers = addResolversToSchema(schema, extension.resolvers);
    const outputs = {
      schema: config2("artifacts.schema", false),
      typegen: config2("artifacts.typegen", false)
    };
    const currentEnv = strapi2.config.get("environment");
    const nexusSchema = makeSchema({
      types: [],
      // Build the schema from the merged GraphQL schema.
      // Since we're passing the schema to the mergeSchema property, it'll transform our SDL type definitions
      // into Nexus type definition, thus allowing them to be handled by  Nexus plugins & other processing
      mergeSchema: { schema: schemaWithResolvers },
      // Apply user-defined plugins
      plugins: extension.plugins,
      // Whether to generate artifacts (GraphQL schema, TS types definitions) or not.
      // By default, we generate artifacts only on development environment
      shouldGenerateArtifacts: config2("generateArtifacts", currentEnv === "development"),
      // Artifacts generation configuration
      outputs
    });
    const wrappedNexusSchema = wrapResolvers({ schema: nexusSchema, strapi: strapi2, extension });
    const prunedNexusSchema = pruneSchema(wrappedNexusSchema);
    return prunedNexusSchema;
  };
  const buildMergedSchema = ({ registry: registry2 }) => {
    const { types: types2, typeDefs = [] } = extensionService.generate({ typeRegistry: registry2 });
    const nexusSchema = makeSchema({ types: [registry2.definitions, types2] });
    return mergeSchemas({
      typeDefs,
      // Give access to the shadowCRUD & nexus based types
      // Note: This is necessary so that types defined in SDL can reference types defined with Nexus
      schemas: [nexusSchema]
    });
  };
  const shadowCRUD = () => {
    const extensionService2 = getGraphQLService("extension");
    const contentTypes2 = [
      ...Object.values(strapi2.components),
      ...Object.values(strapi2.contentTypes)
    ];
    contentTypes2.map(prop("uid")).filter(startsWith("admin::")).forEach((uid) => extensionService2.shadowCRUD(uid).disable());
    const contentTypesWithShadowCRUD = contentTypes2.filter(
      (ct) => extensionService2.shadowCRUD(ct.uid).isEnabled()
    );
    registerAPITypes(contentTypesWithShadowCRUD);
    registerMorphTypes(contentTypesWithShadowCRUD);
  };
  const registerAPITypes = (contentTypes2) => {
    for (const contentType2 of contentTypes2) {
      const { modelType } = contentType2;
      const registerOptions = { registry, strapi: strapi2, builders: builders2 };
      registerEnumsDefinition(contentType2, registerOptions);
      registerDynamicZonesDefinition(contentType2, registerOptions);
      registerFiltersDefinition(contentType2, registerOptions);
      registerInputsDefinition(contentType2, registerOptions);
      if (modelType === "component") {
        registerComponent(contentType2, registerOptions);
        continue;
      }
      const { kind } = contentType2;
      if (kind === "singleType") {
        registerSingleType(contentType2, registerOptions);
      } else if (kind === "collectionType") {
        registerCollectionType(contentType2, registerOptions);
      }
    }
  };
  const registerMorphTypes = (contentTypes2) => {
    const genericMorphType = builders2.buildGenericMorphDefinition();
    registry.register(GENERIC_MORPH_TYPENAME2, genericMorphType, { kind: KINDS2.morph });
    for (const contentType2 of contentTypes2) {
      registerPolymorphicContentType(contentType2, { registry, strapi: strapi2 });
    }
  };
  return { buildSchema };
};
const { ApplicationError: ApplicationError$4 } = errors;
const createTypeRegistry = () => {
  const registry = /* @__PURE__ */ new Map();
  const typeRegistry2 = {
    /**
     * Register a new type definition
     */
    register(name, definition, config2 = {}) {
      if (registry.has(name)) {
        throw new ApplicationError$4(`"${name}" has already been registered`);
      }
      registry.set(name, { name, definition, config: config2 });
      return this;
    },
    /**
     * Register many types definitions at once
     * @param {[string, NexusAcceptedTypeDef][]} definitionsEntries
     * @param {object | function} [config]
     */
    registerMany(definitionsEntries, config2 = {}) {
      for (const [name, definition] of definitionsEntries) {
        this.register(name, definition, isFunction(config2) ? config2(name, definition) : config2);
      }
      return this;
    },
    /**
     * Check if the given type name has already been added to the registry
     * @param {string} name
     * @return {boolean}
     */
    has(name) {
      return registry.has(name);
    },
    /**
     * Get the type definition for `name`
     * @param {string} name - The name of the type
     */
    get(name) {
      return registry.get(name);
    },
    /**
     * Transform and return the registry as an object
     * @return {Object<string, RegisteredTypeDef>}
     */
    toObject() {
      return Object.fromEntries(registry.entries());
    },
    /**
     * Return the name of every registered type
     * @return {string[]}
     */
    get types() {
      return Array.from(registry.keys());
    },
    /**
     * Return all the registered definitions as an array
     * @return {RegisteredTypeDef[]}
     */
    get definitions() {
      return Array.from(registry.values());
    },
    /**
     * Filter and return the types definitions that matches the given predicate
     * @param {function(RegisteredTypeDef): boolean} predicate
     * @return {RegisteredTypeDef[]}
     */
    where(predicate) {
      return this.definitions.filter(predicate);
    }
  };
  return typeRegistry2;
};
const typeRegistry = () => ({
  new: createTypeRegistry
});
const { ApplicationError: ApplicationError$3 } = errors;
const strapiScalarToGraphQLScalar = ({ strapi: strapi2 }) => {
  const { STRAPI_SCALARS: STRAPI_SCALARS2, SCALARS_ASSOCIATIONS: SCALARS_ASSOCIATIONS2 } = strapi2.plugin("graphql").service("constants");
  const missingStrapiScalars = difference(STRAPI_SCALARS2, Object.keys(SCALARS_ASSOCIATIONS2));
  if (missingStrapiScalars.length > 0) {
    throw new ApplicationError$3("Some Strapi scalars are not handled in the GraphQL scalars mapper");
  }
  return {
    /**
     * Used to transform a Strapi scalar type into its GraphQL equivalent
     */
    strapiScalarToGraphQLScalar(strapiScalar) {
      return get(strapiScalar, SCALARS_ASSOCIATIONS2);
    }
  };
};
const virtualScalarAttributes = ["id"];
const graphQLFiltersToStrapiQuery = ({ strapi: strapi2 }) => {
  const { service: getService } = strapi2.plugin("graphql");
  const recursivelyReplaceScalarOperators = (data) => {
    const { operators: operators2 } = getService("builders").filters;
    if (Array.isArray(data)) {
      return data.map(recursivelyReplaceScalarOperators);
    }
    if (isDate(data) || !isObject(data)) {
      return data;
    }
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      const isOperator = !!operators2[key];
      const newKey = isOperator ? operators2[key].strapiOperator : key;
      result[newKey] = recursivelyReplaceScalarOperators(value);
    }
    return result;
  };
  return {
    /**
     * Transform one or many GraphQL filters object into a valid Strapi query
     * @param {object | object[]} filters
     * @param {object} contentType
     * @return {object | object[]}
     */
    graphQLFiltersToStrapiQuery(filters2, contentType2) {
      const { isStrapiScalar, isMedia, isRelation, isComponent } = getService("utils").attributes;
      const { operators: operators2 } = getService("builders").filters;
      const ROOT_LEVEL_OPERATORS = [operators2.and, operators2.or, operators2.not];
      if (isNil(filters2)) {
        return {};
      }
      if (Array.isArray(filters2)) {
        return filters2.map(
          (filtersItem) => this.graphQLFiltersToStrapiQuery(filtersItem, contentType2)
        );
      }
      const resultMap = {};
      const { attributes: attributes2 } = contentType2;
      const isAttribute = (attributeName) => {
        return virtualScalarAttributes.includes(attributeName) || has(attributeName, attributes2);
      };
      for (const [key, value] of Object.entries(filters2)) {
        if (isAttribute(key)) {
          const attribute = attributes2[key];
          if (virtualScalarAttributes.includes(key) || isStrapiScalar(attribute)) {
            resultMap[key] = recursivelyReplaceScalarOperators(value);
          } else if (isRelation(attribute) || isMedia(attribute)) {
            const relModel = strapi2.getModel(attribute.target);
            resultMap[key] = this.graphQLFiltersToStrapiQuery(value, relModel);
          } else if (isComponent(attribute)) {
            const componentModel = strapi2.getModel(attribute.component);
            resultMap[key] = this.graphQLFiltersToStrapiQuery(value, componentModel);
          }
        } else {
          const rootLevelOperator = ROOT_LEVEL_OPERATORS.find(propEq("fieldName", key));
          if (rootLevelOperator) {
            const { strapiOperator } = rootLevelOperator;
            resultMap[strapiOperator] = this.graphQLFiltersToStrapiQuery(value, contentType2);
          }
        }
      }
      return resultMap;
    }
  };
};
const graphqlScalarToOperators = ({ strapi: strapi2 }) => ({
  graphqlScalarToOperators(graphqlScalar) {
    const { GRAPHQL_SCALAR_OPERATORS: GRAPHQL_SCALAR_OPERATORS2 } = strapi2.plugin("graphql").service("constants");
    const { operators: operators2 } = strapi2.plugin("graphql").service("builders").filters;
    const associations = mapValues(
      map((operatorName) => operators2[operatorName]),
      GRAPHQL_SCALAR_OPERATORS2
    );
    return get(graphqlScalar, associations);
  }
});
const entityToResponseEntity = (entity2) => ({
  id: entity2.id,
  attributes: entity2
});
const entitiesToResponseEntities = map(entityToResponseEntity);
const entityToResponseEntity$1 = () => ({
  entityToResponseEntity,
  entitiesToResponseEntities
});
const mappers = (context) => ({
  ...strapiScalarToGraphQLScalar(context),
  ...graphQLFiltersToStrapiQuery(context),
  ...graphqlScalarToOperators(context),
  ...entityToResponseEntity$1()
});
const attributes = ({ strapi: strapi2 }) => {
  const isStrapiScalar = (attribute) => {
    return strapi2.plugin("graphql").service("constants").STRAPI_SCALARS.includes(attribute.type);
  };
  const isGraphQLScalar = (attribute) => {
    return strapi2.plugin("graphql").service("constants").GRAPHQL_SCALARS.includes(attribute.type);
  };
  const isMorphRelation = (attribute) => {
    return attribute.type === "relation" && attribute.relation.includes("morph");
  };
  const isMedia = propEq("type", "media");
  const isRelation = propEq("type", "relation");
  const isEnumeration = propEq("type", "enumeration");
  const isComponent = propEq("type", "component");
  const isDynamicZone = propEq("type", "dynamiczone");
  return {
    isStrapiScalar,
    isGraphQLScalar,
    isMorphRelation,
    isMedia,
    isRelation,
    isEnumeration,
    isComponent,
    isDynamicZone
  };
};
const { ApplicationError: ApplicationError$2 } = errors;
const naming = ({ strapi: strapi2 }) => {
  const getEnumName = (contentType2, attributeName) => {
    const { attributes: attributes2 } = contentType2;
    const { enumName } = attributes2[attributeName];
    const { modelType } = contentType2;
    const typeName = modelType === "component" ? getComponentName(contentType2) : getTypeName(contentType2);
    const defaultEnumName = `ENUM_${typeName.toUpperCase()}_${attributeName.toUpperCase()}`;
    return enumName || defaultEnumName;
  };
  const getTypeName = (contentType2, {
    plurality = "singular"
  } = {}) => {
    const plugin = get("plugin", contentType2);
    const modelName = get("modelName", contentType2);
    const name = plurality === "singular" ? get("info.singularName", contentType2) : get("info.pluralName", contentType2);
    const transformedPlugin = upperFirst(camelCase(plugin));
    const transformedModelName = upperFirst(camelCase(name || singular(modelName)));
    return `${transformedPlugin}${transformedModelName}`;
  };
  const getEntityName = (contentType2) => {
    return `${getTypeName(contentType2)}Entity`;
  };
  const getEntityMetaName = (contentType2) => {
    return `${getEntityName(contentType2)}Meta`;
  };
  const getEntityResponseName = (contentType2) => {
    return `${getEntityName(contentType2)}Response`;
  };
  const getEntityResponseCollectionName = (contentType2) => {
    return `${getEntityName(contentType2)}ResponseCollection`;
  };
  const getRelationResponseCollectionName = (contentType2) => {
    return `${getTypeName(contentType2)}RelationResponseCollection`;
  };
  const getComponentName = (contentType2) => {
    return contentType2.globalId;
  };
  const getComponentNameFromAttribute = (attribute) => {
    return strapi2.components[attribute.component].globalId;
  };
  const getDynamicZoneName = (contentType2, attributeName) => {
    const typeName = getTypeName(contentType2);
    const dzName = upperFirst(camelCase(attributeName));
    const suffix = "DynamicZone";
    return `${typeName}${dzName}${suffix}`;
  };
  const getDynamicZoneInputName = (contentType2, attributeName) => {
    const dzName = getDynamicZoneName(contentType2, attributeName);
    return `${dzName}Input`;
  };
  const getComponentInputName = (contentType2) => {
    const componentName = getComponentName(contentType2);
    return `${componentName}Input`;
  };
  const getContentTypeInputName = (contentType2) => {
    const typeName = getTypeName(contentType2);
    return `${typeName}Input`;
  };
  const getEntityQueriesTypeName = (contentType2) => {
    return `${getEntityName(contentType2)}Queries`;
  };
  const getEntityMutationsTypeName = (contentType2) => {
    return `${getEntityName(contentType2)}Mutations`;
  };
  const getFiltersInputTypeName = (contentType2) => {
    const isComponent = contentType2.modelType === "component";
    const baseName = isComponent ? getComponentName(contentType2) : getTypeName(contentType2);
    return `${baseName}FiltersInput`;
  };
  const getScalarFilterInputTypeName = (scalarType2) => {
    return `${scalarType2}FilterInput`;
  };
  const getMorphRelationTypeName = (contentType2, attributeName) => {
    const typeName = getTypeName(contentType2);
    const formattedAttr = upperFirst(camelCase(attributeName));
    return `${typeName}${formattedAttr}Morph`;
  };
  const buildCustomTypeNameGenerator = (options) => {
    const { prefix = "", suffix = "", plurality = "singular", firstLetterCase = "upper" } = options;
    if (!["plural", "singular"].includes(plurality)) {
      throw new ApplicationError$2(
        `"plurality" param must be either "plural" or "singular", but got: "${plurality}"`
      );
    }
    const getCustomTypeName = pipe(
      (ct) => getTypeName(ct, { plurality }),
      firstLetterCase === "upper" ? upperFirst : lowerFirst
    );
    return (contentType2) => `${prefix}${getCustomTypeName(contentType2)}${suffix}`;
  };
  const getFindQueryName = buildCustomTypeNameGenerator({
    plurality: "plural",
    firstLetterCase: "lower"
  });
  const getFindOneQueryName = buildCustomTypeNameGenerator({ firstLetterCase: "lower" });
  const getCreateMutationTypeName = buildCustomTypeNameGenerator({
    prefix: "create",
    firstLetterCase: "upper"
  });
  const getUpdateMutationTypeName = buildCustomTypeNameGenerator({
    prefix: "update",
    firstLetterCase: "upper"
  });
  const getDeleteMutationTypeName = buildCustomTypeNameGenerator({
    prefix: "delete",
    firstLetterCase: "upper"
  });
  return {
    getEnumName,
    getTypeName,
    getEntityName,
    getEntityMetaName,
    getEntityResponseName,
    getEntityResponseCollectionName,
    getRelationResponseCollectionName,
    getComponentName,
    getComponentNameFromAttribute,
    getDynamicZoneName,
    getDynamicZoneInputName,
    getComponentInputName,
    getContentTypeInputName,
    getEntityQueriesTypeName,
    getEntityMutationsTypeName,
    getFiltersInputTypeName,
    getScalarFilterInputTypeName,
    getMorphRelationTypeName,
    buildCustomTypeNameGenerator,
    getFindQueryName,
    getFindOneQueryName,
    getCreateMutationTypeName,
    getUpdateMutationTypeName,
    getDeleteMutationTypeName
  };
};
const utils$1 = (context) => ({
  naming: naming(context),
  attributes: attributes(context),
  mappers: mappers(context)
});
const PAGINATION_TYPE_NAME = "Pagination";
const PUBLICATION_STATE_TYPE_NAME = "PublicationState";
const ERROR_TYPE_NAME = "Error";
const RESPONSE_COLLECTION_META_TYPE_NAME = "ResponseCollectionMeta";
const GRAPHQL_SCALARS = [
  "ID",
  "Boolean",
  "Int",
  "String",
  "Long",
  "Float",
  "JSON",
  "Date",
  "Time",
  "DateTime"
];
const STRAPI_SCALARS = [
  "boolean",
  "integer",
  "string",
  "richtext",
  "blocks",
  "enumeration",
  "biginteger",
  "float",
  "decimal",
  "json",
  "date",
  "time",
  "datetime",
  "timestamp",
  "uid",
  "email",
  "password",
  "text"
];
const SCALARS_ASSOCIATIONS = {
  uid: "String",
  email: "String",
  password: "String",
  text: "String",
  boolean: "Boolean",
  integer: "Int",
  string: "String",
  enumeration: "String",
  richtext: "String",
  blocks: "JSON",
  biginteger: "Long",
  float: "Float",
  decimal: "Float",
  json: "JSON",
  date: "Date",
  time: "Time",
  datetime: "DateTime",
  timestamp: "DateTime"
};
const GENERIC_MORPH_TYPENAME = "GenericMorph";
const KINDS = {
  type: "type",
  component: "component",
  dynamicZone: "dynamic-zone",
  enum: "enum",
  entity: "entity",
  entityResponse: "entity-response",
  entityResponseCollection: "entity-response-collection",
  relationResponseCollection: "relation-response-collection",
  query: "query",
  mutation: "mutation",
  input: "input",
  filtersInput: "filters-input",
  scalar: "scalar",
  morph: "polymorphic",
  internal: "internal"
};
const allOperators = [
  "and",
  "or",
  "not",
  "eq",
  "eqi",
  "ne",
  "nei",
  "startsWith",
  "endsWith",
  "contains",
  "notContains",
  "containsi",
  "notContainsi",
  "gt",
  "gte",
  "lt",
  "lte",
  "null",
  "notNull",
  "in",
  "notIn",
  "between"
];
const GRAPHQL_SCALAR_OPERATORS = {
  // ID
  ID: allOperators,
  // Booleans
  Boolean: allOperators,
  // Strings
  String: allOperators,
  // Numbers
  Int: allOperators,
  Long: allOperators,
  Float: allOperators,
  // Dates
  Date: allOperators,
  Time: allOperators,
  DateTime: allOperators,
  // Others
  JSON: allOperators
};
const ERROR_CODES = {
  emptyDynamicZone: "dynamiczone.empty"
};
const constants = () => ({
  PAGINATION_TYPE_NAME,
  RESPONSE_COLLECTION_META_TYPE_NAME,
  PUBLICATION_STATE_TYPE_NAME,
  GRAPHQL_SCALARS,
  STRAPI_SCALARS,
  GENERIC_MORPH_TYPENAME,
  KINDS,
  GRAPHQL_SCALAR_OPERATORS,
  SCALARS_ASSOCIATIONS,
  ERROR_CODES,
  ERROR_TYPE_NAME
});
const SortArg = arg({
  type: list("String"),
  default: []
});
const publicationState$1 = ({ strapi: strapi2 }) => {
  const { PUBLICATION_STATE_TYPE_NAME: PUBLICATION_STATE_TYPE_NAME2 } = strapi2.plugin("graphql").service("constants");
  return arg({
    type: PUBLICATION_STATE_TYPE_NAME2,
    default: "live"
  });
};
const PaginationInputType = inputObjectType({
  name: "PaginationArg",
  definition(t) {
    t.int("page");
    t.int("pageSize");
    t.int("start");
    t.int("limit");
  }
});
const PaginationArg = arg({
  type: PaginationInputType,
  default: {}
});
const args = (context) => ({
  SortArg,
  PaginationArg,
  PublicationStateArg: publicationState$1(context)
});
const { ValidationError: ValidationError$2 } = errors;
const TimeScalar = new GraphQLScalarType({
  name: "Time",
  description: "A time string with format HH:mm:ss.SSS",
  serialize(value) {
    return parseType({ type: "time", value });
  },
  parseValue(value) {
    return parseType({ type: "time", value });
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new ValidationError$2("Time cannot represent non string type");
    }
    const { value } = ast;
    return parseType({ type: "time", value });
  }
});
const parseAndCast = (parseFn) => (...args2) => {
  const parsedValue = parseFn(...args2);
  if (parsedValue instanceof Date) {
    return parsedValue.toISOString().split("T")[0];
  }
  return parsedValue;
};
GraphQLDate.parseValue = parseAndCast(GraphQLDate.parseValue);
GraphQLDate.parseLiteral = parseAndCast(GraphQLDate.parseLiteral);
const scalars = () => ({
  JSON: asNexusMethod(GraphQLJSON, "json"),
  DateTime: asNexusMethod(GraphQLDateTime, "dateTime"),
  Time: asNexusMethod(TimeScalar, "time"),
  Date: asNexusMethod(GraphQLDate, "date"),
  Long: asNexusMethod(GraphQLLong, "long"),
  Upload: asNexusMethod(GraphQLUpload, "upload")
});
const pagination = ({ strapi: strapi2 }) => {
  const { PAGINATION_TYPE_NAME: PAGINATION_TYPE_NAME2 } = strapi2.plugin("graphql").service("constants");
  return {
    /**
     * Type definition for a Pagination object
     * @type {NexusObjectTypeDef}
     */
    Pagination: objectType({
      name: PAGINATION_TYPE_NAME2,
      definition(t) {
        t.nonNull.int("total");
        t.nonNull.int("page");
        t.nonNull.int("pageSize");
        t.nonNull.int("pageCount");
      }
    })
  };
};
const buildResponseCollectionMeta = ({ strapi: strapi2 }) => {
  const { RESPONSE_COLLECTION_META_TYPE_NAME: RESPONSE_COLLECTION_META_TYPE_NAME2, PAGINATION_TYPE_NAME: PAGINATION_TYPE_NAME2 } = strapi2.plugin("graphql").service("constants");
  return {
    /**
     * A shared type definition used in EntitiesResponseCollection
     * to have information about the collection as a whole
     * @type {NexusObjectTypeDef}
     */
    ResponseCollectionMeta: objectType({
      name: RESPONSE_COLLECTION_META_TYPE_NAME2,
      definition(t) {
        t.nonNull.field("pagination", {
          type: PAGINATION_TYPE_NAME2,
          async resolve(parent, _childArgs, ctx) {
            const { args: args2, resourceUID } = parent;
            const { start, limit } = args2;
            const safeLimit = Math.max(limit, 1);
            const contentType2 = strapi2.getModel(resourceUID);
            await validate.contentAPI.query(args2, contentType2, {
              auth: ctx?.state?.auth
            });
            const sanitizedQuery = await sanitize.contentAPI.query(args2, contentType2, {
              auth: ctx?.state?.auth
            });
            const total = await strapi2.entityService.count(resourceUID, sanitizedQuery);
            const pageSize = limit === -1 ? total - start : safeLimit;
            const pageCount = limit === -1 ? safeLimit : Math.ceil(total / safeLimit);
            const page = limit === -1 ? safeLimit : Math.floor(start / safeLimit) + 1;
            return { total, page, pageSize, pageCount };
          }
        });
      }
    })
  };
};
const publicationState = ({ strapi: strapi2 }) => {
  const { PUBLICATION_STATE_TYPE_NAME: PUBLICATION_STATE_TYPE_NAME2 } = strapi2.plugin("graphql").service("constants");
  return {
    /**
     * An enum type definition representing a publication state
     * @type {NexusEnumTypeDef}
     */
    PublicationState: enumType({
      name: PUBLICATION_STATE_TYPE_NAME2,
      members: {
        // Published only
        LIVE: "live",
        // Published & draft
        PREVIEW: "preview"
      }
    })
  };
};
const buildScalarFilters = ({ strapi: strapi2 }) => {
  const { naming: naming2, mappers: mappers2 } = strapi2.plugin("graphql").service("utils");
  const { helpers: helpers2 } = strapi2.plugin("graphql").service("internals");
  return helpers2.getEnabledScalars().reduce((acc, type) => {
    const operators2 = mappers2.graphqlScalarToOperators(type);
    const typeName = naming2.getScalarFilterInputTypeName(type);
    if (!operators2 || operators2.length === 0) {
      return acc;
    }
    return {
      ...acc,
      [typeName]: inputObjectType({
        name: typeName,
        definition(t) {
          for (const operator of operators2) {
            operator.add(t, type);
          }
        }
      })
    };
  }, {});
};
const filters$1 = (context) => ({
  scalars: buildScalarFilters(context)
});
const { ValidationError: ValidationError$1 } = errors;
const error = ({ strapi: strapi2 }) => {
  const { ERROR_CODES: ERROR_CODES2, ERROR_TYPE_NAME: ERROR_TYPE_NAME2 } = strapi2.plugin("graphql").service("constants");
  return objectType({
    name: ERROR_TYPE_NAME2,
    definition(t) {
      t.nonNull.string("code", {
        resolve(parent) {
          const code = get("code", parent);
          const isValidPlaceholderCode = Object.values(ERROR_CODES2).includes(code);
          if (!isValidPlaceholderCode) {
            throw new ValidationError$1(`"${code}" is not a valid code value`);
          }
          return code;
        }
      });
      t.string("message");
    }
  });
};
const types = (context) => () => {
  const { strapi: strapi2 } = context;
  const { KINDS: KINDS2 } = strapi2.plugin("graphql").service("constants");
  return {
    [KINDS2.internal]: {
      error: error(context),
      pagination: pagination(context),
      responseCollectionMeta: buildResponseCollectionMeta(context)
    },
    [KINDS2.enum]: {
      publicationState: publicationState(context)
    },
    [KINDS2.filtersInput]: {
      ...filters$1(context)
    }
  };
};
const getEnabledScalars = ({ strapi: strapi2 }) => () => {
  const { GRAPHQL_SCALAR_OPERATORS: GRAPHQL_SCALAR_OPERATORS2 } = strapi2.plugin("graphql").service("constants");
  return Object.entries(GRAPHQL_SCALAR_OPERATORS2).filter(([, value]) => value.length > 0).map(first);
};
const helpers = (context) => ({
  getEnabledScalars: getEnabledScalars(context)
});
const internals = (context) => ({
  args: args(context),
  scalars: scalars(),
  buildInternalTypes: types(context),
  helpers: helpers(context)
});
const buildEnumTypeDefinition = (definition, name) => {
  return enumType({
    name,
    members: definition.enum.reduce(
      (acc, value) => set(toRegressedEnumValue(value), value, acc),
      {}
    )
  });
};
const enums = () => ({
  buildEnumTypeDefinition
});
const { ApplicationError: ApplicationError$1 } = errors;
const dynamicZone = ({ strapi: strapi2 }) => {
  const buildTypeDefinition = (name, components) => {
    const { ERROR_TYPE_NAME: ERROR_TYPE_NAME2 } = strapi2.plugin("graphql").service("constants");
    const isEmpty2 = components.length === 0;
    const componentsTypeNames = components.map((componentUID) => {
      const component = strapi2.components[componentUID];
      if (!component) {
        throw new ApplicationError$1(
          `Trying to create a dynamic zone type with an unknown component: "${componentUID}"`
        );
      }
      return component.globalId;
    });
    return unionType({
      name,
      resolveType(obj) {
        if (isEmpty2) {
          return ERROR_TYPE_NAME2;
        }
        return strapi2.components[obj.__component].globalId;
      },
      definition(t) {
        t.members(...componentsTypeNames, ERROR_TYPE_NAME2);
      }
    });
  };
  const buildInputDefinition = (name, components) => {
    const parseData = (value) => {
      const component = Object.values(strapi2.components).find(
        (component2) => component2.globalId === value.__typename
      );
      if (!component) {
        throw new ApplicationError$1(
          `Component not found. expected one of: ${components.map((uid) => strapi2.components[uid].globalId).join(", ")}`
        );
      }
      return {
        __component: component.uid,
        ...omit(["__typename"], value)
      };
    };
    return scalarType({
      name,
      serialize: (value) => value,
      parseValue: (value) => parseData(value),
      parseLiteral(ast, variables) {
        if (ast.kind !== Kind.OBJECT) {
          return void 0;
        }
        const value = valueFromASTUntyped(ast, variables);
        return parseData(value);
      }
    });
  };
  return {
    /**
     * Build a Nexus dynamic zone type from a Strapi dz attribute
     * @param {object} definition - The definition of the dynamic zone
     * @param {string} name - the name of the dynamic zone
     * @param {string} inputName - the name of the dynamic zone's input
     * @return {[NexusUnionTypeDef, NexusScalarTypeDef]}
     */
    buildDynamicZoneDefinition(definition, name, inputName) {
      const { components } = definition;
      const typeDefinition = buildTypeDefinition(name, components);
      const inputDefinition = buildInputDefinition(inputName, components);
      return [typeDefinition, inputDefinition];
    }
  };
};
const entity = ({ strapi: strapi2 }) => {
  const { naming: naming2 } = strapi2.plugin("graphql").service("utils");
  return {
    /**
     * Build a higher level type for a content type which contains the attributes, the ID and the metadata
     * @param {object} contentType The content type which will be used to build its entity type
     * @return {NexusObjectTypeDef}
     */
    buildEntityDefinition(contentType2) {
      const { attributes: attributes2 } = contentType2;
      const name = naming2.getEntityName(contentType2);
      const typeName = naming2.getTypeName(contentType2);
      return objectType({
        name,
        definition(t) {
          t.id("id", { resolve: prop("id") });
          if (!isEmpty(attributes2)) {
            t.field("attributes", {
              type: typeName,
              resolve: identity
            });
          }
        }
      });
    }
  };
};
function buildEntityMetaDefinition() {
}
const entityMeta = () => ({
  buildEntityMetaDefinition
});
const typeBuilder = (context) => {
  const { strapi: strapi2 } = context;
  const getGraphQLService = strapi2.plugin("graphql").service;
  const extension = getGraphQLService("extension");
  const addScalarAttribute = (options) => {
    const { builder, attributeName, attribute } = options;
    const { mappers: mappers2 } = getGraphQLService("utils");
    const gqlType = mappers2.strapiScalarToGraphQLScalar(attribute.type);
    builder.field(attributeName, { type: gqlType });
  };
  const addComponentAttribute = (options) => {
    const { builder, attributeName, contentType: contentType2, attribute } = options;
    let localBuilder = builder;
    const { naming: naming2 } = getGraphQLService("utils");
    const { getContentTypeArgs } = getGraphQLService("builders").utils;
    const { buildComponentResolver } = getGraphQLService("builders").get("content-api");
    const type = naming2.getComponentNameFromAttribute(attribute);
    if (attribute.repeatable) {
      localBuilder = localBuilder.list;
    }
    const targetComponent = strapi2.getModel(attribute.component);
    const resolve = buildComponentResolver({
      contentTypeUID: contentType2.uid,
      attributeName,
      strapi: strapi2
    });
    const args2 = getContentTypeArgs(targetComponent, { multiple: !!attribute.repeatable });
    localBuilder.field(attributeName, { type, resolve, args: args2 });
  };
  const addDynamicZoneAttribute = (options) => {
    const { builder, attributeName, contentType: contentType2 } = options;
    const { naming: naming2 } = getGraphQLService("utils");
    const { ERROR_CODES: ERROR_CODES2 } = getGraphQLService("constants");
    const { buildDynamicZoneResolver } = getGraphQLService("builders").get("content-api");
    const { components } = contentType2.attributes[attributeName];
    const isEmpty2 = components.length === 0;
    const type = naming2.getDynamicZoneName(contentType2, attributeName);
    const resolve = isEmpty2 ? (
      // If the dynamic zone don't have any component, then return an error payload
      constant({
        code: ERROR_CODES2.emptyDynamicZone,
        message: `This dynamic zone don't have any component attached to it`
      })
    ) : (
      //  Else, return a classic dynamic-zone resolver
      buildDynamicZoneResolver({
        contentTypeUID: contentType2.uid,
        attributeName
      })
    );
    builder.list.field(attributeName, { type, resolve });
  };
  const addEnumAttribute = (options) => {
    const { builder, attributeName, contentType: contentType2 } = options;
    const { naming: naming2 } = getGraphQLService("utils");
    const type = naming2.getEnumName(contentType2, attributeName);
    builder.field(attributeName, { type });
  };
  const addMediaAttribute = (options) => {
    const { naming: naming2 } = getGraphQLService("utils");
    const { getContentTypeArgs } = getGraphQLService("builders").utils;
    const { buildAssociationResolver } = getGraphQLService("builders").get("content-api");
    const extension2 = getGraphQLService("extension");
    const { builder } = options;
    const { attributeName, attribute, contentType: contentType2 } = options;
    const fileUID = "plugin::upload.file";
    if (extension2.shadowCRUD(fileUID).isDisabled()) {
      return;
    }
    const fileContentType = strapi2.contentTypes[fileUID];
    const resolve = buildAssociationResolver({
      contentTypeUID: contentType2.uid,
      attributeName,
      strapi: strapi2
    });
    const args2 = attribute.multiple ? getContentTypeArgs(fileContentType) : void 0;
    const type = attribute.multiple ? naming2.getRelationResponseCollectionName(fileContentType) : naming2.getEntityResponseName(fileContentType);
    builder.field(attributeName, { type, resolve, args: args2 });
  };
  const addPolymorphicRelationalAttribute = (options) => {
    const { GENERIC_MORPH_TYPENAME: GENERIC_MORPH_TYPENAME2 } = getGraphQLService("constants");
    const { naming: naming2 } = getGraphQLService("utils");
    const { buildAssociationResolver } = getGraphQLService("builders").get("content-api");
    let { builder } = options;
    const { attributeName, attribute, contentType: contentType2 } = options;
    const { target } = attribute;
    const isToManyRelation = attribute.relation.endsWith("Many");
    if (isToManyRelation) {
      builder = builder.list;
    }
    const resolve = buildAssociationResolver({
      contentTypeUID: contentType2.uid,
      attributeName,
      strapi: strapi2
    });
    if (isUndefined(target)) {
      builder.field(attributeName, {
        type: GENERIC_MORPH_TYPENAME2,
        resolve
      });
    } else if (isArray(target) && target.every(isString)) {
      const type = naming2.getMorphRelationTypeName(contentType2, attributeName);
      builder.field(attributeName, { type, resolve });
    }
  };
  const addRegularRelationalAttribute = (options) => {
    const { naming: naming2 } = getGraphQLService("utils");
    const { getContentTypeArgs } = getGraphQLService("builders").utils;
    const { buildAssociationResolver } = getGraphQLService("builders").get("content-api");
    const extension2 = getGraphQLService("extension");
    const { builder } = options;
    const { attributeName, attribute, contentType: contentType2 } = options;
    if (extension2.shadowCRUD(attribute.target).isDisabled()) {
      return;
    }
    const isToManyRelation = attribute.relation.endsWith("Many");
    const resolve = buildAssociationResolver({
      contentTypeUID: contentType2.uid,
      attributeName,
      strapi: strapi2
    });
    const targetContentType = strapi2.getModel(attribute.target);
    const type = isToManyRelation ? naming2.getRelationResponseCollectionName(targetContentType) : naming2.getEntityResponseName(targetContentType);
    const args2 = isToManyRelation ? getContentTypeArgs(targetContentType) : void 0;
    const resolverPath = `${naming2.getTypeName(contentType2)}.${attributeName}`;
    const resolverScope = `${targetContentType.uid}.find`;
    extension2.use({ resolversConfig: { [resolverPath]: { auth: { scope: [resolverScope] } } } });
    builder.field(attributeName, { type, resolve, args: args2 });
  };
  const isNotPrivate = (contentType2) => (attributeName) => {
    return !contentTypes.isPrivateAttribute(contentType2, attributeName);
  };
  const isNotDisabled = (contentType2) => (attributeName) => {
    return extension.shadowCRUD(contentType2.uid).field(attributeName).hasOutputEnabled();
  };
  return {
    /**
     * Create a type definition for a given content type
     * @param contentType - The content type used to created the definition
     * @return {NexusObjectTypeDef}
     */
    buildTypeDefinition(contentType2) {
      const utils2 = getGraphQLService("utils");
      const { getComponentName, getTypeName } = utils2.naming;
      const {
        isStrapiScalar,
        isComponent,
        isDynamicZone,
        isEnumeration,
        isMedia,
        isMorphRelation,
        isRelation
      } = utils2.attributes;
      const { attributes: attributes2, modelType } = contentType2;
      const attributesKey = Object.keys(attributes2);
      const name = (modelType === "component" ? getComponentName : getTypeName).call(
        null,
        contentType2
      );
      return objectType({
        name,
        definition(t) {
          if (modelType === "component" && isNotDisabled(contentType2)("id")) {
            t.nonNull.id("id");
          }
          attributesKey.filter(isNotPrivate(contentType2)).filter(isNotDisabled(contentType2)).forEach((attributeName) => {
            const attribute = attributes2[attributeName];
            let builder = t;
            if (attribute.required) {
              builder = builder.nonNull;
            }
            const options = {
              builder,
              attributeName,
              attribute,
              contentType: contentType2,
              context
            };
            if (isEnumeration(attribute)) {
              addEnumAttribute(options);
            } else if (isStrapiScalar(attribute)) {
              addScalarAttribute(options);
            } else if (isComponent(attribute)) {
              addComponentAttribute(options);
            } else if (isDynamicZone(attribute)) {
              addDynamicZoneAttribute(options);
            } else if (isMedia(attribute)) {
              addMediaAttribute(options);
            } else if (isMorphRelation(attribute)) {
              addPolymorphicRelationalAttribute(options);
            } else if (isRelation(attribute)) {
              addRegularRelationalAttribute(options);
            }
          });
        }
      });
    }
  };
};
const response = ({ strapi: strapi2 }) => {
  const { naming: naming2 } = strapi2.plugin("graphql").service("utils");
  return {
    /**
     * Build a type definition for a content API response for a given content type
     */
    buildResponseDefinition(contentType2) {
      const name = naming2.getEntityResponseName(contentType2);
      const entityName = naming2.getEntityName(contentType2);
      return objectType({
        name,
        definition(t) {
          t.field("data", {
            type: entityName,
            resolve: prop("value")
          });
        }
      });
    }
  };
};
const responseCollection = ({ strapi: strapi2 }) => {
  const { naming: naming2 } = strapi2.plugin("graphql").service("utils");
  const { RESPONSE_COLLECTION_META_TYPE_NAME: RESPONSE_COLLECTION_META_TYPE_NAME2 } = strapi2.plugin("graphql").service("constants");
  return {
    /**
     * Build a type definition for a content API collection response for a given content type
     * @param {Schema.ContentType} contentType The content type which will be used to build its content API response definition
     * @return {NexusObjectTypeDef}
     */
    buildResponseCollectionDefinition(contentType2) {
      const name = naming2.getEntityResponseCollectionName(contentType2);
      const entityName = naming2.getEntityName(contentType2);
      return objectType({
        name,
        definition(t) {
          t.nonNull.list.field("data", {
            type: nonNull(entityName),
            resolve: pipe(prop("nodes"), defaultTo([]))
          });
          t.nonNull.field("meta", {
            type: RESPONSE_COLLECTION_META_TYPE_NAME2,
            // Pass down the args stored in the source object
            resolve: prop("info")
          });
        }
      });
    }
  };
};
const relationResponseCollection = ({ strapi: strapi2 }) => {
  const { naming: naming2 } = strapi2.plugin("graphql").service("utils");
  return {
    /**
     * Build a type definition for a content API relation's collection response for a given content type
     */
    buildRelationResponseCollectionDefinition(contentType2) {
      const name = naming2.getRelationResponseCollectionName(contentType2);
      const entityName = naming2.getEntityName(contentType2);
      return objectType({
        name,
        definition(t) {
          t.nonNull.list.field("data", {
            type: nonNull(entityName),
            resolve: pipe(prop("nodes"), defaultTo([]))
          });
        }
      });
    }
  };
};
const createCollectionTypeQueriesBuilder = ({ strapi: strapi2 }) => {
  const { service: getService } = strapi2.plugin("graphql");
  const { naming: naming2 } = getService("utils");
  const { transformArgs, getContentTypeArgs } = getService("builders").utils;
  const { toEntityResponse, toEntityResponseCollection } = getService("format").returnTypes;
  const {
    getFindOneQueryName,
    getEntityResponseName,
    getFindQueryName,
    getEntityResponseCollectionName
  } = naming2;
  const buildCollectionTypeQueries = (contentType2) => {
    const findOneQueryName = `Query.${getFindOneQueryName(contentType2)}`;
    const findQueryName = `Query.${getFindQueryName(contentType2)}`;
    const extension = getService("extension");
    const registerAuthConfig = (action, auth) => {
      return extension.use({ resolversConfig: { [action]: { auth } } });
    };
    const isActionEnabled = (action) => {
      return extension.shadowCRUD(contentType2.uid).isActionEnabled(action);
    };
    const isFindOneEnabled = isActionEnabled("findOne");
    const isFindEnabled = isActionEnabled("find");
    if (isFindOneEnabled) {
      registerAuthConfig(findOneQueryName, { scope: [`${contentType2.uid}.findOne`] });
    }
    if (isFindEnabled) {
      registerAuthConfig(findQueryName, { scope: [`${contentType2.uid}.find`] });
    }
    return extendType({
      type: "Query",
      definition(t) {
        if (isFindOneEnabled) {
          addFindOneQuery(t, contentType2);
        }
        if (isFindEnabled) {
          addFindQuery(t, contentType2);
        }
      }
    });
  };
  const addFindOneQuery = (t, contentType2) => {
    const { uid } = contentType2;
    const findOneQueryName = getFindOneQueryName(contentType2);
    const responseTypeName = getEntityResponseName(contentType2);
    t.field(findOneQueryName, {
      type: responseTypeName,
      args: getContentTypeArgs(contentType2, { multiple: false }),
      async resolve(parent, args2, ctx) {
        const transformedArgs = transformArgs(args2, { contentType: contentType2 });
        const { findOne } = getService("builders").get("content-api").buildQueriesResolvers({ contentType: contentType2 });
        const value = findOne(parent, transformedArgs, ctx);
        return toEntityResponse(value, { args: transformedArgs, resourceUID: uid });
      }
    });
  };
  const addFindQuery = (t, contentType2) => {
    const { uid } = contentType2;
    const findQueryName = getFindQueryName(contentType2);
    const responseCollectionTypeName = getEntityResponseCollectionName(contentType2);
    t.field(findQueryName, {
      type: responseCollectionTypeName,
      args: getContentTypeArgs(contentType2),
      async resolve(parent, args2, ctx) {
        const transformedArgs = transformArgs(args2, { contentType: contentType2, usePagination: true });
        const { find } = getService("builders").get("content-api").buildQueriesResolvers({ contentType: contentType2 });
        const nodes = await find(parent, transformedArgs, ctx);
        return toEntityResponseCollection(nodes, { args: transformedArgs, resourceUID: uid });
      }
    });
  };
  return { buildCollectionTypeQueries };
};
const createSingleTypeQueriesBuilder = ({ strapi: strapi2 }) => {
  const { service: getService } = strapi2.plugin("graphql");
  const { naming: naming2 } = getService("utils");
  const { transformArgs, getContentTypeArgs } = getService("builders").utils;
  const { toEntityResponse } = getService("format").returnTypes;
  const { getFindOneQueryName, getEntityResponseName } = naming2;
  const buildSingleTypeQueries = (contentType2) => {
    const findQueryName = `Query.${getFindOneQueryName(contentType2)}`;
    const extension = getService("extension");
    const registerAuthConfig = (action, auth) => {
      return extension.use({ resolversConfig: { [action]: { auth } } });
    };
    const isActionEnabled = (action) => {
      return extension.shadowCRUD(contentType2.uid).isActionEnabled(action);
    };
    const isFindEnabled = isActionEnabled("find");
    if (isFindEnabled) {
      registerAuthConfig(findQueryName, { scope: [`${contentType2.uid}.find`] });
    }
    return extendType({
      type: "Query",
      definition(t) {
        if (isFindEnabled) {
          addFindQuery(t, contentType2);
        }
      }
    });
  };
  const addFindQuery = (t, contentType2) => {
    const { uid } = contentType2;
    const findQueryName = getFindOneQueryName(contentType2);
    const responseTypeName = getEntityResponseName(contentType2);
    t.field(findQueryName, {
      type: responseTypeName,
      args: getContentTypeArgs(contentType2),
      async resolve(parent, args2, ctx) {
        const transformedArgs = transformArgs(args2, { contentType: contentType2 });
        const queriesResolvers2 = getService("builders").get("content-api").buildQueriesResolvers({ contentType: contentType2 });
        const value = queriesResolvers2.find(parent, transformedArgs, ctx);
        return toEntityResponse(value, { args: transformedArgs, resourceUID: uid });
      }
    });
  };
  return { buildSingleTypeQueries };
};
const queries = (context) => ({
  ...createCollectionTypeQueriesBuilder(context),
  ...createSingleTypeQueriesBuilder(context)
});
const createCollectionTypeMutationsBuilder = ({ strapi: strapi2 }) => {
  const { service: getService } = strapi2.plugin("graphql");
  const { naming: naming2 } = getService("utils");
  const { transformArgs } = getService("builders").utils;
  const { toEntityResponse } = getService("format").returnTypes;
  const {
    getCreateMutationTypeName,
    getUpdateMutationTypeName,
    getDeleteMutationTypeName,
    getEntityResponseName,
    getContentTypeInputName
  } = naming2;
  const addCreateMutation = (t, contentType2) => {
    const { uid } = contentType2;
    const createMutationName = getCreateMutationTypeName(contentType2);
    const responseTypeName = getEntityResponseName(contentType2);
    t.field(createMutationName, {
      type: responseTypeName,
      args: {
        // Create payload
        data: nonNull(getContentTypeInputName(contentType2))
      },
      async resolve(parent, args2, context) {
        const { auth } = context.state;
        const transformedArgs = transformArgs(args2, { contentType: contentType2 });
        const sanitizedInputData = await sanitize.contentAPI.input(
          transformedArgs.data,
          contentType2,
          { auth }
        );
        Object.assign(transformedArgs, { data: sanitizedInputData });
        const { create } = getService("builders").get("content-api").buildMutationsResolvers({ contentType: contentType2 });
        const value = await create(parent, transformedArgs);
        return toEntityResponse(value, { args: transformedArgs, resourceUID: uid });
      }
    });
  };
  const addUpdateMutation = (t, contentType2) => {
    const { uid } = contentType2;
    const updateMutationName = getUpdateMutationTypeName(contentType2);
    const responseTypeName = getEntityResponseName(contentType2);
    t.field(updateMutationName, {
      type: responseTypeName,
      args: {
        // Query args
        id: nonNull("ID"),
        // todo[v4]: Don't allow to filter using every unique attributes for now
        // ...uniqueAttributes,
        // Update payload
        data: nonNull(getContentTypeInputName(contentType2))
      },
      async resolve(parent, args2, context) {
        const { auth } = context.state;
        const transformedArgs = transformArgs(args2, { contentType: contentType2 });
        const sanitizedInputData = await sanitize.contentAPI.input(
          transformedArgs.data,
          contentType2,
          { auth }
        );
        Object.assign(transformedArgs, { data: sanitizedInputData });
        const { update } = getService("builders").get("content-api").buildMutationsResolvers({ contentType: contentType2 });
        const value = await update(parent, transformedArgs);
        return toEntityResponse(value, { args: transformedArgs, resourceUID: uid });
      }
    });
  };
  const addDeleteMutation = (t, contentType2) => {
    const { uid } = contentType2;
    const deleteMutationName = getDeleteMutationTypeName(contentType2);
    const responseTypeName = getEntityResponseName(contentType2);
    t.field(deleteMutationName, {
      type: responseTypeName,
      args: {
        // Query args
        id: nonNull("ID")
        // todo[v4]: Don't allow to filter using every unique attributes for now
        // ...uniqueAttributes,
      },
      async resolve(parent, args2, ctx) {
        const transformedArgs = transformArgs(args2, { contentType: contentType2 });
        const { delete: deleteResolver } = getService("builders").get("content-api").buildMutationsResolvers({ contentType: contentType2 });
        const value = await deleteResolver(parent, args2, ctx);
        return toEntityResponse(value, { args: transformedArgs, resourceUID: uid });
      }
    });
  };
  return {
    buildCollectionTypeMutations(contentType2) {
      const createMutationName = `Mutation.${getCreateMutationTypeName(contentType2)}`;
      const updateMutationName = `Mutation.${getUpdateMutationTypeName(contentType2)}`;
      const deleteMutationName = `Mutation.${getDeleteMutationTypeName(contentType2)}`;
      const extension = getService("extension");
      const registerAuthConfig = (action, auth) => {
        return extension.use({ resolversConfig: { [action]: { auth } } });
      };
      const isActionEnabled = (action) => {
        return extension.shadowCRUD(contentType2.uid).isActionEnabled(action);
      };
      const isCreateEnabled = isActionEnabled("create");
      const isUpdateEnabled = isActionEnabled("update");
      const isDeleteEnabled = isActionEnabled("delete");
      if (isCreateEnabled) {
        registerAuthConfig(createMutationName, { scope: [`${contentType2.uid}.create`] });
      }
      if (isUpdateEnabled) {
        registerAuthConfig(updateMutationName, { scope: [`${contentType2.uid}.update`] });
      }
      if (isDeleteEnabled) {
        registerAuthConfig(deleteMutationName, { scope: [`${contentType2.uid}.delete`] });
      }
      return extendType({
        type: "Mutation",
        definition(t) {
          if (isCreateEnabled) {
            addCreateMutation(t, contentType2);
          }
          if (isUpdateEnabled) {
            addUpdateMutation(t, contentType2);
          }
          if (isDeleteEnabled) {
            addDeleteMutation(t, contentType2);
          }
        }
      });
    }
  };
};
const { NotFoundError } = errors;
const createSingleTypeMutationsBuilder = ({ strapi: strapi2 }) => {
  const { service: getService } = strapi2.plugin("graphql");
  const { naming: naming2 } = getService("utils");
  const { transformArgs } = getService("builders").utils;
  const { toEntityResponse } = getService("format").returnTypes;
  const {
    getUpdateMutationTypeName,
    getEntityResponseName,
    getContentTypeInputName,
    getDeleteMutationTypeName
  } = naming2;
  const addUpdateMutation = (t, contentType2) => {
    const { uid } = contentType2;
    const updateMutationName = getUpdateMutationTypeName(contentType2);
    const responseTypeName = getEntityResponseName(contentType2);
    t.field(updateMutationName, {
      type: responseTypeName,
      args: {
        // Update payload
        data: nonNull(getContentTypeInputName(contentType2))
      },
      async resolve(parent, args2, context) {
        const { auth } = context.state;
        const transformedArgs = transformArgs(args2, { contentType: contentType2 });
        const sanitizedInputData = await sanitize.contentAPI.input(
          transformedArgs.data,
          contentType2,
          { auth }
        );
        Object.assign(transformedArgs, { data: sanitizedInputData });
        const { create, update } = getService("builders").get("content-api").buildMutationsResolvers({ contentType: contentType2 });
        await validate.contentAPI.query(omit(["data", "files"], transformedArgs), contentType2, {
          auth
        });
        const sanitizedQuery = await sanitize.contentAPI.query(
          omit(["data", "files"], transformedArgs),
          contentType2,
          {
            auth
          }
        );
        const entity2 = await strapi2.entityService.findMany(uid, sanitizedQuery);
        const value = isNil(entity2) ? create(parent, transformedArgs) : update(uid, { id: entity2.id, data: transformedArgs.data });
        return toEntityResponse(value, { args: transformedArgs, resourceUID: uid });
      }
    });
  };
  const addDeleteMutation = (t, contentType2) => {
    const { uid } = contentType2;
    const deleteMutationName = getDeleteMutationTypeName(contentType2);
    const responseTypeName = getEntityResponseName(contentType2);
    t.field(deleteMutationName, {
      type: responseTypeName,
      args: {},
      async resolve(parent, args2, ctx) {
        const transformedArgs = transformArgs(args2, { contentType: contentType2 });
        const { delete: deleteResolver } = getService("builders").get("content-api").buildMutationsResolvers({ contentType: contentType2 });
        await validate.contentAPI.query(transformedArgs, contentType2, { auth: ctx?.state?.auth });
        const sanitizedQuery = await sanitize.contentAPI.query(transformedArgs, contentType2, {
          auth: ctx?.state?.auth
        });
        const entity2 = await strapi2.entityService.findMany(uid, sanitizedQuery);
        if (!entity2) {
          throw new NotFoundError("Entity not found");
        }
        const value = await deleteResolver(parent, { id: entity2.id, params: transformedArgs });
        return toEntityResponse(value, { args: transformedArgs, resourceUID: uid });
      }
    });
  };
  return {
    buildSingleTypeMutations(contentType2) {
      const updateMutationName = `Mutation.${getUpdateMutationTypeName(contentType2)}`;
      const deleteMutationName = `Mutation.${getDeleteMutationTypeName(contentType2)}`;
      const extension = getService("extension");
      const registerAuthConfig = (action, auth) => {
        return extension.use({ resolversConfig: { [action]: { auth } } });
      };
      const isActionEnabled = (action) => {
        return extension.shadowCRUD(contentType2.uid).isActionEnabled(action);
      };
      const isUpdateEnabled = isActionEnabled("update");
      const isDeleteEnabled = isActionEnabled("delete");
      if (isUpdateEnabled) {
        registerAuthConfig(updateMutationName, { scope: [`${contentType2.uid}.update`] });
      }
      if (isDeleteEnabled) {
        registerAuthConfig(deleteMutationName, { scope: [`${contentType2.uid}.delete`] });
      }
      return extendType({
        type: "Mutation",
        definition(t) {
          if (isUpdateEnabled) {
            addUpdateMutation(t, contentType2);
          }
          if (isDeleteEnabled) {
            addDeleteMutation(t, contentType2);
          }
        }
      });
    }
  };
};
const mutations = (context) => ({
  ...createCollectionTypeMutationsBuilder(context),
  ...createSingleTypeMutationsBuilder(context)
});
const contentType = ({ strapi: strapi2 }) => {
  const rootLevelOperators = () => {
    const { operators: operators2 } = strapi2.plugin("graphql").service("builders").filters;
    return [operators2.and, operators2.or, operators2.not];
  };
  const addScalarAttribute = (builder, attributeName, attribute) => {
    const { naming: naming2, mappers: mappers2 } = strapi2.plugin("graphql").service("utils");
    const gqlType = mappers2.strapiScalarToGraphQLScalar(attribute.type);
    builder.field(attributeName, { type: naming2.getScalarFilterInputTypeName(gqlType) });
  };
  const addRelationalAttribute = (builder, attributeName, attribute) => {
    const utils2 = strapi2.plugin("graphql").service("utils");
    const extension = strapi2.plugin("graphql").service("extension");
    const { getFiltersInputTypeName } = utils2.naming;
    const { isMorphRelation } = utils2.attributes;
    const model = "target" in attribute && strapi2.getModel(attribute.target);
    if (!model || isMorphRelation(attribute))
      return;
    if (extension.shadowCRUD(model.uid).isDisabled())
      return;
    builder.field(attributeName, { type: getFiltersInputTypeName(model) });
  };
  const addComponentAttribute = (builder, attributeName, attribute) => {
    const utils2 = strapi2.plugin("graphql").service("utils");
    const extension = strapi2.plugin("graphql").service("extension");
    const { getFiltersInputTypeName } = utils2.naming;
    const component = strapi2.getModel(attribute.component);
    if (!component)
      return;
    if (extension.shadowCRUD(component.uid).isDisabled())
      return;
    builder.field(attributeName, { type: getFiltersInputTypeName(component) });
  };
  const buildContentTypeFilters = (contentType2) => {
    const utils2 = strapi2.plugin("graphql").service("utils");
    const extension = strapi2.plugin("graphql").service("extension");
    const { getFiltersInputTypeName, getScalarFilterInputTypeName } = utils2.naming;
    const { isStrapiScalar, isRelation, isComponent } = utils2.attributes;
    const { attributes: attributes2 } = contentType2;
    const filtersTypeName = getFiltersInputTypeName(contentType2);
    return inputObjectType({
      name: filtersTypeName,
      definition(t) {
        const validAttributes = Object.entries(attributes2).filter(
          ([attributeName]) => extension.shadowCRUD(contentType2.uid).field(attributeName).hasFiltersEnabeld()
        );
        const isIDFilterEnabled = extension.shadowCRUD(contentType2.uid).field("id").hasFiltersEnabeld();
        if (contentType2.kind === "collectionType" && isIDFilterEnabled) {
          t.field("id", { type: getScalarFilterInputTypeName("ID") });
        }
        for (const [attributeName, attribute] of validAttributes) {
          if (isStrapiScalar(attribute)) {
            addScalarAttribute(t, attributeName, attribute);
          } else if (isRelation(attribute)) {
            addRelationalAttribute(t, attributeName, attribute);
          } else if (isComponent(attribute)) {
            addComponentAttribute(t, attributeName, attribute);
          }
        }
        for (const operator of rootLevelOperators()) {
          operator.add(t, filtersTypeName);
        }
      }
    });
  };
  return {
    buildContentTypeFilters
  };
};
const filters = (context) => ({
  ...contentType(context)
});
const { isWritableAttribute } = contentTypes;
const inputs = ({ strapi: strapi2 }) => {
  const { naming: naming2, mappers: mappers2, attributes: attributes2 } = strapi2.plugin("graphql").service("utils");
  const extension = strapi2.plugin("graphql").service("extension");
  const { getComponentInputName, getContentTypeInputName, getEnumName, getDynamicZoneInputName } = naming2;
  const {
    isStrapiScalar,
    isRelation,
    isMorphRelation,
    isMedia,
    isEnumeration,
    isComponent,
    isDynamicZone
  } = attributes2;
  return {
    buildInputType(contentType2) {
      const { attributes: attributes22, modelType } = contentType2;
      const name = (modelType === "component" ? getComponentInputName : getContentTypeInputName).call(null, contentType2);
      return inputObjectType({
        name,
        definition(t) {
          const isFieldEnabled = (fieldName) => {
            return extension.shadowCRUD(contentType2.uid).field(fieldName).hasInputEnabled();
          };
          const validAttributes = Object.entries(attributes22).filter(([attributeName]) => {
            return isWritableAttribute(contentType2, attributeName) && isFieldEnabled(attributeName);
          });
          if (modelType === "component" && isFieldEnabled("id")) {
            t.id("id");
          }
          validAttributes.forEach(([attributeName, attribute]) => {
            if (isEnumeration(attribute)) {
              const enumTypeName = getEnumName(contentType2, attributeName);
              t.field(attributeName, { type: enumTypeName });
            } else if (isStrapiScalar(attribute)) {
              const gqlScalar = mappers2.strapiScalarToGraphQLScalar(attribute.type);
              t.field(attributeName, { type: gqlScalar });
            } else if (isMedia(attribute)) {
              const isMultiple = attribute.multiple === true;
              if (extension.shadowCRUD("plugin::upload.file").isDisabled()) {
                return;
              }
              if (isMultiple) {
                t.list.id(attributeName);
              } else {
                t.id(attributeName);
              }
            } else if (isRelation(attribute) && !isMorphRelation(attribute)) {
              if (extension.shadowCRUD(attribute.target).isDisabled()) {
                return;
              }
              const isToManyRelation = attribute.relation.endsWith("Many");
              if (isToManyRelation) {
                t.list.id(attributeName);
              } else {
                t.id(attributeName);
              }
            } else if (isComponent(attribute)) {
              const isRepeatable = attribute.repeatable === true;
              const component = strapi2.components[attribute.component];
              const componentInputType = getComponentInputName(component);
              if (isRepeatable) {
                t.list.field(attributeName, { type: componentInputType });
              } else {
                t.field(attributeName, { type: componentInputType });
              }
            } else if (isDynamicZone(attribute)) {
              const dzInputName = getDynamicZoneInputName(contentType2, attributeName);
              t.list.field(attributeName, { type: nonNull(dzInputName) });
            }
          });
        }
      });
    }
  };
};
const genericMorph = ({ strapi: strapi2, registry }) => {
  const { naming: naming2 } = strapi2.plugin("graphql").service("utils");
  const { KINDS: KINDS2, GENERIC_MORPH_TYPENAME: GENERIC_MORPH_TYPENAME2 } = strapi2.plugin("graphql").service("constants");
  return {
    buildGenericMorphDefinition() {
      return unionType({
        name: GENERIC_MORPH_TYPENAME2,
        resolveType(obj) {
          const contentType2 = strapi2.getModel(obj.__type);
          if (!contentType2) {
            return null;
          }
          if (contentType2.modelType === "component") {
            return naming2.getComponentName(contentType2);
          }
          return naming2.getTypeName(contentType2);
        },
        definition(t) {
          const members = registry.where(({ config: config2 }) => [KINDS2.type, KINDS2.component].includes(config2.kind)).map(prop("name"));
          t.members(...members);
        }
      });
    }
  };
};
const { ApplicationError } = errors;
const associationResolvers = ({ strapi: strapi2 }) => {
  const { service: getGraphQLService } = strapi2.plugin("graphql");
  const { isMorphRelation, isMedia } = getGraphQLService("utils").attributes;
  const { transformArgs } = getGraphQLService("builders").utils;
  const { toEntityResponse, toEntityResponseCollection } = getGraphQLService("format").returnTypes;
  return {
    buildAssociationResolver({
      contentTypeUID,
      attributeName
    }) {
      const contentType2 = strapi2.getModel(contentTypeUID);
      const attribute = contentType2.attributes[attributeName];
      if (!attribute) {
        throw new ApplicationError(
          `Failed to build an association resolver for ${contentTypeUID}::${attributeName}`
        );
      }
      const isMediaAttribute = isMedia(attribute);
      const isMorphAttribute = isMorphRelation(attribute);
      const targetUID = isMediaAttribute ? "plugin::upload.file" : attribute.target;
      const isToMany = isMediaAttribute ? attribute.multiple : attribute.relation.endsWith("Many");
      const targetContentType = strapi2.getModel(targetUID);
      return async (parent, args2 = {}, context = {}) => {
        const { auth } = context.state;
        const transformedArgs = transformArgs(args2, {
          contentType: targetContentType,
          usePagination: true
        });
        await validate.contentAPI.query(transformedArgs, targetContentType, {
          auth
        });
        const sanitizedQuery = await sanitize.contentAPI.query(transformedArgs, targetContentType, {
          auth
        });
        const data = await strapi2.entityService.load(
          contentTypeUID,
          parent,
          attributeName,
          sanitizedQuery
        );
        const info = {
          args: sanitizedQuery,
          resourceUID: targetUID
        };
        if (isMorphAttribute) {
          const wrapData = (dataToWrap) => ({ [attributeName]: dataToWrap });
          const sanitizeData = (dataToSanitize) => {
            return sanitize.contentAPI.output(dataToSanitize, contentType2, { auth });
          };
          const unwrapData = get(attributeName);
          const sanitizeMorphAttribute = pipeAsync(wrapData, sanitizeData, unwrapData);
          return sanitizeMorphAttribute(data);
        }
        if (isToMany) {
          return toEntityResponseCollection(data, info);
        }
        return toEntityResponse(data, info);
      };
    }
  };
};
const queriesResolvers = ({ strapi: strapi2 }) => ({
  buildQueriesResolvers({ contentType: contentType2 }) {
    const { uid } = contentType2;
    return {
      async find(parent, args2, ctx) {
        await validate.contentAPI.query(args2, contentType2, {
          auth: ctx?.state?.auth
        });
        const sanitizedQuery = await sanitize.contentAPI.query(args2, contentType2, {
          auth: ctx?.state?.auth
        });
        return strapi2.entityService.findMany(uid, sanitizedQuery);
      },
      async findOne(parent, args2, ctx) {
        await validate.contentAPI.query(args2, contentType2, {
          auth: ctx?.state?.auth
        });
        const sanitizedQuery = await sanitize.contentAPI.query(args2, contentType2, {
          auth: ctx?.state?.auth
        });
        return strapi2.entityService.findOne(uid, args2.id, omit("id", sanitizedQuery));
      }
    };
  }
});
const pickCreateArgs = pick(["params", "data", "files"]);
const mutationsResolvers = ({ strapi: strapi2 }) => ({
  buildMutationsResolvers({ contentType: contentType2 }) {
    const { uid } = contentType2;
    return {
      async create(parent, args2) {
        const params = pickCreateArgs(args2);
        return strapi2.entityService.create(uid, params);
      },
      async update(parent, args2) {
        const { id, data } = args2;
        return strapi2.entityService.update(uid, id, { data });
      },
      async delete(parent, args2, ctx) {
        const { id, ...rest } = args2;
        await validate.contentAPI.query(rest, contentType2, {
          auth: ctx?.state?.auth
        });
        const sanitizedQuery = await sanitize.contentAPI.query(rest, contentType2, {
          auth: ctx?.state?.auth
        });
        return strapi2.entityService.delete(uid, id, sanitizedQuery);
      }
    };
  }
});
const componentResolvers = ({ strapi: strapi2 }) => ({
  buildComponentResolver({
    contentTypeUID,
    attributeName
  }) {
    const { transformArgs } = strapi2.plugin("graphql").service("builders").utils;
    return async (parent, args2, ctx) => {
      const contentType2 = strapi2.getModel(contentTypeUID);
      const { component: componentName } = contentType2.attributes[attributeName];
      const component = strapi2.getModel(componentName);
      const transformedArgs = transformArgs(args2, { contentType: component, usePagination: true });
      await validate.contentAPI.query(transformedArgs, component, {
        auth: ctx?.state?.auth
      });
      const sanitizedQuery = await sanitize.contentAPI.query(transformedArgs, component, {
        auth: ctx?.state?.auth
      });
      return strapi2.entityService.load(contentTypeUID, parent, attributeName, sanitizedQuery);
    };
  }
});
const dynamicZoneResolvers = ({ strapi: strapi2 }) => ({
  buildDynamicZoneResolver({
    contentTypeUID,
    attributeName
  }) {
    return async (parent) => {
      return strapi2.entityService.load(contentTypeUID, parent, attributeName);
    };
  }
});
const resolvers = (context) => ({
  // Generics
  ...associationResolvers(context),
  // Builders
  ...mutationsResolvers(context),
  ...queriesResolvers(context),
  ...componentResolvers(context),
  ...dynamicZoneResolvers(context)
});
const AND_FIELD_NAME = "and";
const andOperator = () => ({
  fieldName: AND_FIELD_NAME,
  strapiOperator: "$and",
  add(t, type) {
    t.field(AND_FIELD_NAME, { type: list(type) });
  }
});
const OR_FIELD_NAME = "or";
const orOperator = () => ({
  fieldName: OR_FIELD_NAME,
  strapiOperator: "$or",
  add(t, type) {
    t.field(OR_FIELD_NAME, { type: list(type) });
  }
});
const NOT_FIELD_NAME = "not";
const notOperator = ({ strapi: strapi2 }) => ({
  fieldName: NOT_FIELD_NAME,
  strapiOperator: "$not",
  add(t, type) {
    const { naming: naming2, attributes: attributes2 } = strapi2.plugin("graphql").service("utils");
    if (attributes2.isGraphQLScalar({ type })) {
      t.field(NOT_FIELD_NAME, { type: naming2.getScalarFilterInputTypeName(type) });
    } else {
      t.field(NOT_FIELD_NAME, { type });
    }
  }
});
const { ValidationError } = errors;
const EQ_FIELD_NAME = "eq";
const eqOperator = ({ strapi: strapi2 }) => ({
  fieldName: EQ_FIELD_NAME,
  strapiOperator: "$eq",
  add(t, type) {
    const { GRAPHQL_SCALARS: GRAPHQL_SCALARS2 } = strapi2.plugin("graphql").service("constants");
    if (!GRAPHQL_SCALARS2.includes(type)) {
      throw new ValidationError(
        `Can't use "${EQ_FIELD_NAME}" operator. "${type}" is not a valid scalar`
      );
    }
    t.field(EQ_FIELD_NAME, { type });
  }
});
const EQI_FIELD_NAME = "eqi";
const eqiOperator = () => ({
  fieldName: EQI_FIELD_NAME,
  strapiOperator: "$eqi",
  add(t, type) {
    t.field(EQI_FIELD_NAME, { type });
  }
});
const NE_FIELD_NAME = "ne";
const neOperator = () => ({
  fieldName: NE_FIELD_NAME,
  strapiOperator: "$ne",
  add(t, type) {
    t.field(NE_FIELD_NAME, { type });
  }
});
const NEI_FIELD_NAME = "nei";
const neiOperator = () => ({
  fieldName: NEI_FIELD_NAME,
  strapiOperator: "$nei",
  add(t, type) {
    t.field(NEI_FIELD_NAME, { type });
  }
});
const STARTS_WITH_FIELD_NAME = "startsWith";
const startsWithOperator = () => ({
  fieldName: STARTS_WITH_FIELD_NAME,
  strapiOperator: "$startsWith",
  add(t, type) {
    t.field(STARTS_WITH_FIELD_NAME, { type });
  }
});
const ENDS_WITH_FIELD_NAME = "endsWith";
const endsWithOperator = () => ({
  fieldName: ENDS_WITH_FIELD_NAME,
  strapiOperator: "$endsWith",
  add(t, type) {
    t.field(ENDS_WITH_FIELD_NAME, { type });
  }
});
const CONTAINS_FIELD_NAME = "contains";
const containsOperator = () => ({
  fieldName: CONTAINS_FIELD_NAME,
  strapiOperator: "$contains",
  add(t, type) {
    t.field(CONTAINS_FIELD_NAME, { type });
  }
});
const NOT_CONTAINS_FIELD_NAME = "notContains";
const notContainsOperator = () => ({
  fieldName: NOT_CONTAINS_FIELD_NAME,
  strapiOperator: "$notContains",
  add(t, type) {
    t.field(NOT_CONTAINS_FIELD_NAME, { type });
  }
});
const CONTAINSI_FIELD_NAME = "containsi";
const containsiOperator = () => ({
  fieldName: CONTAINSI_FIELD_NAME,
  strapiOperator: "$containsi",
  add(t, type) {
    t.field(CONTAINSI_FIELD_NAME, { type });
  }
});
const NOT_CONTAINSI_FIELD_NAME = "notContainsi";
const notContainsiOperator = () => ({
  fieldName: NOT_CONTAINSI_FIELD_NAME,
  strapiOperator: "$notContainsi",
  add(t, type) {
    t.field(NOT_CONTAINSI_FIELD_NAME, { type });
  }
});
const GT_FIELD_NAME = "gt";
const gtOperator = () => ({
  fieldName: GT_FIELD_NAME,
  strapiOperator: "$gt",
  add(t, type) {
    t.field(GT_FIELD_NAME, { type });
  }
});
const GTE_FIELD_NAME = "gte";
const gteOperator = () => ({
  fieldName: GTE_FIELD_NAME,
  strapiOperator: "$gte",
  add(t, type) {
    t.field(GTE_FIELD_NAME, { type });
  }
});
const LT_FIELD_NAME = "lt";
const ltOperator = () => ({
  fieldName: LT_FIELD_NAME,
  strapiOperator: "$lt",
  add(t, type) {
    t.field(LT_FIELD_NAME, { type });
  }
});
const LTE_FIELD_NAME = "lte";
const lteOperator = () => ({
  fieldName: LTE_FIELD_NAME,
  strapiOperator: "$lte",
  add(t, type) {
    t.field(LTE_FIELD_NAME, { type });
  }
});
const NULL_FIELD_NAME = "null";
const nullOperator = () => ({
  fieldName: NULL_FIELD_NAME,
  strapiOperator: "$null",
  add(t) {
    t.boolean(NULL_FIELD_NAME);
  }
});
const NOT_NULL_FIELD_NAME = "notNull";
const notNullOperator = () => ({
  fieldName: NOT_NULL_FIELD_NAME,
  strapiOperator: "$notNull",
  add(t) {
    t.boolean(NOT_NULL_FIELD_NAME);
  }
});
const IN_FIELD_NAME = "in";
const inOperator = () => ({
  fieldName: IN_FIELD_NAME,
  strapiOperator: "$in",
  add(t, type) {
    t.field(IN_FIELD_NAME, { type: list(type) });
  }
});
const NOT_IN_FIELD_NAME = "notIn";
const notInOperator = () => ({
  fieldName: NOT_IN_FIELD_NAME,
  strapiOperator: "$notIn",
  add(t, type) {
    t.field(NOT_IN_FIELD_NAME, { type: list(type) });
  }
});
const BETWEEN_FIELD_NAME = "between";
const betweenOperator = () => ({
  fieldName: BETWEEN_FIELD_NAME,
  strapiOperator: "$between",
  add(t, type) {
    t.field(BETWEEN_FIELD_NAME, { type: list(type) });
  }
});
const operators = {
  and: andOperator,
  or: orOperator,
  not: notOperator,
  eq: eqOperator,
  eqi: eqiOperator,
  ne: neOperator,
  nei: neiOperator,
  startsWith: startsWithOperator,
  endsWith: endsWithOperator,
  contains: containsOperator,
  notContains: notContainsOperator,
  containsi: containsiOperator,
  notContainsi: notContainsiOperator,
  gt: gtOperator,
  gte: gteOperator,
  lt: ltOperator,
  lte: lteOperator,
  null: nullOperator,
  notNull: notNullOperator,
  in: inOperator,
  notIn: notInOperator,
  between: betweenOperator
};
const operators$1 = ({ strapi: strapi2 }) => mapValues((opCtor) => opCtor({ strapi: strapi2 }), operators);
const { withDefaultPagination } = pagination$1;
const { hasDraftAndPublish } = contentTypes;
const utils = ({ strapi: strapi2 }) => {
  const { service: getService } = strapi2.plugin("graphql");
  return {
    /**
     * Get every args for a given content type
     * @param {object} contentType
     * @param {object} options
     * @param {boolean} options.multiple
     * @return {object}
     */
    getContentTypeArgs(contentType2, { multiple = true } = {}) {
      const { naming: naming2 } = getService("utils");
      const { args: args2 } = getService("internals");
      const { modelType } = contentType2;
      if (modelType === "component") {
        if (!multiple)
          return {};
        return {
          filters: naming2.getFiltersInputTypeName(contentType2),
          pagination: args2.PaginationArg,
          sort: args2.SortArg
        };
      }
      const { kind } = contentType2;
      if (kind === "collectionType") {
        if (!multiple) {
          return { id: "ID" };
        }
        const params = {
          filters: naming2.getFiltersInputTypeName(contentType2),
          pagination: args2.PaginationArg,
          sort: args2.SortArg
        };
        if (hasDraftAndPublish(contentType2)) {
          Object.assign(params, { publicationState: args2.PublicationStateArg });
        }
        return params;
      }
      if (kind === "singleType") {
        const params = {};
        if (hasDraftAndPublish(contentType2)) {
          Object.assign(params, { publicationState: args2.PublicationStateArg });
        }
        return params;
      }
    },
    /**
     * Filter an object entries and keep only those whose value is a unique scalar attribute
     */
    getUniqueScalarAttributes(attributes2) {
      const { isStrapiScalar } = getService("utils").attributes;
      const uniqueAttributes = entries(attributes2).filter(
        ([, attribute]) => isStrapiScalar(attribute) && "unique" in attribute && attribute.unique
      );
      return Object.fromEntries(uniqueAttributes);
    },
    /**
     * Map each value from an attribute to a FiltersInput type name
     * @param {object} attributes - The attributes object to transform
     * @return {Object<string, string>}
     */
    scalarAttributesToFiltersMap(attributes2) {
      return mapValues((attribute) => {
        const { mappers: mappers2, naming: naming2 } = getService("utils");
        const gqlScalar = mappers2.strapiScalarToGraphQLScalar(attribute.type);
        return naming2.getScalarFilterInputTypeName(gqlScalar);
      }, attributes2);
    },
    /**
     * Apply basic transform to GQL args
     */
    transformArgs(args2, {
      contentType: contentType2,
      usePagination = false
    }) {
      const { mappers: mappers2 } = getService("utils");
      const { config: config2 } = strapi2.plugin("graphql");
      const { pagination: pagination2 = {}, filters: filters2 = {} } = args2;
      const newArgs = omit(["pagination", "filters"], args2);
      if (usePagination) {
        const defaultLimit = config2("defaultLimit");
        const maxLimit = config2("maxLimit");
        Object.assign(
          newArgs,
          withDefaultPagination(pagination2, {
            maxLimit,
            defaults: {
              offset: { limit: defaultLimit },
              page: { pageSize: defaultLimit }
            }
          })
        );
      }
      if (args2.filters) {
        Object.assign(newArgs, {
          filters: mappers2.graphQLFiltersToStrapiQuery(filters2, contentType2)
        });
      }
      return newArgs;
    }
  };
};
const buildersFactories = [
  enums,
  dynamicZone,
  entity,
  entityMeta,
  typeBuilder,
  response,
  responseCollection,
  relationResponseCollection,
  queries,
  mutations,
  filters,
  inputs,
  genericMorph,
  resolvers
];
const builders = ({ strapi: strapi2 }) => {
  const buildersMap = /* @__PURE__ */ new Map();
  return {
    /**
     * Instantiate every builder with a strapi instance & a type registry
     */
    new(name, registry) {
      const context = { strapi: strapi2, registry };
      const builders2 = pipe(
        // Create a new instance of every builders
        map((factory) => factory(context)),
        // Merge every builder into the same object
        reduce(merge$1, {})
      ).call(null, buildersFactories);
      buildersMap.set(name, builders2);
      return builders2;
    },
    /**
     * Delete a set of builders instances from
     * the builders map for a given name
     */
    delete(name) {
      buildersMap.delete(name);
    },
    /**
     * Retrieve a set of builders instances from
     * the builders map for a given name
     */
    get(name) {
      return buildersMap.get(name);
    },
    filters: {
      operators: operators$1({ strapi: strapi2 })
    },
    utils: utils({ strapi: strapi2 })
  };
};
const getDefaultContentTypeConfig = () => ({
  enabled: true,
  mutations: true,
  queries: true,
  disabledActions: [],
  fields: /* @__PURE__ */ new Map()
});
const getDefaultFieldConfig = () => ({
  enabled: true,
  input: true,
  output: true,
  filters: true
});
const ALL_ACTIONS = "*";
const createShadowCRUDManager = () => {
  const configs = /* @__PURE__ */ new Map();
  return (uid) => {
    if (!configs.has(uid)) {
      configs.set(uid, getDefaultContentTypeConfig());
    }
    return {
      isEnabled() {
        return configs.get(uid).enabled;
      },
      isDisabled() {
        return !this.isEnabled();
      },
      areQueriesEnabled() {
        return configs.get(uid).queries;
      },
      areQueriesDisabled() {
        return !this.areQueriesEnabled();
      },
      areMutationsEnabled() {
        return configs.get(uid).mutations;
      },
      areMutationsDisabled() {
        return !this.areMutationsEnabled();
      },
      isActionEnabled(action) {
        const matchingActions = [action, ALL_ACTIONS];
        return configs.get(uid).disabledActions.every((action2) => !matchingActions.includes(action2));
      },
      isActionDisabled(action) {
        return !this.isActionEnabled(action);
      },
      disable() {
        configs.get(uid).enabled = false;
        return this;
      },
      disableQueries() {
        configs.get(uid).queries = false;
        return this;
      },
      disableMutations() {
        configs.get(uid).mutations = false;
        return this;
      },
      disableAction(action) {
        const config2 = configs.get(uid);
        if (!config2.disabledActions.includes(action)) {
          config2.disabledActions.push(action);
        }
        return this;
      },
      disableActions(actions = []) {
        actions.forEach((action) => this.disableAction(action));
        return this;
      },
      field(fieldName) {
        const { fields } = configs.get(uid);
        if (!fields.has(fieldName)) {
          fields.set(fieldName, getDefaultFieldConfig());
        }
        return {
          isEnabled() {
            return fields.get(fieldName).enabled;
          },
          hasInputEnabled() {
            return fields.get(fieldName).input;
          },
          hasOutputEnabled() {
            return fields.get(fieldName).output;
          },
          hasFiltersEnabeld() {
            return fields.get(fieldName).filters;
          },
          disable() {
            fields.set(fieldName, {
              enabled: false,
              output: false,
              input: false,
              filters: false
            });
            return this;
          },
          disableOutput() {
            fields.get(fieldName).output = false;
            return this;
          },
          disableInput() {
            fields.get(fieldName).input = false;
            return this;
          },
          disableFilters() {
            fields.get(fieldName).filters = false;
            return this;
          }
        };
      }
    };
  };
};
const getDefaultState = () => ({
  types: [],
  typeDefs: [],
  resolvers: {},
  resolversConfig: {},
  plugins: []
});
const createExtension = ({ strapi: strapi2 }) => {
  const configs = [];
  return {
    shadowCRUD: createShadowCRUDManager(),
    /**
     * Register a new extension configuration
     */
    use(configuration) {
      configs.push(configuration);
      return this;
    },
    /**
     * Convert the registered configuration into a single extension object & return it
     */
    generate({ typeRegistry: typeRegistry2 }) {
      const resolveConfig = (config2) => {
        return typeof config2 === "function" ? config2({ strapi: strapi2, nexus, typeRegistry: typeRegistry2 }) : config2;
      };
      return configs.reduce((acc, configuration) => {
        const { types: types2, typeDefs, resolvers: resolvers2, resolversConfig, plugins } = resolveConfig(configuration);
        if (typeof typeDefs === "string") {
          acc.typeDefs.push(typeDefs);
        }
        if (Array.isArray(types2)) {
          acc.types.push(...types2);
        }
        if (Array.isArray(plugins)) {
          acc.plugins.push(...plugins);
        }
        if (typeof resolvers2 === "object") {
          acc.resolvers = merge$1(acc.resolvers, resolvers2);
        }
        if (typeof resolversConfig === "object") {
          acc.resolversConfig = merge$1(resolversConfig, acc.resolversConfig);
        }
        return acc;
      }, getDefaultState());
    }
  };
};
const returnTypes = () => ({
  toEntityResponse(value, info = {}) {
    const { args: args2 = {}, resourceUID } = info;
    return { value, info: { args: args2, resourceUID } };
  },
  toEntityResponseCollection(nodes, info = {}) {
    const { args: args2 = {}, resourceUID } = info;
    return { nodes, info: { args: args2, resourceUID } };
  }
});
const format = () => ({
  returnTypes: returnTypes()
});
const services = {
  builders,
  "content-api": contentAPI,
  constants,
  extension: createExtension,
  format,
  internals,
  "type-registry": typeRegistry,
  utils: utils$1
};
const index = {
  config,
  bootstrap,
  services
};
export {
  index as default
};
//# sourceMappingURL=index.mjs.map
