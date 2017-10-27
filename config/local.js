/**
 * Local environment settings
 *
 * For more information, check out:
 */

module.exports = {
	connections: {
		ngmReportHubServer: {
			adapter: 'sails-mongo',
			host: 'localhost',
			port: 27017,
			// user: 'username',
			// password: 'password',
			database: 'ngmReportHub',
			schema: true
		},
		ngmHealthClusterServer: {
			adapter: 'sails-mongo',
			host: 'localhost',
			port: 27017,
			// user: 'username',
			// password: 'password',
			database: 'ngmHealthCluster',
			schema: true
		},
		ngmEprServer: {
			adapter: 'sails-mongo',
			host: 'localhost',
			port: 27017,
			// user: 'username',
			// password: 'password',
			database: 'ngmEpr',
			schema: false
		},
		ngmPostgreServer: {
			adapter: 'sails-postgresql',
			host: 'localhost',
			port: 5432,
			user: 'ngmadmin',
			password: 'ngmadmin',
			database: 'immap_afg'
		}
	}
}
