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
		// add a reference to Report
		report_id: {
			model: 'report'
		},
		organization_id: {
			type: 'string',
			required: true
		},
		project_id: {
			type: 'string',
			required: true
		},
		organization: {
			type: 'string',
			required: true
		},
		username: {
			type: 'string',
			required: true
		},
		email: {
			type: 'string',
			required: true
		},
		project_title: {
			type: 'string',
			required: true
		},
		project_type: {
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
		fac_type: {
			type: 'string',
			required: true
		},
		fac_name: {
			type: 'string',
			required: true
		},
		prov_lng: {
			type: 'float',
			required: true
		},
		prov_lat: {
			type: 'float',
			required: true
		},
		dist_lng: {
			type: 'float',
			required: true
		},
		dist_lat: {
			type: 'float',
			required: true
		},
    // add reference to Beneficiaries
    beneficiaries: {
      collection: 'beneficiaries',
      via: 'location_id'
    }
	}

};

