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

		// borehole_water_facility_type
		borehole_water_facility_type_id:{
			type: 'string',
			required: true
		},
		borehole_water_facility_type_name:{
			type: 'string',
			required: true
		},

		// borehole_water_facility_size
		borehole_water_facility_size_id:{
			type: 'string',
			required: true
		},
		borehole_water_facility_size_name:{
			type: 'string',
			required: true
		},

		// borehole_chlorination_plan
		borehole_chlorination_plan_id:{
			type: 'string',
			required: true
		},
		borehole_chlorination_plan_name:{
			type: 'string',
			required: true
		},

		// free_residual_chlorine_range
		free_residual_chlorine_range_id:{
			type: 'string',
			required: true
		},
		free_residual_chlorine_range_name:{
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

		// borehole_tanks_storage_ltrs
		borehole_tanks_storage_ltrs: {
			type: 'float',
			defaultsTo: 0
		},

		// borehole_taps_number_connected
		taps_number_connected: {
			type: 'float',
			defaultsTo: 0
		},

		// borehole_taps_ave_flow_rate_ltrs_minute
		borehole_taps_ave_flow_rate_ltrs_minute: {
			type: 'float',
			defaultsTo: 0
		},

		// borehole_yield_ltrs_second
		borehole_yield_ltrs_second: {
			type: 'float',
			defaultsTo: 0
		},

		// borehole_pumping_ave_daily_hours
		borehole_pumping_ave_daily_hours: {
			type: 'float',
			defaultsTo: 0
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

		// borehole_lng
		borehole_lng: {
			type: 'float',
			required: true
		},

		// borehole_lng
		borehole_lat: {
			type: 'float',
			required: true
		},

		// yield*hrs*3600secs
		borehole_m3: {
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

