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

		// mpc delivery
		mpc_delivery_type_id: {
			type: 'string'
		},
		mpc_delivery_type_name: {
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
		families: {
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
		
		// location
    location_id: {
			type: 'string'
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
		facility_id: {
			type: 'string'
		},
		facility_class: {
			type: 'string'
		},
		facility_status: {
			type: 'string'
		},
		facility_implementation_id: {
			type: 'string'
		},
		facility_implementation_name: {
			type: 'string'
		},
		facility_type_id: {
			type: 'string'
		},
		facility_type_name: {
			type: 'string'
		},
		facility_name: {
			type: 'string',
			required: true
		},
		facility_hub_id: {
			type: 'string'
		},
		facility_hub_name: {
			type: 'string'
		},
		conflict: {
			type: 'boolean'
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
		facility_lng: {
			type: 'float',
			required: true
		},
		facility_lat: {
			type: 'float',
			required: true
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
			type: 'string'
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
		}
		
	},

	// encrypt password before create, assign org_id
	// beforeCreate: function ( b, next ) {

	// 	// add reference for unlinked issue
	// 	b.location_reference_id = b.location_id.valueOf();
	// 	next();

	// }

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

