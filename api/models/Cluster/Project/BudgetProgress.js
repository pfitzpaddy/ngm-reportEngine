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
		username: {
			type: 'string',
			required: true
		},
		email: {
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
			default: 'paid'
		},
		budget_plan: {
			type: 'string',
			default: 'HAFG17'
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
		funding_2017: {
			type: 'float',
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
		inter_cluster_activities: {
			type: 'array'
		},
		activity_type: {
			type: 'array',
			required: true
		},
		activity_description: {
			type: 'array'
		},

		// SOs
		strategic_objectives: {
			type: 'array'
		},

		// target beneficiaries
		category_type: {
			type: 'array'
		},
		beneficiary_type: {
			type: 'array'
		},

		// target locations
		admin1pcode: {
			type: 'array'
		},
		admin2pcode: {
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
		project_budget_currency: {
			type: 'string',
			required: true
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

