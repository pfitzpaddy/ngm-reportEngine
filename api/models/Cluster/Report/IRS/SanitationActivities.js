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

		// quantity of service
		quantity: {
			type: 'float'
		},

		// quantity measurement
		quantity_measurement_id: {
			type: 'string'
		},
		quantity_measurement_name: {
			type: 'string'
		},

		// stipend
		stipend_id: {
			type: 'string',
		},
		stipend_name: {
			type: 'string',
		},

		// stipend amount
		stipend_amount: {
			type: 'float',
		},

		// gender_marking
		gender_marking_id: {
			type: 'string',
		},
		gender_marking_name: {
			type: 'string',
		},

		// lock installation
		lock_installation_id: {
			type: 'string',
		},
		gender_marking_name: {
			type: 'string',
		},

		// inputs
		male:{
			type: 'integer',
			defaultsTo: 0
		},
		female:{
			type: 'integer',
			defaultsTo: 0
		},

		// inputs
		male_disabled:{
			type: 'integer',
			defaultsTo: 0
		},
		female_disabled:{
			type: 'integer',
			defaultsTo: 0
		},

		// gender marking

		// latrine lock installation

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
    }

	}

};

