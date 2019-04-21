/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var moment = require('moment');

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
		},
		cluster: {
			type: 'string',
		},
		username: {
			type: 'string',
			required: true
		},
		email: {
			type: 'string',
			required: true
		},

    // project acbar
		project_acbar_partner: {
			type: 'boolean'
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
		conflict: {
			type: 'boolean',
			required: true
		},
		site_name: {
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
		}

	},

  // after create - create reports
  afterCreate: function (values, cb) {

  	// moment
  	var moment = require('moment');
  	
		// warehouse
		StockWarehouse
			.find( { organization_id: values.organization_id } )
			.exec(function(err, warehouses){
				
				// return error
				if ( err ) return cb( err );
				
        // daterange for warehouses reports
        var year_start = moment().startOf('year').format('YYYY-MM-DD'),
            year_end   = moment().endOf('year').format('YYYY-MM-DD')

				projects = [{
					project_start_date: year_start,
					project_end_date:   year_end
				}];

				// set
				generateStockReports( values, projects[0], warehouses, cb );

			});
  }

};

// 
function generateStockReports( stockwarehouse, project, target_locations, cb ){

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

		// should be reports just for 2017 period!
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

		// merge with values
		report = _.merge( {}, report, stockwarehouse );
		delete report.id;

		// add report to reports
		reports.push( report );

	}

	// get reportlocations
	getStockReportLocations( stockwarehouse, reports, target_locations, cb );

};

// generate an array of reports
function getStockReportLocations( stockwarehouse, reports, target_locations, cb ) {

	// number of reports to update
	var report_counter = 0,
			report_length = reports.length;

	// reports
	reports.forEach(function(report, r_index){

		// set
		var target_counter = 0,
				target_length = target_locations.length;

		// for target_locations
		target_locations.forEach( function( target_location, t_index ) {

			// existing stocklocation?
			StockLocation
				.find({ organization_id: stockwarehouse.organization_id,
										stock_warehouse_id: target_location.id,
										report_month: report.report_month,
                    report_year: report.report_year,
                    report_id: { '!' : null } })
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
                sl.createdOn  = moment().format();
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

		StockReport
			.find( { organization_id: reports[ r_index ].organization_id,
						report_month: reports[ r_index ].report_month, 
						report_year: reports[ r_index ].report_year
					} )
			.exec(function( err, sReport ){
				
				// return error
				if ( err ) return cb( err );

				// report length
				if ( sReport.length ) {
					reports[ r_index ].report_status = sReport[0].report_status;
				}

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
	});

}

