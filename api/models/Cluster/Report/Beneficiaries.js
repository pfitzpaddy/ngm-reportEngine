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
		// 2016
		project_type: {
			type: 'array'
		},
		project_type_other: {
			type: 'string'
		},
		project_description: {
			type: 'string'
		},
		// 2017
		activity_type: {
			type: 'string',
			required: true
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
			type: 'string'
		},
		fac_type_name: {
			type: 'string'
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
		// default
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
		// referral
		// 2016
		male_referrals:{
			type: 'integer',
			defaultsTo: 0
		},
		female_referrals:{
			type: 'integer',
			defaultsTo: 0
		},
		// 2017		
		boys_referral:{
			type: 'integer',
			defaultsTo: 0			
		},
		girls_referral:{
			type: 'integer',
			defaultsTo: 0
		},
		men_referral:{
			type: 'integer',
			defaultsTo: 0
		},
		women_referral:{
			type: 'integer',
			defaultsTo: 0
		},

		// conflict
		first_aid_stabalization:{
			type: 'integer',
			defaultsTo: 0
		},
		physical_rehabilitation: {
			type: 'integer',
			defaultsTo: 0
		},
		minor_surgeries:{
			type: 'integer',
			defaultsTo: 0
		},
		major_surgeries:{
			type: 'integer',
			defaultsTo: 0
		},

		// is this not the above
		conflict_trauma_treated:{
			type: 'integer',
			defaultsTo: 0
		},

		// vacinations
		// 2016
		penta3_vacc_male_under1:{
			type: 'integer',
			defaultsTo: 0
		},
		penta3_vacc_female_under1:{
			type: 'integer',
			defaultsTo: 0
		},
		// 2017
		vacc_male_under1:{
			type: 'integer',
			defaultsTo: 0
		},
		vacc_female_under1:{
			type: 'integer',
			defaultsTo: 0
		},

		// mch
		antenatal_care:{
			type: 'integer',
			defaultsTo: 0
		},
		postnatal_care:{
			type: 'integer',
			defaultsTo: 0
		},		
		skilled_birth_attendant:{
			type: 'integer',
			defaultsTo: 0
		},

		// training/capacity building
		// 2017
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
		},
		// 2017
		training_topic: {
			type: 'string'
		},		
		training_sessions:{
			type: 'integer',
			defaultsTo: 0
		},
		training_male:{
			type: 'integer',
			defaultsTo: 0
		},
		training_female:{
			type: 'integer',
			defaultsTo: 0
		}
		
	}

};

