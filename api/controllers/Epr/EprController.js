/**
 * EprController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	// get data from kobo
		// set script to run (i.e. every hour)
	getKoboData: function  (req, res) {

		// set data
		var epr = [],
				alerts = [],
				disasters = [],
				
				// location
				provinces = {},
				districts = {},

				// disease_lookup
				disease_lookup = {
					'1': 'ABD',
					'2': 'Acute Flaccid Paralysis',
					'3': 'Acute Viral Hepatitis',
					'4': 'ADD',
					'5': 'AWD and Dehydration',
					'6': 'Cough and Cold',
					'7': 'Diphtheria',
					'8': 'Hemorrhagic Fever',
					'9': 'Malaria',
					'10': 'Measles',
					'11': 'Meningitis',
					'12': 'Neonatal Tetanus',
					'13': 'Pertussis',
					'14': 'Pneumonia',
					'15': 'Tetanus',
					'16': 'Tyhoid Fever'
				},

				// set cmd
				moment = require( 'moment' ),
				exec = require('child_process').exec,
				cmd = 'curl -X GET https://kc.humanitarianresponse.info/api/v1/data/97441?format=json -u pfitzpaddy:P@trick7';

		// run curl command
		exec( cmd, function( error, stdout, stderr ) {

			if ( error ) {

				// return error
			  res.json( 400, { error: 'Request error! Please try again...' } );

			} else {

				// success
				kobo = JSON.parse( stdout );

				// get location details
				Admin2
					.find()
					.where({ 'admin0pcode': 'AF' })
					.exec(function (err, admin2) {

						// err
						if ( err ) return res.negotiate( err );

						// for each
						admin2.forEach(function( d, i ){

							// create lookup
							provinces[ d.admin1pcode ] = d;
							districts[ d.admin2pcode ] = d;

						});				

						// rows
						kobo.forEach( function( d, i ){

							// each row
							var obj = {};

							// for each key, value
							for (var k in d){

								//
								var key = k.split('/')[ k.split('/').length - 1 ];
								
								// add default values
								var d_obj = {
									focal_point_name: d['reporting/reporting_focal_point/focal_point_name'],
									focal_point_title: d['reporting/reporting_focal_point/focal_point_title'],
									focal_point_email: d['reporting/reporting_focal_point/focal_point_email'],
									reporting_region: d['reporting/reporting_details/reporting_region'],
									reporting_region_name: d['reporting/reporting_details/reporting_region'].replace(/_/g,' ').toUpperCase(),
									reporting_province: d['reporting/reporting_details/reporting_province'],
									reporting_province_name: provinces[d['reporting/reporting_details/reporting_province']].admin1name,
									reporting_week: d['reporting/reporting_details/reporting_week'],
									reporting_year: d['reporting/reporting_details/reporting_year'],
									reporting_date: moment().year( d['reporting/reporting_details/reporting_year'] ).week( d['reporting/reporting_details/reporting_week'] ).add( 1, 'd' ).format( 'YYYY-MM-DD' ),
									reporting_lat: provinces[d['reporting/reporting_details/reporting_province']].admin1lat,
									reporting_lng: provinces[d['reporting/reporting_details/reporting_province']].admin1lng,
									_submission_time: d['_submission_time']
								};						
								
								switch ( key ) {
									
									case 'alerts':
										// for each alert
										d[key].forEach( function( alert, i ){

											// for key, value
											for (var j in alert){
												var d_key = j.split('/')[ j.split('/').length - 1 ];
												d_obj[d_key] = alert[j];
											}

											// province/distrct/disease name
											d_obj.alert_disease_name = disease_lookup[d_obj.alert_disease];
											d_obj.alert_province_name = provinces[d_obj.alert_province].admin1name;
											d_obj.alert_district_name = districts[d_obj.alert_district].admin2name;
											// lat/lng
											d_obj.alert_lat = districts[d_obj.alert_district].admin2lat;
											d_obj.alert_lng = districts[d_obj.alert_district].admin2lng;											

											// push as single record
											alerts.push( d_obj );

										});
										break;

									case 'disasters':
										// for each disaster
										d[key].forEach( function( disaster, i ){

											// for key, value
											for (var j in disaster){
												var d_key = j.split('/')[ j.split('/').length - 1 ];
												d_obj[d_key] = disaster[j];
											}

											// name
											d_obj.disaster_province_name = provinces[d_obj.disaster_province].admin1name;
											d_obj.disaster_district_name = districts[d_obj.disaster_district].admin2name;
											// lat/lng
											d_obj.disaster_lat = districts[d_obj.disaster_district].admin2lat;
											d_obj.disaster_lng = districts[d_obj.disaster_district].admin2lng;											

											// push as single record
											disasters.push( d_obj );

										});
										break;

									default:
										// set record
										obj[key] = d[k];
										obj.reporting_date = moment().year( moment(d['_submission_time']).year() ).week( d['reporting/reporting_details/reporting_week'] ).add( 1, 'd' ).format( 'YYYY-MM-DD' ),
										obj.reporting_year = moment(d['_submission_time']).year();
										obj.reporting_lat = provinces[d['reporting/reporting_details/reporting_province']].admin1lat;
										obj.reporting_lng = provinces[d['reporting/reporting_details/reporting_province']].admin1lng;
										obj.reporting_province_name = provinces[d['reporting/reporting_details/reporting_province']].admin1name;
										obj.reporting_region_name = d['reporting/reporting_details/reporting_region'].replace(/_/g,' ').toUpperCase();										
										break;
								}

							}

							// push to data
							epr.push( obj );

						});

						// destroy
						Epr.destroy({}).exec(function (err) {
							// err
							if ( err ) return res.negotiate( err );
							// insert into 				
							Epr.create(epr).exec(function (err, records) {
								// err
								if ( err ) return res.negotiate( err );						

								// destroy
								Alerts.destroy({}).exec(function (err) {
									// err
									if ( err ) return res.negotiate( err );
									// insert into 				
									Alerts.create(alerts).exec(function (err, records) {
										// err
										if ( err ) return res.negotiate( err );						

										// destroy
										Disasters.destroy({}).exec(function (err) {
											// err
											if ( err ) return res.negotiate( err );
											// insert into 				
											Disasters.create(disasters).exec(function (err, records) {
												// err
												if ( err ) return res.negotiate( err );						

												// return
												res.json( 200, { 'msg': 'success' });

											});
										});

									});
								});

							});
						});

				});

			}

		});

	}

};

