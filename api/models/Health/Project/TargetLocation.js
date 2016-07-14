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
		// region/country id
    adminRpcode: {
			type: 'string',
			required: true
    },
    adminRname: {
			type: 'string',
			required: true
    },
    admin0pcode: {
			type: 'string',
			required: true
    },
    admin0name: {
			type: 'string',
			required: true
    },
		organization_id: {
			type: 'string',
			required: true
		},
		organization: {
			type: 'string',
			required: true
		},
		// add a reference to Project
		project_id: {
			model: 'project'
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
		fac_type: {
			type: 'string',
			required: true
		},
		fac_type_name: {
			type: 'string'
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

