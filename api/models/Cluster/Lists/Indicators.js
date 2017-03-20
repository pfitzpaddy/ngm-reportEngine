/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

// 2016 legacy indicators
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
		elderly_men:{
			type: 'integer',
			defaultsTo: 0
		},
		elderly_women:{
			type: 'integer',
			defaultsTo: 0
		},
		conflict_trauma_treated:{
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

