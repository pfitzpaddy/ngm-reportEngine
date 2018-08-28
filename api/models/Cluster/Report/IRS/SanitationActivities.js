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
			type: 'float',
			defaultsTo: 0
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
		stipend_amount: {
			type: 'float',
		},

		// committee_rotation
		committee_rotation_id: {
			type: 'string',
		},
		committee_rotation_name: {
			type: 'string',
		},
		committee_rotation_per_month: {
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
		lock_installation_name: {
			type: 'string',
		},

		// facility_status
		facility_status_id: {
			type: 'string',
		},
		facility_status_name: {
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
    },

		// total_beneficiaries 
		total_beneficiaries: {
			type: 'integer',
			defaultsTo: 0
		},

	}

};

