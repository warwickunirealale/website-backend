module.exports = ({ env }) => ({
    email: {
        config: {
            provider: 'nodemailer',
            providerOptions: {
                host: env('SMTP_HOST'), // The SMTP server (e.g., Gmail)
                port: env.int('SMTP_PORT'), // Port for TLS (use 465 for SSL)
                auth: {
                    user: env('SMTP_USER'), // Your email address
                    pass: env('SMTP_PASSWORD'), // Your email password or app-specific password
                },
                // Optional: Add additional options here if needed
                secure: false, // Use true for 465, false for other ports
            },
            settings: {
                defaultFrom: env('SMTP_USER'), // Default sender email
                defaultReplyTo: env('SMTP_USER'), // Default reply-to email
            },
        },
    },
    graphql: {
        config: {
            endpoint: '/graphql',
            shadowCRUD: true,
            landingPage: false,
            depthLimit: 7,
            amountLimit: 100,
            apolloServer: {
                tracing: false,
            },
        },
    },
});