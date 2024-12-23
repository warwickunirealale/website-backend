module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');
    extensionService.use(({ nexus }) => {
      const SendEmailResponse = nexus.objectType({
        name: 'SendEmailResponse',
        definition(t) {
          t.boolean('success');
          t.string('message');
        },
      });

      const sendEmailMutation = nexus.extendType({
        type: 'Mutation',
        definition(t) {
          t.field('sendEmail', {
            type: 'SendEmailResponse',
            args: {
              input: nexus.inputObjectType({
                name: 'SendEmailInput',
                definition(t) {
                  t.nonNull.string('email');
                  t.nonNull.string('name')
                  t.nonNull.string('message');
                  t.nonNull.string('recaptcha');
                },
              }),
            },
            resolve: async (_, { input }, ctx) => {
              const { email, name, message, recaptcha } = input;
              return await strapi.controller('api::contact.contact').sendEmail({
                request: { body: { email, name, message, recaptcha } },
              });
            },
          });
        },
      });

      return {
        types: [SendEmailResponse, sendEmailMutation],
        resolversConfig: {
          'Mutation.sendEmail': {
            auth: false, // Set this to true if you want to require authentication
          },
        },
      };
    });
  },
};