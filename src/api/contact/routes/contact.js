module.exports = {
    routes: [
      {
        method: 'POST',
        path: '/contact',
        handler: 'contact.sendEmail',
        config: {
          policies: ['api::contact.is-authenticated'],
        },
      },
    ],
  };