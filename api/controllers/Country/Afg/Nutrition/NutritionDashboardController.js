/**
 * NutritionDashboardController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// require
var moment = require( 'moment' );
var json2csv = require( 'json2csv' );
if (sails.config.kobo) {
    var kobo_url = sails.config.kobo.NUTRITION_KOBO_URL;
    var kobo_user = sails.config.kobo.NUTRITION_KOBO_USER;
    var kobo_password = sails.config.kobo.NUTRITION_KOBO_PASSWORD;
}
var NutritionDashboard = {

    // get latest date
    getLatestUpdate: function( req, res ){
      
      NutritionReports
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

    // get distinct by key #TODO use _
    getDistinct: function( key, records ){
  
      store = {}
      records.forEach(function(d,i){
        for (var d_key in d) {
          if( key === d_key  && !store[key] ){
            store[d[key]] = true
          }
        }
      });
      return Object.keys(store).length;
    },
  
    // get params from req
    getParams: function( req ){
      // check req
      if (  !req.param('indicator') || !req.param('year') || !req.param('province')  || !req.param('district')  || !req.param('week') || !req.param('start_date') || !req.param('end_date') ) {
        return res.json( 401, { err: 'year, province, district, week, start_date, end_date required!' });
      }
      // return params
      return {
        indicator: req.param('indicator'),
        list: req.param('list') ? req.param('list') : false,
        year: parseInt( req.param('year') ),
        province: req.param('province'),
        district: req.param('district'),
        organization_tag: req.param('organization_tag'),
        week: req.param('week'),
        start_date: req.param('start_date'),
        end_date: req.param('end_date'),
        current_week: ( parseInt( req.param('year') ) === moment().year() ) ? moment().week() : 53,
      }
     
    },
  
    // return filters
    getFilters: function( params ){
      // filters
      return {
        year: { reporting_year: params.year },
        province: params.province !== 'all' ? { admin1pcode: params.province } : {},
        district: params.district !== 'all' ? { admin2pcode: params.district } : {},
        organization_tag: params.organization_tag !== 'all' ? { organization_tag: params.organization_tag } : {},
        week: params.week !== 'all' ? { reporting_week: parseInt(params.week) } : {},
        date: { reporting_start_date: { '>=': params.start_date, '<': params.end_date } }
      }
    },

    // flatten json
    flatten: function( json ) {
        var array = [];
        for( var i in json ) {
        if ( json.hasOwnProperty( i ) && json[ i ] instanceof Object ){
            array.push( json[ i ] );
        }
        }
        return array;
    },
  
    // get epr indicators
    getNutritionReportsIndicator: function(req, res) {

    // params
    var params = NutritionDashboard.getParams( req, res );

    // filters
    var filters = NutritionDashboard.getFilters( params );

    // run query
    NutritionReports
        .find()
        .where( filters.year )
        .where( filters.week )
        .where( filters.organization_tag )
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

            case 'organizations':

            if ( !params.list ) {

                var value = NutritionDashboard.getDistinct( 'organization_tag', results );
                return res.json( 200, { 'value': value } );

                break;

            } else {
                
                var organizations = [];

                results.forEach(function( d, i ){

                    // if not existing
                    if( !organizations[ d.organization_tag ] ) {
                      // add
                      organizations[ d.organization_tag ] = {};
                      organizations[ d.organization_tag ].organization_tag = d.organization_tag;
                      organizations[ d.organization_tag ].organization = d.organization;
                    }
      
                  });
      
                  // flatten
                  if ( organizations ) {
                    organizations = NutritionDashboard.flatten( organizations );
                  }
      
                  // order
                  organizations.sort(function(a, b) {
                    return a.organization.localeCompare(b.organization);
                  });
      
                  // default
                  organizations.unshift({
                    organization_tag: 'all',
                    organization: 'ALL',
                  });

                  return res.json( 200, organizations );

                  break;

            }
    
            // total reports due
            case 'duplicate_reports':

                // values
                var store = {},
                        reports = [],
                        duplicates = 0;

                // results
                results.forEach(function( d, i ){
                    // week + province
                    if (!store[d.reporting_start_date + '_' + d.organization_tag]) {
                        store[d.reporting_start_date + '_' + d.organization_tag] = {};
                        store[d.reporting_start_date + '_' + d.organization_tag].count = 0;
                        store[d.reporting_start_date + '_' + d.organization_tag].data = [];
                    }
                    store[d.reporting_start_date + '_' + d.organization_tag].count++;
                    store[d.reporting_start_date + '_' + d.organization_tag].data.push(d);
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
            
            case 'calendar':

                        // result
                        var result = {};
                        // for each row, format for cal-heatmap
                        results.forEach( function( d, i ) {
                        // timestamp is seconds since 1st Jan 1970
                        if ( !result[ new Date( d._submission_time ).getTime() / 1000 ] ){
                            result[ new Date( d._submission_time ).getTime() / 1000 ] = 0;
                        }
                        result[ new Date( d._submission_time ).getTime() / 1000 ]++;
                        });

                        // return number of expected reports
                        return res.json( 200, { 'data': result } );            

                        break;
                        
                        
            default:

                // return number of reports
                return res.json( 200, results );

                break;

        }


        });

    },
  
    // get alert indicator
    getNutritionIndicator: function(req, res) {
  
      // params
      var params = NutritionDashboard.getParams( req );
  
      // filters
      var filters = NutritionDashboard.getFilters( params );
  
      // run query
      NutritionBeneficiaries
        .find()
        .where( filters.year )
        .where( filters.province )
        .where( filters.district )
        .where( filters.organization_tag )
        .where( filters.week )
        .where( filters.date )
        .exec( function( err, results ){
  
          // return error
          if (err) return res.negotiate( err );
  
          // indicator
          switch( params.indicator ){
  
            // total reports due
            case 'rows':
  
              // return number of expected reports
              return res.json( 200, { 'value': results.length } );
  
              break;
  
            case 'total':
  
              var value = NutritionDashboard.getSum( 'total', results );
              return res.json( 200, { 'value': value } );
  
            case 'locations':
  
              var value = NutritionDashboard.getDistinct( 'district', results );
              return res.json( 200, { 'value': value } );

            case 'activities':
  
              var value = NutritionDashboard.getDistinct( 'activity_description_id', results );
              return res.json( 200, { 'value': value } );

            // total reports submitted
            case 'submitted_reports':

                // return number of expected reports
                var value = NutritionDashboard.getDistinct( 'dataid', results );
                return res.json( 200, { 'value': value } );
                

            case 'markers':
  
              // markers
              var markers = {};
  
              // for each
              results.forEach(function(d,i){
   
                // message
                var message = '<div class="center card-panel" style="width:300px">' +
                                '<div>' +
                                  '<div class="count" style="text-align:center">' + d.total + '</div> Beneficiaries <br/><br/>' + 
                                '</div>' +
                                '<div>' +
                                  '<div style="text-align:center">' + d.activity_description_name +
                                '</div>' + 
                                '<div>' +
                                '<div style="text-align:center">' + d.girls + ' girls, ' +  d.boys + ' boys, ' + d.men + ' men, ' + d.women + ' women' +
                                '</div>' + 
                                '<div>' +
                                  'in ' + d.admin1name + ', ' + d.admin2name +
                                '</div>' +
                                '<div style="text-align:center">' + d.location_name + '</div>' +
                                '<div>' + d.reporting_start_date + ' till ' + d.reporting_end_date + '</div>' +
                                '<div>' +
                                '<div style="text-align:center">' + d.organization + 
                                '</div>' +
                              '</div>';
                // create markers
                markers['marker' + i] = {
                  layer: 'beneficiaries',
                  lat: d.admin2lat,
                  lng: d.admin2lng,
                  message: message
                };
              });
  
              // return markers
              return res.json( { status:200, data: markers } );

              case 'organizations':

              if ( !params.list ) {
  
                  var value = NutritionDashboard.getDistinct( 'organization_tag', results );
                  return res.json( 200, { 'value': value } );
  
                  break;
  
              } else {
                  
                  var organizations = [];
  
                  results.forEach(function( d, i ){
  
                      // if not existing
                      if( !organizations[ d.organization_tag ] ) {
                        // add
                        organizations[ d.organization_tag ] = {};
                        organizations[ d.organization_tag ].organization_tag = d.organization_tag;
                        organizations[ d.organization_tag ].organization = d.organization;
                      }
        
                    });
        
                    // flatten
                    if ( organizations ) {
                      organizations = NutritionDashboard.flatten( organizations );
                    }
        
                    // order
                    organizations.sort(function(a, b) {
                      return a.organization.localeCompare(b.organization);
                    });
        
                    // default
                    organizations.unshift({
                      organization_tag: 'all',
                      organization: 'All',
                    });
  
                    return res.json( 200, organizations );
                    
  
                    break;
                }

            default:
  
              // return number of expected reports
              return res.json( 200, results );
  
              break;
  
          }
  
  
        });
  
    },
  
 
    getNutritionData: function(req, res) {

    // params
    var params = NutritionDashboard.getParams( req );

    // filters
    var filters = NutritionDashboard.getFilters( params );

    // run query
    NutritionBeneficiaries
        .find()
    .where( filters.year )
    .where( filters.province )
    .where( filters.district )
    .where( filters.organization_tag )
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
  

    getEditForm: function(req, res) {
        moment = require( 'moment' ),
        exec = require('child_process').exec,
        pk = req.param('pk'),
        dataid = req.param('dataid'),
        cmd = 'curl -X GET https://kc.humanitarianresponse.info/api/v1/data/'+ pk + '/'+ dataid + '/enketo?return_url='+ req.protocol + '://' + req.host + ' -u ' + kobo_user + ':' + kobo_password,
        pk=225584;

        // run curl command
    exec( cmd, { maxBuffer: 1024 * 16384 }, function( error, stdout, stderr ) {

        if ( error ) {

            console.log(error);

            // return error
            res.json( 400, { error: 'Request error! Please try again...' } );

        } else {
            // success
            koboUrl = JSON.parse( stdout );
            return res.json( 200, { url: koboUrl.url } )
        }
        });
    },

    deleteForm: function(req, res) {
        moment = require( 'moment' ),
        exec = require('child_process').exec,
        pk = parseInt(req.param('pk')),
        dataid = parseInt(req.param('dataid')),
        cmd = 'curl -X DELETE https://kc.humanitarianresponse.info/api/v1/data/'+ pk + '/'+ dataid + ' -u ' + kobo_user + ':' + kobo_password,
        pk=226108;

        // run curl command
    exec( cmd, { maxBuffer: 1024 * 16384 }, function( error, stdout, stderr ) {

        if ( error ) {

            console.log(error);

            // return error
            res.json( 400, { error: 'Request error! Please try again...' } );

        } else {
            // success
            NutritionBeneficiaries.destroy({pk:pk, dataid:dataid}).exec(function (err,deletedRecords) {
                if (err) return res.negotiate( err );
                NutritionReports.destroy({pk:pk, dataid:dataid}).exec(function (err,deletedRecords) {
                    if (err) return res.negotiate( err );
                    return res.json( 200, { msg: 'deleted' } )
                })
            }) 
        }
        });
    }
  };

module.exports = NutritionDashboard;