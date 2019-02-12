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
			type: 'string'
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
		project_hrp_code: {
			type: 'string',
			required: true
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

		// SOs
		strategic_objectives: {
			type: 'array'
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

    remarks:{
      type: 'string'
    },

		// target locations
		admin1pcode: {
			type: 'array'
		},
		admin2pcode: {
			type: 'array'
		},
		admin3pcode: {
			type: 'array'
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
  updateOrCreateEach: function( parent, values, cb ){
    var self = this; // reference for use by callbacks
    // If no values were specified, return []
    if (!values.length) cb( false, [] );

    var results = [],
        counter = 0,
        length = values.length;

    // values
    values.forEach(function( value ){

      if( value.id ){
        self.update({ id: value.id }, value, function( err, update ){
          if(err) return cb(err, false);
          results.push( update[0] );

          counter++;
          if( counter===length ){
            cb( false, results );
          }
        });
      }else{
  			// set based on criteria
  			for ( key in parent ){
  				value[ key ] = parent[ key ];
  			}
        self.create(value, function( err, create ){
          if(err) return cb(err, false);
          results.push( create );

          counter++;
          if( counter===length ){
            cb( false, results );
          }
        });
      }

    });

  }

};

