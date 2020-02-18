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
const json2csv = require( 'json2csv' );
const _ = require('underscore');
const XLSX = require('xlsx');
const XLSX_UTILS = XLSX.utils;
const EXEC = require('child_process').exec;

// kobo config
if ( sails.config.kobo ) {
	var kobo_user = sails.config.kobo.WFP_LIVELIHOODS_USER;
	var kobo_password = sails.config.kobo.WFP_LIVELIHOODS_PASSWORD;
	var kobo_pk_action_aid = sails.config.kobo.WFP_LIVELIHOODS_PK_ACTION_AID;
	var kobo_pk_brac = sails.config.kobo.WFP_LIVELIHOODS_PK_BRAC;
}

// merge geo by distribution_points
var distribution_points ={
	'Camp 11 - Common Tailoring Zone': {
		"admin3pcode" : "CXB-217",
		"site_id" : 'camp_11_common_tailoring_zone',
		"site_name" : 'Camp 11 - Common Tailoring Zone',
		"site_lat": 21.1815356957658,
		"site_lng": 92.1559596391446
	},
	'Camp 11 - Men & Boys Center': {
		"admin3pcode" : "CXB-217",
		"site_id" : 'camp_11_men_boys_center',
		"site_name" : 'Camp 11 - Men & Boys Center',
		"site_lat": 21.1815356957658,
		"site_lng": 92.1559596391446
	},
	'Camp 12 - Women Friendly Space 1 (WFS 1)': {
		"admin3pcode" : "CXB-218",
		"site_id" : 'camp_12_women_friendly_space_1',
		"site_name" : 'Camp 12 - Women Friendly Space 1 (WFS 1)',
		"site_lat": 21.1794843848965,
		"site_lng": 92.1512797825594
	},
	'Camp 12 - Women Friendly Space 2 (WFS 2)': {
		"admin3pcode" : "CXB-218",
		"site_id" : 'camp_12_women_friendly_space_2',
		"site_name" : 'Camp 12 - Women Friendly Space 2 (WFS 2)',
		"site_lat": 21.1794843848965,
		"site_lng": 92.1512797825594
	}

}

