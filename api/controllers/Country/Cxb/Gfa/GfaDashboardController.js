/**
 * GfaDashboardController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// require
const fs = require('fs');
const _ = require('underscore');
const moment = require( 'moment' );
const json2csv = require( 'json2csv' );
const EXEC = require('child_process').exec;

// task controller
var GfaDashboardController = {

	// 
	filterByProperty: function ( array, propertyName ) {
		var occurrences = {}

		return array.filter(function(x) {
			var property = x[propertyName]
			if ( occurrences[property] ) {
				return false;
			}
			occurrences[property] = true;
			return true;
		})
	
	},

	// get planned beneficiaries
	getPlannedBeneficiaries: function( req, res ){

		// check req
		if ( !req.param('admin0pcode') && !req.param('organization_tag') && !req.param('report_round') && !req.param('report_distribution') ) {
			return res.json( 401, { err: 'admin0pcode, organization_tag, report_round, report_distribution required!' });
		}

		// set params
		var limit = req.param('limit') ? 1 : 10000 * 10000;
		var admin0pcode = req.param('admin0pcode');
		var organization_tag = req.param('organization_tag');
		var report_round = req.param('report_round');
		var report_distribution = req.param('report_distribution');

		// if wfp, select all
		organization_tag_filter = organization_tag === 'wfp' ? { organization_tag: { $exists: true } } : { organization_tag: organization_tag };

		// distribution
		PlannedBeneficiaries
			.find()
			.where( { admin0pcode: admin0pcode } )
			.where( organization_tag_filter )
			.where( { report_round: report_round } )
			.where( { report_distribution: report_distribution } )
			.limit( limit )
			.exec( function( err, planned_beneficiaries ){

				// return error
				if (err) return res.negotiate( err );

				// return
				return res.json( 200, planned_beneficiaries );

			});

	},

	// set distribution round
	getPlannedBeneficiariesIndicator: function( req, res ){

		// check req
		if ( !req.param('indicator') && !req.param('admin0pcode') && !req.param('organization_tag') && !req.param('report_round') && !req.param('site_id') && !req.param('admin3pcode') && !req.param('admin4pcode') && !req.param('admin5pcode') && !req.param('start_date') && !req.param('end_date') ) {
			return res.json( 401, { err: 'indicator, admin0pcode, organization_tag, report_round, site_id, admin3pcode, admin4pcode, admin5pcode, start_date, end_date required!' });
		}

		// set params
		var params = {
			indicator: req.param('indicator'),
			download: req.param('download') ? true : false,
			admin0pcode: req.param('admin0pcode'),
			organization_tag: req.param('organization_tag'),
			report_round: req.param('report_round'),
			report_distribution: req.param('report_distribution'),
			site_id: req.param('site_id'),
			admin3pcode: req.param('admin3pcode'),
			admin4pcode: req.param('admin4pcode'),
			admin5pcode: req.param('admin5pcode'),
			start_date: req.param('start_date'),
			end_date: req.param('end_date')
		}

		// filters
		// var filters = {
		// 	organization_tag: params.organization_tag === 'wfp' ? {} : { organization_tag: params.organization_tag },
		// 	site_id: params.site_id === 'all' ? {} : { site_id: params.site_id },
		// 	admin3pcode: params.admin3pcode === 'all' ? {} : { admin3pcode: params.admin3pcode },
		// 	admin4pcode: params.admin4pcode === 'all' ? {} : { admin4pcode: params.admin4pcode },
		// 	admin5pcode: params.admin5pcode === 'all' ? {} : { admin5pcode: params.admin5pcode }
		// }
		var filters = {
			organization_tag: params.organization_tag === 'wfp' ? { organization_tag: { $exists: true } } : { organization_tag: params.organization_tag },
			site_id: params.site_id === 'all' ? { site_id: { $exists: true } } : { site_id: params.site_id },
			admin3pcode: params.admin3pcode === 'all' ? { admin3pcode: { $exists: true } } : { admin3pcode: params.admin3pcode },
			admin4pcode: params.admin4pcode === 'all' ? { admin4pcode: { $exists: true } } : { admin4pcode: params.admin4pcode },
			admin5pcode: params.admin5pcode === 'all' ? { admin5pcode: { $exists: true } } : { admin5pcode: params.admin5pcode }
		}		

		// distribution
		PlannedBeneficiaries
			.find()
			.where( { admin0pcode: params.admin0pcode } )
			.where( { report_round: params.report_round } )
			.where( { report_distribution: params.report_distribution } )
			.where( filters.organization_tag )
			.where( filters.site_id )
			.where( filters.admin3pcode )
			.where( filters.admin4pcode )
			.where( filters.admin5pcode )
			.where( { distribution_date: { '>=': moment( params.start_date ).format( 'YYYY-MM-DD' ), '<=': moment( params.end_date ).format( 'YYYY-MM-DD' ) } } )
			.exec( function( err, planned_beneficiaries ){

				// return error
				if (err) return res.negotiate( err );

				// calculate indicators
				GfaDashboardController.setIndicator( params, filters, planned_beneficiaries, res );

			});

	},

	// set distribution round
	getActualBeneficiariesIndicator: function( req, res ){

		// check req
		if ( !req.param('indicator') && !req.param('admin0pcode') && !req.param('organization_tag') && !req.param('report_round') && !req.param('site_id') && !req.param('admin3pcode') && !req.param('admin4pcode') && !req.param('admin5pcode') && !req.param('start_date') && !req.param('end_date') ) {
			return res.json( 401, { err: 'indicator, admin0pcode, organization_tag, report_round, site_id, admin3pcode, admin4pcode, admin5pcode, start_date, end_date required!' });
		}

		// set params
		var params = {
			indicator: req.param('indicator'),
			download: req.param('download') ? true : false,
			admin0pcode: req.param('admin0pcode'),
			organization_tag: req.param('organization_tag'),
			report_round: req.param('report_round'),
			report_distribution: req.param('report_distribution') ? req.param('report_distribution') : false,
			site_id: req.param('site_id'),
			admin3pcode: req.param('admin3pcode'),
			admin4pcode: req.param('admin4pcode'),
			admin5pcode: req.param('admin5pcode'),
			start_date: req.param('start_date'),
			end_date: req.param('end_date')
		}

		// filters
		var filters = {
			organization_tag: params.organization_tag === 'wfp' ? {} : { organization_tag: params.organization_tag },
			report_round: params.report_round === 'all' ? {} : { report_round: params.report_round },
			report_distribution: !params.report_distribution ? {} : { report_distribution: params.report_distribution },
			site_id: params.site_id === 'all' ? {} : { site_id: params.site_id },
			admin3pcode: params.admin3pcode === 'all' ? {} : { admin3pcode: params.admin3pcode },
			admin4pcode: params.admin4pcode === 'all' ? {} : { admin4pcode: params.admin4pcode },
			admin5pcode: params.admin5pcode === 'all' ? {} : { admin5pcode: params.admin5pcode }
		}

		// distribution
		ActualBeneficiaries
			.find()
			.where( { admin0pcode: params.admin0pcode } )
			.where( filters.organization_tag )
			.where( filters.report_round )
			.where( filters.report_distribution )
			.where( filters.site_id )
			.where( filters.admin3pcode )
			.where( filters.admin4pcode )
			.where( filters.admin5pcode )
			.where( { distribution_date: { '>=': moment( params.start_date ).format( 'YYYY-MM-DD' ), '<=': moment( params.end_date ).format( 'YYYY-MM-DD' ) } } )
			.exec( function( err, actual_beneficiaries ){

				// return error
				if (err) return res.negotiate( err );

				// calculate indicators
				GfaDashboardController.setIndicator( params, filters, actual_beneficiaries, res );

			});

	},

	// set distribution round
	getAbsentBeneficiariesIndicator: function( req, res ){

		// check req
		if ( !req.param('indicator') && !req.param('admin0pcode') && !req.param('organization_tag') && !req.param('report_round') && !req.param('site_id') && !req.param('admin3pcode') && !req.param('admin4pcode') && !req.param('admin5pcode') && !req.param('start_date') && !req.param('end_date') ) {
			return res.json( 401, { err: 'indicator, admin0pcode, organization_tag, report_round, site_id, admin3pcode, admin4pcode, admin5pcode, start_date, end_date required!' });
		}

		// set params
		var params = {
			indicator: req.param('indicator'),
			download: req.param('download') ? true : false,
			admin0pcode: req.param('admin0pcode'),
			organization_tag: req.param('organization_tag'),
			report_round: req.param('report_round'),
			report_distribution: req.param('report_distribution') ? req.param('report_distribution') : false,
			site_id: req.param('site_id'),
			admin3pcode: req.param('admin3pcode'),
			admin4pcode: req.param('admin4pcode'),
			admin5pcode: req.param('admin5pcode'),
			start_date: req.param('start_date'),
			end_date: req.param('end_date')
		}

		// filters
		var filters = {
			organization_tag: params.organization_tag === 'wfp' ? {} : { organization_tag: params.organization_tag },
			report_round: params.report_round === 'all' ? {} : { report_round: params.report_round },
			report_distribution: !params.report_distribution ? {} : { report_distribution: params.report_distribution },
			site_id: params.site_id === 'all' ? {} : { site_id: params.site_id },
			admin3pcode: params.admin3pcode === 'all' ? {} : { admin3pcode: params.admin3pcode },
			admin4pcode: params.admin4pcode === 'all' ? {} : { admin4pcode: params.admin4pcode },
			admin5pcode: params.admin5pcode === 'all' ? {} : { admin5pcode: params.admin5pcode }
		}

		// distribution
		AbsentBeneficiaries
			.find()
			.where( { admin0pcode: params.admin0pcode } )
			.where( filters.organization_tag )
			.where( filters.report_round )
			.where( filters.report_distribution )
			.where( filters.site_id )
			.where( filters.admin3pcode )
			.where( filters.admin4pcode )
			.where( filters.admin5pcode )
			.where( { distribution_date: { '>=': moment( params.start_date ).format( 'YYYY-MM-DD' ), '<=': moment( params.end_date ).format( 'YYYY-MM-DD' ) } } )
			.exec( function( err, absent_beneficiaries ){

				// return error
				if (err) return res.negotiate( err );

				// calculate indicators
				GfaDashboardController.setIndicator( params, filters, absent_beneficiaries, res );

			});

	},

	// calculate indicators
	setIndicator: function( params, filters, beneficiaries, res ) {

		// indicator params
		var filter;
		var value = 0;

		// indicators
		if ( !params.download ) {

			// indicator
			switch ( params.indicator ) {

				case 'latest':
					// avoid -Infinity
					value = { updatedAt: 0 }
					// filter by _.max date
					if ( beneficiaries.length ) {
						filter = _.max( beneficiaries, function( b ) { 
							return moment( b.updatedAt ).unix();
						});
						value = filter;
					}
					break;
				
				case 'duplicates':
					filter = _.chain( beneficiaries ).groupBy( 'fcn_id' ).filter(function(v){ return v.length > 1 }).flatten().uniq().value();
					value = { 'value': filter.length };
					break;

				case 'rice':
					// food distribution plan
					planned = 0;
					console.log( 'planned_beneficiaries' );
					for( i=0; i<beneficiaries.length; i++ ){
						planned += beneficiaries[ i ].rice;
					}
					console.log( 'loop' );
					value = { 'value': planned };
					break;

				case 'lentils':
					// food distribution plan
					planned = 0;
					for( i=0; i<beneficiaries.length; i++ ){
						planned += beneficiaries[ i ].lentils;
					}
					value = { 'value': planned };
					break;

				case 'oil':
					// food distribution plan
					planned = 0;
					for( i=0; i<beneficiaries.length; i++ ){
						planned += beneficiaries[ i ].oil;
					}
					value = { 'value': planned };
					break;

				case 'entitlements':
					// food distribution plan
					planned = 0;
					for( i=0; i<beneficiaries.length; i++ ){
						planned += beneficiaries[ i ].entitlements;
					}
					value = { 'value': planned };
					break;

				case 'family_size_1_3':
					filter = _.filter( beneficiaries, function ( b ) {
						return b.gfd_family_size >= 1 && b.gfd_family_size <= 3;
					});
					value = { 'value': filter.length };
					break;

				case 'family_size_4_7':
					filter = _.filter( beneficiaries, function ( b ) {
						return b.gfd_family_size >= 4 && b.gfd_family_size <= 7;
					});
					value = { 'value': filter.length };
					break;

				case 'family_size_8_10':
					filter = _.filter( beneficiaries, function ( b ) {
						return b.gfd_family_size >= 8 && b.gfd_family_size <= 10;
					});
					value = { 'value': filter.length };
					break;

				case 'family_size_11+':
					filter = _.filter( beneficiaries, function ( b ) {
						return b.gfd_family_size >= 11;
					});
					value = { 'value': filter.length };
					break;

				case 'pregnant_hh':
					filter = _.filter( beneficiaries, function ( b ) {
						return b.pregnant_hh;
					});
					value = { 'value': filter.length };
					break;

				case 'lactating_hh':
					filter = _.filter( beneficiaries, function ( b ) {
						return b.lactating_hh;
					});
					value = { 'value': filter.length };
					break;

				case 'pregnant_lactating_hh':
					filter = _.filter( beneficiaries, function ( b ) {
						return b.pregnant_hh || b.lactating_hh;
					});
					value = { 'value': filter.length };
					break;

				case 'disabled_hh':
					filter = _.filter( beneficiaries, function ( b ) {
						return b.disabled_hh;
					});
					value = { 'value': filter.length };
					break;

				case 'beneficiaries_duplicate_list':
					filter = _.chain( beneficiaries ).groupBy( 'fcn_id' ).filter(function(v){ return v.length > 1 }).flatten().uniq().value();
					value = filter;
					break;

				case 'beneficiaries_absent_list':
					value = beneficiaries;
					break;

				case 'beneficiaries_list':
					value = beneficiaries;
					break;

				case 'menu':
					
					// admin
					var admin3 = _.sortBy( _.unique( beneficiaries, 'admin3pcode' ), 'admin3name' ); 
					var admin4 = _.sortBy( _.unique( beneficiaries, 'admin4pcode' ), 'admin4name' ); 
					var admin5 = _.sortBy( _.unique( beneficiaries, 'admin5pcode' ), 'admin5name' );
					var site_id = _.sortBy( _.unique( beneficiaries, 'site_id' ), 'site_name' );
					var dates = _.sortBy( _.unique( beneficiaries, 'distribution_date' ), 'distribution_date' );
					
					// set
					value = {
						admin3: admin3,
						admin4: admin4,
						admin5: admin5,
						site_id: site_id,
						dates: dates,
					}

					break;

				case 'markers':

					var vulnerable_hhs = [],
							blocks_groups = [],
							blocks_data = [],
							data = [],
							counter = 0,
							length = 0,
							markers = {};

					// return no locations
					if ( !beneficiaries.length ) return res.json( 200, { 'data': { 'marker0': { layer: 'projects', lat: 21.2, lng: 92.2, message: '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">NO VULNERABLE POPN</h5>' } } } );

					// filter by vulnerable
					vulnerable_hhs = _.filter( beneficiaries, function ( b ) {
						return b.pregnant_hh || b.lactating_hh || b.disabled_hh;
					});

					// group by admin4pcode
					blocks_groups = _.groupBy( vulnerable_hhs, 'admin4pcode' );

					// loop
					for ( var key in  blocks_groups ) {

						// set first
						blocks_data[ key ] = blocks_groups[ key ][ 0 ];

						// for loop
						for ( i = 1; i < blocks_groups[ key ].length; i++ ) {
							blocks_data[ key ].pregnant_women += blocks_groups[ key ][ i ].pregnant_women;
							blocks_data[ key ].lactating_women += blocks_groups[ key ][ i ].lactating_women;
							blocks_data[ key ].boys_disabled += blocks_groups[ key ][ i ].boys_disabled;
							blocks_data[ key ].girls_disabled += blocks_groups[ key ][ i ].girls_disabled;
							blocks_data[ key ].men_disabled += blocks_groups[ key ][ i ].men_disabled;
							blocks_data[ key ].women_disabled += blocks_groups[ key ][ i ].women_disabled;
							blocks_data[ key ].elderly_men_disabled += blocks_groups[ key ][ i ].elderly_men_disabled;
							blocks_data[ key ].elderly_women_disabled += blocks_groups[ key ][ i ].elderly_women_disabled;
						}

					}

					// flatten
					for ( var key in  blocks_data ) {
						data.push( blocks_data[ key ] );
					}

					// length
					length = data.length;
					
					// foreach location
					data.forEach( function( d, i ){

						// popup message
						var message = '<h5 style="text-align:center; font-size:1.3rem; font-weight:100;">Location: ' + d.admin4name + '</h5>'
								message += '<h5 style="text-align:center; font-size:1.3rem; font-weight:100;">GFD Point: ' + d.site_name + '</h5>'
												if ( d.admin5name ) {
													message += '<div style="text-align:center">' + d.admin1name + ', ' + d.admin2name + ', ' + d.admin3name + ', ' + d.admin4name + ', ' + d.admin5name + '</div>';
												} else if ( d.admin4name ) {
													message += '<div style="text-align:center">' + d.admin1name + ', ' + d.admin2name + ', ' + d.admin3name + ', ' + d.admin4name + '</div>';
												} else if ( d.admin3name ) {
													message += '<div style="text-align:center">' + d.admin1name + ', ' + d.admin2name + ', ' + d.admin3name + '</div>';
												} else {
													message += '<div style="text-align:center">' + d.admin1name + ', ' + d.admin2name + '</div>';
												}
												message += '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">SUMMARY</h5>'
												+ '<div style="text-align:center">Pregnant: ' + d.pregnant_women + '</div>'
												+ '<div style="text-align:center">Lactating: ' + d.lactating_women + '</div>'
												+ '<div style="text-align:center">Disabled Boys: ' + d.boys_disabled + '</div>'
												+ '<div style="text-align:center">Disabled Girls: ' + d.girls_disabled + '</div>'
												+ '<div style="text-align:center">Disabled Men: ' + d.men_disabled + '</div>'
												+ '<div style="text-align:center">Disabled Women: ' + d.women_disabled + '</div>'
												+ '<div style="text-align:center">Disabled Elderly Men: ' + d.elderly_men_disabled + '</div>'
												+ '<div style="text-align:center">Disabled Elderly Women: ' + d.elderly_women_disabled + '</div>';

						// create markers
						markers[ 'marker' + counter ] = {
							layer: 'projects',
							lat: d.admin4lat,
							lng: d.admin4lng,
							message: message
						};

						// plus
						counter++;

						// if last location
						if( counter === length ){

							// return markers
							value = { 'data': markers }

						}

					});

					break;

				case 'family_size_chart':
					
					var family_size_1_3 = _.filter( beneficiaries, function ( b ) {
						return b.gfd_family_size >= 0 && b.gfd_family_size <= 3;
					});
					var family_size_4_7 = _.filter( beneficiaries, function ( b ) {
						return b.gfd_family_size >= 4 && b.gfd_family_size <= 7;
					});
					var family_size_8_10 = _.filter( beneficiaries, function ( b ) {
						return b.gfd_family_size >= 8 && b.gfd_family_size <= 10;
					});
					var family_size_11 = _.filter( beneficiaries, function ( b ) {
						return b.gfd_family_size >= 11;
					});
					value = { 
						data: [
							[ '1-3', family_size_1_3.length ],
							[ '4-7', family_size_4_7.length ],
							[ '8-10', family_size_8_10.length ],
							[ '11+', family_size_11.length ]
						]
					}
					break;

				default:
					value = { 'value': beneficiaries.length };
			
			}

			// return
			return res.json( 200, value );

		}

		// downloads
		if ( params.download ) {

			// indicator
			switch ( params.indicator ) {

				case 'print_distribution_zip':

					// folder
					var dir = '/home/ubuntu/nginx/www/ngm-reportPrint/pdf/';
					var folder = params.organization_tag + '_round_' + params.report_round + '_distribution_' + params.report_distribution + '_' + moment().unix();
					
					// run curl command
					fs.mkdir( dir + folder, { recursive: true }, function( err ) {
						// err
						if (err) throw err;

						// get form details
						GfdForms
						 .find()
						 .where( filters.organization_tag )
						 .where({ report_round: params.report_round })
						 .exec( function( err, forms ){

								// return error
								if ( err ) return res.negotiate( err );

								// distribution_list by site_id 
								var distribution_list = _.groupBy( beneficiaries, 'site_id' );

								// get length
								var forms_count = 0;
								var forms_length = forms.length;

								// build template
								doDistributionPoint( forms_count, forms_length, forms[ forms_count ], distribution_list[ forms[ forms_count ].site_id ] );

								// do template
								function doDistributionPoint( forms_count, forms_length, form, distribution_plan ){

									// group by date
									var distribution_dates = _.groupBy( _.sortBy( distribution_plan, 'distribution_date' ), 'distribution_date' );

									// distribution_dates
									var dates_count = 0;
									var dates_keys = Object.keys( distribution_dates );
									var dates_length = Object.keys( distribution_dates ).length;

									// run PDF function
									doDistributionDate( params, form, dates_keys[ dates_count ], distribution_dates );

									// loop each date to allow for PDF generation
									function doDistributionDate( params, form, date_key, distribution_dates ) {

										// html
										var template = GfaDashboardController.getDistributionPlanHtmlTemplate( params, form, date_key, distribution_dates );

										// fs write template
										fs.writeFile( template.dir + template.report + '.html', template.html, function( err ) {
											// err
											if( err ) return res.json( 400, { error: 'HTML Template error!', details: err  } );
											
											// import updated form
											var cmd = 'phantomjs /home/ubuntu/nginx/www/ngm-reportPrint/ngm-wfp-gfd.js "' + template.header_1 + '" "' + template.header_2 + '" "' + template.footer + '" ' + template.dir + template.report + '.html ' + dir + folder + '/' + template.report + '.pdf';

											// run curl command
											EXEC( cmd, { maxBuffer: 1024 * 20480 }, function( error, stdout, stderr ) {
												// err
												if ( error ) {
													// return error
													res.json( 400, { error: 'PDF error!', details: error  } );
												} else {
													
													// delete template
													fs.unlink( template.dir + template.report + '.html', function ( err ) {
														// err
														if ( err ) throw err;

														// generate master list pdf completed
														dates_count++;
														if ( dates_count === dates_length ) {
															forms_count++;
															if ( forms_count === forms_length ) {
																// zip
																var zip_cmd = 'cd /home/ubuntu/nginx/www/ngm-reportPrint/pdf; zip -r ' + folder + '.zip ' + folder;
																// run curl command
																EXEC( zip_cmd, { maxBuffer: 1024 * 1024 }, function( error, stdout, stderr ) {
																	// err
																	if ( error ) return res.json( 400, { error: 'ZIP error!', details: error  } );
																		// success
																		return res.json( 200, { report: folder + '.zip' });
																});
															} else {
																doDistributionPoint( forms_count, forms_length, forms[ forms_count ], distribution_list[ forms[ forms_count ].site_id ] );
															}
														} else {
															doDistributionDate( params, form, dates_keys[ dates_count ], distribution_dates );
														}

													});
												
												}
											
											});

										});
									
									}

								}

						});

					});

					break;

				case 'downloads_duplicates':

					// get duplicates
					filter = _.chain( beneficiaries ).groupBy( 'fcn_id' ).filter(function(v){ return v.length > 1 }).flatten().uniq().value();

					// return csv
					json2csv({ data: filter }, function( err, csv ) {

						// error
						if ( err ) return res.negotiate( err );

						// success
						value = { data: csv };

						// return
						return res.json( 200, value );

					});

					break;

				case 'downloads_vulnerable':

					// get duplicates
					filter = _.filter( beneficiaries, function ( b ) {
						return b.pregnant_hh || b.lactating_hh || b.disabled_hh;
					});;

					// return csv
					json2csv({ data: filter }, function( err, csv ) {

						// error
						if ( err ) return res.negotiate( err );

						// success
						value = { data: csv };

						// return
						return res.json( 200, value );

					});

					break;

				case 'downloads_food_distribution':

					// fields 
					var fields = [
						'distribution_date',
						'organization',
						'report_distribution',
						'site_name',
						'admin1name',
						'admin2name',
						'admin3name',
						'admin4name',
						'admin5name',
						'majhee_name',
						'family_1_to_3',
						'family_4_to_7',
						'family_8_to_10',
						'family_11+',
						'hh_total',
						'rice',
						'lentils',
						'oil',
						'entitlements',
						'site_lng',
						'site_lat',
					];

					// fieldNames
					var fieldNames = [
						'Date (YYYY-MM-DD)',
						'Implementing Partner',
						'Distribution',
						'Distribution Point',
						'Upazilla',
						'Union',
						'Camp',
						'Block',
						'Sub Block',
						'Majhee Name',
						'1 to 3',
						'4 to 7',
						'8 to 10',
						'11+',
						'HH Total',
						'Rice',
						'Lentils',
						'Oil',
						'Total',
						'site_lng',
						'site_lat',
					];
												
					// food distribution plan
					var data = [];
					beneficiaries.reduce( function( res, value ) {
						// group by organization_tag + admin5pcode + distribution_date
						var id = value.organization_tag + '_' + value.admin5pcode + ' ' + value.distribution_date;
						if ( !res[ id ] ) {
							res[ id ] = value;
							res[ id ][ 'family_1_to_3' ] = 0;
							res[ id ][ 'family_4_to_7' ] = 0;
							res[ id ][ 'family_8_to_10' ] = 0;
							res[ id ][ 'family_11+' ] = 0;
							res[ id ][ 'hh_total' ] = 0;
							data.push( res[ id ] );
						} else {
							// tally (initial values set with res[ id ] = value )
							res[ id ].rice += value.rice;
							res[ id ].lentils += value.lentils;
							res[ id ].oil += value.oil;
							res[ id ].entitlements += value.entitlements;
						}

						// family size
						if ( value.gfd_family_size >= 0 && value.gfd_family_size <= 3 ) {
							res[ id ][ 'family_1_to_3' ]++;
						}
						if ( value.gfd_family_size >= 4 && value.gfd_family_size <= 7 ) {
							res[ id ][ 'family_4_to_7' ]++;
						}
						if ( value.gfd_family_size >= 8 && value.gfd_family_size <= 10 ) {
							res[ id ][ 'family_8_to_10' ]++;
						}
						if ( value.gfd_family_size >= 11 ) {
							res[ id ][ 'family_11+' ]++;
						}
						// count hh's
						res[ id ][ 'hh_total' ]++;

						return res;
					}, {});

					// order by least important to most important
					var filter = _.chain( data )
						.sortBy( 'admin5name' )
						.sortBy( 'admin4name' )
						.sortBy( 'admin3name' )
						.sortBy( 'distribution_date' )
						.sortBy( 'organization' )
						.value();

					// return csv
					json2csv({ data: filter, fields: fields, fieldNames: fieldNames }, function( err, csv ) {

						// error
						if ( err ) return res.negotiate( err );

						// success
						value = { data: csv };

						// return
						return res.json( 200, value );

					});

					break;

				case 'downloads_absent_beneficiaries':

					// return csv
					json2csv({ data: beneficiaries }, function( err, csv ) {

						// error
						if ( err ) return res.negotiate( err );

						// success
						value = { data: csv };

						// return
						return res.json( 200, value );

					});

					break;

				case 'downloads_beneficiaries':

					// return csv
					json2csv({ data: beneficiaries }, function( err, csv ) {

						// error
						if ( err ) return res.negotiate( err );

						// success
						value = { data: csv };

						// return
						return res.json( 200, value );

					});

					break;

				default:
					
					// return csv
					json2csv({ data: beneficiaries }, function( err, csv ) {

						// error
						if ( err ) return res.negotiate( err );

						// success
						value = { data: csv };

						// return
						return res.json( 200, value );

					});
			
			}

		}

	},

	// return html template for distribution master list
	getDistributionPlanHtmlTemplate: function( params, form, date_key, distribution_dates ) {

		// html content
		var page_html_start = '';
		var page_html_body = '';

		// template object
		var template = {
			dir: '/home/ubuntu/data/html/template/',
			report: params.organization_tag + '_' + form.site_id + '_' + params.report_round + '_' + params.report_distribution + '_' + date_key + '_master_list',
			header_1: 'Master Roll for GFD Point: ' + form.site_name + ', Round ' + form.report_round + ', Distribution ' + params.report_distribution,
			header_2: 'Distribution Date: ' + moment( date_key ).format( 'MMMM Do YYYY' ),
			footer: 'Funded by the World Food Programme (WFP)'
		}

		// headers
		page_html_start = '<!DOCTYPE html>' +
			'<html lang="en">' +
				'<head>' +
					'<title>WFP GFD Distribution List</title>' +
					'<meta http-equiv="content-type" content="text/html; charset=UTF-8">' +
					'<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
					'<style type="text/css" media="all">' +
						'html {' +
							'margin: 0;' +
							'zoom: 1;' +
						'}' +
					'</style>' +
				'</head>' +
				'<style>' +
						'table {' +
							'width: 100%' +
							'font-family: verdana, arial, sans-serif;' +
							'color: #333333;' +
							'border-width: 1px;' +
							'border-color: #3A3A3A;' +
							'border-collapse: collapse;' +
						'}' +
						'table th {' +
							'border-width: 1px;' +
							'font-size: 7px;' +
							'padding: 2px;' +
							'border-style: solid;' +
							'border-color: #517994;' +
							'background-color: #B2CFD8;' +
						'}' +
						'table td {' +
							'border-width: 1px;' +
							'font-size: 7px;' +
							'padding: 2px;' +
							'border-style: solid;' +
							'border-color: #517994;' +
							'background-color: #ffffff;' +
						'}' +
				'</style>' +
				'<body>';


		// order by least important to most important
		var distribution = _.chain( distribution_dates[ date_key ] )
												.sortBy( 'gfd_id' )
												.sortBy( 'gfd_family_size' )
												.value();

		// foreach record
		var sub_header = 'Family Size 1 to 3';
		var family_4_to_7 = true;
		var family_8_to_10 = true;
		var family_11_plus = true;
		var beneficiary_page_count = 1;
		var beneficiary_page_length = 15;

		// for each record
		for( i=0; i < distribution.length; i++ ){

			// gfd entitlement
			var gfd_entitlement = 'Rice: 30kg<br/>Pulse: 9kg<br/>Oil: 3L';

			// true / false
			var page_break = ( beneficiary_page_count > beneficiary_page_length ) || 
						family_4_to_7 && distribution[ i ].gfd_family_size >= 4 || 
						family_8_to_10 && distribution[ i ].gfd_family_size >= 8 || 
						family_11_plus && distribution[ i ].gfd_family_size >= 11;

			// round 1
			if ( distribution[ i ].report_round === '1' ) {
				if ( distribution[ i ].gfd_family_size <= 10  ) {
					// gfd_entitlement
					gfd_entitlement = 'Rice: 30kg<br/>Pulse: 9kg<br/>Oil: 3L';
				} else {
					// gfd_entitlement
					gfd_entitlement = 'Rice: 60kg<br/>Pulse: 18kg<br/>Oil: 6L';
				}
			}

			// round 2
			if ( distribution[ i ].report_round === '2' ) {
				if ( distribution[ i ].gfd_family_size >= 1 && distribution[ i ].gfd_family_size <= 3 ) {
					// gfd_entitlement
					gfd_entitlement = 'Rice: 30kg<br/>Pulse: 9kg<br/>Oil: 3L';
				}
				if ( distribution[ i ].gfd_family_size >= 4 && distribution[ i ].gfd_family_size <= 7 ) {
					// gfd_entitlement
					gfd_entitlement = 'Rice: 30kg<br/>Pulse: 9kg<br/>Oil: 3L';
				}
				if ( distribution[ i ].gfd_family_size >= 8 && distribution[ i ].gfd_family_size <= 10 ) {
					// gfd_entitlement
					gfd_entitlement = 'Rice: 60kg<br/>Pulse: 18kg<br/>Oil: 6L';
				}
				if ( distribution[ i ].gfd_family_size >= 11 ) {
					// gfd_entitlement
					gfd_entitlement = 'Rice: 60kg<br/>Pulse: 18kg<br/>Oil: 6L';
				}
			}
			
			// check if first page / page break required
			if ( i === 0 || page_break ) {

				// page break for family_4_to_7
				if ( distribution[ i ].gfd_family_size >= 4 ) {
					family_4_to_7 = false;
					sub_header = 'Family Size 4 to 7';
				
				}

				// page break for family_8_to_10
				if ( distribution[ i ].gfd_family_size >= 8 ) {
					family_8_to_10 = false;
					sub_header = 'Family Size 8 to 10';
				
				}

				// page break for family_11_plus
				if ( distribution[ i ].gfd_family_size >= 11 ) {
					family_11_plus = false;
					sub_header = 'Family Size 11+';
				
				}

				// reset / page break
				if (  i !== 0 && page_break ) {
					// set 
					beneficiary_page_count = 1;
					
					// end
					page_html_body += '</tbody></table>';
					
					// approval content
					page_html_body += '' +
						'<table style="width: 100%; border-width: 0px; font-family: verdana, arial, sans-serif; font-size: 8px; color: #333333; margin: 10px 0px 0px 0px;">' +
							'<td style="width: 25%; border-width: 0px;" align="left">' +
								'Prepared by:' +
							"</td>" +
							'<td style="width: 25%; border-width: 0px;" align="left">' +
								'Checked by:' +
							"</td>" +
							'<td style="width: 25%; border-width: 0px;" align="left">' +
								'Approved by:' +
							"</td>" +
						'</table>';

					// page break
					page_html_body += '<div style="page-break-before: always;"></div>';
				}

				// page header
				page_html_body += '' +
					'<table style="border-width: 0px;">' +
						'<td width="20%" style="border-width: 0px; margin-top:-10px;">' +
							'<img src="https://reporthub.org/desk/images/logo/wfp-logo-standard-blue-en.png" width="90%" />' +
						'</td>' +
						'<td align="center" style="border-width: 0px;">' +
							'<h3 style="font-family: verdana, arial, sans-serif; font-size: 9px; padding-top:12px; margin:0px; font-weight: 300;">' + template.header_1 + '</h3>' +
							'<h3 style="font-family: verdana, arial, sans-serif; font-size: 9px; padding-top:6px; margin:0px; font-weight: 300;">' + sub_header + '</h3>' +
							'<h3 style="font-family: verdana, arial, sans-serif; font-size: 8px; padding-top:6px; margin:0px 0px 10px 0px; color: #616161; font-weight: 300;">' + template.header_2 + '</h3>' +
						'</td>' +
						'<td align="right" style="border-width: 0px;">' +
							'<img src="https://reporthub.org/desk/images/logo/' + params.organization_tag + '-logo.png" width="40%" />' +
						'</td>' +
					'</table>';	
				
				// theader
				page_html_body += '' +
					'<table style="width:100%">' +
					'<thead>' +
						'<tr>' +
							'<th>SL#</th>' +
							'<th>HH Number</th>' +
							'<th>FCN</th>' +
							'<th>Scope</th>' +
							'<th>HH Name</th>' +
							'<th>Family Size</th>' +
							'<th>GFD</th>' +
							'<th>Thumb</th>' +
						'</tr>' +
					'</thead>' +
					'<tbody>';
			}

			// content
			page_html_body += '' +
				'<tr>' +
					'<td>' + distribution[ i ].sl_number  + '</td>' +
					'<td>' + distribution[ i ].gfd_id + '</td>' +
					'<td>' + distribution[ i ].fcn_id + '</td>' +
					'<td>' + distribution[ i ].scope_id + '</td>' +
					'<td>' + distribution[ i ].hh_name + '</td>' +
					'<td align="center">' + distribution[ i ].gfd_family_size + '</td>' +
					'<td>' + gfd_entitlement + '</td>' +
					'<td width="25%" height="40px;"></td>' +
				'</tr>';
			
			// ++
			beneficiary_page_count++;

		}

		// end
		page_html_body += '</tbody></table>';
		
		// approval content
		page_html_body += '' +
			'<table style="width: 100%; border-width: 0px; font-family: verdana, arial, sans-serif; font-size: 8px; color: #333333; margin: 10px 0px 0px 0px;">' +
				'<td style="width: 25%; border-width: 0px;" align="left">' +
					'Prepared by:' +
				"</td>" +
				'<td style="width: 25%; border-width: 0px;" align="left">' +
					'Checked by:' +
				"</td>" +
				'<td style="width: 25%; border-width: 0px;" align="left">' +
					'Approved by:' +
				"</td>" +
			'</table>';

		// end
		page_html_body += '</tbody></table></body></html>';

		// set html
		template.html = page_html_start + page_html_body; 

		// return
		return template;

	}

}

module.exports = GfaDashboardController;
