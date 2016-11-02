/**
 * EprController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	// get data from kobo
	getIndicator: function(req, res) {

    // request input
    if (  !req.param('indicator') || !req.param('year') || !req.param('region') || !req.param('province')  || !req.param('week') ) {
      return res.json( 401, { err: 'year, region, province, week required!' });
    }

    // indicator
    var indicator = req.param('indicator'),
    		list = req.param('list') ? req.param('list') : false,
    		year = parseInt( req.param('year') ),
    		region = req.param('region'),
    		province = req.param('province'),
    		week = req.param('week'),
    		regions = {
					'all': {
						name: 'All'
					},
					'central': {
						name: 'Central',
						prov: [ 8,3,4,5,2,1 ]
					},
					'central_highlands': {
						name: 'Central Highlands',
						prov: [ 10,22 ]
					},
					'east': {
						name: 'East',
						prov: [ 13,7,14,6 ]
					},
					'north': {
						name: 'North',
						prov: [ 27,28,18,19,20 ]
					},
					'north_east': {
						name: 'North East',
						prov: [ 15,9,17,16 ]
					},
					'south': {
						name: 'South',
						prov: [ 32,23,34,24,33 ]
					},
					'south_east': {
						name: 'South East',
						prov: [  26,25,12,11 ]
					},
					'west': {
						name: 'West',
						prov: [ 31,21,29,30 ]
					}
				};

    // filters
    var filters = {

    	year: { reporting_year: year },

    	region: region !== 'all' ? { reporting_region: region } : {},

    	province: province !== 'all' ? { reporting_province: province } : {},

    	week: week !== 'all' ? { reporting_week: week } : {}

    }

    // run query
    Epr
    	.find()
      .where( filters.year )
      .where( filters.region )
      .where( filters.province )
      .where( filters.week )
      .exec( function( err, results ){

        // return error
        if (err) return res.negotiate( err );

        // indicator
        switch( indicator ){

        	// total reports due
        	case 'total':

        		// province/weeks
        		var reports = province === 'all' ? 34 : 1,
        				weeks = week === 'all' ? 53 : 1;

        		// if reports for a region
        		if ( region !== 'all' ) {
        			// region
        			reports = regions[region].prov.length;

        		}

        		// return number of expected reports
          	return res.json( 200, { 'value': reports * weeks } );

        		break;

        	// total reports due
        	case 'submitted_reports':

        		// return number of expected reports
          	return res.json( 200, { 'value': results.length } );

        		break;

        	// total reports due
        	case 'outstanding_reports':

        		// 
        		var reports = province === 'all' ? 34 : 1,
        				weeks = week === 'all' ? 53 : 1;

        		// if reports for a region
        		if ( region !== 'all' ) {

        			reports = regions[region].prov.length;

        		}

        		// return number of expected reports
          	return res.json( 200, { 'value': ( reports * weeks ) - results.length } );

        		break;


        	// total reports due
        	case 'duplicate_reports':

        		// values
        		var store = {},
        				reports = [],
        				duplicates = 0;

        		// results
        		results.forEach(function( d, i ){
        			// week + province
        			if (!store[d.reporting_week + '_' + d.reporting_province]) {
        				store[d.reporting_week + '_' + d.reporting_province] = {};
        				store[d.reporting_week + '_' + d.reporting_province].count = 0;
        				store[d.reporting_week + '_' + d.reporting_province].data = [];
        			}
        			store[d.reporting_week + '_' + d.reporting_province].count++;
        			store[d.reporting_week + '_' + d.reporting_province].data.push(d);
        		});

        		// store
      			for(var k in store){
        			if ( store[k].count > 1 ) {
        				// sum
        				duplicates++;
        				// convert to reports
        				store[k].data.forEach(function( d, i ){
        					reports.push(d);
        				});
        			}
        		}
	        		
	        	// if list
	        	if ( list ) {
	        		// return table
	          	return res.json( 200, reports );
	        	} else {
	        		return res.json( 200, { 'value': duplicates } );
	        	}

        		break;

        	default:

        		// return number of expected reports
          	return res.json( 200, results );

        		break;

        }


      });

	}

};

