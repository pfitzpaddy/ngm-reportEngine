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

    // borehole_water_facility_type
    borehole_water_facility_type_id:{
    	type: 'string'
    },
    borehole_water_facility_type_name:{
    	type: 'string'
    },

    // borehole_water_facility_size
    borehole_water_facility_size_id:{
    	type: 'string'
    },
    borehole_water_facility_size_name:{
    	type: 'string'
    },

    // borehole_chlorination_plan
    borehole_chlorination_plan_id:{
    	type: 'string'
    },
    borehole_chlorination_plan_name:{
    	type: 'string'
    },

    // borehole_free_residual_cholrine_range
    borehole_free_residual_cholrine_range_id:{
    	type: 'string'
    },
    borehole_free_residual_cholrine_range_name:{
    	type: 'string'
    },

    // borehole_water_turbidity_range
    borehole_water_turbidity_range_id:{
    	type: 'string'
    },
    borehole_water_turbidity_range_name:{
    	type: 'string'
    },

    // borehole_tanks_storage_ltrs
    borehole_tanks_storage_ltrs: {
			type: 'float',
			defaultsTo: 0
    },

    // borehole_taps_number_connected
    borehole_taps_number_connected: {
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

		// borehole_lng
    borehole_lng: {
			type: 'float',
			required: true
    },

		// borehole_lng
    borehole_lat: {
			type: 'float',
			required: true
    }

	},

};

