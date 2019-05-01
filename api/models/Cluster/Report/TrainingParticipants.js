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

		
		// trainings
		training_id: {
			type: 'string',
			required: true
		},
		training_title: {
			type: 'string',
			required: true
		},
		training_topics: {
			type: 'string',
			required: true
		},
		training_start_date: {
			type: 'date',
			required: true
		},
		training_end_date: {
			type: 'date',
			required: true
		},
		training_days_number: {
			type: 'integer'
		},
		training_conducted_by: {
			type: 'string',
			required: true
		},
		training_supported_by: {
			type: 'string',
			required: true
		},

		// participants
    trainee_affiliation_id: {
			type: 'string',
			required: true
    },
    trainee_affiliation_name: {
			type: 'string',
			required: true
    },
    trainee_health_worker_id: {
			type: 'string',
			required: true
    },
    trainee_health_worker_name: {
			type: 'string',
			required: true
    },
    trainee_men: {
			type: 'integer',
			required: true
		},
    trainee_women: {
			type: 'integer',
			required: true
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
		site_lng: {
			type: 'float',
			required: true
		},
		site_lat: {
			type: 'float',
			required: true
		},

		
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

