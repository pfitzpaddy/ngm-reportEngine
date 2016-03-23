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
		// add a reference to Project
		project_id: {
			model: 'project'
		},
		project_title: {
			type: 'string'
		},
		project_type: {
			type: 'string'
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
			type: 'integer',
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
		lng: {
			type: 'float',
			required: true
		},
		lat: {
			type: 'float',
			required: true
		},
    // add reference to Beneficiaries
    beneficiaries: {
      collection: 'beneficiaries',
      via: 'location_id'
    },
    timestamp: {
    	type: 'string',
    	required: true
    }
	},

	// add project_id from locations 
	beforeCreate: function( $location, next ) {

		// get location
		Project.findOne().where( { id: $location.project_id } ).exec(function(err, project){

			// add project details
			$location.project_title = project.project_title;
			$location.project_type = project.project_type;

			// 'next!'
			next();

		});

	}

};

