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
  getHealthAdminIndicator: function( req, res ){

    // request input
    if ( !req.param('indicator') || !req.param('organization') || !req.param('adminRpcode')  || !req.param('admin0pcode') || !req.param('start_date') || !req.param('end_date') ) {
      return res.json( 401, { err: 'indicator, adminRpcode, admin0pcode, start_date, end_date required!' });
    }

    // organizations to exclude totally
    var $nin_organizations = [ 'iMMAP' ],
        // organizations to exclude in calculations
        // ARCS
        $nin_select_organizations = [ '56ff49200c68f2c746e3f83a' ];

    // variables
    var moment = require( 'moment' ),
        list = req.param('list'),
        indicator = req.param('indicator'),
        organization_filter = req.param('organization') === 'all' ? { organization_id: { '!': $nin_select_organizations } } : { organization_id: req.param('organization') },
        adminRpcode = req.param('adminRpcode').toUpperCase(),
        admin0pcode = req.param('admin0pcode').toUpperCase(),
        start_date = req.param('start_date'),
        end_date = req.param('end_date');

    // switch on indicator
    switch( indicator ) {

      case 'organizations':

        // get a list of projects for side menu
        if ( list ) {

          // get organizations by project
          Project
            .find()
            .where( { adminRpcode: adminRpcode } )
            .where( { admin0pcode: admin0pcode } )
            .where( { project_start_date: { '<=': new Date( end_date ) } } )
            .where( { project_end_date: { '>=': new Date( start_date ) } } )
            .where( { organization: { '!': $nin_organizations } } )
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
              .where( { adminRpcode: adminRpcode } )
              .where( { admin0pcode: admin0pcode } )
              .where( organization_filter )
              .where( { project_start_date: { '<=': new Date( end_date ) } } )
              .where( { project_end_date: { '>=': new Date( start_date ) } } )
              // .where( { organization: { '!': $nin_organizations } } )
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
          .where( { report_active: true } )
          .where( { adminRpcode: adminRpcode } )
          .where( { admin0pcode: admin0pcode } )
          .where( organization_filter )
          .where( { report_month: { '>=': moment( start_date ).month(), '<=': moment( end_date ).month() } } )
          .where( { report_year: { '>=': moment( start_date ).year(), '<=': moment( end_date ).year() } } )
          // .where( { organization: { '!': $nin_organizations } } )
          .sort('updatedAt DESC')
          .exec( function( err, reports ){

            // return error
            if (err) return res.negotiate( err );

            // return
            if ( list ) {

              // counter
              var counter=0,
                  length=reports.length;

              // reports
              reports.forEach( function( d, i ){

                // check if form has been edited
                Beneficiaries
                  .count( { report_id: d.id } )
                  .exec(function( err, b){
                    
                    // return error
                    if (err) return res.negotiate( err );

                    // add status
                    reports[i].status = '#e57373';

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
          .where( { report_active: true } )
          .where( { report_status: 'complete' } )
          .where( { adminRpcode: adminRpcode } )
          .where( { admin0pcode: admin0pcode } )
          .where( organization_filter )
          .where( { report_month: { '>=': moment( start_date ).month(), '<=': moment( end_date ).month() } } )
          .where( { report_year: { '>=': moment( start_date ).year(), '<=': moment( end_date ).year() } } )
          // .where( { organization: { '!': $nin_organizations } } )
          .sort('updatedAt DESC')
          .exec( function( err, reports ){

            // return error
            if (err) return res.negotiate( err );

            // return
            if ( list ) {
              
              // reports
              reports.forEach( function( d, i ){
                // add status
                reports[i].status = '#4db6ac'

              });

              // table
              return res.json( 200, reports );              

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
          .where( { report_active: true } )
          .where( { report_status: 'todo' } )
          .where( { adminRpcode: adminRpcode } )
          .where( { admin0pcode: admin0pcode } )
          .where( organization_filter )
          .where( { report_month: { '>=': moment( start_date ).month(), '<=': moment( end_date ).month() } } )
          .where( { report_year: { '>=': moment( start_date ).year(), '<=': moment( end_date ).year() } } )
          // .where( { organization: { '!': $nin_organizations } } )
          .sort('updatedAt DESC')
          .exec( function( err, reports ){

            // return error
            if (err) return res.negotiate( err );

            // return
            if ( list ) {

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

    }

  }

};

module.exports = AdminDashboardController;
