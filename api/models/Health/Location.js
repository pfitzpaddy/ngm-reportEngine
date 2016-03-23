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
		project_id: {
			type: 'string',
			required: true
		},
		project_title: {
			type: 'string'
		},
		prov_code: {
			type: 'integer'
		},
		prov_name: {
			type: 'string'
		},
		dist_code: {
			type: 'integer'
		},
		dist_name: {
			type: 'string'
		},
		conflict: {
			type: 'boolean'
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
			type: 'float'
		},
		lat: {
			type: 'float'
		},
    // add reference to Beneficiaries
    beneficiaries: {
      collection: 'beneficiaries',
      via: 'location_id'
    }
	}

};

