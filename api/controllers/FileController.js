/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	//
	upload: function  (req, res) {

		//	call to /upload via GET is error
		if(req.method === 'GET') return res.json({ 'status':'GET not allowed' });

		// skipper
		req.file('file').upload(function onUploadComplete (err, files) {
			
			//	if error return and send 500 error with error
			if (err) return res.serverError(err);

			// response status 200
			res.json({ status:200, file:files });

		});

	},

	//
	process: function  (req, res) {

		var fs = require('fs'),
			exec = require('child_process').exec,
			PythonShell = require('python-shell');

		var options = {
		  mode: 'text',
		  scriptPath: __dirname + '/../../tasks/python',
		  args: [req.param('file'), req.param('schema'), req.param('table')]
		};

		PythonShell.run(req.param('importScript'), options, function (err, results) {
		  if (err) {
		  	// return error
		  	res.json(400, { 
		  		error: 'Data import error, please try again!' 
		  	});
		  } else {
			
			// remove file
			fs.unlink(req.param('file'));

			if (!req.param('processScript')) {
				res.json({ status:200 });
			} else {

				// run processing script
				function puts(error, stdout, stderr) { sys.puts(stdout) }
				exec('. ' + options.scriptPath + '/../db/' + req.param('processScript'), function(error, stdout, stderr) {
					if (!error) {
						// success
						res.json({ status:200 });
					} else {
						// return error
					  	res.json(400, { 
					  		error: 'Data processing error, please try again!' 
					  	});
					}
				});
			}
		  }
		});

	},

	//
	print: function  (req, res) {

		var report = req.param('report'),
			printUrl = req.param('printUrl'),
			token = req.param('token'),
			pageLoadTime = req.param('pageLoadTime'),
			viewportWidth = req.param('viewportWidth'),
			viewportHeight = req.param('viewportHeight'),
			exec = require('child_process').exec,
			cmd = 'phantomjs /home/ubuntu/nginx/www/ngm-reportPrint/ngm-print.js ' + report + ' ' + printUrl + ' ' + token + ' ' + pageLoadTime;
		
		// width
		cmd = viewportWidth ? cmd + ' ' + viewportWidth : cmd;
		// height
		cmd = viewportHeight ? cmd + ' ' + viewportHeight: cmd;

		exec( cmd,
			function( error, stdout, stderr ) {
				if (!error) {
					// success
					res.json({ 
						status:200, 
						report: report + '.pdf' 
					});
				} else {
					// return error
				  	res.json(400, {
				  		error: 'PDF export error, please try again!' 
				  	});
				}
			}
		);
	},

	//
	proxy: function  (req, res) {

    // request input
    if ( !req.param( 'url' ) ) {
      return res.json(401, { err: 'url required!' } );
    }

		var url = req.param( 'url' ),
			exec = require('child_process').exec,
			cmd = 'curl -v -H "Authorization:Basic cGZpdHpnZXJhbGQ6UEB0cmljazc=" -G "' + url + '"';

		exec( cmd, function( error, stdout, stderr ) {
				if (!error) {
					// success
					res.json( 200, JSON.parse( stdout ) );
				} else {
					// return error
				  	res.json(400, { error: 'Request error! Please try again...' });
				}
			}
		);
	},

	//
	export: function( req, res ){

		// request
		var data = [],
				request = require( 'request' ),
				json2csv = require( 'json2csv' ),
				indicator = req.param( 'indicator' ) ? req.param( 'indicator' ) : 'popn_to_health_facilities',
				fieldNames = [ 'Province Name', 'Province Code', '<1h', '<2h', '<3h', '<4h', '<5h', '<6h', '<7h', '<8h', '>8h' ];

		// indicator
		switch ( indicator ) {

			case 'popn_to_prov_capital':
				var fields = [ 'prov_name', 'prov_code', 'l1_h__itsx_prov', 'l2_h__itsx_prov', 'l3_h__itsx_prov', 'l4_h__itsx_prov', 'l5_h__itsx_prov', 'l6_h__tsx_prov', 'l7_h__itsx_prov', 'l8_h__tsx_prov', 'g8_h__itsx_prov' ];
				break;

			case 'popn_to_airport':
				var fields = [ 'prov_name', 'prov_code', 'l1_h__near_airp', 'l2_h__near_airp', 'l3_h__near_airp', 'l4_h__near_airp', 'l5_h__near_airp', 'l6_h__near_airp', 'l7_h__near_airp', 'l8_h__near_airp', 'g8_h__near_airp' ];
				break;

			default:
				var fields = [ 'prov_name', 'prov_code', 'l1_h__near_hltall', 'l2_h__near_hltall', 'l3_h__near_hltall', 'l4_h__near_hltall', 'l5_h__near_hltall', 'l6_h__near_hltall', 'l7_h__near_hltall', 'l8_h__near_hltall', 'g8_h__near_hltall' ];
				break;

		}

		//
		var counter = 0,
				province = [{
					'prov_code': 1, 'prov_name': 'Kabul'
				},{
					'prov_code': 2, 'prov_name': 'Kapisa'
				},{
					'prov_code': 3, 'prov_name': 'Parwan'
				},{
					'prov_code': 4, 'prov_name': 'Wardak'
				},{
					'prov_code': 5, 'prov_name': 'Logar'
				},{
					'prov_code': 6, 'prov_name': 'Nangarhar'
				},{
					'prov_code': 7, 'prov_name': 'Laghman'
				},{
					'prov_code': 8, 'prov_name': 'Panjsher'
				},{
					'prov_code': 9, 'prov_name': 'Baghlan'
				},{
					'prov_code': 10, 'prov_name': 'Bamyan'
				},{
					'prov_code': 11, 'prov_name': 'Ghazni'
				},{
					'prov_code': 12, 'prov_name': 'Paktya'
				},{
					'prov_code': 13, 'prov_name': 'Kunar'
				},{
					'prov_code': 14, 'prov_name': 'Nuristan'
				},{
					'prov_code': 15, 'prov_name': 'Badakhshan'
				},{
					'prov_code': 16, 'prov_name': 'Takhar'
				},{
					'prov_code': 17, 'prov_name': 'Kunduz'
				},{
					'prov_code': 18, 'prov_name': 'Balkh'
				},{
					'prov_code': 19, 'prov_name': 'Samangan'
				},{
					'prov_code': 20, 'prov_name': 'Sar-e-Pul'
				},{
					'prov_code': 21, 'prov_name': 'Ghor'
				},{
					'prov_code': 22, 'prov_name': 'Daykundi'
				},{
					'prov_code': 23, 'prov_name': 'Uruzgan'
				},{
					'prov_code': 24, 'prov_name': 'Zabul'
				},{
					'prov_code': 25, 'prov_name': 'Paktika'
				},{
					'prov_code': 26, 'prov_name': 'Khost'
				},{
					'prov_code': 27, 'prov_name': 'Jawzjan'
				},{
					'prov_code': 28, 'prov_name': 'Faryab'
				},{
					'prov_code': 29, 'prov_name': 'Badghis'
				},{
					'prov_code': 30, 'prov_name': 'Hirat'
				},{
					'prov_code': 31, 'prov_name': 'Farah'
				},{
					'prov_code': 32, 'prov_name': 'Hilmand'
				},{
					'prov_code': 33, 'prov_name': 'Kandahar'
				},{
					'prov_code': 34, 'prov_name': 'Nimroz'
				}];

		// length
		var length = province.length;

		// do request to get province
		province.forEach( function( d, i ){

			// options
			var options = {
			  method: 'post',
			  body: {
					spatialfilter: [],
					flag: 'currentProvince',
					code: d.prov_code
			  },
			  json: true,
			  url: 'http://asdc.immap.org/geoapi/getaccessibilities/',
			  headers: {
			    'Authorization': 'Basic cGZpdHpnZXJhbGQ6UEB0cmljazc='
			  }
			}

			// request
			request( options, function ( err, response, body ) {
			  
			  // error
			  if ( err ) return res.json( 200, err );

			  // 
			  data[ i ] = body;

			  // add province details
			  data[ i ].prov_code = d.prov_code;
			  data[ i ].prov_name = d.prov_name;

			  //
			  counter++;

			  // end
			  if ( counter === length ) {
		      // return csv
		      json2csv({ data: data, fields: fields, fieldNames: fieldNames }, function( err, csv ) {
		        
		        // error
		        if ( err ) return res.negotiate( err );

		        // stream csv
					  res.setHeader('Content-disposition', 'attachment; filename=' + indicator + '.csv');
					  res.set('Content-Type', 'text/csv');
					  res.status( 200 ).send( csv );

		      }); 
			  }

			});				
		

		});

	},

  //
  getBeneficiairiesCsv: function( req, res ) {

  	//
  	var json2csv = require( 'json2csv' );

    //
    Beneficiaries
      .find()
      .exec( function( err, b ){
        
        // error
        if ( err ) return res.negotiate( err );

        // return csv
        json2csv({ data: b }, function( err, csv ) {
          
		        // error
		        if ( err ) return res.negotiate( err );

		        // stream csv
					  res.setHeader('Content-disposition', 'attachment; filename=beneficiaries.csv');
					  res.set('Content-Type', 'text/csv');
					  res.status( 200 ).send( csv );

        });        

      });

  }

};

