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
		project_id: {
			type: 'string'
		},
		project_title: {
			type: 'string'
		},
		project_type: {
			type: 'string'
		},
		// add a reference to Location
    location_id: {
      model: 'location'
    },
		username: {
			type: 'string',
			required: true
		},
		email: {
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
		beneficiary_name: {
			type: 'string',
			required: true
		},
		beneficiary_type: {
			type: 'string',
			required: true
		},
		under5male:{
			type: 'integer',
			defaultsTo: 0			
		},
		under5female:{
			type: 'integer',
			defaultsTo: 0
		},
		over5male:{
			type: 'integer',
			defaultsTo: 0
		},
		over5female:{
			type: 'integer',
			defaultsTo: 0
		},
		penta3_vacc_male_under1:{
			type: 'integer',
			defaultsTo: 0
		},
		penta3_vacc_female_under1:{
			type: 'integer',
			defaultsTo: 0
		},
		skilled_birth_attendant:{
			type: 'integer',
			defaultsTo: 0
		},
		conflict_trauma_treated:{
			type: 'integer',
			defaultsTo: 0
		}

	},

	// add project_id from locations 
	beforeCreate: function( $beneficiaries, next ) {

		// get location
		Location.findOne().where( { id: $beneficiaries.location_id } ).exec(function(err, location){

			// return error
			if ( err ) return next( err );

			// add project details
			$beneficiaries.project_id = location.project_id;
			$beneficiaries.project_title = location.project_title;
			$beneficiaries.project_title = location.project_type;

			// 'next!'
			next();

		});

	}

};

