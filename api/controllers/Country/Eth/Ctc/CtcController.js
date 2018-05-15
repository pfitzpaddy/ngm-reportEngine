/**
 * EprController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// secrets
if (sails.config.kobo) {
    var kobo_pk = sails.config.kobo.CTC_KOBO_PK;
    var kobo_url = sails.config.kobo.CTC_KOBO_URL;
    var kobo_user = sails.config.kobo.CTC_KOBO_USER;
    var kobo_password = sails.config.kobo.CTC_KOBO_PASSWORD;
}
module.exports = {

	// get data from kobo
		// set script to run (i.e. every hour)
	getKoboData: function  ( req, res ) {

		// set data
		var assessments = [],
				case_management = [],
				water = [],
				ipc = [],
				stocks = [],
				
				// location
				region = {},
				zone = {},
				woreda = {},
				facilities = {},

				// set cmd
				moment = require( 'moment' ),
				exec = require('child_process').exec,
				// API
					// https://kc.kobotoolbox.org/api/v1/
				// view forms
				cmd = 'curl -X GET https://kc.humanitarianresponse.info/api/v1/data/' +  kobo_pk + '?format=json' + ' -u ' + kobo_user + ':' + kobo_password;

		// run curl command
		exec( cmd, { maxBuffer: 1024 * 16384 }, function( error, stdout, stderr ) {

			if ( error ) {

				console.log(error);

				// return error
			  res.json( 400, { error: 'Request error! Please try again...' } );

			} else {

				// success
				kobo = JSON.parse( stdout );

				// get location details
				Admin3Sites
					.find()
					.where({ 'admin0pcode': 'ET' })
					.exec(function (err, admin3sites) {

						// err
						if ( err ) return res.negotiate( err );

						// for each
						admin3sites.forEach(function( d, i ){

							// create lookup
							region[ d.admin1pcode ] = d;
							zone[ d.admin2pcode ] = d;
							woreda[ d.admin3pcode ] = d;
							facilities[ d.site_id ] = d;

						});

						// rows
						kobo.forEach( function( d, i ){

							// each row
							var assessment_obj = {},
									case_management_obj = {},
									water_obj = {},
									ipc_obj = {},
									stocks_obj = {};

							// for each key, value
							for ( var k in d ) {
								
								// add default values
								var key = k.split('/')[ k.split('/').length - 1 ];

								// assessment
								assessment_obj = {
									focal_point_name: d['reporting/reporting_focal_point/focal_point_name'],
									focal_point_organization: d['reporting/reporting_focal_point/focal_point_organization'],
									focal_point_email: d['reporting/reporting_focal_point/focal_point_email'],
									assessment_date: moment(d['reporting/reporting_focal_point/assessment_date']).format('YYYY-MM-DD'),
									// admin0
									admin0pcode: region[d['reporting/reporting_facility/reporting_region']].admin0pcode,
									admin0name: region[d['reporting/reporting_facility/reporting_region']].admin0name,
									admin0type_name: region[d['reporting/reporting_facility/reporting_region']].admin0type_name,
									admin0lng: region[d['reporting/reporting_facility/reporting_region']].admin0lng,
									admin0lat: region[d['reporting/reporting_facility/reporting_region']].admin0lat,
									// admin1
									admin1pcode: region[d['reporting/reporting_facility/reporting_region']].admin1pcode,
									admin1name: region[d['reporting/reporting_facility/reporting_region']].admin1name,
									admin1type_name: region[d['reporting/reporting_facility/reporting_region']].admin1type_name,
									admin1lng: region[d['reporting/reporting_facility/reporting_region']].admin1lng,
									admin1lat: region[d['reporting/reporting_facility/reporting_region']].admin1lat,
									// admin2
									admin2pcode: zone[d['reporting/reporting_facility/reporting_zone']].admin2pcode,
									admin2name: zone[d['reporting/reporting_facility/reporting_zone']].admin2name,
									admin2type_name: zone[d['reporting/reporting_facility/reporting_zone']].admin2type_name,
									admin2lng: zone[d['reporting/reporting_facility/reporting_zone']].admin2lng,
									admin2lat: zone[d['reporting/reporting_facility/reporting_zone']].admin2lat,
									// admin3
									admin3pcode: woreda[d['reporting/reporting_facility/reporting_woreda']].admin3pcode,
									admin3name: woreda[d['reporting/reporting_facility/reporting_woreda']].admin3name,
									admin3type_name: woreda[d['reporting/reporting_facility/reporting_woreda']].admin3type_name,
									admin3lng: woreda[d['reporting/reporting_facility/reporting_woreda']].admin3lng,
									admin3lat: woreda[d['reporting/reporting_facility/reporting_woreda']].admin3lat,
									// admin3 (default)
									site_lng: woreda[d['reporting/reporting_facility/reporting_woreda']].admin3lng,
									site_lat: woreda[d['reporting/reporting_facility/reporting_woreda']].admin3lat,
									// site
									site_type: d['reporting/reporting_facility/reporting_facility_type'].toUpperCase(),
									site_name: d['reporting/reporting_facility/reporting_facility_name'],
									// parent site
									parent_site_id: d['reporting/reporting_facility/reporting_parent_facility'],
									parent_site_name: facilities[d['reporting/reporting_facility/reporting_parent_facility']].site_name,
									parent_site_type: facilities[d['reporting/reporting_facility/reporting_parent_facility']].site_type_name,
									// submission
									_submission_time: d['_submission_time']
								};

								// determine level accuracy
								if ( d['reporting/reporting_facility/reporting_parent_facility'] ) {
									assessment_obj.site_lng = facilities[d['reporting/reporting_facility/reporting_parent_facility']].site_lng;
									assessment_obj.site_lat = facilities[d['reporting/reporting_facility/reporting_parent_facility']].site_lat;
								}
								if ( d['reporting/reporting_gps/facility_gps'] ) {
									var position = d['reporting/reporting_gps/facility_gps'].split(' ');
									assessment_obj.site_lng = position[1];
									assessment_obj.site_lat = position[0];
								}

								// case management
								if ( key.search('case_management') > -1 ) {
									case_management_obj[key] = d[k];
								}

								// water
								if ( key.search('water') > -1 ) { 
									water_obj[key] = d[k];
								}

								// ipc
								if ( key.search('infection_pc') > -1 ) { 
									ipc_obj[key] = d[k];
								}

								// stocks
								if ( key.search('stocks') > -1 ) { 
									stocks_obj[key] = d[k];
								}

							}

							// push to assessments
							assessments.push( assessment_obj );
							if ( !_.isEmpty(case_management_obj) ) {
								case_management.push( _.extend( {}, assessment_obj, case_management_obj ) );	
							}
							if ( !_.isEmpty(water_obj) ) {
								water.push( _.extend( {}, assessment_obj, water_obj ) );
							}
							if ( !_.isEmpty(ipc_obj) ) {
								ipc.push( _.extend( {}, assessment_obj, ipc_obj ) );
							}
							if ( !_.isEmpty(stocks_obj) ) {
								stocks.push( _.extend( {}, assessment_obj, stocks_obj ) );
							}

						});

						// either that or drop the whole schema
            var Promise = require('bluebird');

            Promise.all([
              Assessments.destroy({}),
              CaseManagement.destroy({}),
              Water.destroy({}),
              Ipc.destroy({}),
              Stocks.destroy({})
            ])
            .catch( function(err) {
              return res.negotiate( err )
            })
            .done( function() {
	            Promise.all([
	              Assessments.create(assessments),
	              CaseManagement.create(case_management),
	              Water.create(water),
	              Ipc.create(ipc),
	              Stocks.create(stocks)
	            ])
	            .catch( function(err) {
	              return res.negotiate( err )
	            })
	            .done( function() {
              	res.json( 200, { success: true, msg: 'Success!' });
              });
            });

				});

			}

		});

	}

};
