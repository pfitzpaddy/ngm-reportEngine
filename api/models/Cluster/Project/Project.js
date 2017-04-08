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

		// add reference to Target beneficiaries
		target_beneficiaries: {
			collection: 'targetbeneficiaries',
			via: 'project_id'
		},	
		// add reference to Target Locations
		target_locations: {
			collection: 'targetlocation',
			via: 'project_id'
    	},
		// add reference to Budget Progress
		project_budget_progress: {
			collection: 'budgetprogress',
			via: 'project_id'
		},

		// flag to manage location updates
		update_locations: {
			type: 'boolean',
			defaultsTo: false
		},

		// project
		project_hrp_code: {
			type: 'string',
			required: true
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
			type: 'integer',
			required: true
		},
		project_budget_currency: {
			type: 'string',
			required: true
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
			type: 'array',
			required: true
		},

		// target locations
		admin1pcode: {
			type: 'array'
		},
		admin2pcode: {
			type: 'array'
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
		},
		project_donor_other: {
			type: 'string'
		},
		activity_description_other: {
			type: 'string'
		},
		implementing_partners_checked: {
			type: 'boolean',
			defaultsTo: false
		},
		implementing_partners: {
			type: 'string'
		}

	},

	// afterCreate
	afterCreate: function( project, next ) {
		
		// for each project target locations
		TargetLocation
			.find()
			.where( { project_id: project.id } )
			.exec( function( err, target_locations ) {

				// return error
				if ( err ) return next( err );

				// if none
				if ( !target_locations || !target_locations.length ) return next();

				// if target_locations
				if ( target_locations && target_locations.length ) {

					// generate an array of reports
					var reports = getProjectReports( project, target_locations );

					// create reports
					Report
						.create( reports )
						.exec( function( err, reports ) {

							// return error
							if ( err ) return next( err );

							// next!
							next();
							
						});
				}

			});
	},

	// update report locations
	afterUpdate: function( project, next ) {

		// if no updates
		if ( !project.update_locations ) return next();
		
		// if update required
		if( project.update_locations ){

			// for each project target locations
			TargetLocation
				.find()
				.where( { project_id: project.id } )
				.exec( function( err, target_locations ) {

					// return error
					if ( err ) return next( err );

					// if none
					if ( !target_locations || !target_locations.length ) return next();

					// if target_locations
					if ( target_locations && target_locations.length ) {

						// generate an array of reports
						var generated_reports = getProjectReports( project, target_locations );				

						// could make this a new func
						updateProjectReports( project, target_locations, generated_reports, next );

					}

			});

		}

	}
};


// generate an array of reports
function getProjectReports( project, target_locations ) {

	// tools
	var moment = require('moment'),
			_under = require('underscore');
	// variables
	var reports = [],
			// set start date / end date to start and end of respective months
			s_date = moment( project.project_start_date ).startOf( 'month' ),
			e_date = moment( project.project_end_date ).endOf( 'month' );

	// number of reports
	var reports_duration = moment.duration( e_date.diff( s_date ) ).asMonths().toFixed(0);

	// for each report month
	for ( m = 0; m < reports_duration; m++ ) {

		// report is true
		var report_active = true;

		// should be reports just for 2017 period!
		if ( moment( s_date ).add( m, 'M' ).year() < 2017 ) {
			report_active = false;
		}

		// report_status 'todo' open from 1st of next month
		var report_status = moment().diff( moment( s_date ).add( m, 'M' ).endOf( 'month' ) ) >= 0 ? 'todo' : 'pending';

		// create report
		var report = {
			// defaults
			report_status: report_status,
			report_active: report_active,
			report_month: moment( s_date ).add( m, 'M' ).month(),
			report_year: moment( s_date ).add( m, 'M' ).year(),
			reporting_period: moment( s_date ).add( m, 'M' ).set('date', 1).format(),
			reporting_due_date: moment( s_date ).add( m+1, 'M' ).set('date', 15).format()//,
			// locations: []
		};

		// clone project
		var p = _under.clone( project );
		// merge with report
		report = _under.extend( {}, report, p );
		report.project_id = p.id;
		// remove id for new object
		delete report.id;

		// merge report with target_locations
		report.locations = getProjectReportLocations( report, target_locations );

		// add report to reports
		reports.push( report );

	}

	// return the reports for the project period
	return reports;

};

// generate an array of reports
function getProjectReportLocations( report, target_locations ) {

	// variables
	var locations = [],
			_under = require('underscore');
	
	// clone report
	var r = _under.clone( report );
	delete r.admin1pcode;
	delete r.admin1name;
	delete r.admin2pcode;
	delete r.admin2name;

	// for project target_locations
	target_locations.forEach( function( target_location, t_index ) {

		// clone target_location
		var l = target_location.toObject();
				l.target_location_reference_id = l.id.valueOf();
				delete l.id;

		locations.push( _under.extend( l, r ) );
		
	});

	// return locations array
	return locations;

};

