/**
 * GfaDashboardController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// require
const _ = require('underscore');
const moment = require( 'moment' );
const json2csv = require( 'json2csv' );

// task controller
var GfaDashboardController = {

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
		organization_tag_filter = organization_tag === 'wfp' ? {} : { organization_tag: organization_tag };

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
		if ( !req.param('indicator') && !req.param('admin0pcode') && !req.param('organization_tag') && !req.param('report_round') && !req.param('report_distribution') && !req.param('site_id') && !req.param('admin3pcode') ) {
			return res.json( 401, { err: 'indicator, admin0pcode, organization_tag, report_round, report_distribution, site_id, admin3pcode required!' });
		}

		// set params
		var indicator = req.param('indicator');
		var download = req.param('download') ? true : false;
		var admin0pcode = req.param('admin0pcode');
		var organization_tag = req.param('organization_tag');
		var report_round = req.param('report_round');
		var report_distribution = req.param('report_distribution');
		var site_id = req.param('site_id');
		var admin3pcode = req.param('admin3pcode');
		var admin4pcode = req.param('admin4pcode');
		var admin5pcode = req.param('admin5pcode');

		// if wfp, select all
		var organization_tag_filter = organization_tag === 'wfp' ? {} : { organization_tag: organization_tag };
		// if site eq all, select all
		var site_id_filter = site_id === 'all' ? {} : { site_id: site_id };
		// admin3pcode
		var admin3pcode_filter = admin3pcode === 'all' ? {} : { admin3pcode: admin3pcode };
		var admin4pcode_filter = admin4pcode === 'all' ? {} : { admin4pcode: admin4pcode };
		var admin5pcode_filter = admin5pcode === 'all' ? {} : { admin5pcode: admin5pcode };

		// distribution
		PlannedBeneficiaries
			.find()
			.where( { admin0pcode: admin0pcode } )
			.where( organization_tag_filter )
			.where( { report_round: report_round } )
			.where( { report_distribution: report_distribution } )
			.where( site_id_filter )
			.where( admin3pcode_filter )
			.where( admin4pcode_filter )
			.where( admin5pcode_filter )
			.exec( function( err, planned_beneficiaries ){

				// return error
				if (err) return res.negotiate( err );

				var filter;
				var value = 0;

				// indicators
				if ( !download ) {

					// indicator
					switch ( indicator ) {
						
						case 'duplicates':
							filter = _.chain( planned_beneficiaries ).groupBy( 'fcn_id' ).filter(function(v){ return v.length > 1 }).flatten().uniq().value();
							value = { 'value': filter.length };
							break;

						case 'rice':
							// food distribution plan
							planned = 0;
							for( i=0; i<planned_beneficiaries.length; i++ ){
								planned += planned_beneficiaries[ i ].planned_rice;
							}
							value = { 'value': planned };
							break;

						case 'lentils':
							// food distribution plan
							planned = 0;
							for( i=0; i<planned_beneficiaries.length; i++ ){
								planned += planned_beneficiaries[ i ].planned_lentils;
							}
							value = { 'value': planned };
							break;

						case 'oil':
							// food distribution plan
							planned = 0;
							for( i=0; i<planned_beneficiaries.length; i++ ){
								planned += planned_beneficiaries[ i ].planned_oil;
							}
							value = { 'value': planned };
							break;

						case 'entitlements':
							// food distribution plan
							planned = 0;
							for( i=0; i<planned_beneficiaries.length; i++ ){
								planned += planned_beneficiaries[ i ].planned_entitlements;
							}
							value = { 'value': planned };
							break;

						case 'family_size_1_3':
							filter = _.filter( planned_beneficiaries, function ( b ) {
								return b.total_beneficiaries >= 0 && b.total_beneficiaries <= 3;
							});
							value = { 'value': filter.length };
							break;

						case 'family_size_4_7':
							filter = _.filter( planned_beneficiaries, function ( b ) {
								return b.total_beneficiaries >= 4 && b.total_beneficiaries <= 7;
							});
							value = { 'value': filter.length };
							break;

						case 'family_size_8_10':
							filter = _.filter( planned_beneficiaries, function ( b ) {
								return b.total_beneficiaries >= 8 && b.total_beneficiaries <= 10;
							});
							value = { 'value': filter.length };
							break;

						case 'family_size_11+':
							filter = _.filter( planned_beneficiaries, function ( b ) {
								return b.total_beneficiaries >= 11;
							});
							value = { 'value': filter.length };
							break;

						case 'pregnant_hh':
							filter = _.filter( planned_beneficiaries, function ( b ) {
								return b.pregnant_hh;
							});
							value = { 'value': filter.length };
							break;

						case 'lactating_hh':
							filter = _.filter( planned_beneficiaries, function ( b ) {
								return b.lactating_hh;
							});
							value = { 'value': filter.length };
							break;

						case 'pregnant_lactating_hh':
							filter = _.filter( planned_beneficiaries, function ( b ) {
								return b.pregnant_hh || b.lactating_hh;
							});
							value = { 'value': filter.length };
							break;

						case 'disabled_hh':
							filter = _.filter( planned_beneficiaries, function ( b ) {
								return b.disabled_hh;
							});
							value = { 'value': filter.length };
							break;

						case 'duplicate_beneficiaries_list':
							filter = _.chain( planned_beneficiaries ).groupBy( 'fcn_id' ).filter(function(v){ return v.length > 1 }).flatten().uniq().value();
							value = filter;
							break;

						case 'beneficiaries_list':
							value = planned_beneficiaries;
							break;

						case 'menu':
							filter = _.uniq( planned_beneficiaries, 'admin3pcode');
							value = filter;
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
							if ( !planned_beneficiaries.length ) return res.json( 200, { 'data': { 'marker0': { layer: 'projects', lat: 21.2, lng: 92.2, message: '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">NO VULNERABLE POPN</h5>' } } } );

							// filter by vulnerable
							vulnerable_hhs = _.filter( planned_beneficiaries, function ( b ) {
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
							
							var family_size_1_3 = _.filter( planned_beneficiaries, function ( b ) {
								return b.total_beneficiaries >= 0 && b.total_beneficiaries <= 3;
							});
							var family_size_4_7 = _.filter( planned_beneficiaries, function ( b ) {
								return b.total_beneficiaries >= 4 && b.total_beneficiaries <= 7;
							});
							var family_size_8_10 = _.filter( planned_beneficiaries, function ( b ) {
								return b.total_beneficiaries >= 8 && b.total_beneficiaries <= 10;
							});
							var family_size_11 = _.filter( planned_beneficiaries, function ( b ) {
								return b.total_beneficiaries >= 11;
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
							value = { 'value': planned_beneficiaries.length };
					
					}

					// return
					return res.json( 200, value );

				}

				// downloads
				if ( download ) {

					// indicator
					switch ( indicator ) {

						case 'downloads_duplicates':

							// get duplicates
							filter = _.chain( planned_beneficiaries ).groupBy( 'fcn_id' ).filter(function(v){ return v.length > 1 }).flatten().uniq().value();

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
							filter = _.filter( planned_beneficiaries, function ( b ) {
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
								'organization',
								'report_distribution',
								'site_name',
								'admin3name',
								'admin4name',
								'admin5name',
								'family_1_to_3',
								'family_4_to_7',
								'family_8_to_10',
								'family_11+',
								'hh_total',
								'planned_rice',
								'planned_lentils',
								'planned_oil',
								'planned_entitlements',
								'site_lng',
								'site_lat',
							];
														
							// food distribution plan
							var filter = [];
							planned_beneficiaries.reduce( function( res, value ) {
								// group by organization_tag + admin5pcode
								var id = value.organization_tag + '_' + value.admin5pcode;
								if ( !res[ id ] ) {
									res[ id ] = value;
									res[ id ][ 'family_1_to_3' ] = 0;
									res[ id ][ 'family_4_to_7' ] = 0;
									res[ id ][ 'family_8_to_10' ] = 0;
									res[ id ][ 'family_11+' ] = 0;
									res[ id ][ 'hh_total' ] = 0;
									filter.push( res[ id ] );
								} else {
									// tally (initial values set with res[ id ] = value )
									res[ id ].planned_rice += value.planned_rice;
									res[ id ].planned_lentils += value.planned_lentils;
									res[ id ].planned_oil += value.planned_oil;
									res[ id ].planned_entitlements += value.planned_entitlements;
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

							// return csv
							json2csv({ data: filter, fields: fields, fieldNames: fields }, function( err, csv ) {

								// error
								if ( err ) return res.negotiate( err );

								// success
								value = { data: csv };

								// return
								return res.json( 200, value );

							});

							break;

						case 'downloads_planned_beneficiaries':

							// return csv
							json2csv({ data: planned_beneficiaries }, function( err, csv ) {

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
							json2csv({ data: planned_beneficiaries }, function( err, csv ) {

								// error
								if ( err ) return res.negotiate( err );

								// success
								value = { data: csv };

								// return
								return res.json( 200, value );

							});
					
					}

				}

			});

	},	

	// set distribution round
	getActualBeneficiariesIndicator: function( req, res ){

		// check req
		if ( !req.param('indicator') && !req.param('admin0pcode') && !req.param('organization_tag') && !req.param('report_round') && !req.param('site_id') && !req.param('admin3pcode') && !req.param('start_date') && !req.param('end_date') ) {
			return res.json( 401, { err: 'indicator, admin0pcode, organization_tag, report_round, report_distribution, site_id, admin3pcode, start_date, end_date required!' });
		}

		// set params
		var indicator = req.param('indicator');
		var download = req.param('download') ? true : false;
		var admin0pcode = req.param('admin0pcode');
		var organization_tag = req.param('organization_tag');
		var report_round = req.param('report_round');
		var report_distribution = req.param('report_distribution') ? req.param('report_distribution') : false;
		var site_id = req.param('site_id');
		var admin3pcode = req.param('admin3pcode');
		var admin4pcode = req.param('admin4pcode');
		var admin5pcode = req.param('admin5pcode');
		var start_date = req.param('start_date');
		var end_date = req.param('end_date');

		// if wfp, select all
		var organization_tag_filter = organization_tag === 'wfp' ? {} : { actual_organization_tag: organization_tag };
		// report round
		var report_round_filter = report_round === 'all' ? {} : { actual_report_round: report_round }; 
		var report_distribution_filter = !report_distribution ? {} : { actual_report_distribution: report_distribution };
		// if site eq all, select all
		var site_id_filter = site_id === 'all' ? {} : { actual_site_id: site_id };
		// admin3pcode
		var admin3pcode_filter = admin3pcode === 'all' ? {} : { admin3pcode: admin3pcode };
		var admin4pcode_filter = admin4pcode === 'all' ? {} : { admin4pcode: admin4pcode };
		var admin5pcode_filter = admin5pcode === 'all' ? {} : { admin5pcode: admin5pcode };

		// distribution
		ActualBeneficiaries
			.find()
			.where( { admin0pcode: admin0pcode } )
			.where( organization_tag_filter )
			.where( report_round_filter )
			.where( report_distribution_filter )
			.where( site_id_filter )
			.where( admin3pcode_filter )
			.where( admin4pcode_filter )
			.where( admin5pcode_filter )
			.where( { actual_distribution_date: { '>=': moment( start_date ).format( 'YYYY-MM-DD' ), '<=': moment( end_date ).format( 'YYYY-MM-DD' ) } } )
			.exec( function( err, actual_beneficiaries ){

				// return error
				if (err) return res.negotiate( err );

				var filter;
				var value = 0;

				// indicators
				if ( !download ) {

					// indicator
					switch ( indicator ) {

						case 'latest':
							// avoid -Infinity
							value = { updatedAt: 0 }
							// filter by _.max date
							if ( actual_beneficiaries.length ) {
								filter = _.max( actual_beneficiaries, function( b ) { 
									return moment( b.updatedAt ).unix();
								});
								value = filter;
							}
							break;
						
						case 'duplicates':
							filter = _.chain( actual_beneficiaries ).groupBy( 'fcn_id' ).filter(function(v){ return v.length > 1 }).flatten().uniq().value();
							value = { 'value': filter.length };
							break;

						case 'unplanned_new_beneficiary':
							filter = _.filter( actual_beneficiaries, function ( b ) {
								return b.beneficiary_type_id === 'unplanned_new_beneficiary';
							});
							value = { 'value': filter.length };
							break;

						case 'rice':
							// food distribution plan
							actual = 0;
							for( i=0; i<actual_beneficiaries.length; i++ ){
								actual += actual_beneficiaries[ i ].actual_rice;
							}
							value = { 'value': actual };
							break;

						case 'lentils':
							// food distribution plan
							actual = 0;
							for( i=0; i<actual_beneficiaries.length; i++ ){
								actual += actual_beneficiaries[ i ].actual_lentils;
							}
							value = { 'value': actual };
							break;

						case 'oil':
							// food distribution plan
							actual = 0;
							for( i=0; i<actual_beneficiaries.length; i++ ){
								actual += actual_beneficiaries[ i ].actual_oil;
							}
							value = { 'value': actual };
							break;

						case 'entitlements':
							// food distribution plan
							actual = 0;
							for( i=0; i<actual_beneficiaries.length; i++ ){
								actual += actual_beneficiaries[ i ].actual_entitlements;
							}
							value = { 'value': actual };
							break;

						case 'family_size_1_3':
							filter = _.filter( actual_beneficiaries, function ( b ) {
								return b.actual_gfd_family_size >= 0 && b.actual_gfd_family_size <= 3;
							});
							value = { 'value': filter.length };
							break;

						case 'family_size_4_7':
							filter = _.filter( actual_beneficiaries, function ( b ) {
								return b.actual_gfd_family_size >= 4 && b.actual_gfd_family_size <= 7;
							});
							value = { 'value': filter.length };
							break;

						case 'family_size_8_10':
							filter = _.filter( actual_beneficiaries, function ( b ) {
								return b.actual_gfd_family_size >= 8 && b.actual_gfd_family_size <= 10;
							});
							value = { 'value': filter.length };
							break;

						case 'family_size_11+':
							filter = _.filter( actual_beneficiaries, function ( b ) {
								return b.actual_gfd_family_size >= 11;
							});
							value = { 'value': filter.length };
							break;

						case 'pregnant_hh':
							filter = _.filter( actual_beneficiaries, function ( b ) {
								return b.pregnant_hh;
							});
							value = { 'value': filter.length };
							break;

						case 'lactating_hh':
							filter = _.filter( actual_beneficiaries, function ( b ) {
								return b.lactating_hh;
							});
							value = { 'value': filter.length };
							break;

						case 'pregnant_lactating_hh':
							filter = _.filter( actual_beneficiaries, function ( b ) {
								return b.pregnant_hh || b.lactating_hh;
							});
							value = { 'value': filter.length };
							break;

						case 'disabled_hh':
							filter = _.filter( actual_beneficiaries, function ( b ) {
								return b.disabled_hh;
							});
							value = { 'value': filter.length };
							break;

						case 'duplicate_beneficiaries_list':
							filter = _.chain( actual_beneficiaries ).groupBy( 'fcn_id' ).filter(function(v){ return v.length > 1 }).flatten().uniq().value();
							value = filter;
							break;

						case 'unplanned_new_beneficiary_list':
							filter = _.filter( actual_beneficiaries, function ( b ) {
								return b.beneficiary_type_id === 'unplanned_new_beneficiary';
							});
							value = filter;
							break;

						case 'beneficiaries_list':
							value = actual_beneficiaries;
							break;

						case 'menu':
							filter = _.uniq( actual_beneficiaries, 'admin3pcode');
							value = filter;
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
							if ( !actual_beneficiaries.length ) return res.json( 200, { 'data': { 'marker0': { layer: 'projects', lat: 21.2, lng: 92.2, message: '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">NO VULNERABLE POPN</h5>' } } } );

							// filter by vulnerable
							vulnerable_hhs = _.filter( actual_beneficiaries, function ( b ) {
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
							
							var family_size_1_3 = _.filter( actual_beneficiaries, function ( b ) {
								return b.actual_gfd_family_size >= 0 && b.actual_gfd_family_size <= 3;
							});
							var family_size_4_7 = _.filter( actual_beneficiaries, function ( b ) {
								return b.actual_gfd_family_size >= 4 && b.actual_gfd_family_size <= 7;
							});
							var family_size_8_10 = _.filter( actual_beneficiaries, function ( b ) {
								return b.actual_gfd_family_size >= 8 && b.actual_gfd_family_size <= 10;
							});
							var family_size_11 = _.filter( actual_beneficiaries, function ( b ) {
								return b.actual_gfd_family_size >= 11;
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
							value = { 'value': actual_beneficiaries.length };
					
					}

					// return
					return res.json( 200, value );

				}

				// downloads
				if ( download ) {

					// indicator
					switch ( indicator ) {

						case 'downloads_duplicates':

							// get duplicates
							filter = _.chain( actual_beneficiaries ).groupBy( 'fcn_id' ).filter(function(v){ return v.length > 1 }).flatten().uniq().value();

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

						case 'downloads_unplanned_new_beneficiary':

							// get duplicates
							filter = _.filter( actual_beneficiaries, function ( b ) {
								return b.beneficiary_type_id === 'unplanned_new_beneficiary';
							});
							value = filter;

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
							filter = _.filter( actual_beneficiaries, function ( b ) {
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
								'organization',
								'report_distribution',
								'site_name',
								'admin3name',
								'admin4name',
								'admin5name',
								'family_1_to_3',
								'family_4_to_7',
								'family_8_to_10',
								'family_11+',
								'hh_total',
								'actual_rice',
								'actual_lentils',
								'actual_oil',
								'actual_entitlements',
								'site_lng',
								'site_lat',
							];
														
							// food distribution plan
							var filter = [];
							actual_beneficiaries.reduce( function( res, value ) {
								// group by organization_tag + admin5pcode
								var id = value.organization_tag + '_' + value.admin5pcode;
								if ( !res[ id ] ) {
									res[ id ] = value;
									res[ id ][ 'family_1_to_3' ] = 0;
									res[ id ][ 'family_4_to_7' ] = 0;
									res[ id ][ 'family_8_to_10' ] = 0;
									res[ id ][ 'family_11+' ] = 0;
									res[ id ][ 'hh_total' ] = 0;
									filter.push( res[ id ] );
								} else {
									// tally (initial values set with res[ id ] = value )
									res[ id ].actual_rice += value.actual_rice;
									res[ id ].actual_lentils += value.actual_lentils;
									res[ id ].actual_oil += value.actual_oil;
									res[ id ].actual_entitlements += value.actual_entitlements;
								}

								// family size
								if ( value.actual_gfd_family_size >= 0 && value.actual_gfd_family_size <= 3 ) {
									res[ id ][ 'family_1_to_3' ]++;
								}
								if ( value.actual_gfd_family_size >= 4 && value.actual_gfd_family_size <= 7 ) {
									res[ id ][ 'family_4_to_7' ]++;
								}
								if ( value.actual_gfd_family_size >= 8 && value.actual_gfd_family_size <= 10 ) {
									res[ id ][ 'family_8_to_10' ]++;
								}
								if ( value.actual_gfd_family_size >= 11 ) {
									res[ id ][ 'family_11+' ]++;
								}
								// count hh's
								res[ id ][ 'hh_total' ]++;

								return res;
							}, {});

							// return csv
							json2csv({ data: filter, fields: fields, fieldNames: fields }, function( err, csv ) {

								// error
								if ( err ) return res.negotiate( err );

								// success
								value = { data: csv };

								// return
								return res.json( 200, value );

							});

							break;

						case 'downloads_actual_beneficiaries':

							// return csv
							json2csv({ data: actual_beneficiaries }, function( err, csv ) {

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
							json2csv({ data: actual_beneficiaries }, function( err, csv ) {

								// error
								if ( err ) return res.negotiate( err );

								// success
								value = { data: csv };

								// return
								return res.json( 200, value );

							});
					
					}

				}

			});

	},	

}

module.exports = GfaDashboardController;
