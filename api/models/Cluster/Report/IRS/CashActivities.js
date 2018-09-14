/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	// connection
	connection: 'ngmIRSServer',

	// strict schema
	schema: true,

	// attributes
	attributes: {

		// add a reference to beneficiaries
		beneficiary_id: {
			model: 'beneficiaries'
		},

		// quantity of cash
		quantity: {
			type: 'float',
			defaultsTo: 0
		},

		// quantity measurement
		quantity_measurement_id: {
			type: 'string',
			defaultsTo: 'naira'
		},
		quantity_measurement_name: {
			type: 'string',
			defaultsTo: 'Naira'
		},

		// stores activity details
		details: {
			type: 'array',
		},

		// activities
		activity_start_date:{
			type: 'date',
			required: true
		},
		activity_end_date:{
			type: 'date',
			required: true
		},

		// to match beneficiaries
		cash_amount: {
			type: 'float',
			defaultsTo: 0
		},
		// popn
		households:{
			type: 'integer',
			defaultsTo: 0
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
		elderly_men:{
			type: 'integer',
			defaultsTo: 0
		},
		elderly_women:{
			type: 'integer',
			defaultsTo: 0
    },

		// total_beneficiaries 
		total_beneficiaries: {
			type: 'integer',
			defaultsTo: 0
		},

	}

};

