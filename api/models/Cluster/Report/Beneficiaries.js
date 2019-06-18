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
		// region/country
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

		// project
		project_id: {
			type: 'string',
			required: true
		},
		project_acbar_partner: {
			type: 'boolean'
		},
		project_hrp_code: {
			type: 'string',
			required: true
		},
		project_code: {
			type: 'string'
		},
		project_status: {
			type: 'string',
			defaultsTo: 'new'
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

		// report
		report_id: {
			type: 'string',
			required: true
		},
		report_active: {
			type: 'boolean',
			defaultsTo: true
		},
		report_status: {
			type: 'string',
			defaultsTo: 'todo'
		},
		report_month: {
			type: 'integer',
			required: true
		},
		report_year: {
			type: 'integer',
			required: true
		},
		report_submitted: {
			type: 'date'
		},
		reporting_period: {
			type: 'date',
			required: true
		},
		reporting_due_date: {
			type: 'date',
			required: true
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
		
		distribution_start_date: {
			type: 'date'
		},
		distribution_end_date: {
			type: 'date'
		},
		distribution_status: {
			type: 'string'
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

		// activity_description
		activity_description_id: {
			type: 'string',
			required: true
		},
		activity_description_name: {
			type: 'string',
			required: true
		},

		// added new 'W' for NG, activities should be planned better
		activity_detail_id: {
			type: 'string'
		},
		activity_detail_name: {
			type: 'string'
		},

		// NG cholera response
		activity_cholera_response_id: {
			type: 'string'
		},
		activity_cholera_response_name: {
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
		mpc_mechanism_type_id:{
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

		// beneficiaries
		households:{
			type: 'integer',
			defaultsTo: 0
		},
		families: {
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

		// store partial kits
		partial_kits: {
			type: 'array'

		},

		// store kit details
		kit_details: {
			type: 'array'

		},

		// location
		location_id: {
			type: 'string',
			required: true
		},
		// target_location_reference
		target_location_reference_id: {
			type: 'string',
			required: true
		},
		admin1pcode: {
			type: 'string',
			required: true
		},
		admin1name: {
			type: 'string',
			required: true
		},
		admin2pcode: {
			type: 'string',
			required: true
		},
		admin2name: {
			type: 'string',
			required: true
		},
		admin3pcode: {
			type: 'string'
		},
		admin3name: {
			type: 'string'
		},
		admin4pcode: {
			type: 'string'
		},
		admin4name: {
			type: 'string'
		},
		admin5pcode: {
			type: 'string'
		},
		admin5name: {
			type: 'string'
		},

		// DTM
		site_id: {
			type: 'string'
		},
		site_class: {
			type: 'string'
		},
		site_status: {
			type: 'string'
		},
		site_implementation_id: {
			type: 'string'
		},
		site_implementation_name: {
			type: 'string'
		},
		site_type_id: {
			type: 'string'
		},
		site_type_name: {
			type: 'string'
		},
		site_name: {
			type: 'string',
			required: true
		},
		site_name_alternative: {
			type: 'string'
		},
		site_hub_id: {
			type: 'string'
		},
		site_hub_name: {
			type: 'string'
		},
		site_households:{
			type: 'integer',
			defaultsTo: 0,
		},
		site_population:{
			type: 'integer',
			defaultsTo: 0,
		},
		site_boys:{
			type: 'integer',
			defaultsTo: 0,
		},
		site_girls:{
			type: 'integer',
			defaultsTo: 0,
		},
		site_men:{
			type: 'integer',
			defaultsTo: 0,
		},
		site_women:{
			type: 'integer',
			defaultsTo: 0,
		},
		site_elderly_men:{
			type: 'integer',
			defaultsTo: 0,
		},
		site_elderly_women:{
			type: 'integer',
			defaultsTo: 0,
		},
		site_lng: {
			type: 'float',
			required: true
		},
		site_lat: {
			type: 'float',
			required: true
		},
		
		admin1lng: {
			type: 'float',
			required: true
		},
		admin1lat: {
			type: 'float',
			required: true
		},
		admin2lng: {
			type: 'float',
			required: true
		},
		admin2lat: {
			type: 'float',
			required: true
		},
		admin3lng: {
			type: 'float'
		},
		admin3lat: {
			type: 'float'
		},
		admin4lng: {
			type: 'float'
		},
		admin4lat: {
			type: 'float'
		},
		admin5lng: {
			type: 'float'
		},
		admin5lat: {
			type: 'float'
		},
		conflict: {
			type: 'boolean'
		},

		/******* WASH NG IRS *******/

		// Water (IRS) association
		water: {
			collection: 'wateractivities',
			via: 'beneficiary_id'
		},

		// Boreholes (IRS) association
		boreholes: {
			collection: 'borehole',
			via: 'beneficiary_id'
		},

		// Sanitation (IRS) association
		sanitation: {
			collection: 'sanitationactivities',
			via: 'beneficiary_id'
		},

		// Hygiene (IRS) association
		hygiene: {
			collection: 'hygieneactivities',
			via: 'beneficiary_id'
		},

		// Cash (IRS) association
		cash: {
			collection: 'cashactivities',
			via: 'beneficiary_id'
		},

		// Cash (IRS) association
		accountability: {
			collection: 'accountabilityactivities',
			via: 'beneficiary_id'
		},

		// Remarks
		remarks: {
			type: 'string'
		},



		/*********** 2016 *************/
		// Project details
		project_type: {
			type: 'array'
		},
		project_type_other: {
			type: 'string'
		},
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
			type: 'array'
		},
		penta3_vacc_male_under1:{
			type: 'integer'
		},
		penta3_vacc_female_under1:{
			type: 'integer'
		},
		skilled_birth_attendant:{
			type: 'integer'
		},
		conflict_trauma_treated:{
			type: 'integer'
		},
		education_topic: {
			type: 'string'
		},
		education_sessions:{
			type: 'integer'
		},
		education_male:{
			type: 'integer'
		},
		education_female:{
			type: 'integer'
		},
		training_topic: {
			type: 'string'
		},
		training_sessions:{
			type: 'integer'
		},
		training_male:{
			type: 'integer'
		},
		training_female:{
			type: 'integer'
		},
		// technical order in location form
		_order: {
			type: 'integer'
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

