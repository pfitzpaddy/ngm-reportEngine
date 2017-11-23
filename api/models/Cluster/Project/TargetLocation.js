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
			type: 'string' //,
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

		facility_id: {
			type: 'string'
		},





		// ADD THIS TO ADMIN2FACILITIES AS "EDUCATION" OR "HEALTH"
		facility_class: {
			type: 'string'
		},



		// ADD THIS TO ADMIN2FACILITIES AS OPEN
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


		// //////////////
		new_facility_id: {
			type: 'string'
		},
		new_facility_name: {
			type: 'string'
		},
		// //////////////



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

		// flag to manage location updates
		update_location: {
			type: 'boolean',
			defaultsTo: false
		},




		/*********** 2016 *************/
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

  },

	// update report locations
	afterCreate: function( target_location, next ) {

		// variables
		var _under = require('underscore');

		// find reports
		Report
			.find()
			.where({ project_id: target_location.project_id })
			.exec( function( err, reports ){

				// return error
				if ( err ) return next( err );

				// counter
				var counter = 0,
						length = reports.length;

				// forEach
				reports.forEach(function( report, i ){

					// clone report
					var r = _under.clone( report );
									r.report_id = r.id.valueOf();
									delete r.id;
									delete r.admin1pcode;
									delete r.admin1name;
									delete r.admin2pcode;
									delete r.admin2name;
									delete r.admin3pcode;
									delete r.admin3name;

					// clone target_location
					var location,
							l = _under.clone( target_location );
							l.target_location_reference_id = l.id;
							delete l.id;

					// merge reporting location
					location = _under.extend( l, r );

					// create reporting location
					Location
						.create( location )
						.exec(function( err, result ){

							// return error
							if ( err ) return next( err );

							counter++
							if ( counter === length ) {
								next();
							}

					});

				});

		});

	},

	// update report locations
	afterUpdate: function( target_location, next ) {

		// no edits, return
		if ( !target_location.update_location ) return next();

		// variables
		var _under = require('underscore');


		// --------- UPDATE LOCATIONS ---------
		// update location
		if ( target_location.project_id ) {

			// clone target_location
			var l = _under.clone( target_location );
							l.target_location_reference_id = l.id;
							delete l.id;

			// target location reference id
			Location
				.update( { target_location_reference_id: l.target_location_reference_id }, l )
				.exec( function( err, result ){

					// return error
					if ( err ) return next( err );

					// next!
					next();

			});

		}


		// --------- REMOVE LOCATIONS ---------
		// remove location from reports!
		if ( !target_location.project_id ) {

	    // get report by organization_id
	    Location
	      .update( { target_location_reference_id: target_location.id }, { report_id: null } )
	      .exec( function( err, location_results ){

					// return error
					if ( err ) return next( err );

					// counter
					var counter = 0,
							length = location_results.length;

					// for each report location
					location_results.forEach( function( location, i ) {

						// beneficiaries
						Beneficiaries
							.update( { location_id: location.id }, { location_id: null } )
							.exec( function( err, beneficiaries_result ){

								// return error
								if ( err ) return next( err );

								// counter
								if ( counter === length ) {
									// next!
									next();
								}

						});

					});

	    });

		}

	}

};
