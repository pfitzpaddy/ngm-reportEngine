/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	// connection
	connection: 'ngmHealthClusterServer',

	// strict schema
	schema: true,

	// attributes
	attributes: {
		organization_id: {
			type: 'string',
			required: true
		},
		project_id: {
			type: 'string',
			required: true
		},
		user_id: {
			type: 'integer',
			required: true
		},
		username: {
			type: 'string',
			required: true
		},
		project_title: {
			type: 'string',
			required: true
		},
		prov_code: {
			type: 'integer',
			required: true
		},
		prov_name: {
			type: 'string',
			required: true
		},
		dist_code: {
			type: 'integer',
			required: true
		},
		dist_name: {
			type: 'string',
			required: true
		},
		conflict: {
			type: 'boolean',
			required: true
		},
		fac_id: {
			type: 'integer'
		},
		fac_type: {
			type: 'string'
		},
		fac_name: {
			type: 'string'
		},
		lng: {
			type: 'float',
			required: true
		},
		lat: {
			type: 'float',
			required: true
		}
	}

};

