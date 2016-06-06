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
		// add a reference to Location
    location_id: {
      model: 'location'
    },
		project_title: {
			type: 'string'
		},
		project_type: {
			type: 'string'
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
		fac_type: {
			type: 'string',
			required: true
		},
		fac_name: {
			type: 'string',
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

