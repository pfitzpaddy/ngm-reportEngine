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

		// add a reference to Location
		beneficiary_id: {
			model: 'beneficiaries'
		},

		// quantity of service
		quantity: {
			type: 'float',
			defaultsTo: 0
		},

		// quantity
		quantity_measurement: {
			type: 'string',
			defaultsTo: 'm3_per_month'
		},

		// free_residual_chlorine_range
		free_residual_chlorine_range_id:{
			type: 'string'
		},
		free_residual_chlorine_range_name:{
			type: 'string'
		},

		// water_turbidity_range
		water_turbidity_range_id:{
			type: 'string'
		},
		water_turbidity_range_name:{
			type: 'string'
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