// task controller
var LivelihoodsTaskController = {

	// get dataset
	getLivelihoodsDataset: function( req, res ){

		// csv
		var format = req.param('format') ? req.param('format') : false;

		// get
		Livelihoods
			.find()
			.exec( function( err, livelihoods ) {
				// return error
				if (err) return res.negotiate( err );
					// return csv
					json2csv({ data: livelihoods }, function( err, csv ) {
						// error
						if ( err ) return res.negotiate( err );
						// success
						if ( format === 'csv' ) {
							res.set('Content-Type', 'text/csv');
							return res.send( 200, csv );
						} else {
							return res.json( 200, { data: csv } );
						}
					});
				});
	},

	// set livelihoods dataset
	setLivelihoodsDatasetActionAid: function( req, res ){

		// dataset
		var livelihoods = [];
		
		// get all
		var cmd = 'curl -X GET https://kc.humanitarianresponse.info/api/v1/data/' + kobo_pk_action_aid + '?format=json -u ' + kobo_user + ':' + kobo_password;

		// run curl command
		EXEC( cmd, { maxBuffer: 1024 * 4096 }, function( error, stdout, stderr ) {
			
						// return error
				if ( error ) return res.negotiate( error );

				// success
				kobo = JSON.parse( stdout );

				// promise
				Promise.all([
					Organization.findOne({ admin0pcode: 'CB', organization_tag: 'actionaid' }),
					Admin3.findOne({ admin3pcode:'CXB-217' }),
					Admin3.findOne({ admin3pcode:'CXB-218' })
				])
				.catch( function( err ) {
					return res.negotiate( err );
				})
				.then( function( result ) {

					// set organization
					var organization = result[ 0 ];
							delete organization.id;
							delete organization.warehouses;

					// camp
					var camp_cxb_217 = result[ 1 ];
							delete camp_cxb_217.id;
					var camp_cxb_218 = result[ 2 ];
							delete camp_cxb_218.id;
					
					// camps
					var admin_cxb = { 'CXB-217': camp_cxb_217, 'CXB-218': camp_cxb_218 }

					// each data
					async.each( kobo, function ( data, next ) {

						// distribution point
						var distribution_point = distribution_points[ data[ 'group_ya0cw08/distribution_point' ] ];
						var camp = admin_cxb[ distribution_point.admin3pcode ];

						// record
						var d = Object.assign( { _id: data._id }, organization, camp, distribution_point );

						// scan
						if ( data[ 'group_af9zh97/_4_1_Card_QR_Code' ] ) {
							// string containing ';'?
									// no
							if ( data[ 'group_af9zh97/_4_1_Card_QR_Code' ].indexOf(';') === -1 ) {
								d.fcn_id = data[ 'group_af9zh97/_4_1_Card_QR_Code' ];
								// yes
							} else {
								d.progres_id = data[ 'group_af9zh97/_4_1_Card_QR_Code' ].split(';')[0];
								d.progres_case_id = data[ 'group_af9zh97/_4_1_Card_QR_Code' ].split(';')[1];
								d.fcn_id = data[ 'group_af9zh97/_4_1_Card_QR_Code' ].split(';')[2];
								d.beneficiary_name = data[ 'group_af9zh97/_4_1_Card_QR_Code' ].split(';')[3];
								d.beneficiary_gender = data[ 'group_af9zh97/_4_1_Card_QR_Code' ].split(';')[4];
							}
						} else {
							d.fcn_id = data[ 'group_af9zh97/fcn_id' ];
						}

						// for each
						d.distribution_date = data[ 'group_ya0cw08/distribution_date' ];
						d.stipend_amount_bdt = parseInt( data[ 'group_af9zh97/stipend_amount_bdt' ] );
						
						// activity_details ( link to MASTER LIST )
						d.remarks = data[ 'group_hr52g97/remarks' ] ? data[ 'group_hr52g97/remarks' ] : '';

						// image
						if ( data[ '_attachments' ].length ) {
							d.download_small_url = data[ '_attachments' ][0].download_small_url;
							d.download_medium_url = data[ '_attachments' ][0].download_medium_url;
							d.download_large_url = data[ '_attachments' ][0].download_large_url;
							// d._attachments = data[ '_attachments' ];
						}

						// kobo
						d._form_uuid = data[ 'formhub/uuid' ];
						d._uuid = data._uuid;
						d._submission_time = data._submission_time;

						// push cleaned data
						livelihoods.push( d );

						next();

					}, function ( err ) {
						
						// return error
						if ( err ) return res.negotiate( err );

						Livelihoods
							.destroy({ organization_tag: 'actionaid' })
							.exec( function( err, destroy ) {
								
								// return error
								if (err) return res.negotiate( err );
								
								// create
								Livelihoods
									.create( livelihoods )
									.exec( function( err, result ) {
										// return error
										if (err) return res.negotiate( err );
										// return success
										return res.json( 200, { msg: 'Success!' });
									});

							});
					
					});

				});

			});

	},

	// set livelihoods dataset
	setLivelihoodsDatasetBrac: function( req, res ){

		// dataset
		var livelihoods = [];
		
		// get all
		var cmd = 'curl -X GET https://kc.humanitarianresponse.info/api/v1/data/' + kobo_pk_brac + '?format=json -u ' + kobo_user + ':' + kobo_password;

		// run curl command
		EXEC( cmd, { maxBuffer: 1024 * 4096 }, function( error, stdout, stderr ) {
			
						// return error
				if ( error ) return res.negotiate( error );

				// success
				kobo = JSON.parse( stdout );

				// promise
				Promise.all([
					Organization.findOne({ admin0pcode: 'CB', organization_tag: 'brac' }),
					Admin3.find({ admin0pcode:'CB', admin3type_name:'Camp' })
				])
				.catch( function( err ) {
					return res.negotiate( err );
				})
				.then( function( result ) {

					// set organization
					var organization = result[ 0 ];
							delete organization.id;
							delete organization.warehouses;
					
					// admin3 camps
					var camps = result[ 1 ];

					// each data
					async.each( kobo, function ( data, next ) {

						// distribution point
						var filter = _.filter( camps, function ( c ) {
							return c.admin3name === data[ 'group_ya0cw08/distribution_point' ];
						});

						// camp
						var camp = filter[ 0 ];
								delete camp.id;
								
						// record
						var d = Object.assign( { _id: data._id }, organization, camp );

						// id, name
						d.activity_detail_id = data[ 'group_ya0cw08/activity_detail' ].replace(/ /g, '_').replace('/', '_').toLowerCase();
						d.activity_detail_name = data[ 'group_ya0cw08/activity_detail' ];

						// scan
						if ( data[ 'group_af9zh97/_4_1_Card_QR_Code' ] ) {
							// string containing ';'?
									// no
							if ( data[ 'group_af9zh97/_4_1_Card_QR_Code' ].indexOf(';') === -1 ) {
								d.fcn_id = data[ 'group_af9zh97/_4_1_Card_QR_Code' ];
								// yes
							} else {
								d.progres_id = data[ 'group_af9zh97/_4_1_Card_QR_Code' ].split(';')[0];
								d.progres_case_id = data[ 'group_af9zh97/_4_1_Card_QR_Code' ].split(';')[1];
								d.fcn_id = data[ 'group_af9zh97/_4_1_Card_QR_Code' ].split(';')[2];
								d.beneficiary_name = data[ 'group_af9zh97/_4_1_Card_QR_Code' ].split(';')[3];
								d.beneficiary_gender = data[ 'group_af9zh97/_4_1_Card_QR_Code' ].split(';')[4];
							}
						} else {
							d.fcn_id = data[ 'group_af9zh97/fcn_id' ];
						}

						// for each
						d.distribution_date = data[ 'group_ya0cw08/distribution_date' ];
						d.stipend_amount_bdt = parseInt( data[ 'group_af9zh97/stipend_amount_bdt' ] );
						
						// activity_details ( link to MASTER LIST )
						d.remarks = data[ 'group_hr52g97/remarks' ] ? data[ 'group_hr52g97/remarks' ] : '';

						// image
						if ( data[ '_attachments' ].length ) {
							d.download_small_url = data[ '_attachments' ][0].download_small_url;
							d.download_medium_url = data[ '_attachments' ][0].download_medium_url;
							d.download_large_url = data[ '_attachments' ][0].download_large_url;
							// d._attachments = data[ '_attachments' ];
						}

						// kobo
						d._form_uuid = data[ 'formhub/uuid' ];
						d._uuid = data._uuid;
						d._submission_time = data._submission_time;

						// push cleaned data
						livelihoods.push( d );

						next();

					}, function ( err ) {
						
						// return error
						if ( err ) return res.negotiate( err );

						Livelihoods
							.destroy({ organization_tag: 'brac' })
							.exec( function( err, destroy ) {
								
								// return error
								if (err) return res.negotiate( err );
								
								// create
								Livelihoods
									.create( livelihoods )
									.exec( function( err, result ) {
										// return error
										if (err) return res.negotiate( err );
										// return success
										return res.json( 200, { msg: 'Success!' });
									});

							});
					
					});

				});

			});

	},

	// set livelihoods record
	setLivelihoodsRecord: function( req, res ){
		// set one by one
	}

}

module.exports = LivelihoodsTaskController;
