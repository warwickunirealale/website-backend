module.exports =  ({ env }) => ({
	connection: {
		client: 'mysql2',
		connection: {
		host: env('DATABASE_HOST', 'strapiDB'),
			port: env.int('DATABASE_PORT', 3306),
			database: env('DATABASE_NAME', 'strapi'),
			user: env('DATABASE_USERNAME', 'strapi'),
			password: env('DATABASE_PASSWORD', 'Wur4s1973'),
			ssl: env.bool('DATABASE_SSL', false),
			connectTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000), // 60 seconds
		}
	}
});
