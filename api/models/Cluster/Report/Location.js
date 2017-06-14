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
		username: {
			type: 'string',
			required: true
		},
		email: {
			type: 'string',
			required: true
		},

		// target_location_reference
		target_location_reference_id: {
			type: 'string'
		},

		// project
		project_id: {
			type: 'string',
			required: true
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

		// report
		// report_id: {
		// 	model: 'report'
		// },

		report_id: {
			type: 'string'
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

		// location
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
		conflict: {
			type: 'boolean',
			required: true
		},
		fac_type: {
			type: 'string'
		},
		fac_type_name: {
			type: 'string'
		},		
		fac_name: {
			type: 'string',
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

    // add reference to Beneficiaries
    // beneficiaries: {
    //   collection: 'beneficiaries',
    //   via: 'location_id'
    // },






		/*********** 2016 *************/
		project_type: {
			type: 'array'
		},
		project_type_other: {
			type: 'string'
		}

	},

	// create new report locations based on project target_locations
	createNewReportLocations: function( report, target_locations, cb ){
    var self = this; // reference for use by callbacks
    // If no values were specified, return []
    if ( !report || !target_locations.length ) cb( false, [] );

    // var
    var results = [],
        counter = 0,
        length = target_locations.length,
        _under = require('underscore');

    // clone report
    var target_report = _under.clone( report );
            target_report.report_id = report.id.valueOf();
            delete target_report.id;
            delete target_report.admin1pcode;
            delete target_report.admin1name;
            delete target_report.admin2pcode;
            delete target_report.admin2name;

    // values
    target_locations.forEach(function( t_location ){

			// clone target_location
			var l = _under.clone( t_location );
			    l.target_location_reference_id = t_location.id;
			    delete l.id;

      // merge reporting location
      var location = _under.extend( {}, target_report, l );

      // find or create
			self
        .findOrCreate( { 
            project_id: target_report.project_id, 
            report_month: target_report.report_month, 
            report_year: target_report.report_year,
            target_location_reference_id: t_location.id
          }, location )
        .exec( function( err, result ) {

        	// err
        	if ( err ) return cb( err, false );

        	// results
        	results.push( result );

					// counter
					counter++
					if ( counter === length ) {
						cb( false, results );
					}
			});

		});

	}

};

