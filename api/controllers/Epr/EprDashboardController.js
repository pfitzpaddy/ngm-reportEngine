/**
 * EprController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// require
var moment = require( 'moment' );
var json2csv = require( 'json2csv' );

var EprDashboard = {

  // get latest date
  getLatestUpdate: function( req, res ){
    
    Epr
      .find().limit(1)
      .exec( function( err, results ){

        // return error
        if (err) return res.negotiate( err );

        // latest update
        return res.json( 200, results[0] );

      });
  },

  // get sum by key
  getSum: function( key, records ){

    var value=0;

    records.forEach(function(d,i){
      for (var d_key in d) {
        if( key === d_key && !isNaN(d[d_key]) && typeof(d[d_key]) === 'number' ){
          value += d[d_key];
        }
      }
    });

    return value;
  },

  // get params from req
  getParams: function( req ){
    // check req
    if (  !req.param('indicator') || !req.param('year') || !req.param('region') || !req.param('province')  || !req.param('week') || !req.param('start_date') || !req.param('end_date') ) {
      return res.json( 401, { err: 'year, region, province, week, start_date, end_date required!' });
    }
    // return params
    return {
      indicator: req.param('indicator'),
      list: req.param('list') ? req.param('list') : false,
      year: parseInt( req.param('year') ),
      region: req.param('region'),
      province: req.param('province'),
      week: req.param('week'),
      start_date: req.param('start_date'),
      end_date: req.param('end_date'),
      current_week: ( parseInt( req.param('year') ) === moment().year() ) ? moment().week() : 53,
      regions: {
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
      }
    }

  },

  // return filters
  getFilters: function( params ){
    // filters
    return {
      year: { reporting_year: params.year },
      region: params.region !== 'all' ? { reporting_region: params.region } : {},
      province: params.province !== 'all' ? { reporting_province: params.province } : {},
      week: params.week !== 'all' ? { reporting_week: params.week } : {},
      date: params.week === 'all' ? { reporting_date: { '>=': params.start_date, '<=': params.end_date } } : {}
    }
  },

	// get epr indicators
	getEprIndicator: function(req, res) {

    // params
    var params = EprDashboard.getParams( req );

    // filters
    var filters = EprDashboard.getFilters( params );

    // run query
    Epr
    	.find()
      .where( filters.year )
      .where( filters.region )
      .where( filters.province )
      .where( filters.week )
      .where( filters.date )
      .exec( function( err, results ){

        // return error
        if (err) return res.negotiate( err );

        // indicator
        switch( params.indicator ){

        	// total reports submitted
        	case 'submitted_reports':

        		// return number of expected reports
          	return res.json( 200, { 'value': results.length } );

        		break;

        	// total reports outstanding
        	case 'outstanding_reports':

        		// 
        		var reports = params.province === 'all' ? 34 : 1,
        				weeks = params.week === 'all' ? params.current_week : 1;

        		// if reports for a region
        		if ( params.region !== 'all' ) {

        			reports = params.regions[params.region].prov.length;

        		}

        		// return number of expected reports
          	return res.json( 200, { 'value': ( reports * weeks ) - results.length } );

        		break;

          // total reports due
          case 'expected_reports':

            // province/weeks
            var reports = params.province === 'all' ? 34 : 1,
                weeks = params.week === 'all' ? params.current_week : 1;

            // if reports for a region
            if ( params.region !== 'all' ) {
              // region
              reports = params.regions[params.region].prov.length;

            }

            // return number of expected reports
            return res.json( 200, { 'value': reports * weeks } );

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
	        	if ( params.list ) {
	        		// return table
	          	return res.json( 200, reports );
	        	} else {
	        		return res.json( 200, { 'value': duplicates } );
	        	}

        		break;

        	// total reports due
        	case 'data':

            // return csv
            json2csv({ data: results }, function( err, csv ) {
              
              // error
              if ( err ) return res.negotiate( err );

              // success
              return res.json( 200, { data: csv } );

            });        		

        		break;        		

        	default:

        		// return number of reports
          	return res.json( 200, results );

        		break;

        }


      });

	},

  // get alert indicator
  getAlertIndicator: function(req, res) {

    // params
    var params = EprDashboard.getParams( req );

    // filters
    var filters = EprDashboard.getFilters( params );

    // run query
    Alerts
      .find()
      .where( filters.year )
      .where( filters.region )
      .where( filters.province )
      .where( filters.week )
      .where( filters.date )
      .exec( function( err, results ){

        // return error
        if (err) return res.negotiate( err );

        // indicator
        switch( params.indicator ){

          // total reports due
          case 'total':

            // return number of expected reports
            return res.json( 200, { 'value': results.length } );

            break;

          case 'cases':

            var value = EprDashboard.getSum( 'cases', results );
            return res.json( 200, { 'value': value } );

          case 'deaths':

            var value = EprDashboard.getSum( 'deaths', results );
            return res.json( 200, { 'value': value } );

          case 'markers':

            // markers
            var markers = {};

            // for each
            results.forEach(function(d,i){

              // breaking on alert_verificaiton
              var alert_verification = d.alert_verification ? d.alert_verification.replace(/_/g, ' ').toUpperCase() : 'N/A';

              // message
              var message = '<div class="center card-panel" style="width:300px">' +
                              '<div>' +
                                '<div class="count" style="text-align:center">' + d.deaths + '</div> deaths <br/><br/>' + 
                              '</div>' +
                              '<div>' +
                                '<div style="text-align:center"> with <span class="count">' + d.cases + '</span> cases from ' + d.alert_categories.replace(/_/g, ' ').toUpperCase() +
                              '</div>' + 
                              '<div>' +
                                '<div style="text-align:center">Alert Verification: ' + alert_verification +
                              '</div>' + 
                              '<div>' +
                                'in ' + d.alert_province_name + ', ' + d.alert_district_name +
                              '</div>' +
                              '<div>' + d.reporting_date + '</div>' +
                            '</div>';
              // create markers
              markers['marker' + i] = {
                layer: 'alerts',
                lat: d.alert_lat,
                lng: d.alert_lng,
                message: message
              };
            });

            // return markers
            return res.json( { status:200, data: markers } );

          default:

            // return number of expected reports
            return res.json( 200, results );

            break;

        }


      });

  },

  // get disaster indicators
  getDisasterIndicator: function(req, res) {

    // params
    var params = EprDashboard.getParams( req );

    // filters
    var filters = EprDashboard.getFilters( params );

    // run query
    Disasters
      .find()
      .where( filters.year )
      .where( filters.region )
      .where( filters.province )
      .where( filters.week )
      .where( filters.date )
      .exec( function( err, results ){

        // return error
        if (err) return res.negotiate( err );

        // indicator
        switch( params.indicator ){

          // total reports due
          case 'total':

            // return number of expected reports
            return res.json( 200, { 'value': results.length } );

            break;

          case 'casualties':

            var value = EprDashboard.getSum( 'casualties', results );
            return res.json( 200, { 'value': value } );

          case 'deaths':

            var value = EprDashboard.getSum( 'deaths', results );
            return res.json( 200, { 'value': value } );

          case 'markers':

            // markers
            var markers = {};

            // for each
            results.forEach(function(d,i){

              // message
              var message = '<div class="center card-panel" style="width:300px">' +
                              '<div>' +
                                '<div class="count" style="text-align:center">' + d.deaths + '</div> deaths <br/><br/>' + 
                              '</div>' +
                              '<div>' +
                                '<div style="text-align:center"> with <span class="count">' + d.casualties + '</span> casualties from ' + d.disaster_type.replace(/_/g, ' ').toUpperCase() + ' incident' +
                              '</div>' +  
                              '<div>';
                              if ( d['disaster_' + d.disaster_type + '_categories'] ) {
                                message += '<div style="text-align:center">Incident Category: ' + d['disaster_' + d.disaster_type + '_categories'].replace(/_/g, ' ').toUpperCase();
                              }
                              message += '</div>' + 
                              '<div>' +
                                'in ' + d.disaster_province_name + ', ' + d.disaster_district_name +
                              '</div>' +
                              '<div>' + d.reporting_date + '</div>' +
                            '</div>';

              // create markers
              markers['marker' + i] = {
                layer: 'disasters',
                lat: d.disaster_lat,
                lng: d.disaster_lng,
                message: message
              };
            });

            // return markers
            return res.json( { status:200, data: markers } );

          default:

            // return number of expected reports
            return res.json( 200, results );

            break;

        }


      });

  },  

	getAlertData: function(req, res) {

    // params
    var params = EprDashboard.getParams( req );

    // filters
    var filters = EprDashboard.getFilters( params );

    // run query
    Alerts
    	.find()
      .where( filters.year )
      .where( filters.region )
      .where( filters.province )
      .where( filters.week )
      .where( filters.date )
      .exec( function( err, results ){

        // return error
        if (err) return res.negotiate( err );

        // return csv
        json2csv({ data: results }, function( err, csv ) {
          
          // error
          if ( err ) return res.negotiate( err );

          // success
          return res.json( 200, { data: csv } );

        }); 

      });

	},

	getDisasterData: function(req, res) {

    // params
    var params = EprDashboard.getParams( req );

    // filters
    var filters = EprDashboard.getFilters( params );

    // run query
    Disasters
    	.find()
      .where( filters.year )
      .where( filters.region )
      .where( filters.province )
      .where( filters.week )
      .where( filters.date )
      .exec( function( err, results ){

        // return error
        if (err) return res.negotiate( err );

        // return csv
        json2csv({ data: results }, function( err, csv ) {
          
          // error
          if ( err ) return res.negotiate( err );

          // success
          return res.json( 200, { data: csv } );

        });

      });

	}

};

module.exports = EprDashboard;