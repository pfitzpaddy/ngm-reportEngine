/**
 * EprController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// require
var moment = require( 'moment' );
var json2csv = require( 'json2csv' );

var CtcDashboard = {

  // get latest date
  getLatestUpdate: function( req, res ){
    
    Assessments
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
        if( key === d_key ){
          value += parseInt(d[d_key]);
        }
      }
    });

    return value;
  },

  // get params from req
  getParams: function( req ){
    // check req
    if (  !req.param('region') || !req.param('zone')  || !req.param('woreda') || !req.param('indicator') ||  !req.param('start_date') || !req.param('end_date') ) {
      return res.json( 401, { err: 'region, zone, woreda, indicator, start_date, end_date required!' });
    }
    // return params
    return {
      region: req.param('region'),
      zone: req.param('zone'),
      woreda: req.param('woreda'),
      indicator: req.param('indicator'),
      list: req.param('list') ? req.param('list') : false,
      start_date: req.param('start_date'),
      end_date: req.param('end_date'),
    }

  },

  // return filters
  getFilters: function( params ){
    // filters
    return {
      region: params.region !== 'all' ? { admin1pcode: params.region } : {},
      zone: params.zone !== 'all' ? { admin2pcode: params.zone } : {},
      woreda: params.woreda !== 'all' ? { admin3pcode: params.woreda } : {},
      date: { assessment_date: { '>=': params.start_date, '<=': params.end_date } }
    }
  },

  // ctc menu
  getCtcMenu: function(req, res) {
      
    // rows
    var menu, rows = [];
    var url = '#/who/ethiopia/ctc/';
    // params
    var params = CtcDashboard.getParams( req );

    // indicator
    switch( params.indicator ){

      // total reports due
      case 'zone':

        Admin2
          .find({ admin0pcode: 'ET', admin1pcode: params.region })
          .sort('admin2name ASC' )
          .exec( function ( err, results ) {
            
            // return error
            if (err) return res.negotiate( err );

            // for each
            results.forEach( function( d, i ){
              rows.push({
                'title': d.admin2name,
                'param': 'zone',
                'active': d.admin2pcode,
                'class': 'grey-text text-darken-2 waves-effect waves-teal waves-teal-lighten-4',
                'href': url + params.region + '/' + d.admin2pcode + '/all/' + params.start_date  + '/' + params.end_date
              });
            });

            // menu
            menu = {
              'id': 'ctc-admin-zone',
              'icon': 'location_on',
              'title': 'Zone',
              'class': 'teal lighten-1 white-text',
              'rows': rows
            };

            // success
            return res.json( 200, { menu: menu, data: results } );

          });

        break;

      // total reports due
      case 'woreda':
        
        Admin3
          .find({ admin0pcode: 'ET', admin2pcode: params.zone })
          .sort('admin3name ASC' )
          .exec( function ( err, results ) {
            
            // return error
            if (err) return res.negotiate( err );

            // for each
            results.forEach( function( d, i ){
              rows.push({
                'title': d.admin3name,
                'param': 'woreda',
                'active': d.admin3pcode,
                'class': 'grey-text text-darken-2 waves-effect waves-teal waves-teal-lighten-4',
                'href': url + params.region + '/' + params.zone + '/' + d.admin3pcode + '/' + params.start_date  + '/' + params.end_date
              });
            });

            // menu
            menu = {
              'id': 'ctc-admin-woreda',
              'icon': 'location_on',
              'title': 'Woreda',
              'class': 'teal lighten-1 white-text',
              'rows': rows
            };

            // success
            return res.json( 200, { menu: menu, data: results } );

          });

        break;

      // total reports due
      default:

        Admin1
          .find({ admin0pcode: 'ET' })
          .sort('admin1name DESC' )
          .exec( function ( err, results ) {
            
            // return error
            if (err) return res.negotiate( err );

            // for each
            results.forEach( function( d, i ){
              rows.push({
                'title': d.admin1name,
                'param': 'region',
                'active': d.admin1pcode,
                'class': 'grey-text text-darken-2 waves-effect waves-teal waves-teal-lighten-4',
                'href': url + d.admin1pcode + '/' + params.zone + '/' + params.woreda  + '/' + params.start_date  + '/' + params.end_date
              });
            });

            // menu
            menu = {
              'id': 'ctc-admin-region',
              'icon': 'location_on',
              'title': 'Region',
              'class': 'teal lighten-1 white-text',
              'rows': rows
            };

            // success
            return res.json( 200, { menu: menu, data: results } );

          });

        // break
        break;

    }

  },

  // get epr indicators
  getCtcIndicator: function(req, res) {

    // params, filters
    var params = CtcDashboard.getParams( req );
    var filters = CtcDashboard.getFilters( params );

    // run query
    Assessments
      .find()
      .where( filters.region )
      .where( filters.zone )
      .where( filters.woreda )
      .where( filters.date )
      .exec( function( err, results ){

        // return error
        if (err) return res.negotiate( err );

        // indicator
        switch( params.indicator ){

          // total reports due
          case 'download':

            // return csv
            json2csv({ data: results }, function( err, csv ) {
              
              // error
              if ( err ) return res.negotiate( err );
              // success
              return res.json( 200, { data: csv } );

            });

            break;

          // total reports due
          case 'calendar':

            // result
            var result = {};
            // for each row, format for cal-heatmap
            results.forEach( function( d, i ) {
              // timestamp is seconds since 1st Jan 1970
              if ( !result[ new Date( d.assessment_date ).getTime() / 1000 ] ){
                result[ new Date( d.assessment_date ).getTime() / 1000 ] = 0;
              }
              result[ new Date( d.assessment_date ).getTime() / 1000 ]++;
            });

            // return number of expected reports
            return res.json( 200, { 'data': result } );            

            break;

          default:
            
            // return number of expected reports
            return res.json( 200, { 'value': results.length } );

            break;

        }


      });

  },

  // get alert indicator
  getCaseManagementIndicator: function(req, res) {

    // params, filters
    var params = CtcDashboard.getParams( req );
    var filters = CtcDashboard.getFilters( params );

    // run query
    CaseManagement
      .find()
      .where( filters.region )
      .where( filters.zone )
      .where( filters.woreda )
      .where( filters.date )
      .exec( function( err, results ){

        // return error
        if (err) return res.negotiate( err );

        // indicator
        switch( params.indicator ){

          case 'patients':

            var value = CtcDashboard.getSum( 'case_management_patients', results );
            return res.json( 200, { 'value': value } );

          case 'beds_patients':

            var value = CtcDashboard.getSum( 'case_management_beds', results ) - CtcDashboard.getSum( 'case_management_patients', results );
            return res.json( 200, { 'value': value } );

          case 'beds':

            var value = CtcDashboard.getSum( 'case_management_beds', results );
            return res.json( 200, { 'value': value } );

          case 'doctors':

            var value = CtcDashboard.getSum( 'case_management_doctors', results );
            return res.json( 200, { 'value': value } );

          case 'nurses':

            var value = CtcDashboard.getSum( 'case_management_nurses', results );
            return res.json( 200, { 'value': value } );

          case 'cleaners':

            var value = CtcDashboard.getSum( 'case_management_cleaners', results );
            return res.json( 200, { 'value': value } );

          // total reports due
          case 'download':

            // return csv
            json2csv({ data: results }, function( err, csv ) {
              
              // error
              if ( err ) return res.negotiate( err );
              // success
              return res.json( 200, { data: csv } );

            });

            break;

          case 'markers':

            // markers
            var markers = {};

            // for each
            results.forEach( function( d, i ){

              // message
              var message = '<div class="center card-panel" style="width:300px">' +
                              '<div style="text-align:center;">' +
                                '<div style="font-size:1.6rem; font-weight:100;">' + d.site_name + '</div><br/>' + 
                              '</div>' +
                              '<div style="text-align:center">' +
                                '<span class="count">' + d.case_management_patients + '</span> patients, <span class="count">' + d.case_management_beds + '</span> beds <br/><br/>' + 
                              '</div>' +
                              '<div style="text-align:center">' +
                                'with <span class="count">' + d.case_management_doctors + '</span> doctors, <span class="count">' + d.case_management_nurses + '</span> nurses' +
                              '</div>' + 
                              '<div>' +
                                '<br/>' +
                                'in <span style="font-size:1.6rem; font-weight:100;">' + d.admin1name + '<br/>' + d.admin2name + ', ' + d.admin3name + '</span>' +
                              '</div>' +
                              '<br/>' +
                              '<div>' +
                                'Assessment Date<br/> <span style="font-size:1.6rem; font-weight:100;">' + moment( d.assessment_date ).format('ddd, MMMM Do YYYY') + '</span>' +
                              '</div>' +
                            '</div>';
              // create markers
              markers[ 'marker' + i ] = {
                layer: 'case_management',
                lat: parseFloat( d.site_lat ),
                lng: parseFloat( d.site_lng ),
                message: message
              };
            });

            // return markers
            return res.json( { status:200, data: markers } );

          default:
            
            // return number of expected reports
            return res.json( 200, { 'value': results.length } );

            break;

        }


      });

  }

};

module.exports = CtcDashboard;