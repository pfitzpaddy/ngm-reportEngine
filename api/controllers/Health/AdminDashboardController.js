/**
 * AdminDashboardController
 *
 * @description :: Health Cluster Dashboard
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// admin controller
var AdminDashboardController = {

  //
  getHealthAdminIndicator: function( req, res ){

    // request input
    if ( !req.param('indicator') || !req.param('adminRpcode')  || !req.param('admin0pcode') || !req.param('start_date') || !req.param('end_date') ) {
      return res.json( 401, { err: 'indicator, adminRpcode, admin0pcode, start_date, end_date required!' });
    }

    // variables
    var moment = require( 'moment' ),
        table = req.param('table'),
        indicator = req.param('indicator'),
        adminRpcode = req.param('adminRpcode').toUpperCase(),
        admin0pcode = req.param('admin0pcode').toUpperCase(),
        start_date = req.param('start_date'),
        end_date = req.param('end_date');

    // switch on indicator
    switch( indicator ) {

      case 'reports_total':
        
        // reports total
        Report
          .find()
          .where( { report_active: true } )
          .where( { adminRpcode: adminRpcode } )
          .where( { admin0pcode: admin0pcode } )
          .where( { report_month: { '>=': moment( start_date ).month(), '<=': moment( end_date ).month() } } )
          .where( { report_year: { '>=': moment( start_date ).year(), '<=': moment( end_date ).year() } } )
          .sort('updatedAt DESC')
          .exec( function( err, reports ){

            // return error
            if (err) return res.negotiate( err );            

            // return
            if ( table ) {

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
          .where( { report_month: { '>=': moment( start_date ).month(), '<=': moment( end_date ).month() } } )
          .where( { report_year: { '>=': moment( start_date ).year(), '<=': moment( end_date ).year() } } )
          .sort('updatedAt DESC')
          .exec( function( err, reports ){

            // return error
            if (err) return res.negotiate( err );

            // return
            if ( table ) {
              
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
          .where( { report_month: { '>=': moment( start_date ).month(), '<=': moment( end_date ).month() } } )
          .where( { report_year: { '>=': moment( start_date ).year(), '<=': moment( end_date ).year() } } )
          .sort('updatedAt DESC')
          .exec( function( err, reports ){

            // return error
            if (err) return res.negotiate( err );

            // return
            if ( table ) {

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