function updateProjectReports( project, target_locations, generated_reports, next ){

	// counter
	var counter = 0,
			length = generated_reports.length,
			deepAssign = require( 'deep-assign' );

	// loop
	generated_reports.forEach(function( skeleton_report, r_index ){

		// find
		Report
			.find( { 	project_id: skeleton_report.project_id,
								report_month: skeleton_report.report_month, 
								report_year: skeleton_report.report_year
							})
			.populateAll()
			.exec( function( err, reports ) {

				// return error
				if ( err ) return next( err );

				// if no report - create
				if ( !reports.length ) {

					// create with association
					Report
						.create( skeleton_report )
						.exec( function( err, report ) {

							// return error
							if ( err ) return next( err );

							// counter
							counter++;							

							// final update
							if ( counter === length ) {
								// next!
								next();

							}
							
					});

				}

				// if report loop and update!
				if ( reports.length ) {

					// for each
					reports.forEach(function( r, i ){

						// if report removed
						if( reports[i].locations.length > skeleton_report.locations.length ){

							// target array
							var locations = [],
									target_location_reference_ids = '';

							// pick out target_location_reference_id
							skeleton_report.locations.forEach(function( d, k ){
								target_location_reference_ids += d.target_location_reference_id + ',';
							});

							// filter locations
							reports[i].locations.forEach(function( d, k ){
								if( target_location_reference_ids.indexOf(d.target_location_reference_id) !== -1 ){
									locations.push(d);
								}
							});

							// 
							reports[i].locations = locations;

						}

						// merge location changes
						reports[i] = deepAssign( reports[i], skeleton_report );

						// update
						Report
							.update( { id: r.id }, reports[i] )
							.exec( function( err, report ) {

								// return error
								if ( err ) return next( err );

								// counter
								counter++;

								// final update ?
								if ( counter === length ) {
									next();
								}

						});

					});

				}

			});
	});

}

// update existing project reports
// function updateProjectReports( reports, next ) {

// 	// number of reports to update
// 	var counter = 0,
// 			length = reports.length;

// 	// for each report
// 	reports.forEach( function( report, r_index ) {

// 		// report is true
// 		var report_active = true;

// 		// should be reports just for 2016 period and beyond!
// 		if ( reports[ r_index ].report_year < 2016  ) {
// 			report_active = false;
// 		}

// 		// updateOrCreate (returns array)
// 		Report
// 			.update( { 	project_id: reports[ r_index ].project_id,
// 									report_month: reports[ r_index ].report_month, 
// 									report_year: reports[ r_index ].report_year
// 								}, { report_active: report_active } )
// 			.exec( function( err, report ) {

// 				// return error
// 				if ( err ) return next( err );

// 				// if no report - create
// 				if ( !report.length ) {

// 					// create with association
// 					Report
// 						.create( reports[ r_index ] )
// 						.exec( function( err, report ) {

// 							// return error
// 							if ( err ) return next( err );

// 							// counter
// 							counter++;							

// 							// final update
// 							if ( counter === length ) {
// 								// next!
// 								next();

// 							}
							
// 						});

// 				} else {

// 					// get locations
// 					Location
// 						.find()
// 						.where( { report_id: report[0].id } )
// 						.populateAll()
// 						.exec( function( err, locations ){

// 							// return error
// 							if ( err ) return next( err );

// 							// for each location
// 							locations.forEach( function( location, l_index){

// 								// add beneficiaries if existing
// 								if ( location.beneficiaries.length ) {
// 									if( !reports[ r_index ].locations[ l_index ] ){
// 										reports[ r_index ].locations[ l_index ] = {
// 											beneficiaries: []
// 										}
// 									}
// 									reports[ r_index ].locations[ l_index ].beneficiaries = location.beneficiaries;
// 								}
								
// 							});

// 							// updates locations association
// 							Report
// 								.update( { 	project_id: reports[ r_index ].project_id,
// 														report_month: reports[ r_index ].report_month, 
// 														report_year: reports[ r_index ].report_year
// 													}, { locations: reports[ r_index ].locations } )
// 								.exec( function( err, report ) {

// 									// return error
// 									if ( err ) return next( err );

// 									// counter
// 									counter++;							
									
// 									// final update ?
// 									if ( counter === length ) {
										
// 										// next!
// 										next();
// 									}

// 								});

						
// 						});

// 				}

// 			});

// 	});

// }
