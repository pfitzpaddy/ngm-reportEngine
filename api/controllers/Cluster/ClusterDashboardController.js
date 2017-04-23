/**
 * EprController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// require
var moment = require( 'moment' );
var json2csv = require( 'json2csv' );
var $nin_organizations = [ 'immap', 'arcs' ];

var ClusterDashboardController = {

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

  // get params from req
  getParams: function( req, res ){
    
    // request input
    if ( !req.param('indicator') || 
          !req.param('cluster_id') ||
          !req.param('adminRpcode') ||
          !req.param('admin0pcode') ||
          !req.param('organization_tag') ||
          !req.param('admin1pcode') ||
          !req.param('admin2pcode') ||
          !req.param('beneficiaries') ||
          !req.param('start_date') ||
          !req.param('end_date') ) {
      return res.json(401, {err: 'indicator, cluster_id, adminRpcode, admin0pcode, organization_tag, admin1pcode, admin2pcode, beneficiaries, start_date, end_date required!'});
    }

    // return params
    return {
      csv: req.param('csv') ? req.param('csv') : false,
      list: req.param('list') ? req.param('list') : false,
      indicator: req.param('indicator'),
      cluster_id: req.param('cluster_id'),
      adminRpcode: req.param('adminRpcode'),
      admin0pcode: req.param('admin0pcode'),
      organization_tag: req.param('organization_tag'),
      admin1pcode: req.param('admin1pcode'),
      admin2pcode: req.param('admin2pcode'),
      beneficiaries: req.param('beneficiaries'),
      start_date: req.param('start_date'),
      end_date: req.param('end_date')
    }

  },

  // return filters
  getFilters: function( params ){
    // filters
    return {
      default: { report_year: { '>=': 2017 }, location_id: { '!': null } },
      cluster_id: params.cluster_id === 'all' ? {} : { cluster_id: params.cluster_id },
      adminRpcode: params.adminRpcode === 'all' ? {} : { adminRpcode: params.adminRpcode },
      admin0pcode: params.admin0pcode === 'all' ? {} : { admin0pcode: params.admin0pcode },
      organization_tag: params.organization_tag === 'all' ? { organization_tag: { '!': $nin_organizations } } : { organization_tag: params.organization_tag },
      admin1pcode: params.admin1pcode === 'all' ? {} : { admin1pcode: params.admin1pcode },
      admin2pcode: params.admin2pcode === 'all' ? {} : { admin2pcode: params.admin2pcode },
      beneficiaries: params.beneficiaries[0] === 'all' ? {} : { beneficiary_type_id: params.beneficiaries },
      date: { reporting_period: { '>=': new Date( params.start_date ), '<=': new Date( params.end_date ) } }
    }
  },

  // get latest date
  getLatestUpdate: function( req, res ){
    
    // beneficiaries
    Beneficiaries
      .find({ organization_tag: { '!': $nin_organizations } })
      .sort( 'updatedAt DESC' )
      .limit(1)
      .exec( function( err, results ){

        // return error
        if (err) return res.negotiate( err );

        // latest update
        return res.json( 200, results[0] );

      });
  },

  // indicators
  getIndicator: function ( req, res  ) {
    
    // parmas, filters
    var params = ClusterDashboardController.getParams( req, res );
    var filters = ClusterDashboardController.getFilters( params );

    // switch on indicator
    switch( params.indicator ) {

      case 'organizations':

        // get organizations by project
        Beneficiaries
          .find()
          .where( filters.default )
          .where( filters.cluster_id )
          .where( filters.organization_tag )
          .where( filters.adminRpcode )
          .where( filters.admin0pcode )
          .where( filters.admin1pcode )
          .where( filters.admin2pcode )
          .where( filters.beneficiaries )
          .where( filters.date )
          // .where( filters.$nin_organizations )
          .exec( function( err, beneficiaries ){

            // return error
            if (err) return res.negotiate( err );

            // orgs
            var organizations = [];

            // projects 
            beneficiaries.forEach(function( d, i ){

              // if not existing
              if( !organizations[ d.organization ] ) {
                // add 
                organizations[ d.organization ] = {};
                organizations[ d.organization ].organization_tag = d.organization_tag;
                organizations[ d.organization ].organization = d.organization;
              }

            });

              // flatten
              organizations = ClusterDashboardController.flatten( organizations );

              // order
              organizations.sort(function(a, b) {
                return a.organization.localeCompare(b.organization);
              }); 

              // default
              organizations.unshift({
                organization_tag: 'all',
                organization: 'ALL',
              });

              // orgs
              Organizations
                .find()
                .where( { organization_tag: params.organization_tag } )
                .exec( function( err, organization ){

                  // return error
                  if (err) return res.negotiate( err );

                  if ( !beneficiaries.length ) {
                    organizations[1] = organization[0];
                  }

                  // get a list of projects for side menu
                  if ( params.list ) {
                    // return org list
                    return res.json( 200, organizations );
                  } else {
                    // return indicator
                    return res.json( 200, { 'value': organizations.length-1 });
                  }

                });

            });

        break;

      case 'projects':

        // get organizations by project
        Beneficiaries
          .find()
          .where( filters.default )
          .where( filters.cluster_id )
          .where( filters.organization_tag )
          .where( filters.adminRpcode )
          .where( filters.admin0pcode )
          .where( filters.admin1pcode )
          .where( filters.admin2pcode )
          .where( filters.beneficiaries )
          .where( filters.date )
          .exec( function( err, beneficiaries ){

            // return error
            if (err) return res.negotiate( err );

            // orgs
            var projects = [];

            // projects 
            beneficiaries.forEach(function( d, i ){

              // if not existing
              if( !projects[ d.project_id ] ) {
                // add 
                projects[ d.project_id ] = {};
                projects[ d.project_id ].project_id = d.project_id;
              }

            });

            // return org list
            return res.json( 200, { 'value': ClusterDashboardController.flatten( projects ).length } );

          });

        break;

      case 'contacts':

        // require
        var users = [],
            fields = [ 'admin0name', 'cluster', 'organization', 'name', 'position', 'username', 'phone', 'email', 'createdAt' ],
            fieldNames = [ 'Country', 'Cluster', 'Organization', 'Name', 'Position', 'Username', 'Phone', 'Email', 'Joined ReportHub' ];


        // get organizations by project
        Beneficiaries
          .find()
          .where( filters.default )
          .where( filters.cluster_id )
          .where( filters.organization_tag )
          .where( filters.adminRpcode )
          .where( filters.admin0pcode )
          .where( filters.admin1pcode )
          .where( filters.admin2pcode )
          .where( filters.beneficiaries )
          .where( filters.date )
          .exec( function( err, beneficiaries ){

            // return error
            if (err) return res.negotiate( err );

            // orgs
            var users = [];

            // projects 
            beneficiaries.forEach(function( d, i ){

              // if not existing
              users.push( d.username );

            });

            // users
            User
              .find()
              .where( { username: users } )
              .exec( function( err, users ){

                // return error
                if (err) return res.negotiate( err );

                // return csv
                json2csv({ data: users, fields: fields, fieldNames: fieldNames }, function( err, csv ) {
                  
                  // error
                  if ( err ) return res.negotiate( err );

                  // success
                  return res.json( 200, { data: csv } );

                });

              });

            });

        break;

      case 'ocha_report':

        // require
        var data = {},
            fields = [ 'admin1pcode', 'admin1name', 'category_type_name', 'beneficiary_type_name', 'boys', 'girls', 'men', 'women', 'elderly_men', 'elderly_women', 'total' ],
            fieldNames = [ 'Admin1 Pcode', 'Admin1 Name', 'Category', 'Beneficiary', 'Boys', 'Girls', 'Men', 'Women', 'Elderly Men', 'Elderly Women', 'Total' ];

        // get organizations by project
        Beneficiaries
          .find()
          .where( filters.default )
          .where( filters.cluster_id )
          .where( filters.organization_tag )
          .where( filters.adminRpcode )
          .where( filters.admin0pcode )
          .where( filters.admin1pcode )
          .where( filters.admin2pcode )
          .where( filters.beneficiaries )
          .where( filters.date )
          .exec( function( err, beneficiaries ){

            // return error
            if (err) return res.negotiate( err );

            // beneficiarie
            beneficiaries.forEach(function( d, i ){
              if ( !data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ] ) {
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ] = {};
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].admin1pcode;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].admin1name;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].category_type_name;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].beneficiary_type_name;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].boys = 0;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].girls = 0;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].men = 0;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].women = 0;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].elderly_men = 0;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].elderly_women = 0;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].total = 0;
              }
              // var eld_men = d.elderly_men ? d.elderly_men : 0;
              // var eld_women = d.elderly_women ? d.elderly_women : 0;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].admin1pcode = d.admin1pcode;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].admin1name = d.admin1name;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].category_type_name = d.category_type_name;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].beneficiary_type_name = d.beneficiary_type_name;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].boys += d.boys;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].girls += d.girls;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].men += d.men;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].women += d.women;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].elderly_men += d.elderly_men;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].elderly_women += d.elderly_women;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].total += d.boys + d.girls + d.men + d.women + d.elderly_men + d.elderly_women;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].lat = d.admin1lat;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].lng = d.admin1lng;

            });

            // sort
            var report = ClusterDashboardController.flatten( data );

            report.sort(function(a, b) {
              return a.admin1name.localeCompare(b.admin1name) || 
                      a.category_type_name.localeCompare(b.category_type_name) || 
                      a.beneficiary_type_name.localeCompare(b.beneficiary_type_name)
            });      

            // return csv
            json2csv({ data: report, fields: fields, fieldNames: fieldNames }, function( err, csv ) {
              
              // error
              if ( err ) return res.negotiate( err );

              // success
              return res.json( 200, { data: csv } );

            });


          });

        break;

      // raw data export
      case 'financial_report':

        // require
        var fields = [ 'cluster', 'organization', 'project_title', 'project_hrp_code', 'project_code', 'project_donor_name', 'project_budget', 'project_budget_currency', 'project_budget_date_recieved' ],
            fieldNames = [ 'Cluster', 'Organization', 'Project Title', 'HRP Project Code', 'Project Code', 'Project Donor', 'Total Funding Amount', 'Funding Currency', 'Date Funds Recieved' ];

        // get beneficiaries by project
        BudgetProgress
          .find()
          .where( { project_id: { '!': null } } )
          .where( filters.cluster_id )
          .where( filters.organization_tag )
          .where( filters.adminRpcode )
          .where( filters.admin0pcode )
          .where( filters.admin1pcode )
          .where( filters.admin2pcode )
          .where( { project_budget_date_recieved: { '>=': new Date( params.start_date ), '<=': new Date( params.end_date ) } } )
          .exec( function( err, budget ){

            // return error
            if (err) return res.negotiate( err );

            // return csv
            json2csv({ data: budget, fields: fields, fieldNames: fieldNames }, function( err, csv ) {
              
              // error
              if ( err ) return res.negotiate( err );

              // success
              return res.json( 200, { data: csv } );

            });

          });

        break;
      

      // raw data export
      case 'beneficiaries':

        // get beneficiaries by project
        Beneficiaries
          .find()
          .where( filters.default )
          .where( filters.cluster_id )
          .where( filters.organization_tag )
          .where( filters.adminRpcode )
          .where( filters.admin0pcode )
          .where( filters.admin1pcode )
          .where( filters.admin2pcode )
          .where( filters.beneficiaries )
          .where( filters.date )
          .exec( function( err, beneficiaries ){

            // return error
            if (err) return res.negotiate( err );

            var total = 0;

            // format
            beneficiaries.forEach(function( d, i ){
              var sum = d.boys + d.girls + d.men + d.women + d.elderly_men + d.elderly_women;
              total += sum;
              // beneficiaries
              d.total = sum;
              d.report_month_number = d.report_month+1;
              d.report_month = moment( d.reporting_period ).format( 'MMMM' );
            });

            if ( !params.csv ) {

              // return org list
              return res.json( 200, { 'value': total } );

            } else {

              var fields = [
                    'project_id',
                    'report_id',
                    'cluster_id',
                    'cluster',
                    'organization',
                    'report_month_number',
                    'report_month',
                    'report_year',
                    'reporting_period',
                    'admin1pcode',
                    'admin1name',
                    'admin2pcode',
                    'admin2name',
                    'conflict',
                    'fac_type_name',
                    'fac_name',
                    'category_type_id',
                    'category_type_name',
                    'beneficiary_type_id',
                    'beneficiary_type_name',
                    'activity_type_id',
                    'activity_type_name',
                    'activity_description_id',
                    'activity_description_name',
                    'delivery_type_id',
                    'delivery_type_name',
                    'units',
                    'unit_type_id',
                    'unit_type_name',
                    'households',
                    'families',
                    'boys',
                    'girls',
                    'men',
                    'women',
                    'elderly_men', 
                    'elderly_women',
                    'total',
                    'admin1lng',
                    'admin1lat',
                    'admin2lng',
                    'admin2lat'
                  ];

              var fieldNames = [
                    'project_id',
                    'report_id',
                    'cluster_id',
                    'cluster',
                    'organization',
                    'report_month_number',
                    'report_month',
                    'report_year',
                    'reporting_period',
                    'admin1pcode',
                    'admin1name',
                    'admin2pcode',
                    'admin2name',
                    'conflict',
                    'fac_type_name',
                    'fac_name',
                    'category_type_id',
                    'category_type_name',
                    'beneficiary_type_id',
                    'beneficiary_type_name',
                    'activity_type_id',
                    'activity_type_name',
                    'activity_description_id',
                    'activity_description_name',
                    'delivery_type_id',
                    'delivery_type_name',
                    'units',
                    'unit_type_id',
                    'unit_type_name',
                    'households',
                    'families',
                    'boys',
                    'girls',
                    'men',
                    'women',
                    'elderly_men', 
                    'elderly_women',
                    'total',
                    'admin1lng',
                    'admin1lat',
                    'admin2lng',
                    'admin2lat'
                  ];

              // return csv
              json2csv({ data: beneficiaries, fields: fields, fieldNames: fieldNames }, function( err, csv ) {
                
                // error
                if ( err ) return res.negotiate( err );

                // success
                return res.json( 200, { data: csv } );

              });

            }

          });

        break;

      // markers
      case 'markers':

        // params
        var locations = [],
            markers = {},
            counter = 0,
            length = 0;

        // get organizations by project
        Beneficiaries
          .find()
          .where( filters.cluster_id )
          .where( filters.organization_tag )
          .where( filters.adminRpcode )
          .where( filters.admin0pcode )
          .where( filters.admin1pcode )
          .where( filters.admin2pcode )
          .where( filters.beneficiaries )
          .where( filters.date )
          .exec( function( err, beneficiaries ){

            // return error
            if (err) return res.negotiate( err );

            // project ids
            beneficiaries.forEach( function( d, i ){
              if ( !locations[ d.project_id + d.admin2pcode ] ) {
                locations[ d.project_id + d.admin2pcode ] = d;
              }
            });

            locations = ClusterDashboardController.flatten( locations );

            // return no locations
            if ( !locations.length ) return res.json( 200, { 'data': { 'marker0': { layer: 'projects', lat:34.5, lng:66.0, message: '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">NO PROJECTS</h5>' } } } );

            // length
            length = locations.length;

            // foreach location
            locations.forEach( function( d, i ){

              // get user details
              User.findOne( { username: d.username } ).exec( function( err, user ){

                // return error
                if (err) return res.negotiate( err );

                // popup message
                var message = '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">' + user.cluster + '</h5>'
                            + '<h5 style="text-align:center; font-size:1.3rem; font-weight:100;">' + user.organization + ' | ' + d.project_title + '</h5>'
                            + '<div style="text-align:center">' + d.admin0name + '</div>'
                            + '<div style="text-align:center">' + d.admin1name + ', ' + d.admin2name + '</div>';
                            if ( d.cluster_id === 'health' ) {
                              message += '<div style="text-align:center">' + d.fac_type_name + '</div>';
                            }
                            message +=  '<div style="text-align:center">' + d.fac_name + '</div>'
                            + '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">CONTACT</h5>'
                            + '<div style="text-align:center">' + user.organization + '</div>'
                            + '<div style="text-align:center">' + user.name + '</div>'
                            + '<div style="text-align:center">' + user.position + '</div>'
                            + '<div style="text-align:center">' + user.phone + '</div>'
                            + '<div style="text-align:center">' + user.email + '</div>';

                // create markers
                markers[ 'marker' + counter ] = {
                  layer: 'projects',
                  lat: d.admin2lat,
                  lng: d.admin2lng,
                  message: message
                };

                // plus
                counter++;

                // if last location
                if( counter === length ){
                  
                  // return markers
                  return res.json(200, { 'data': markers } );

                }

              });

            });                          

          });

        break;

    }
    
  }


};

module.exports = ClusterDashboardController;
