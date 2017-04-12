/**
 * AdminDashboardController
 *
 * @description :: Health Cluster Dashboard
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// flatten json
function flatten( json ) {
  var array = [];
  for( var i in json ) {
    if ( json.hasOwnProperty( i ) && json[ i ] instanceof Object ){
      array.push( json[ i ] );
    }
  }
  return array;
}

// admin controller
var AdminDashboardController = {

  //
  getClusterAdminIndicator: function( req, res ){

    // request input
    if ( !req.param( 'report_type' ) || !req.param( 'indicator' ) || !req.param( 'cluster_id' ) || !req.param( 'organization' ) || !req.param( 'adminRpcode' )  || !req.param( 'admin0pcode' ) || !req.param( 'start_date' ) || !req.param( 'end_date' ) ) {
      return res.json( 401, { err: 'report_type, indicator, cluster_id, adminRpcode, admin0pcode, start_date, end_date required!' });
    }

    // organizations to exclude totally
    var $nin_organizations = [ 'iMMAP' ];
        // organizations to exclude in calculations
        // ARCS
        // $nin_select_organizations = [ '56ff49200c68f2c746e3f83a' ];

    // variables
    var params = {
          moment: require( 'moment' ),
          list: req.param( 'list' ),
          indicator: req.param( 'indicator' ),
          report_type: req.param( 'report_type' ),
          cluster_filter: req.param( 'cluster_id' ) === 'all' ? {} : { cluster_id: req.param( 'cluster_id' ) },
          // organization_filter: req.param( 'organization' ) === 'all' ? { organization_id: { '!': $nin_select_organizations } } : { organization_id: req.param( 'organization' ) },
          organization_filter: req.param( 'organization' ) === 'all' ? { organization: { '!': $nin_organizations } } : { organization_id: req.param( 'organization' ) },
          adminRpcode: req.param( 'adminRpcode' ).toUpperCase(),
          admin0pcode: req.param( 'admin0pcode' ).toUpperCase(),
          start_date: req.param( 'start_date' ),
          end_date: req.param( 'end_date' )
      }

    // stock/activity
    if ( params.report_type === 'stock' ) {
      AdminDashboardController.getStockIndicator( $nin_organizations, params, req, res );
    } else {
      AdminDashboardController.getActivityIndicator( $nin_organizations, params, req, res );
    }

  },

  // stock reports
  getStockIndicator: function( $nin_organizations, params, req, res ){
    // switch on indicator
    switch( params.indicator ) {

      case 'latest':

        // get organizations by project
        StockReport
          .find()
          .where( params.cluster_filter )
          .where( { adminRpcode: params.adminRpcode } )
          .where( { admin0pcode: params.admin0pcode } )
          .where( { reporting_period: { '>=': new Date( params.start_date ), '<=': new Date( params.end_date ) } } )
          .where( params.organization_filter )
          .sort( 'updatedAt DESC' )
          .limit(1)
          .exec( function( err, reports ){

            // return error
            if (err) return res.negotiate( err );

            
            // return org list
            return res.json( 200, reports[0] );

          });

        break;

      case 'organizations':

        // get a list of projects for side menu
        if ( params.list ) {

          // get organizations by project
          StockReport
            .find()
            .where( params.cluster_filter )
            .where( { adminRpcode: params.adminRpcode } )
            .where( { admin0pcode: params.admin0pcode } )
            .where( { reporting_period: { '>=': new Date( params.start_date ), '<=': new Date( params.end_date ) } } )
            .where( params.organization_filter )
            .exec( function( err, projects ){

              // return error
              if (err) return res.negotiate( err );

              //
              var organizations = [];

              // projects 
              projects.forEach(function( d, i ){

                // if not existing
                if( !organizations[d.organization_id] ) {
                  // add 
                  organizations[d.organization_id] = {};
                  organizations[d.organization_id].organization_id = d.organization_id;
                  organizations[d.organization_id].organization = d.organization;
                }

              });
              
              // return org list
              return res.json( 200, flatten( organizations ) );

            });

          } else {

            // get organizations by project
            StockReport
              .find()
              .where( params.cluster_filter )
              .where( { adminRpcode: params.adminRpcode } )
              .where( { admin0pcode: params.admin0pcode } )
              .where( { reporting_period: { '>=': new Date( params.start_date ), '<=': new Date( params.end_date ) } } )
              .where( params.organization_filter )
              .exec( function( err, projects ){

                // return error
                if (err) return res.negotiate( err );

                //
                var organizations = [];

                // projects 
                projects.forEach(function( d, i ){

                  // if not existing
                  if( !organizations[d.organization_id] ) {
                    // add 
                    organizations[d.organization_id] = {};
                    organizations[d.organization_id].organization_id = d.organization_id;
                    organizations[d.organization_id].organization = d.organization;
                  }

                });
                
                // return indicator
                return res.json( 200, { 'value': flatten( organizations ).length });

              });
              
          }

          break;

      case 'reports_total':
        
        // reports total
        StockReport
          .find()
          .where( params.cluster_filter )
          .where( { adminRpcode: params.adminRpcode } )
          .where( { admin0pcode: params.admin0pcode } )
          .where( { reporting_period: { '>=': new Date( params.start_date ), '<=': new Date( params.end_date ) } } )
          .where( params.organization_filter )
          .where( { report_active: true } )
          .sort('updatedAt DESC')
          .exec( function( err, reports ){

            // return error
            if (err) return res.negotiate( err );

            // return
            if ( params.list ) {

              // counter
              var counter=0,
                  length=reports.length;

              // reports
              reports.forEach( function( d, i ){

                // check if form has been edited
                Stock
                  .count( { report_id: d.id } )
                  .exec(function( err, b ){
                    
                    // return error
                    if (err) return res.negotiate( err );

                    // add status / icon
                    reports[i].status = '#e57373';
                    reports[i].icon = 'fiber_manual_record';

                    // if benficiaries
                    if ( b ) {
                      // add status
                      reports[i].status = reports[i].report_status === 'complete' ? '#4db6ac' : '#fff176'
                    }

                    // reutrn
                    counter++;
                    if ( counter === length ) {
                      // table
                      return res.json( 200, reports );
                    }

                  });

              });

            } else {

              // return indicator
              return res.json( 200, { 'value': reports.length });
            }

          });

        break;

      case 'reports_complete':

        // reports complete
        StockReport
          .find()
          .where( params.cluster_filter )
          .where( { adminRpcode: params.adminRpcode } )
          .where( { admin0pcode: params.admin0pcode } )
          .where( { reporting_period: { '>=': new Date( params.start_date ), '<=': new Date( params.end_date ) } } )
          .where( params.organization_filter )
          .where( { report_active: true } )
          .where( { report_status: 'complete' } )
          .sort('updatedAt DESC')
          .exec( function( err, reports ){

            // return error
            if (err) return res.negotiate( err );

            // return
            if ( params.list ) {

              // counter
              var counter=0,
                  length=reports.length;

              // if no reports
              if ( length === 0 ) {
                
                // return empty
                return res.json( 200, [] );

              } else {
              
                // reports
                reports.forEach( function( d, i ){

                  // check if form has been edited
                  Stock
                    .find( { report_id: d.id } )
                    .exec(function( err, b){
                      
                      // return error
                      if (err) return res.negotiate( err );

                      // add status
                      reports[i].status = '#4db6ac'
                      reports[i].icon = 'check_circle';

                      // if benficiaries
                      if ( !b.length ) {
                        // add status
                        reports[i].icon = 'adjust'
                      }

                      // reutrn
                      counter++;
                      if ( counter === length ) {
                        // table
                        return res.json( 200, reports );
                      }

                    });

                });

              }  

            } else {
              
              // return indicator
              return res.json( 200, { 'value': reports.length });
            }

          });  

        break;

      case 'reports_due':

        // reports due
        StockReport
          .find()
          .where( params.cluster_filter )
          .where( { adminRpcode: params.adminRpcode } )
          .where( { admin0pcode: params.admin0pcode } )
          .where( { report_active: true } )
          .where( { report_status: 'todo' } )
          .where( { report_month: { '>=': params.moment( params.start_date ).month(), '<=': params.moment( params.end_date ).month() } } )
          .where( { report_year: { '>=': params.moment( params.start_date ).year(), '<=': params.moment( params.end_date ).year() } } )
          .where( params.organization_filter )
          .sort('updatedAt DESC')
          .exec( function( err, reports ){

            // return error
            if (err) return res.negotiate( err );

            // return
            if ( params.list ) {

              // counter
              var counter=0,
                  length=reports.length;

              // if no reports
              if ( length === 0 ) {
                
                // return empty
                return res.json( 200, [] );

              } else {

                // reports
                reports.forEach( function( d, i ){

                  // check if form has been edited
                  Stock
                    .count( { report_id: d.id } )
                    .exec(function( err, b){
                      
                      // return error
                      if (err) return res.negotiate( err );

                      // add status
                      reports[i].status = '#e57373'
                      reports[i].icon = 'watch_later';

                      // if benficiaries
                      if ( b ) {
                        // add status
                        reports[i].status = '#fff176'
                      }

                      // reutrn
                      counter++;
                      if ( counter === length ) {
                        // table
                        return res.json( 200, reports );
                      }

                    });

                });

              }

            } else {

              // return indicator
              return res.json( 200, { 'value': reports.length });
            }
            

          });  

        break;

      case 'reports_complete_total':

        // reports total
        StockReport
          .find()
          .where( params.cluster_filter )
          .where( { adminRpcode: params.adminRpcode } )
          .where( { admin0pcode: params.admin0pcode } )
          .where( { reporting_period: { '>=': new Date( params.start_date ), '<=': new Date( params.end_date ) } } )
          .where( params.organization_filter )
          .where( { report_active: true } )
          .sort('updatedAt DESC')
          .exec( function( err, total_reports ){

            // return error
            if (err) return res.negotiate( err );

            // reports complete
            Report
              .find()
              .where( params.cluster_filter )
              .where( { adminRpcode: params.adminRpcode } )
              .where( { admin0pcode: params.admin0pcode } )
              .where( { reporting_period: { '>=': new Date( params.start_date ), '<=': new Date( params.end_date ) } } )
              .where( params.organization_filter )
              .where( { report_active: true } )
              .where( { report_status: 'complete' } )
              .sort('updatedAt DESC')
              .exec( function( err, reports ){

                // return error
                if (err) return res.negotiate( err );

                // return new Project
                return res.json(200, { 'value': reports.length, 'value_total': total_reports.length });                

              });

            });

            break;

    }
  },
  
  // monthly reports
  getActivityIndicator: function( $nin_organizations, params, req, res ){

    // switch on indicator
    switch( params.indicator ) {

      case 'latest':

        // get organizations by project
        Report
          .find()
          .where( params.cluster_filter )
          .where( { adminRpcode: params.adminRpcode } )
          .where( { admin0pcode: params.admin0pcode } )
          .where( { project_start_date: { '<=': new Date( params.end_date ) } } )
          .where( { project_end_date: { '>=': new Date( params.start_date ) } } )
          // .where( { organization: { '!': $nin_organizations } } )
          .where( params.organization_filter )
          .sort( 'updatedAt DESC' )
          .limit(1)
          .exec( function( err, reports ){

            // return error
            if (err) return res.negotiate( err );

            
            // return org list
            return res.json( 200, reports[0] );

          });

        break;

      case 'organizations':

        // get a list of projects for side menu
        if ( params.list ) {

          // get organizations by project
          Project
            .find()
            .where( params.cluster_filter )
            .where( { adminRpcode: params.adminRpcode } )
            .where( { admin0pcode: params.admin0pcode } )
            .where( { project_start_date: { '<=': new Date( params.end_date ) } } )
            .where( { project_end_date: { '>=': new Date( params.start_date ) } } )
            .where( params.organization_filter )
            .exec( function( err, projects ){

              // return error
              if (err) return res.negotiate( err );

              //
              var organizations = [];

              // projects 
              projects.forEach(function( d, i ){

                // if not existing
                if( !organizations[d.organization_id] ) {
                  // add 
                  organizations[d.organization_id] = {};
                  organizations[d.organization_id].organization_id = d.organization_id;
                  organizations[d.organization_id].organization = d.organization;
                }

              });
              
              // return org list
              return res.json( 200, flatten( organizations ) );

            });

          } else {

            // get organizations by project
            Project
              .find()
              .where( params.cluster_filter )
              .where( { adminRpcode: params.adminRpcode } )
              .where( { admin0pcode: params.admin0pcode } )
              .where( { project_start_date: { '<=': new Date( params.end_date ) } } )
              .where( { project_end_date: { '>=': new Date( params.start_date ) } } )
              .where( params.organization_filter )
              .exec( function( err, projects ){

                // return error
                if (err) return res.negotiate( err );

                //
                var organizations = [];

                // projects 
                projects.forEach(function( d, i ){

                  // if not existing
                  if( !organizations[d.organization_id] ) {
                    // add 
                    organizations[d.organization_id] = {};
                    organizations[d.organization_id].organization_id = d.organization_id;
                    organizations[d.organization_id].organization = d.organization;
                  }

                });
                
                // return indicator
                return res.json( 200, { 'value': flatten( organizations ).length });

              });
              
          }

          break;

      case 'reports_total':
        
        // reports total
        Report
          .find()
          .where( params.cluster_filter )
          .where( { adminRpcode: params.adminRpcode } )
          .where( { admin0pcode: params.admin0pcode } )
          .where( { report_active: true } )
          .where( { reporting_period: { '>=': params.moment( params.start_date ).format('YYYY-MM-DD'), '<=': params.moment( params.end_date ).format('YYYY-MM-DD') } } )
          .where( params.organization_filter )
          .sort('updatedAt DESC')
          .exec( function( err, reports ){

            // return error
            if (err) return res.negotiate( err );

            // return
            if ( params.list ) {

              // counter
              var counter=0,
                  length=reports.length;

              // reports
              reports.forEach( function( d, i ){

                // check if form has been edited
                Beneficiaries
                  .count( { report_id: d.id } )
                  .exec(function( err, b ){
                    
                    // return error
                    if (err) return res.negotiate( err );

                    // add status / icon
                    reports[i].status = '#e57373';
                    reports[i].icon = 'fiber_manual_record';

                    // if benficiaries
                    if ( b ) {
                      // add status
                      reports[i].status = reports[i].report_status === 'complete' ? '#4db6ac' : '#fff176'
                    }

                    // reutrn
                    counter++;
                    if ( counter === length ) {
                      // table
                      return res.json( 200, reports );
                    }

                  });

              });

            } else {

              // return indicator
              return res.json( 200, { 'value': reports.length });
            }

          });

        break;

      case 'reports_complete':

        // reports complete
        Report
          .find()
          .where( params.cluster_filter )
          .where( { adminRpcode: params.adminRpcode } )
          .where( { admin0pcode: params.admin0pcode } )
          .where( { report_active: true } )
          .where( { report_status: 'complete' } )
          .where( { reporting_period: { '>=': params.moment( params.start_date ).format('YYYY-MM-DD'), '<=': params.moment( params.end_date ).format('YYYY-MM-DD') } } )
          .where( params.organization_filter )
          .sort('updatedAt DESC')
          .exec( function( err, reports ){

            // return error
            if (err) return res.negotiate( err );

            // return
            if ( params.list ) {

              // counter
              var counter=0,
                  length=reports.length;

              // if no reports
              if ( length === 0 ) {
                
                // return empty
                return res.json( 200, [] );

              } else {
              
                // reports
                reports.forEach( function( d, i ){

                  // check if form has been edited
                  Beneficiaries
                    .find( { report_id: d.id } )
                    .exec(function( err, b){
                      
                      // return error
                      if (err) return res.negotiate( err );

                      // add status
                      reports[i].status = '#4db6ac'
                      reports[i].icon = 'check_circle';

                      // if benficiaries
                      if ( !b.length ) {
                        // add status
                        reports[i].icon = 'adjust'
                      }

                      // reutrn
                      counter++;
                      if ( counter === length ) {
                        // table
                        return res.json( 200, reports );
                      }

                    });

                });

              }  

            } else {
              
              // return indicator
              return res.json( 200, { 'value': reports.length });
            }

          });  

        break;

      case 'reports_due':

        // reports due
        Report
          .find()
          .where( params.cluster_filter )
          .where( { adminRpcode: params.adminRpcode } )
          .where( { admin0pcode: params.admin0pcode } )
          .where( { report_active: true } )
          .where( { report_status: 'todo' } )
          .where( { report_month: { '>=': params.moment( params.start_date ).month(), '<=': params.moment( params.end_date ).month() } } )
          .where( { report_year: { '>=': params.moment( params.start_date ).year(), '<=': params.moment( params.end_date ).year() } } )
          .where( params.organization_filter )
          .sort('updatedAt DESC')
          .exec( function( err, reports ){

            // return error
            if (err) return res.negotiate( err );

            // return
            if ( params.list ) {

              // counter
              var counter=0,
                  length=reports.length;

              // if no reports
              if ( length === 0 ) {
                
                // return empty
                return res.json( 200, [] );

              } else {

                // reports
                reports.forEach( function( d, i ){

                  // check if form has been edited
                  Beneficiaries
                    .count( { report_id: d.id } )
                    .exec(function( err, b){
                      
                      // return error
                      if (err) return res.negotiate( err );

                      // add status
                      reports[i].status = '#e57373'
                      reports[i].icon = 'watch_later';

                      // if benficiaries
                      if ( b ) {
                        // add status
                        reports[i].status = '#fff176'
                      }

                      // reutrn
                      counter++;
                      if ( counter === length ) {
                        // table
                        return res.json( 200, reports );
                      }

                    });

                });

              }

            } else {

              // return indicator
              return res.json( 200, { 'value': reports.length });
            }
            

          });  

        break;

      case 'reports_complete_total':

        // reports total
        Report
          .find()
          .where( params.cluster_filter )
          .where( { adminRpcode: params.adminRpcode } )
          .where( { admin0pcode: params.admin0pcode } )
          .where( { report_active: true } )
          .where( { reporting_period: { '>=': params.moment( params.start_date ).format('YYYY-MM-DD'), '<=': params.moment( params.end_date ).format('YYYY-MM-DD') } } )
          .where( params.organization_filter )
          .sort('updatedAt DESC')
          .exec( function( err, total_reports ){

            // return error
            if (err) return res.negotiate( err );

            // reports complete
            Report
              .find()
              .where( params.cluster_filter )
              .where( { adminRpcode: params.adminRpcode } )
              .where( { admin0pcode: params.admin0pcode } )
              .where( { report_active: true } )
              .where( { report_status: 'complete' } )
              .where( { reporting_period: { '>=': params.moment( params.start_date ).format('YYYY-MM-DD'), '<=': params.moment( params.end_date ).format('YYYY-MM-DD') } } )
              .where( params.organization_filter )
              .sort('updatedAt DESC')
              .exec( function( err, reports ){

                // return error
                if (err) return res.negotiate( err );

                // return new Project
                return res.json(200, { 'value': reports.length, 'value_total': total_reports.length });                

              });

            });

            break;

    }

  }

};

module.exports = AdminDashboardController;
