/**
* BudgetProgress.js
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
		},

		// 2017
		grant_id: {
			type: 'string'
		},
		contribution_status: {
			type: 'string',
			defaultsTo: 'paid'
		},
		budget_plan: {
			type: 'string',
			defaultsTo: 'HAFG17'
		},
		budget_funds_id: {
			type: 'string'
		},
		budget_funds_name: {
			type: 'string'
		},
		financial_programming_id: {
			type: 'string'
		},
		financial_programming_name: {
			type: 'string'
		},
		multi_year_funding_id: {
			type: 'string'
		},
		multi_year_funding_name: {
			type: 'string'
		},
		multi_year_array:{
			type: 'array'
		},
		funding_2017: {
			type: 'float',
		},
		funding_year: {
			type: 'integer',
		},
		reported_on_fts_id: {
			type: 'string'
		},
		reported_on_fts_name: {
			type: 'string'
		},
		fts_record_id: {
			type: 'string'
		},
		comments: {
			type: 'string'
		},
 
		// project
		project_acbar_partner: {
			type: 'boolean'
		},
		project_hrp_code: {
			type: 'string',
			required: true
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
		implementing_partners: {
			type: 'array'
		},

		// budget item
		project_donor_id: {
			type: 'string'
		},
		project_donor_name: {
			type: 'string'
		},
		// activity_type
		activity_type_id: {
			type: 'string'
		},
		activity_type_name: {
			type: 'string'
		},

		activity_description_id:{
			type: 'string'
		},
		activity_description_name:{
			type: 'string'
		},
		project_budget_currency: {
			type: 'string',
			required: true
		},
		admin1name:{
			type:'string'
		},
		admin1pcode:{
			type:'string'
		},
		admin1lat:{
			type: 'float'
		},
		admin1lng:{
			type: 'float'
		},

		admin2name:{
			type:'string'
		},
		admin2pcode:{
			type:'string'
		},
		admin2lat:{
			type: 'float'
		},
		admin2lng:{
			type: 'float'
		},

		project_budget_amount_recieved: {
			type: 'float',
			required: true
		},
		currency_id: {
			type: 'string'
		},
		currency_name: {
			type: 'string'
		},
		project_budget_date_recieved: {
			type: 'date',
			required: true
		},




		/*********** 2016 *************/
		project_code: {
			type: 'string'
		},
		project_type: {
			type: 'array'
		},
		project_type_other: {
			type: 'string'
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

