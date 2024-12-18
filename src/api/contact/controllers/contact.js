module.exports = {
    async sendEmail(ctx) {
        const { email, message } = ctx.request.body;

        if (!email || !message) {
            return ctx.badRequest('Email and message are required');
        }

        try {
            await strapi.plugins['email'].services.email.send({
                to: 'recipient@example.com',
                from: email, // or use a default email address
                subject: 'Contact Form Message',
                text: message,
            });

            ctx.send({ success: true, message: 'Email sent successfully!' });
        } catch (err) {
            ctx.send({ success: false, message: 'Failed to send email' });
        }
    },
};