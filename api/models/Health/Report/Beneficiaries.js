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
		// user/project
		organization_id: {
			type: 'string',
			required: true
		},
		organization: {
			type: 'string',
			required: true
		},
		cluster_id: {
			type: 'string',
			required: true
		},
		cluster: {
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
		activity_type: {
			type: 'array'//,
			// required: true
		},
		activity_description: {
			type: 'array'//,
			// required: true
		},
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
		admin1pcode: {
			type: 'string',
			required: true
		},
		admin1name: {
			type: 'string',
			required: true
		},
		admin2pcode: {
			type: 'string',
			required: true
		},
		admin2name: {
			type: 'string',
			required: true
		},
		report_id: {
			type: 'string',
			required: true
		},
		report_month: {
			type: 'integer',
			required: true
		},
		report_year: {
			type: 'integer',
			required: true
		},
		reporting_period: {
			type: 'date',
			required: true
		},
		// add a reference to Location
    location_id: {
      model: 'location'
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
			type: 'string',
			required: true
		},
		fac_name: {
			type: 'string',
			required: true
		},
		admin1lng: {
			type: 'float',
			required: true
		},
		admin1lat: {
			type: 'float',
			required: true
		},
		admin2lng: {
			type: 'float',
			required: true
		},
		admin2lat: {
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
		boys:{
			type: 'integer',
			defaultsTo: 0			
		},
		girls:{
			type: 'integer',
			defaultsTo: 0
		},
		men:{
			type: 'integer',
			defaultsTo: 0
		},
		women:{
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
		},
		capacity_building_topic: {
			type: 'string'
		},		
		capacity_building_sessions:{
			type: 'integer',
			defaultsTo: 0
		},
		capacity_building_male:{
			type: 'integer',
			defaultsTo: 0
		},
		capacity_building_female:{
			type: 'integer',
			defaultsTo: 0
		},
		education_topic: {
			type: 'string'
		},		
		education_sessions:{
			type: 'integer',
			defaultsTo: 0
		},
		education_male:{
			type: 'integer',
			defaultsTo: 0
		},
		education_female:{
			type: 'integer',
			defaultsTo: 0
		}
		
	}

};

