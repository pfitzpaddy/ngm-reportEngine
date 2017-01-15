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

		// 2017 
		// esnfi
		families: {
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
		
		// 2016
		conflict_trauma_treated:{
			type: 'integer',
			defaultsTo: 0
		},

		// 2017

		// fatp
    boys_first_aid_stabalization:{
			type: 'integer',
			defaultsTo: 0
		},
    girls_first_aid_stabalization:{
			type: 'integer',
			defaultsTo: 0
		},
    men_first_aid_stabalization:{
			type: 'integer',
			defaultsTo: 0
		},
    women_first_aid_stabalization:{
			type: 'integer',
			defaultsTo: 0
		},

    // tcu
    boys_physical_rehabilitation:{
			type: 'integer',
			defaultsTo: 0
		},
    girls_physical_rehabilitation:{
			type: 'integer',
			defaultsTo: 0
		},
    men_physical_rehabilitation:{
			type: 'integer',
			defaultsTo: 0
		},
    women_physical_rehabilitation:{
			type: 'integer',
			defaultsTo: 0
		},

    // tcu minor
    boys_minor_surgeries:{
			type: 'integer',
			defaultsTo: 0
		},
    girls_minor_surgeries:{
			type: 'integer',
			defaultsTo: 0
		},
    men_minor_surgeries:{
			type: 'integer',
			defaultsTo: 0
		},
    women_minor_surgeries:{
			type: 'integer',
			defaultsTo: 0
		},

    // tcu major
    boys_major_surgeries:{
			type: 'integer',
			defaultsTo: 0
		},
    girls_major_surgeries:{
			type: 'integer',
			defaultsTo: 0
		},
    men_major_surgeries:{
			type: 'integer',
			defaultsTo: 0
		},
    women_major_surgeries:{
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
		measles_vacc_male_under1:{
			type: 'integer',
			defaultsTo: 0
		},
		measles_vacc_female_under1:{
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

		// education
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
		
		// 2017 capacity_building -> training
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

