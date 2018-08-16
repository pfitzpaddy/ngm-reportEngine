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
			defaultsTo: 'taps_connected'
		},

		// free_residual_chlorine_range
		from_chlorinated_system_id:{
			type: 'string',
			required: true
		},
		from_chlorinated_system_name:{
			type: 'string',
			required: true
		},

		// water_turbidity_range
		water_turbidity_range_id:{
			type: 'string',
			required: true
		},
		water_turbidity_range_name:{
			type: 'string',
			required: true
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

