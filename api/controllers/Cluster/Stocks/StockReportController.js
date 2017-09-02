/**
 * ReportController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// set moment
var moment = require('moment');

module.exports = {

  // get all reports
  getReportsList: function( req, res ) {

    // request input
    if ( !req.param( 'filter' ) ) {
      return res.json( 401, { err: 'filter required!' });
    }
    
    // get by organization_id & status
    StockReport
      .find( req.param( 'filter' ) )
      .sort( 'report_month ASC' )
      .exec ( function( err, reports ){
      
        // return error
        if ( err ) return res.negotiate( err );

        // counter
        var counter=0,
            length=reports.length;

        // no reports
        if ( !length ) {
          return res.json( 200, reports );
        }

        // determine status
        if ( length )  {
    
          // reports
          reports.forEach( function( d, i ){

            // check if form has been edited
            Stock
              .count( { report_id: d.id } )
              .exec(function( err, b ){
                
                // return error
                if (err) return res.negotiate( err );

                // add status as green
                reports[i].status = '#4db6ac';

                // if report is 'todo' and past due date!
                if ( reports[i].report_status === 'todo' && moment().isAfter( moment( reports[i].reporting_due_date ) ) ) {
                        
                  // set to red (overdue!)
                  reports[i].status = '#e57373'

                  // if beneficiaries ( report has been updated )
                  if ( b ) {
                    reports[i].status = '#fff176'
                  }
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

      });

  },

  // get all Reports
  getReportById: function( req, res ) {

    // request input
    if ( !req.param( 'id' ) ) {
      return res.json(401, { err: 'id required!' });
    }

    // report for UI
    var $report = {};    
    
    // get report by organization_id
    StockReport
      .findOne( { id: req.param( 'id' ) } )
      .exec( function( err, report ){
      
        // return error
        if (err) return res.negotiate( err );
        
        // clone to update
        $report = report.toObject();

        // get report by organization_id
        StockLocation
          .find( { report_id: $report.id } )
          // .populate('stock')
          .populateAll()
          .exec( function( err, locations ){

          // return error
          if (err) return res.negotiate( err );

          // add locations ( associations included )
          $report.stocklocations = locations;

          // return report
          return res.json( 200, $report );

        });

      });  

  },

  // set report details by report id
  setReportById: function( req, res ) {

    // request input
    if ( !req.param( 'report' ) ) {
      return res.json(401, { err: 'report required!' });
    }
    
    // get report
    var $report = req.param( 'report' );

    // update report
    StockReport
      .update( { id: $report.id }, $report )
      .exec( function( err, report ){

        // return error
        if ( err ) return res.negotiate( err );    

        // return Report
        return res.json( 200, report[0] );

      });

  },

  // removes reports with stock_warehouse_id
  removeReportLocation: function( req, res ) {
    
    // request input
    if ( !req.param( 'stock_warehouse_id' ) ) {
      return res.json(401, { err: 'stock_warehouse_id required!' });
    }

    // stock_warehouse_id
    var stock_warehouse_id = req.param( 'stock_warehouse_id' );

    // update report
    StockLocation
      .update( { stock_warehouse_id: stock_warehouse_id }, { report_id: null } )
      .exec( function( err, stocklocations ){

        // return error
        if ( err ) return res.negotiate( err );    

        // return Report
        return res.json( 200, stocklocations );

      });

  }

};

