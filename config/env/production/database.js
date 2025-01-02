module.exports =  ({ env }) => ({
	connection: {
		client: 'postgres',
		connection: {
		host: env('DATABASE_HOST', 'localhost'),
			port: env.int('DATABASE_PORT', 5432),
			database: env('DATABASE_NAME', 'strapi'),
			user: env('DATABASE_USERNAME', 'wuras-admin'),
			password: env('DATABASE_PASSWORD', 'M0R3Be3r73'),
			ssl: env.bool('DATABASE_SSL', false)
		}
	}
});
