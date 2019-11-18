/**
 * GfaTaskController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// require
const fs = require('fs');
const async = require('async');
const moment = require( 'moment' );
const _ = require('underscore');
const XLSX = require('xlsx');
const XLSX_UTILS = XLSX.utils;
const EXEC = require('child_process').exec;

// constants
const XLSX_PATH = '/home/ubuntu/data/kobo/cxb/wfp/gfa';
const XLSX_TEMPLATE = XLSX_PATH + '/template/wfp_cxb_gfd_report_template.xlsx';

// kobo config
if ( sails.config.kobo ) {
	var kobo_user = sails.config.kobo.WFP_GFD_USER;
	var kobo_password = sails.config.kobo.WFP_GFD_PASSWORD;
}

// lookup table
var food_distribution_point_lookup = {
	'Bagghona': 'bagghona', // RIC
	'Balukhali 01': 'balukhali_1', // WVI
	'Balukhali 02': 'balukhali_2', // WVI
	'Burmapara': 'burma_para', // SCI
	'Camp 17': 'camp_17', // SCI
	'Camp 19': 'camp_19', // SCI
	'Camp 20Ext.': 'camp_20_ext', // SCI
	'Camp 4Ext.': 'camp_4_ext', // SCI
	'Hakimpara': 'hakimpara', // RIC
	'Jadimura': 'jadimura', // AAH
	'Jamtoli': 'jamtoli', // RIC
	'Lambasia': 'lambashia', // BRAC
	'Leda': 'leda_ms', // AAH
	'Modhurchara 1': 'modhur_chara_1', // BRAC
	'Modhurchara 2': 'modhur_chara_2', // SCI
	'Modhurchara 3': 'modhur_chara_3', // SCI
	'Modhurchara 4': 'modhur_chara_4', // SCI
	'Moinerghona': 'mainnergona_1', // WVI
	'Shamlapur': 'shamlapur',  // AAH
	'TV Tower': 'tv_tower', // BRAC
}

// lookup table
var camp_block_lookup = {
	'C01E_A': 'CXB-201_B001',
	'C01E_B': 'CXB-201_B002',
	'C01E_C': 'CXB-201_B003',
	'C01E_D': 'CXB-201_B004',
	'C01E_E': 'CXB-201_B005',
	'C01E_F': 'CXB-201_B006',
	'C01E_G': 'CXB-201_B007',
	'C01W_A': 'CXB-202_B008',
	'C01W_B': 'CXB-202_B009',
	'C01W_C': 'CXB-202_B010',
	'C01W_D': 'CXB-202_B011',
	'C01W_E': 'CXB-202_B012',
	'C01W_F': 'CXB-202_B013',
	'C01W_G': 'CXB-202_B014',
	'C02E_A': 'CXB-203_B015',
	'C02E_B': 'CXB-203_B016',
	'C02E_C': 'CXB-203_B017',
	'C02E_D': 'CXB-203_B018',
	'C02E_E': 'CXB-203_B019',
	'C02W_A': 'CXB-204_B020',
	'C02W_B': 'CXB-204_B021',
	'C02W_C': 'CXB-204_B022',
	'C02W_D': 'CXB-204_B023',
	'C03_A': 'CXB-205_B024',
	'C03_B': 'CXB-205_B025',
	'C03_C': 'CXB-205_B026',
	'C03_D': 'CXB-205_B027',
	'C03_E': 'CXB-205_B028',
	'C03_F': 'CXB-205_B029',
	'C03_G': 'CXB-205_B030',
	'C04_A': 'CXB-206_B031',
	'C04_B': 'CXB-206_B032',
	'C04_C': 'CXB-206_B033',
	'C04_D': 'CXB-206_B034',
	'C04_E': 'CXB-206_B035',
	'C04_F': 'CXB-206_B036',
	'C04_G': 'CXB-206_B037',
	'C05_A': 'CXB-209_B038',
	'C05_B': 'CXB-209_B039',
	'C05_C': 'CXB-209_B040',
	'C05_D': 'CXB-209_B041',
	'C05_E': 'CXB-209_B042',
	'C06_A': 'CXB-208_B043',
	'C06_B': 'CXB-208_B044',
	'C06_C': 'CXB-208_B045',
	'C07_A':'CXB-207_B047',
	'C07_B':'CXB-207_B048',
	'C07_C':'CXB-207_B049',
	'C07_D':'CXB-207_B050',
	'C07_E':'CXB-207_B051',
	'C07_F':'CXB-207_B052',
	'C07_G':'CXB-207_B053',
	'C08E_A': 'CXB-210_B054',
	'C08E_B': 'CXB-210_B055',
	'C08E_C': 'CXB-210_B056',
	'C08E_D': 'CXB-210_B057',
	'C08E_E': 'CXB-210_B058',
	'C08E_F': 'CXB-210_B059',
	'C08W_A': 'CXB-211_B060',
	'C08W_B': 'CXB-211_B061',
	'C08W_C': 'CXB-211_B062',
	'C08W_D': 'CXB-211_B063',
	'C08W_E': 'CXB-211_B064',
	'C08W_F': 'CXB-211_B065',
	'C09_A': 'CXB-213_B066',
	'C09_B': 'CXB-213_B067',
	'C09_C': 'CXB-213_B068',
	'C09_D': 'CXB-213_B069',
	'C09_E': 'CXB-213_B070',
	'C09_F': 'CXB-213_B071',
	'C09_G': 'CXB-213_B072',
	'C10_A': 'CXB-214_B073',
	'C10_B': 'CXB-214_B074',
	'C10_C': 'CXB-214_B075',
	'C10_D': 'CXB-214_B076',
	'C10_E': 'CXB-214_B077',
	'C10_F': 'CXB-214_B078',
	'C11_A': 'CXB-217_B079',
	'C11_B': 'CXB-217_B080',
	'C11_C': 'CXB-217_B081',
	'C11_D': 'CXB-217_B082',
	'C11_E': 'CXB-217_B083',
	'C11_F': 'CXB-217_B084',
	'C12_A': 'CXB-218_B085',
	'C12_B': 'CXB-218_B086',
	'C12_C': 'CXB-218_B087',
	'C12_D': 'CXB-218_B088',
	'C14_A': 'CXB-222_B096',
	'C14_B': 'CXB-222_B097',
	'C14_C': 'CXB-222_B098',
	'C14_D': 'CXB-222_B099',
	'C14_E': 'CXB-222_B100',
	'C15_A': 'CXB-223_B101',
	'C15_B': 'CXB-223_B102',
	'C15_C': 'CXB-223_B103',
	'C15_D': 'CXB-223_B104',
	'C15_E': 'CXB-223_B105',
	'C15_F': 'CXB-223_B106',
	'C15_G': 'CXB-223_B107',
	'C15_H': 'CXB-223_B108',
	'C16_A': 'CXB-224_B109',
	'C16_B': 'CXB-224_B110',
	'C16_C': 'CXB-224_B111',
	'C16_D': 'CXB-224_B112',
	'C17_A': 'CXB-212_B113',
	'C17_B': 'CXB-212_B114',
	'C17_C': 'CXB-212_B115',
	'C18_A': 'CXB-215_B116',
	'C18_B': 'CXB-215_B117',
	'C18_C': 'CXB-215_B118',
	'C18_D': 'CXB-215_B119',
	'C18_E': 'CXB-215_B120',
	'C20_A': 'CXB-216_B125',
	'C20_B': 'CXB-216_B126',
	// 'C20EX_B': 'CXB_234_',
	'C23_A': 'CXB-032_B136',
	'C23_B': 'CXB-032_B137',
	'C24_A': 'CXB-233_B139',
	'C24_B': 'CXB-233_B140',
	'C24_C': 'CXB-233_B141',
	'C24_D': 'CXB-233_B142',
	'C24_E': 'CXB-233_B143',
	'C24_F': 'CXB-233_B144',
	'C24_G': 'CXB-233_B145',
	'C25_A': 'CXB-017_B146',
	'C25_B': 'CXB-017_B147',
	'C26_A': 'CXB-025_B148',
	'C26_B': 'CXB-025_B149',
	'C26_C': 'CXB-025_B150',
	'C26_D': 'CXB-025_B151',
	'C26_E': 'CXB-025_B152',
	'C26_F': 'CXB-025_B153',
	'C26_G': 'CXB-025_B154',
	'C26_H': 'CXB-025_B155',
	'C26_I': 'CXB-025_B156',
	'C27_A': 'CXB-037_B157',
	'C27_B': 'CXB-037_B158',
	'C27_C': 'CXB-037_B159',
	// 'NRC_B': 'CXB-089_',
	// 'NRC_C': 'CXB-089_',
	// 'NRC_D': 'CXB-089_',
	// 'NRC_E': 'CXB-089_',
	// 'NRC_H': 'CXB-089_',
	// 'NRC_I': 'CXB-089_',
	// 'NRC_P': 'CXB-089_',
}

// task controller
var GfaTaskController = {

	// set distribution round
	getDistributionRound: function( req, res ){

		// check req
		if ( !req.param( 'report_status' ) ) {
			return res.json( 401, { err: 'report_status required!' });
		}

		// report_status
		var report_status = req.param( 'report_status' );

		// distribution
		Distribution
			.find( { report_status: report_status } )
			.sort('report_distribution DESC')
			.exec( function( err, distributions ){

				// return error
				if (err) return res.negotiate( err );

				// return
				return res.json( 200, distributions );

			});

	},

	// set distribution round
	setDistributionRound: function( req, res ){

		// variables
		var round = req.param('round');
		var day = moment().date();
		var round_1 = 26;
		var round_2 = 8;

		// check req
		if ( !req.param('round') ) {
			return res.json( 401, { err: 'round as integer required!' });
		}

		// open round?
		if ( day !== 26 || day !== 8 ) {
			return res.json( 401, { err: 'round not open!' });
		}

		// create report
		var report = {
			report_round: round.toString(),
			report_status: 'active'
		};

		// switch
		if ( report.report_round == '1' ) {

			// set report variables
			report.report_month_number = moment().add( 1, 'M' ).month();
			report.report_month_name = moment().add( 1, 'M' ).format('MMMM');
			report.report_year = moment().add( 1, 'M' ).year();
			report.reporting_period = moment().add( 1, 'M' ).set('date', 1).startOf('day').format();
			report.reporting_due_date = moment().add( 1, 'M' ).set('date', round_1 ).startOf('day').format();		

			// set filter
			var filter = { report_round: report.report_round, report_year: moment().year(), report_month_number: moment().month() };

		} else {

			// 
			report.report_month_number = moment().month();
			report.report_month_name = moment().format('MMMM');
			report.report_year = moment().year();
			report.reporting_period = moment().set('date', 1).startOf('day').format();
			report.reporting_due_date = moment().add( 1, 'M' ).set('date', round_2 ).startOf('day').format();

			// set filter
			var filter = { report_round: report.report_round, report_year: moment().subtract( 1, 'M' ).year(), report_month_number: moment().subtract( 1, 'M' ).month() }

		}

		// distribution
		Distribution
			.update( filter, { report_status: 'complete' } )
			.exec( function( err, distribution ){

				// return error
				if (err) return res.negotiate( err );

				// set report_distribution
				report.report_distribution = parseInt( distribution[0].report_distribution ) + 2;
				report.report_distribution = report.report_distribution.toString();

				// find or create
				Distribution
					.updateOrCreate( { report_round: report.report_round, report_month_number: report.report_month_number, report_year: report.report_year }, report, 
					function( err, distribution ){

						// return error
						if (err) return res.negotiate( err );

						// return
						return res.json( 200, { msg: 'Success!' });

					});

			});

	},

	// upload planned beneficiaries
	processPlannedBeneficiaries: function( req, res ){

		// check req
		if ( !req.param('file') && !req.param('admin0pcode') && !req.param('organization_tag') && !req.param('report_round') && !req.param('report_distribution') ) {
			return res.json( 401, { err: 'file, admin0pcode, organization_tag, report_round, report_distribution required!' });
		}

		// set params
		var file = req.param('file');
		var admin0pcode = req.param('admin0pcode');
		var organization_tag = req.param('organization_tag');
		var report_round = req.param('report_round');
		var report_distribution = req.param('report_distribution');
		
		// xlsx
		var workbook = XLSX.readFile( file );

		// data will be processed into planned_beneficiaries
		var planned_beneficiaries = [];

		// get sheet with len
		var sheet_csv = [];
		var sheet_length = 0;
		var planned_beneficiaries_import;

		// get sheetnames
		var sheetnames = workbook.SheetNames;

		// find largest sheet and set to planned_beneficiaries
		for ( i=0; i < workbook.SheetNames.length; i++ ){
			//sheet to json
			sheet_csv[ i ] = XLSX_UTILS.sheet_to_json( workbook.Sheets[ workbook.SheetNames[ i ] ], { defval: '0' });
			if ( sheet_length < sheet_csv[ i ].length ) {
				sheet_length = sheet_csv[ i ].length;
				planned_beneficiaries_import = sheet_csv[ i ];
			}
		}

		// distribution
		// promise
		Promise.all([
			Organization.findOne( { admin0pcode: admin0pcode, organization_tag: organization_tag } ),
			Distribution.findOne( { report_distribution: report_distribution } ),
			Admin4.find( { admin0pcode:'CB', admin4type_name:'Refugee Block' } ),
			AdminSites.find( { admin0pcode:'CB', site_type_id:'food_distribution_point' } )
		])
		.catch( function( err ) {
			return res.negotiate( err );
		})
		.then( function( result ) {

			// assign
			var organization = result[ 0 ];
			var distribution = result[ 1 ];
			var admin4 = result[ 2 ];
			var food_distribution_points = result[ 3 ];

			// remove attrs
			organization.organization_id = organization.id;
			delete organization.id;
			delete organization.cluster_id;
			delete organization.cluster;
			delete organization.warehouses;
			delete organization.adminRpcode;
			delete organization.adminRname;
			delete organization.organization_type;
			delete organization.createdAt;
			delete organization.updatedAt;
			delete distribution.id;
			delete distribution.createdAt;
			delete distribution.updatedAt;

			// set to planned_beneficiaries
			async.each( planned_beneficiaries_import, function ( data, next ) {

				// JSON to array
					// ( to access columns via column index and not column names which might be manipulated );
				var d = [];
				for ( var i in data ) {
					d.push( data[ i ] );
				}

				// if fcn_id
				// if ( d[ 16 ] ) {

					// attrs
					var site;
					var admin;
					var distribution_site;
					var camp_block;
					var planned;

					// get distribution_site
					site = _.filter( food_distribution_points, function ( s ) {
						return s.site_id === food_distribution_point_lookup[ d[ 6 ] ];
					});

					// set distribution_site
					if ( site.length ) {
						distribution_site = {
							site_id: site[ 0 ].site_id,
							site_name: site[ 0 ].site_name,
							site_type_id: site[ 0 ].site_type_id,
							site_type_name: site[ 0 ].site_type_name,
							site_lat: site[ 0 ].site_lat,
							site_lng: site[ 0 ].site_lng
						}
					}
					

					// create camp_block key
					if ( d[ 9 ].length === 1 ) {
						var camp_number = d[ 8 ].match( /\d+/g ).map( Number )[ 0 ];
						var key = 'C';
								key += camp_number > 9 ? camp_number : '0' + camp_number;
								key += '_' + d[ 9 ];
						d[ 9 ] = key;
					}
					
					// set camp_block 
					admin = _.filter( admin4, function ( b ) {
						return b.admin4pcode === camp_block_lookup[ d[ 9 ] ];
					});

					// camp_block
					if ( admin.length ) {
						camp_block = {
							admin0pcode: admin[ 0 ].admin0pcode,
							admin0name: admin[ 0 ].admin0name,
							admin1pcode: admin[ 0 ].admin1pcode,
							admin1name: admin[ 0 ].admin1name,
							admin2pcode: admin[ 0 ].admin2pcode,
							admin2name: admin[ 0 ].admin2name,
							admin3pcode: admin[ 0 ].admin3pcode,
							admin3name: admin[ 0 ].admin3name,
							admin4pcode: admin[ 0 ].admin4pcode,
							admin4name: admin[ 0 ].admin4name,
							admin4lat: admin[ 0 ].admin4lat,
							admin4lng: admin[ 0 ].admin4lng
						}
					}

					// add to planned
					planned = Object.assign( { sl_number: d[ 0 ], distribution_date: moment( d[ 1 ] ).format( 'YYYY-MM-DD' ) }, organization, distribution, distribution_site, camp_block );

					// variables
					planned.admin5pcode = camp_block && camp_block.admin4pcode ? camp_block.admin4pcode + '_' + d[ 10 ] : d[ 10 ];
					planned.admin5name = d[ 10 ];

					// majee
					planned.majee_name = d[ 11 ];
					planned.majee_phone = d[ 12 ];
					planned.fh_name = d[ 14 ];
					planned.hh_name = d[ 13 ];
					planned.hh_age = d[ 23 ];
					planned.hh_gender = d[ 22 ] === 'M' || d[ 22 ] === 'Male' ? 'Male' : 'Female';
					
					// ids
					planned.scope_id = d[ 15 ].toString();
					planned.gfd_id = d[ 17 ].toString();
					planned.fcn_id = d[ 18 ].toString();
					planned.govt_id = d[ 19 ].toString();
					planned.unhcr_case_id = d[ 20 ].toString();
					planned.progres_id = d[ 21 ].toString();
					planned.gfd_modality = d[ 16 ];

					// demographics
					planned.gfd_family_size = d[ 34 ] ? parseInt( d[ 34 ] ) : 0;
					planned.boys_0_5 = d[ 27 ] ? parseInt( d[ 27 ] ) : 0;
					planned.girls_0_5 = d[ 26 ] ? parseInt( d[ 26 ] ) : 0;
					planned.boys_5_17 = d[ 29 ] ? parseInt( d[ 29 ] ) :0;
					planned.girls_5_17 = d[ 28 ] ? parseInt( d[ 28 ] ) : 0;
					planned.boys = parseInt( planned.boys_0_5 ) + parseInt( planned.boys_5_17 );
					planned.girls = parseInt( planned.girls_0_5 ) + parseInt( planned.girls_5_17 );
					planned.men = d[ 31 ] ? parseInt( d[ 31 ] ) : 0;
					planned.women = d[ 30 ] ? parseInt( d[ 30 ] ) : 0;
					planned.elderly_men = d[ 33 ] ? parseInt( d[ 33 ] ) : 0;
					planned.elderly_women = d[ 32 ] ? parseInt( d[ 32 ] ) : 0;
					planned.total_male = parseInt( planned.boys ) + parseInt( planned.men ) + parseInt( planned.elderly_men );
					planned.total_female = parseInt( planned.girls ) + parseInt( planned.women ) + parseInt( planned.elderly_women );
					planned.total_beneficiaries = parseInt( planned.total_male ) + parseInt( planned.total_female );

					// special needs
					planned.pregnant_hh = d[ 35 ] ? true : false;
					planned.lactating_hh = d[ 36 ] ? true : false;
					planned.disabled_hh = d[ 45 ] ? true : false;

					// special needs demographics
					planned.pregnant_women = d[ 35 ] ? parseInt( d[ 35 ] ) : 0;
					planned.lactating_women = d[ 36 ] ? parseInt( d[ 36 ] ) : 0;

					// disabled
					planned.boys_0_5_disabled = d[ 38 ] ? parseInt( d[ 38 ] ) : 0;
					planned.girls_0_5_disabled = d[ 37 ] ? parseInt( d[ 37 ] ) : 0;
					planned.boys_5_17_disabled = d[ 40 ] ? parseInt( d[ 40 ] ) : 0;
					planned.girls_5_17_disabled = d[ 39 ] ? parseInt( d[ 39 ] ) : 0;
					planned.boys_disabled = parseInt( planned.boys_0_5_disabled ) + parseInt( planned.boys_5_17_disabled );
					planned.girls_disabled = parseInt( planned.girls_0_5_disabled ) + parseInt( planned.girls_5_17_disabled );
					planned.men_disabled = d[ 42 ] ? parseInt( d[ 42 ] ) : 0;
					planned.women_disabled = d[ 41 ] ? parseInt( d[ 41 ] ) : 0;
					planned.elderly_men_disabled = d[ 44 ] ? parseInt( d[ 44 ] ) : 0;
					planned.elderly_women_disabled = d[ 43 ] ? parseInt( d[ 43 ] ) : 0;
					planned.total_male_disabled = parseInt( planned.boys_disabled ) + parseInt( planned.men_disabled ) + parseInt( planned.elderly_men_disabled );
					planned.total_women_disabled = parseInt( planned.girls_disabled ) + parseInt( planned.women_disabled ) + parseInt( planned.elderly_women_disabled );
					planned.total_beneficiaries_disabled = parseInt( planned.total_male_disabled ) + parseInt( planned.total_women_disabled );


					// monthly entitlements

					// round 1
					if ( report_round === '1' ) {
						if ( planned.gfd_family_size <= 10  ) {
							planned.rice = 30 / 1000;
							planned.lentils = 9 / 1000;
							planned.oil = ( 3 * 0.92 ) / 1000;
							planned.entitlements = planned.rice + planned.lentils + planned.oil;
						} else {
							planned.rice = 60 / 1000;
							planned.lentils = 18 / 1000;
							planned.oil = ( 6 * 0.92 ) / 1000;
							planned.entitlements = planned.rice + planned.lentils + planned.oil;
						}
					}

					// round 2
					if ( report_round === '2' ) {
						if ( planned.gfd_family_size >= 4 && planned.gfd_family_size <= 7 ) {
							planned.rice = 30 / 1000;
							planned.lentils = 9 / 1000;
							planned.oil = ( 3 * 0.92 ) / 1000;
							planned.entitlements = planned.rice + planned.lentils + planned.oil;
						}
						if ( planned.gfd_family_size >= 8 && planned.gfd_family_size <= 10 ) {
							planned.rice = 60 / 1000;
							planned.lentils = 18 / 1000;
							planned.oil = ( 6 * 0.92 ) / 1000;
							planned.entitlements = planned.rice + planned.lentils + planned.oil;
						}
						if ( planned.gfd_family_size >= 11 ) {
							planned.rice = 60 / 1000;
							planned.lentils = 18 / 1000;
							planned.oil = ( 6 * 0.92 ) / 1000;
							planned.entitlements = planned.rice + planned.lentils + planned.oil;
						}
					}
					
					// add report with p to reports
					planned_beneficiaries.push( planned );

				// }

				// next
				next();

			}, function ( err ) {
				
				// if error
				if ( err ) return cb( err, false );

				// remove existing
				PlannedBeneficiaries
					.destroy({ admin0pcode: admin0pcode, organization_tag: organization_tag, report_round: report_round, report_distribution: report_distribution  })
					.exec( function( err, destroy ) {

						// return error
						if (err) return res.negotiate( err );

						// replace with updated plan
						PlannedBeneficiaries
							.create( planned_beneficiaries )
							.exec( function( err, update ){

								// return error
								if (err) return res.negotiate( err );

								// remove file upload 
								if ( fs.existsSync( file ) ) { fs.unlinkSync( file ); }

								// return the reports for the project period
								return res.json( 200, { msg: 'Updating Kobo Daily Reporting Forms...' });

							});

					});

			});

		});

	},

	// set distribution round
	setKoboXlsxForm: function( req, res ){

		// check req
		if ( !req.param('admin0pcode') && !req.param('organization_tag') && !req.param('report_round') && !req.param('report_distribution') ) {
			return res.json( 401, { err: 'admin0pcode, organization_tag, report_round, report_distribution required!' });
		}

		// set params
		var admin0pcode = req.param('admin0pcode');
		var organization_tag = req.param('organization_tag');
		var report_round = req.param('report_round');
		var report_distribution = req.param('report_distribution');

		// gfd forms
		GfdForms
			.find()
			.where({ organization_tag: organization_tag })
			.where({ report_round: report_round })
			.exec( function( err, forms ) {

				// return error
				if (err) return res.negotiate( err );

				// remove existing
				PlannedBeneficiaries
					.find()
					.where({ organization_tag: organization_tag, report_round: report_round, report_distribution: report_distribution  })
					.sort({ fcn_id: 1 })
					.exec( function( err, planned_beneficiaries ) {

						// return error
						if (err) return res.negotiate( err );
						
						// fcn_list
						var choices_list = {};

						// generate fcn ids
						for ( i = 0; i < planned_beneficiaries.length; i++ ) {
							if ( !choices_list[ planned_beneficiaries[ i ][ 'site_id' ] ] ) {
								// set empty
								choices_list[ planned_beneficiaries[ i ][ 'site_id' ] ] = [];
								// choices beneficiary_type
								choices_list[ planned_beneficiaries[ i ][ 'site_id' ] ].push( [ 'list_name', 'name', 'label'] );
								// choices_list[ planned_beneficiaries[ i ][ 'site_id' ] ].push( [ 'beneficiary_type', 'planned_beneficiary', 'Planned Beneficiary'] );
								// choices_list[ planned_beneficiaries[ i ][ 'site_id' ] ].push( [ 'beneficiary_type', 'missing_beneficiary', 'Planned Beneficiary (not found on form list)'] );
							}
							// each beneficiary
							choices_list[ planned_beneficiaries[ i ][ 'site_id' ] ].push( [ 'fcn_id', planned_beneficiaries[ i ].fcn_id + '_' + planned_beneficiaries[ i ].scope_id, planned_beneficiaries[ i ].fcn_id + ' / ' + planned_beneficiaries[ i ].scope_id ] );
						}
						
						// deployments
						var xls_complete = 0;
						var xls_pending = forms.length;

						// set update
						doXlsUpdate( xls_complete, xls_pending, forms[ xls_complete ] );

						// do deployment
						function doXlsUpdate( xls_complete, xls_pending, form ) {
							
							// workbook template
							var workbook = XLSX.readFile( XLSX_TEMPLATE );

							// update distribution_round
							var survey_sheet = workbook.Sheets[ workbook.SheetNames[ 0 ] ];
							survey_sheet[ 'E6' ].t = 's';
							survey_sheet[ 'E6' ].v = report_round;
							survey_sheet[ 'E7' ].t = 's';
							survey_sheet[ 'E7' ].v = report_distribution;

							// settings
							var survey_sheet = workbook.Sheets[ workbook.SheetNames[ 1 ] ];
							survey_sheet[ 'A2' ].t = 's';
							survey_sheet[ 'A2' ].v = forms[ xls_complete ].form_title;
							survey_sheet[ 'B2' ].t = 's';
							survey_sheet[ 'B2' ].v = forms[ xls_complete ].form_template;

							// choices per form
							var choices = choices_list[ forms[ xls_complete ][ 'site_id' ] ];
							if ( !choices.length ) {
								choices = [];
								choices.push( [ 'list_name', 'name', 'label' ] );
								// choices.push( [ 'beneficiary_type', 'planned_beneficiary', 'Planned Beneficiary' ] );
								// choices.push( [ 'beneficiary_type', 'missing_beneficiary', 'Planned Beneficiary (not found on form list)' ] );
							}
							XLSX_UTILS.book_append_sheet( workbook, XLSX_UTILS.aoa_to_sheet( choices ), 'choices' );

							// writefile
							XLSX.writeFile( workbook, XLSX_PATH + '/forms/' + forms[ xls_complete ].organization_tag + '/' + forms[ xls_complete ].form_template + '_current.xlsx' );

							// add deployment complete
							xls_complete++;
							// return success
							if ( xls_complete === xls_pending ) {
								// return the reports for the project period
								return res.json( 200, { msg: 'Deploying Kobo Daily Reporting Forms...' });
							} else {
								// set process
								doXlsUpdate( xls_complete, xls_pending, forms[ xls_complete ] );
							}
						
						}

					});

			});

	},

	// deploy forms
	deployKoboXlsxForm: function( req, res ){

		// check req
		if ( !req.param('admin0pcode') && !req.param('organization_tag') && !req.param('report_round') && !req.param('report_distribution') ) {
			return res.json( 401, { err: 'admin0pcode, organization_tag, report_round, report_distribution required!' });
		}

		// set params
		var admin0pcode = req.param('admin0pcode');
		var organization_tag = req.param('organization_tag');
		var report_round = req.param('report_round');
		var report_distribution = req.param('report_distribution');

		// gfd forms
		GfdForms
			.find()
			.where({ organization_tag: organization_tag })
			.where({ report_round: report_round })
			.exec( function( err, forms ) {

				// return error
				if (err) return res.negotiate( err );

				// deployments
				var deployments_complete = 0;
				var deployments_pending = forms.length;

				// set process
				doDeployment( deployments_complete, deployments_pending, forms[ deployments_complete ] );

				
				// do deployment
				function doDeployment( deployments_complete, deployments_pending, form  ) {

					// import updated form
					var cmd_1 = 'curl --silent --user ' + kobo_user + ':' + kobo_password + ' --header "Accept: application/json" -X POST https://kobo.humanitarianresponse.info/imports/ --form destination=https://kobo.humanitarianresponse.info/assets/' + form[ 'assetUid' ] + '/ --form file=@' + XLSX_PATH + '/forms/' + form[ 'organization_tag' ] + '/' + form[ 'form_template' ] + '_current.xlsx | python -m json.tool';

					// run curl command
					EXEC( cmd_1, { maxBuffer: 1024 * 16384 }, function( error, stdout, stderr ) {

						// if error
						if ( error ) {
							// return error
							res.json( 400, { error: 'Form import error! Please try again...', details: error } );
						} else {

							// import updated form
							var cmd_2 = 'curl --silent --user ' + kobo_user + ':' + kobo_password + ' --header "Accept: application/json" https://kobo.humanitarianresponse.info/assets/' + form[ 'assetUid' ] + '/ | python -m json.tool';

							// run curl command
							EXEC( cmd_2, { maxBuffer: 1024 * 16384 }, function( error, stdout, stderr ) {

								// err
								if ( error ) {
									// return error
									res.json( 400, { error: 'Form version error! Please try again...', details: error  } );
								} else {

									// success
									kobo = JSON.parse( stdout );

									// get staged version
									var version_id = kobo.version_id;

									// import updated form
									var cmd_3 = 'curl --silent --user ' + kobo_user + ':' + kobo_password + ' --header "Accept: application/json" -X PATCH https://kobo.humanitarianresponse.info/assets/' + form[ 'assetUid' ] + '/deployment/ --form version_id=' + version_id;

									// run curl command
									EXEC( cmd_3, { maxBuffer: 1024 * 16384 }, function( error, stdout, stderr ) {

										// err
										if ( error || stderr ) {

											// send email
											sails.hooks.email.send( 'bgd-gfa-form-deployment', {
													name: 'WFP GFA Team',
													form: form.title,
													cmd: cmd_3,
													sendername: 'ReportHub'
												}, {
													to: 'pfitzgerald@immap.org, ngmreporthub@gmail.com',
													subject: 'Form Deployment Issue - ' + form.title + '!'
												}, function(err) {

													// return error
													if (err) return res.negotiate( err );

													// add deplotmnet complete
													deployments_complete++;
													// return success
													if ( deployments_complete === deployments_pending ) {
														// return the reports for the project period
														return res.json( 200, { msg: 'Form deployment error, instructions provided to WFP GFA Team via email' });
													} else {
														// set process
														doDeployment( deployments_complete, deployments_pending, forms[ deployments_complete ] );
													}

												});

										} else {

											// add deplotmnet complete
											deployments_complete++;
											// return success
											if ( deployments_complete === deployments_pending ) {
												// return the reports for the project period
												return res.json( 200, { msg: 'Kobo Daily Reporting Forms Successfully Deployed!' });
											} else {
												// set process
												doDeployment( deployments_complete, deployments_pending, forms[ deployments_complete ] );
											}

										}

									});

								}

							});

						}

					});

				}

			});

	},

	// kobo POSTed service
		// http://support.kobotoolbox.org/en/articles/592398-api-and-rest-services
	getKoboData: function( req, res ){

		// kobo data
		var k_data = req.body;

		// set actual_fcn_id
		var actual_fcn_id = k_data[ 'beneficiary_details/fcn_id' ].split( '_' )[ 0 ];
		var actual_scope_id = k_data[ 'beneficiary_details/fcn_id' ].split( '_' )[ 1 ];

		// filter
		var filter = { fcn_id: actual_fcn_id }
		if ( actual_scope_id ) {
			filter.scope_id = actual_scope_id;
		}

		// find from plan
		PlannedBeneficiaries
			.findOne()
			.where( filter )
			.exec( function( err, planned ) {
				// return error
				if ( err ) return res.negotiate( err );
		
				// update absent table
				AbsentBeneficiaries
					.updateOrCreate( filter, planned, function ( err, destroy_result ) {
						// return error
						if ( err ) return res.negotiate( err );

						// actual beneficiaries
						ActualBeneficiaries
							.destroy( filter )
							.exec( function( err, destroy_result ) {
								// return error
								if ( err ) return res.negotiate( err );
								
								// return success
								return res.json( 200, { msg: 'Success!' });
							});

					});
			});

	},

	// set planned to actual
	setDailyDistribution: function( req, res ){

		// get today's date
		var today = moment.utc().format( 'YYYY-MM-DD' );

		// find from plan
		PlannedBeneficiaries
			.find()
			.where({ distribution_date: today })
			.exec( function( err, planned_beneficiaries ) {
				
				// return error
				if ( err ) return res.negotiate( err );

				// if records
				if ( planned_beneficiaries.length ) {
					// set to actual
					ActualBeneficiaries
						.create( planned_beneficiaries )
						.exec( function( err, result ) {
							// return error
							if ( err ) return res.negotiate( err );
							// return success
							return res.json( 200, { msg: 'Success!' });
						});

				}

				// if no records
				if ( !planned_beneficiaries.length  ) {
					// return success
					return res.json( 200, { msg: 'Success!' });					
				}
				
			});

	}

}

module.exports = GfaTaskController;
