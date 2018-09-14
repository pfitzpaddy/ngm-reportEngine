/**
 * EprController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// secrets
if ( sails.config.google ) {
		var DOC_ID = sails.config.google.PRODUCTS_DOC_ID;
		var API_KEY = sails.config.google.PRODUCTS_API_KEY;
}
module.exports = {

	// get data from kobo
		// set script to run (i.e. every hour)
	getProductsData: function  ( req, res ) {

		// set data
		var headers = [],
				products = [],
				months = {
					January: 0,
					February: 1,
					March: 2,
					April: 3,
					May: 4,
					June: 5,
					July: 6,
					August: 7,
					September: 8,
					October: 9,
					November: 10,
					December: 11
				},
				regions = {
					'Democratic Republic of Congo': {
						adminRpcode: 'AFRO',
						adminRname: 'AFRO',
						adminRzoom: 3,
						adminRlng: 23.669468,
						adminRlat: -1.173667,
						admin0pcode: 'CD',
						admin0name: 'Democratic Republic of Congo',
						admin0lng: 12.6480834,
						admin0lat: -3.9610534,
						admin0zoom: 6
					},
					'Ethiopia': {
						adminRpcode: 'AFRO',
						adminRname: 'AFRO',
						adminRzoom: 3,
						adminRlng: 23.669468,
						adminRlat: -1.173667,
						admin0pcode: 'ET',
						admin0name: 'Ethiopia',
						admin0lng: 39.041495,
						admin0lat: 8.308214,
						admin0zoom: 6
					}
				},
				sectors = {
					'coordination': {
						product_sector_short: 'COO',
						theme: { color: '#4a148c' }
					},
					'agriculture_and_livestock': {
						product_sector_short: 'AGR',
						theme: { color: '#ffff00' }
					},
					'education':{
						product_sector_short: 'EDU',
						theme: { color: '#f06292' }
					},
					'emergency_shelter_nfi': {
						product_sector_short: 'S/NFI',
						theme: { color: '#ec407a' }
					},
					'food': {
						product_sector_short: 'FOOD',
						theme: { color: '#fdd835' }
					},
					'health': {
						product_sector_short: 'HEA',
						theme: { color: '#2196f3' }
					},
					'nutrition': {
						product_sector_short: 'NUT',
						theme: { color: '#4caf50' }
					},
					'protection': {
						product_sector_short: 'PRT',
						theme: { color: '#ab47bc' }
					},
					'wash': {
						product_sector_short: 'WASH',
						theme: { color: '#009688' }
					}
				};

				// set cmd
				moment = require( 'moment' ),
				exec = require('child_process').exec,

				// fetch
				cmd = 'curl -X GET https://sheets.googleapis.com/v4/spreadsheets/' + DOC_ID + '/values/products_list?key=' + API_KEY;

		// run curl command
		exec( cmd, { maxBuffer: 1024 * 16384 }, function( error, stdout, stderr ) {

			if ( error ) {

				// return error
				res.json( 400, { error: 'Request error! Please try again...' } );

			} else {

				// success
				data = JSON.parse( stdout );

				// values
				var headers = data.values[0];

				// format headers
				for ( var i = 0; i < headers.length; i++ ) {
					headers[ i ] = headers[ i ].toLowerCase().replace(' ', '_');
				}

				// assign data
				for ( var row = 1; row < data.values.length; row++ ) {

					// if row has data
					if ( data.values[ row ][ 0 ]  ) {
	
						// obj to hold row
						var obj = {};
					 
						// loop each column
						for( var column=0; column < headers.length; column++ ){
							obj[ headers[ column ]] = data.values[ row ][ column ];
						}

						// array
						obj.product_id = obj.product_id.split(',');
						obj.product_upload = obj.product_upload.split(',');
						// formatting
						obj.timestamp_format = new Date( obj.timestamp ).toUTCString().slice(0, -4);
						obj.product_sector_id = obj.product_sector.toLowerCase().split('/').join('').replace( / /g, '_' ).replace( /__/g, '_' );
						obj.product_type_id = obj.product_type.toLowerCase().replace( / /g, '_' );
						obj.product_date = new Date( Date.UTC( obj.product_year, months[ obj.product_month ], 1 ) ).toISOString();

						// merge tags
						_.merge( obj, sectors[ obj.product_sector_id ] );

						// merge data structure
						_.merge( obj, regions[ obj.country ] );

						// push to products
						products.push( obj );

					}

				}

				// either that or drop the whole schema
				var Promise = require('bluebird');

				// destroy / create
				Promise.all([
					Products.destroy({})
				])
				.catch( function(err) {
					return res.negotiate( err )
				})
				.done( function() {
					Promise.all([
						Products.create( products ),
					])
					.catch( function(err) {
						return res.negotiate( err )
					})
					.done( function() {
						res.json( 200, { success: true, msg: 'Success!' });
					});
				});

			}

		});

	},

  // get latest date
  getLatestUpdate: function( req, res ){
    
    Products
    	.find()
      .sort( 'timestamp DESC' )
      .limit(1)
      .exec( function( err, results ){

        // return error
        if (err) return res.negotiate( err );

        // latest update
        return res.json( 200, results[0] );

      });
  },

  // get latest date
  getProductsMenu: function( req, res ){

		// request input
		if ( !req.param( 'menu_items' ) ) {
			return res.json( 400, { err: 'menu_items required!' });
		}

		// menu
		var menu = [];
		var menu_items = req.param( 'menu_items' );

		// products
    Products
    	.find()
      .exec( function( err, products ){

        // return error
        if (err) return res.negotiate( err );

				// country
				if ( menu_items.indexOf( 'admin0pcode' ) !== -1 ) {
					
					// menu
					menu.push({
						'search': true,
						'id': 'search-country-products',
						'icon': 'person_pin',
						'title': 'Country',
						'class': 'teal lighten-1 white-text',
						'rows':[]
					});

					// get unique countries
					var list = _.uniq( products, function( p ){
						return p.admin0pcode;
					});

					// sort
					list.sort(function(a, b) {
            return a.admin0pcode.localeCompare(b.admin0pcode);
          });

					// add all
          list.unshift({ admin0name: 'All', admin0pcode: 'all' });

					// for each
					list.forEach( function( d, i ) {
						menu[ menu.length-1 ].rows.push({
							'title': d.admin0name,
							'param': 'admin0pcode',
							'active': d.admin0pcode,
							'class': 'grey-text text-darken-2 waves-effect waves-teal waves-teal-lighten-4',
							'href': '/desk/#/immap/products/' + d.admin0pcode + '/' + 
												req.param( 'project' ) + '/' +
												req.param( 'product_sector_id' ) + '/' +
												req.param( 'product_type_id' ) + '/' +
												req.param( 'email' ) + '/' +
												req.param( 'start_date' ) + '/' +
												req.param( 'end_date' )
						});
					});

				}

				// project
				if ( menu_items.indexOf( 'project' ) !== -1 ) {
					
					// menu
					menu.push({
						'search': true,
						'id': 'search-project-products',
						'icon': 'recent_actors',
						'title': 'Project',
						'class': 'teal lighten-1 white-text',
						'rows':[]
					});

					// get unique project
					var list = _.uniq( products, function( p ){
						return p.project;
					});

					// sort
					list.sort(function(a, b) {
            return a.project.localeCompare(b.project);
          });

					// add all
          list.unshift({ project: 'all' });

					// for each
					list.forEach( function( d, i ) {
						menu[ menu.length-1 ].rows.push({
							'title': d.project === 'all' ? 'All' : d.project, 
							'param': 'project',
							'active': d.project,
							'class': 'grey-text text-darken-2 waves-effect waves-teal waves-teal-lighten-4',
							'href': '/desk/#/immap/products/' + req.param( 'admin0pcode' ) + '/' + 
												d.project + '/' +
												req.param( 'product_sector_id' ) + '/' +
												req.param( 'product_type_id' ) + '/' +
												req.param( 'email' ) + '/' +
												req.param( 'start_date' ) + '/' +
												req.param( 'end_date' )
						});
					});

				}

				// product_sector_id
				if ( menu_items.indexOf( 'product_sector_id' ) !== -1 ) {
					
					// menu
					menu.push({
						'search': true,
						'id': 'search-product_sector_id-products',
						'icon': 'donut_large',
						'title': 'Sector',
						'class': 'teal lighten-1 white-text',
						'rows':[]
					});

					// get unique product_sector_id
					var list = _.uniq( products, function( p ){
						return p.product_sector_id;
					});

					// sort
					list.sort(function(a, b) {
            return a.product_sector_id.localeCompare(b.product_sector_id);
          });

					// add all
          list.unshift({ product_sector: 'All', product_sector_id: 'all' });

					// for each
					list.forEach( function( d, i ) {
						menu[ menu.length-1 ].rows.push({
							'title': d.product_sector,
							'param': 'product_sector_id',
							'active': d.product_sector_id,
							'class': 'grey-text text-darken-2 waves-effect waves-teal waves-teal-lighten-4',
							'href': '/desk/#/immap/products/' + req.param( 'admin0pcode' ) + '/' + 
												req.param( 'project' ) + '/' +
												d.product_sector_id + '/' +
												req.param( 'product_type_id' ) + '/' +
												req.param( 'email' ) + '/' +
												req.param( 'start_date' ) + '/' +
												req.param( 'end_date' )
						});
					});

				}

				// product_type_id
				if ( menu_items.indexOf( 'product_type_id' ) !== -1 ) {
					
					// menu
					menu.push({
						'search': true,
						'id': 'search-product_type_id-products',
						'icon': 'crop_original',
						'title': 'Type',
						'class': 'teal lighten-1 white-text',
						'rows':[]
					});

					// get unique product_type_id
					var list = _.uniq( products, function( p ){
						return p.product_type_id;
					});

					// sort
					list.sort(function(a, b) {
            return a.product_type_id.localeCompare(b.product_type_id);
          });

					// add all
          list.unshift({ product_type: 'All', product_type_id: 'all' });

					// for each
					list.forEach( function( d, i ) {
						menu[ menu.length-1 ].rows.push({
							'title': d.product_type,
							'param': 'product_type_id',
							'active': d.product_type_id,
							'class': 'grey-text text-darken-2 waves-effect waves-teal waves-teal-lighten-4',
							'href': '/desk/#/immap/products/' + req.param( 'admin0pcode' ) + '/' + 
												req.param( 'project' ) + '/' +
												req.param( 'product_sector_id' ) + '/' +
												d.product_type_id + '/' +
												req.param( 'email' ) + '/' +
												req.param( 'start_date' ) + '/' +
												req.param( 'end_date' )
						});
					});

				}

				// email
				if ( menu_items.indexOf( 'email' ) !== -1 ) {
					
					// menu
					menu.push({
						'search': true,
						'id': 'search-email-products',
						'icon': 'email',
						'title': 'Email',
						'class': 'teal lighten-1 white-text',
						'rows':[]
					});

					// get unique product_type_id
					var list = _.uniq( products, function( p ){
						return p.email;
					});

					// sort
					list.sort(function(a, b) {
            return a.email.localeCompare(b.email);
          });

					// add all
          list.unshift({ email: 'all' });

					// for each
					list.forEach( function( d, i ) {
						menu[ menu.length-1 ].rows.push({
							'title': d.email === 'all' ? 'All' : d.email,
							'param': 'email',
							'active': d.email,
							'class': 'grey-text text-darken-2 waves-effect waves-teal waves-teal-lighten-4',
							'href': '/desk/#/immap/products/' + req.param( 'admin0pcode' ) + '/' + 
												req.param( 'project' ) + '/' +
												req.param( 'product_sector_id' ) + '/' +
												req.param( 'product_type_id' ) + '/' +
												d.email + '/' +
												req.param( 'start_date' ) + '/' +
												req.param( 'end_date' )
						});
					});

				}

				// return menu
				return res.json( 200, menu );

   		});

  },

	// get product indicator
	getProductsIndicator: function  ( req, res ) {

		// request input
		if ( !req.param( 'indicator' ) ) {
			return res.json( 400, { err: 'indicator required!' });
		}

		// indicatr, json2csv
		var indicator = req.param( 'indicator' );
		var json2csv = require( 'json2csv' );

		// filters
		var admin0pcode_filter = !req.param( 'admin0pcode' ) || req.param( 'admin0pcode' ) === 'all' ? {} : { admin0pcode: req.param( 'admin0pcode' ) };
		var project_filter = !req.param( 'project' ) || req.param( 'project' ) === 'all' ? {} : { project: req.param( 'project' ) };
		var email_filter = !req.param( 'email' ) || req.param( 'email' ) === 'all' ? {} : { email: req.param( 'email' ) };
		var product_sector_id_filter = !req.param( 'product_sector_id' ) || req.param( 'product_sector_id' ) === 'all' ? {} : { product_sector_id: req.param( 'product_sector_id' ) };
		var product_type_id_filter = !req.param( 'product_type_id' ) || req.param( 'product_type_id' ) === 'all' ? {} : { product_type_id: req.param( 'product_type_id' ) };
		var date_filter = { product_date: { '>=': req.param( 'start_date' ), '<=': req.param( 'end_date' ) } };

		// products
		Products
			.find()
			.where( admin0pcode_filter )
			.where( project_filter )
			.where( email_filter )
			.where( product_sector_id_filter )
			.where( product_type_id_filter )
			.where( date_filter )
			.exec( function( err, products ){

				// return error
				if (err) return res.negotiate( err );

				// switch on indicator
				switch( indicator ) {

					// retun list
					case 'csv':

						// return csv
						json2csv({ data: products }, function( err, csv ) {

							// error
							if ( err ) return res.negotiate( err );

							// success
							return res.json( 200, { data: csv } );

						});

						break;

					// retun team contributors
					case 'team':

						// get unique sectors
						var team = _.uniq( products, function( p ){
							return p.email;
						});

						// return products
						return res.json( 200, { value: team.length } );

						break;

					// retun products
					case 'products':

						// return total
						return res.json( 200, { value: products.length } );

						break;

					// retun sectors
					case 'products_chart':

						// flatten and count
						var tags = _.chain( products ).map( 'product_type' ).countBy().value();
						
						// make chart
						var i = 0,
								chart = [],
								colors = [ '#90caf9','#64b5f6','#42a5f5','#2196f3','#1e88e5','#1976d2', '#1565c0', '#0d47a1' ];
						for (var key in tags) {
							chart.push({ name: key, y: tags[key], color: colors[i] } );
							i++;
						}

						// return products
						return res.json( 200, { data: chart } );

						break;				

					// retun sectors
					case 'sectors':

						// get unique sectors
						var sectors = _.uniq( products, function( p ){
							return p.product_sector_id;
						});

						// return products
						return res.json( 200, { value: sectors.length } );

						break;

					// retun sectors
					case 'sectors_chart':

						// flatten and count
						var tags = _.chain( products ).map( 'product_sector' ).countBy().value();

						// set object
						var tags = {}
						products.forEach( function( d, i ) {
							if ( !tags[ d.product_sector_id ] ){
								tags[ d.product_sector_id ] = {
									name: d.product_sector,
									y: 0,
									color: d.theme.color
								}
							}
							tags[ d.product_sector_id ].y++;
						});

						// make chart
						var chart = [];
						for (var key in tags) {
							chart.push(tags[key]);
						}

						// return products
						return res.json( 200, { data: chart } );

						break;

					// retun list
					case 'calendar':

						// result
						var result = {};
						
						// for each row, format for cal-heatmap
						products.forEach( function( d, i ) {
							// timestamp is seconds since 1st Jan 1970
							if ( !result[ new Date( d.timestamp ).getTime() / 1000 ] ){
									result[ new Date( d.timestamp ).getTime() / 1000 ] = 0;
							}
							result[ new Date( d.timestamp ).getTime() / 1000 ]++;
						});

						// return number of expected reports
						return res.json( 200, { 'data': result } ); 

						break;

					// default
					default:

						// return products
						return res.json( 200, products );

				}

			});

	}

};
