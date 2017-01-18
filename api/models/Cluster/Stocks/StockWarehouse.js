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
		// relation
		organization_id: {
			model: 'organization'
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
		conflict: {
			type: 'boolean',
			required: true
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
		}
	},

  // after create - create reports
  afterCreate: function (values, cb) {

  	// moment
  	var moment = require('moment');

  	Project
  		.find( { organization_id: values.organization_id } )
  		.sort('project_end_date DESC')
  		.limit(1)
  		.exec(function(err, projects){

				// return error
				if ( err ) return cb( err );

				// warehouse
				StockWarehouse
					.find( { organization_id: values.organization_id } )
					.exec(function(err, warehouses){
						
						// return error
						if ( err ) return cb( err );

						// set
						generateStockReports( values.organization_id, projects[0], warehouses, cb );

  				});
  		});
  },

  // after update
  afterUpdate: function (values, cb) {

  	// linked 
  	if(values.organization_id){
			cb();
		}

  	// un-linked 
  	if(!values.organization_id){

  		// remove primary key to reports
  		StockLocation
  			// .update({ stock_warehouse_id: values.id }, { report_id: null })
  			.find({ stock_warehouse_id: values.id });
  			.exec(function(err, stocklocations){

					// return error
					if ( err ) return cb( err );

					console.log(stocklocations);

					// 
					cb();

  			})

  	}

  }

};

// 
function generateStockReports( organization_id, project, target_locations, cb ){

	// tools
	var moment = require('moment');
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

		// should be reports just for 2016 period!
		if ( moment( s_date ).add( m, 'M' ).year() < 2017  ) {
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
			reporting_due_date: moment( s_date ).add( m+1, 'M' ).set('date', 15).format(),
			stocklocations: []
		};

		// merge with project
		report = _.merge( {}, report, project );
		delete report.id;

		// add report stocklocations
		// report.stocklocations = getStockReportLocations( target_locations );

		// add report to reports
		reports.push( report );

	}

	// return the reports for the project period
	// return reports;

	// get reportlocations
	getStockReportLocations(organization_id, reports, target_locations, cb );

};

// generate an array of reports
function getStockReportLocations( organization_id, reports, target_locations, cb ) {

	// number of reports to update
	var report_counter = 0,
			report_length = reports.length;

	// reports
	reports.forEach(function(report, r_index){

		//
		var target_counter = 0,
				target_length = target_locations.length;

		// for project target_locations
		target_locations.forEach( function( target_location, t_index ) {

			// existing stocklocation?
			StockLocation
				.find({ organization_id: organization_id,
										stock_warehouse_id: target_location.id,
										report_month: report.report_month,
										report_year: report.report_year })
				.populateAll()
				.exec(function(err, stocklocation){

					// return error
					if ( err ) return cb( err );

					// existing stocklocation
					if(stocklocation.length){
						// stocklocations
						reports[r_index].stocklocations.push(stocklocation);
					}

					// create stocklocation
					if(!stocklocation.length){
						// clone target_location
						var sl = target_location.toObject();
								sl.stock_warehouse_id = sl.id;
								sl.report_month = reports[r_index].report_month;
								sl.report_year = reports[r_index].report_year;
								delete sl.id;
						// sl
						reports[r_index].stocklocations.push(sl);
					}

					// target++
					target_counter++;
					if(target_counter===target_length){

						// report++
						report_counter++;
						if(report_counter===report_length){
							// setreports
							setStockReports(reports, cb);
						}

					}			

				});
			
		});

	});

};

// set db
function setStockReports( reports, cb ){

	// number of reports to update
	var counter = 0,
			length = reports.length;

	// for each report
	reports.forEach( function( report, r_index ) {

		// update (returns array)
		StockReport
			.update( { 	organization_id: reports[ r_index ].organization_id,
									report_month: reports[ r_index ].report_month, 
									report_year: reports[ r_index ].report_year
								}, reports[ r_index ] )
			.exec( function( err, update ) {

				// return error
				if ( err ) return cb( err );

				// if report
				if ( update.length ) {
					// counter
					counter++;
					// final update
					if ( counter === length ) {
						// next!
						cb();
					}
				}
				// if no report - create
				if ( !update.length ) {

					// create with association
					StockReport
						.create( reports[ r_index ] )
						.exec( function( err, new_report ) {
							// return error
							if ( err ) return cb( err );
							// counter
							counter++;
							// final update
							if ( counter === length ) {
								// next!
								cb();
							}
						});
				}

			});
	});

}

