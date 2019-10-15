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
		organization_id: {
			type: 'string',
			required: true
		},
		organization_tag: {
			type: 'string',
			required: true
		},
		organization: {
			type: 'string',
			required: true
		},
		implementing_partners: {
			type: 'array'
		},
		cluster_id: {
			type: 'string',
			required: true
		},
		cluster: {
			type: 'string',
			required: true
		},
		name: {
			type: 'string',
			required: true
		},
		position: {
			type: 'string',
			required: true
		},
		phone: {
			type: 'string',
			required: true
		},
		email: {
			type: 'string',
			unique: true,
			required: true
		},
		username: {
			type: 'string',
			required: true
		},
		// add a reference to Project
		// project_id: {
		// 	model: 'project'
		// },

		project_id: {
			type: 'string'
			// required: true
		},

		// project
		project_acbar_partner: {
			type: 'boolean'
		},

		//New column plans and components
		plan_component: {
			type: 'array'
		},
		
		project_code: {
			type: 'string'
		},
		project_status: {
			type: 'string'
		},
		project_title: {
			type: 'string',
			required: true
		},
		project_description: {
			type: 'string',
			required: true
		},
		project_start_date: {
			type: 'date',
			required: true
		},
		project_end_date: {
			type: 'date',
			required: true
		},
		project_budget: {
			type: 'float'
		},
		project_budget_currency: {
			type: 'string',
			required: true
		},
		mpc_purpose: {
			type: 'array'
		},
		mpc_purpose_cluster_id: {
			type: 'string'
    },
    mpc_purpose_type_id: {
			type: 'string'
    },
    mpc_purpose_type_name: {
			type: 'string'
		},
		inter_cluster_activities: {
			type: 'array'
		},
		project_donor: {
			type: 'array'
		},

		// SOs ( afg only )
		strategic_objectives: {
			type: 'array'
		},

		// SOs ( new implementation )
		strategic_objective_id:{
			type: 'string'
		},
		strategic_objective_name:{
			type: 'string'
		},
		strategic_objective_description:{
			type: 'string'
		},
		sector_objective_id:{
			type:'string'
		},
		sector_objective_name:{
			type:'string'
		},
		sector_objective_description:{
			type:'string'
		},
		strategic_objective_descriptions: {
			type: 'json'
		},

		// category
		category_type_id: {
			type: 'string'
		},

		category_type_name: {
			type: 'string'
		},

		// beneficiary
		beneficiary_type_id: {
			type: 'string',
			required: true
		},
		beneficiary_type_name: {
			type: 'string',
			required: true
		},


		// beneficiary category

		beneficiary_category_id: {
			type: 'string'
		},

		beneficiary_category_name: {
			type: 'string'
		},


		// FORM

		// capture filter / display levels from activities.csv and store to avoid 
			// filtering and retrieving the wrong form details (i.e. has indicator_id which is not unique
			// and retrieves wrong form configuration as it should in fact know to filter on activity_details_id )
		display_activity_detail: {
			type: 'boolean'
		},

		display_indicator: {
			type: 'boolean'
		},

		// activity_type
		activity_type_id: {
			type: 'string',
			required: true
		},
		activity_type_name: {
			type: 'string',
			required: true
		},

		// activity description
		activity_description_id: {
			type: 'string',
			required: true
		},
		activity_description_name: {
			type: 'string',
			required: true
		},

		// activity detail
		activity_detail_id: {
			type: 'string'
		},
		activity_detail_name: {
			type: 'string'
		},

		// indicator that relates to activity for HRP reporting
		indicator_id: {
			type: 'string'
		},
		indicator_name: {
			type: 'string'
		},

		// mpc delivery
		mpc_delivery_type_id: {
			type: 'string'
		},
		mpc_delivery_type_name: {
			type: 'string'
		},
		
		//mpc mechanism
		mpc_mechanism_type_id: {
			type: 'string'
		},
		mpc_mechanism_type_name: {
			type: 'string'
		},

		package_type_id:{
			type: 'string'
		},

		package_type_name:{
			type: 'string'
		},
		
		// delivery (population, service)
		delivery_type_id: {
			type: 'string',
			defaultsTo: 'population'
		},
		delivery_type_name: {
			type: 'string',
			defaultsTo: 'New Beneficiaries'
		},

		// transfers per beneficiary
		transfer_type_id: {
			type: 'integer',
			defaultsTo: 0
		},
		transfer_type_value: {
			type: 'integer',
			defaultsTo: 0
		},

		// indicator
			// sessions -> training
		sessions:{
			type: 'integer',
			defaultsTo: 0
		},
			// units -> eiewg
		units: {
			type: 'float',
			defaultsTo: 0
		},
		// units
		unit_type_id: {
			type: 'string'
		},
		unit_type_name: {
			type: 'string'
		},

			// conditional/unconditional
		cash_amount: {
			type: 'integer',
			defaultsTo: 0
		},
		households:{
			type: 'integer',
			defaultsTo: 0
		},
		families:{
			type: 'integer',
			defaultsTo: 0
		},
		boys_0_5:{
			type: 'integer',
			defaultsTo: 0
		},
		boys_6_11:{
			type: 'integer',
			defaultsTo: 0
		},
		boys_12_17:{
			type: 'integer',
			defaultsTo: 0
		},
		boys:{
			type: 'integer',
			defaultsTo: 0
		},
		girls_0_5:{
			type: 'integer',
			defaultsTo: 0
		},
		girls_6_11:{
			type: 'integer',
			defaultsTo: 0
		},
		girls_12_17:{
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
		total_male:{
			type: 'integer',
			defaultsTo: 0
    },
		total_female:{
			type: 'integer',
			defaultsTo: 0
    },
		total_beneficiaries:{
			type: 'integer',
			defaultsTo: 0
		},
    injury_treatment_same_province:{
      type: 'boolean'
    },

		// to replace partial_kits + kit_details (potentially units, unit_type_id, unit_type_name)
		details: {
			type: 'array'
		},

    remarks:{
      type: 'string'
    },



		/*********** 2017 *************/
		activity_type: {
			type: 'array'
		},
		activity_description: {
			type: 'array'
		},
		beneficiary_name: {
			type: 'string'
		},
		beneficiary_type: {
			type: 'string'
		},

		/*********** 2016 *************/
		project_type: {
			type: 'array'
		},
		project_type_other: {
			type: 'string'
		},
		capacity_building_topic: {
			type: 'string'
		},
		capacity_building_sessions:{
			type: 'integer',
			defaultsTo: 0
		},
		capacity_building_male:{
			type: 'integer',
			defaultsTo: 0
		},
		capacity_building_female:{
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
		}

	},

  // updateOrCreate
    // http://stackoverflow.com/questions/25936910/sails-js-model-insert-or-update-records
  updateOrCreate: function( parent, criteria, values ){
    var self = this; // reference for use by callbacks

    // if exists
    if( criteria.id ){
      return self.update( criteria, values );
    }else{
			// set relation
			for ( key in parent ){ values[ key ] = parent[ key ]; }
      return self.create( values );
    }    

  }

};