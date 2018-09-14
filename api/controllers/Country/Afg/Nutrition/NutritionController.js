/**
 * NutritionController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// secrets
if (sails.config.kobo) {
    var kobo_pk = sails.config.kobo.NUTRITION_KOBO_PK;
    var kobo_url = sails.config.kobo.NUTRITION_KOBO_URL;
    var kobo_user = sails.config.kobo.NUTRITION_KOBO_USER;
    var kobo_password = sails.config.kobo.NUTRITION_KOBO_PASSWORD;
}
var Promise = require('bluebird');

module.exports = {

	// get data from kobo
	// set script to run (i.e. every hour)
	getKoboData: function  (req, res) {
		// set data
		var nutrition = [],
				reports = [],
				beneficiaries=[]
				// location
				provinces = {},
				districts = {},
                organizations = {},
                activities = {},
				// set cmd
				moment = require( 'moment' ),
				exec = require('child_process').exec,
				// API
				// https://kc.kobotoolbox.org/api/v1/
				// view forms
                // cmd = 'curl -X GET ' +  kobo_url + ' -u ' + kobo_user + ':' + kobo_password,
                cmd = 'curl -X GET https://kc.humanitarianresponse.info/api/v1/data/' +  kobo_pk + '?format=json' + ' -u ' + kobo_user + ':' + kobo_password,

		// run curl command
		exec( cmd, { maxBuffer: 1024 * 16384 }, function( error, stdout, stderr ) {

			if ( error ) {

			    sails.log(error);

			    // return error
			    res.json( 400, { error: 'Request error! Please try again...' } );

			} else {

				// success
				kobo = JSON.parse( stdout );
				// get location details
				Admin2
					.find()
                    .where({ 'admin0pcode': 'AF' })
                    .where({ 'inactive': {'!': true} })
					.exec(function (err, admin2) {

						// err
						if ( err ) return res.negotiate( err );

						// for each
						admin2.forEach(function( d, i ){

							// create lookup
							provinces[ d.admin1pcode ] = d;
							districts[ d.admin2pcode ] = d;

                        });
                        
                        Organizations.find().exec(function(err,orgs){
                            if ( err ) return res.negotiate( err );    
                            // for each
                            orgs.forEach(function( o, i ){
                                // create lookup
                                organizations[ o.organization_tag ] = o;

                            });


                            Activities.find().where({admin0pcode:{'contains':'AF'}}).where({'cluster_id':'nutrition'}).exec(function(err,activitiesRaw){

                                if ( err ) return res.negotiate( err );

                                activitiesRaw.forEach(function( a, i ){
                                    // create lookup
                                    activities[ a.activity_description_id ] = a;
        
                                });
                            
                                // look up table not to hit db / #TODO configurable
                                var BENEFICIARY_TYPES = {
                                    'new_idp': { 'beneficiary_type_id': 'new_idp', 'beneficiary_type_name': 'New IDPs' },
                                    'returnee': { 'beneficiary_type_id': 'returnee', 'beneficiary_type_name': 'Returnees' },
                                    'natural_disaster': { 'beneficiary_type_id': 'natural_disaster', 'beneficiary_type_name': 'Natural Disaster' }
                                }

                                // rows
                                if (kobo.length){
                                    kobo.forEach( function( d, i ){

                                        // each row
                                        var obj = {};
                                        var main_obj = {
                                            pk:kobo_pk,
                                            dataid:d['_id'],
                                            focal_point_name: d['reporting_details/focal_point_name'],
                                            focal_point_title: d['reporting_details/focal_point_title'],
                                            focal_point_email: d['reporting_details/focal_point_email'],
                                            organization_tag: organizations[d['reporting_details/organization_tag']]?organizations[d['reporting_details/organization_tag']].organization_tag:d['reporting_details/organization_tag'],
                                            organization: organizations[d['reporting_details/organization_tag']]?organizations[d['reporting_details/organization_tag']].organization:d['reporting_details/organization_tag'],
                                            organization_name: organizations[d['reporting_details/organization_tag']]?organizations[d['reporting_details/organization_tag']].organization_name:d['reporting_details/organization_tag'],
                                            reporting_week: moment(d['reporting_details/reporting_date']).add( 1, 'd' ).startOf('isoWeek').subtract( 1, 'd' ).week(),
                                            reporting_month: moment(d['reporting_details/reporting_date']).month(),
                                            reporting_year: moment(d['reporting_details/reporting_date']).year(),
                                            reporting_start_date: moment(d['reporting_details/reporting_date']).add( 1, 'd' ).startOf('isoWeek').subtract( 1, 'd' ).format( 'YYYY-MM-DD' ),
                                            reporting_end_date: moment(d['reporting_details/reporting_date']).add( 1, 'd' ).endOf('isoWeek').format( 'YYYY-MM-DD' ),
                                            _submission_time: d['_submission_time']
                                        };
                                        obj=_.extend( {}, main_obj )

                                        // for each key, value
                                        for (var k in d){
                                            
                                            var key = k.split('/')[ k.split('/').length - 1 ];

                                            // add default values
                                            if ( key==='report' ) {

                                                    // for each row
                                                    d[key].forEach( function( report, i ){
                                                        var d_obj=_.extend( {}, main_obj )
                                                        // for key, value
                                                        for (var j in report){
                                                            var d_key = j.split('/')[ j.split('/').length - 1 ];
                                                            d_obj[d_key] = report[j];
                                                        }
                                                        
                                                        d_obj.admin2name = d_obj.province ? provinces[d_obj.province].admin1name : '';
                                                        d_obj.admin1name = d_obj.district ? districts[d_obj.district].admin2name : '';
                                                        d_obj.activity_description_id = activities[d_obj.activity_description_id].activity_description_id;
                                                        d_obj.activity_description_name = activities[d_obj.activity_description_id].activity_description_name;
                                                        d_obj.beneficiary_type_id = BENEFICIARY_TYPES[d_obj.beneficiary_type_id].beneficiary_type_id;
                                                        d_obj.beneficiary_type_name = BENEFICIARY_TYPES[d_obj.beneficiary_type_id].beneficiary_type_name;

                                                        d_obj.men = d_obj.men ? parseInt(d_obj.men) : 0;
                                                        d_obj.women = d_obj.women ? parseInt(d_obj.women) : 0;
                                                        d_obj.boys = d_obj.boys ? parseInt(d_obj.boys) : 0;
                                                        d_obj.girls = d_obj.girls ? parseInt(d_obj.girls) : 0;
                                                        // total cases
                                                        d_obj.total = 0;

                                                        d_obj.total += d_obj.men;
                                                        d_obj.total += d_obj.women;
                                                        d_obj.total += d_obj.boys;
                                                        d_obj.total += d_obj.girls;

                                                        if (d_obj.province) {
                                                            d_obj.admin1lat = provinces[d_obj.province].admin1lat;
                                                            d_obj.admin1lng = provinces[d_obj.province].admin1lng;
                                                        }
                                                        
                                                        // lat/lng
                                                        if (d_obj.district) {
                                                            d_obj.admin2lat = districts[d_obj.district].admin2lat;
                                                            d_obj.admin2lng = districts[d_obj.district].admin2lng;
                                                        } else {
                                                            d_obj.admin2lat = provinces[d_obj.province].admin1lat;
                                                            d_obj.admin2lng = provinces[d_obj.province].admin1lng;
                                                        }
                                                                                                                                                
                                                        // remane to pcode
                                                        d_obj.admin2pcode = d_obj.district;
                                                        d_obj.admin1pcode = d_obj.province;
                                                        // push as single record
                                                        beneficiaries.push( d_obj );
                                                        

                                                    });

                                            }

                                        }
                                        
                                        // push to data
                                        reports.push( obj );

                                        });
                                    }
                                    
                                    Promise.all([
                                        NutritionBeneficiaries.destroy({}),
                                        NutritionReports.destroy({})
                                    ])
                                    .catch( function(err) {
                                    return res.negotiate( err )
                                    })
                                    .done( function() {
                                        Promise.all([
                                            NutritionBeneficiaries.create(beneficiaries),
                                            NutritionReports.create(reports)
                                        ])
                                        .catch( function(err) {
                                        return res.negotiate( err )
                                        })
                                        .done( function() {
                                        res.json( 200, { success: true, msg: 'Success!' });
                                        });
                                    });

                            });
                        });
			    });

			}

		});

	}

};

