const axios = require('axios');

module.exports = {
    async sendEmail(ctx) {
        const { email, name, message, recaptcha } = ctx.request ? ctx.request.body : ctx.args.input;

        // Verify reCAPTCHA
        try {
            const recaptchaVerify = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
                {
                    params: {
                        secret: process.env.RECAPTCHA_SECRET_KEY_PROD,
                        response: recaptcha
                    }
                }
            );

            if (!recaptchaVerify.data.success) {
                console.log('reCAPTCHA verification failed:', recaptchaVerify.data);
                return { success: false, message: 'reCAPTCHA verification failed' };
            }
        } catch (error) {
            console.error('reCAPTCHA verification error:', error);
            return { success: false, message: 'reCAPTCHA verification failed' };
        }

        try {
            await strapi.plugins['email'].services.email.send({
                to: 'recipient@example.com',
                from: email, // or use a default email address
                subject: `Contact Form Message From: ${name}`,
                text: message,
            });

            const response = { success: true, message: 'Email sent successfully!' };

            // If it's a REST request, use ctx.send
            if (ctx.send) {
                return ctx.send(response);
            }

            // If it's a GraphQL request, just return the response
            return response;
        } catch (err) {
            const error = new Error('Failed to send email');
            error.status = 500;
            throw error;
        }
    },
};