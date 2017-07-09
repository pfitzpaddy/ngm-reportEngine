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

  },

  // opens reports
    // run this 1st day of the month
  setReportsToDo: function( req, res ) {

    // only run if date is above monthly reporting period
    if ( moment().date() === 1 ) {

      // Perform update on all stock reports
      Organization
        .find()
        .populate('warehouses')
        .exec(function(err, organizations){

          // return error
          if ( err ) return res.negotiate( err );

          var counter=0,
              length=organizations.length;

          // organization
          organizations.forEach(function(organization,i){
            if(organization.warehouses.length) {
              var warehouse = organization.warehouses[organization.warehouses.length-1];
              delete warehouse.id

              // create/delete - to run open/todo function on reports
              StockWarehouse
                .create( warehouse )
                .exec( function( err, warehouse_created ) {

                  // return error
                  if ( err ) return res.negotiate( err );

                  StockWarehouse
                    .destroy( { id: warehouse_created.id } )
                    .exec( function( err, warehouse_deleted ) {
                      
                      // return error
                      if ( err ) return res.negotiate( err );

                      // remove stocklocations of warehouse
                      StockLocation
                        .destroy( { stock_warehouse_id: warehouse_created.id } )
                        .exec( function( err, stocklocation_deleted ) {
                          
                          // return error
                          if ( err ) return res.negotiate( err );

                          counter++
                          if(counter===length){
                            return res.json( 200, { msg: 'success' } );
                          }
                        });
                    });

                });

            } else {
              counter++
              if(counter===length){
                return res.json( 200, { msg: 'success' } );
              }
            }
          });

        });

    } else {

      // return reports
      return res.json( 200, { msg: 'Reporting not open for ' + moment().format('MMM') + '!' } );
    }

  },

  // send notification for new reporting period
    // run this on return of above method on 11 day of the month
  setReportsOpen: function( req, res ) {

    // only run if date is above monthly reporting period
    if ( moment().date() === 1 ) {

      // find active reports for the next reporting period
      StockReport
        .update( { report_month: moment().subtract( 1, 'M' ).month(), 
                    report_year: moment().subtract( 1, 'M' ).year() },
                { report_active: true, report_status: 'todo' } )
        .exec( function( err, reports ){

          // return error
          if ( err ) return res.negotiate( err ); 

          // return
          return res.json(200, { 'data': 'success' });

          // track 
          // var counter=0,
          //     length=reports.length;

          // each report (only one stock report per org)
          // reports.forEach(function(report,i){

          //   // send email
          //   sails.hooks.email.send( 'notification-open', {
          //       type: 'Stock',
          //       username: report.username,
          //       email: report.email,
          //       report_month:  moment().subtract( 1, 'M' ).format( 'MMMM' ).toUpperCase(),
          //       reports: [{
          //         project_title: report.organization,
          //         report_url: req.protocol + '://' + req.host + '/desk/#/cluster/stocks/report/' + report.organization_id + '/' + report.id
          //       }],
          //       sendername: 'ReportHub'
          //     }, {
          //       to: report.email,
          //       subject: 'ReportHub - Stock Reporting Period for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ).toUpperCase() + ' Now Open!'
          //     }, function(err) {
                
          //       // return error
          //       if (err) return res.negotiate( err );

          //       // add to counter
          //       counter++;
          //       // return 
          //       if ( counter === length ) {
          //         // email sent
          //         return res.json(200, { 'data': 'success' });
          //       }

          //     });

          // });

      });   

    } else {

      // return reports
      return res.json( 200, { msg: 'Reporting not open for ' + moment().format( 'MMMM' ) + '!' } );
    }

  },

  // sends reminder for active reports not yet submitted
  setReportsReminder: function( req, res ) {

    // 
    var reportToDoList = {}

    // only run if date is above monthly reporting period
    if ( moment().date() >= 10 ) {

      // find active reports for the next reporting period
      StockReport
        .find( { report_month: { '<=': moment().subtract( 1, 'M' ).month() }, 
                    report_year: moment().subtract( 1, 'M' ).year(),
                    report_active: true, 
                    report_status: 'todo' } )
        .exec( function( err, reports ){

          // return error
          if ( err ) return res.negotiate( err );

          // track 
          var counter=0,
              length=reports.length;

          // gather outstanding stock reports
          reports.forEach(function(report,i){
            if(!reportToDoList[report.organization]){
              reportToDoList[report.organization] = [];
            }
            // push
            reportToDoList[report.organization].push({
              project_title: report.organization,
              report_month: moment().month( report.report_month ).format( 'MMMM' ),
              report_url: req.protocol + '://' + req.host + '/desk/#/cluster/stocks/report/' + report.organization_id + '/' + report.id
            })
          });


          // each report (only one stock report per org)
          reports.forEach(function(report,i){

            // send email
            sails.hooks.email.send( 'notification-due', {
                type: 'Stock',
                username: report.username,
                email: report.email,
                report_month:  moment().subtract( 1, 'M' ).format( 'MMMM' ).toUpperCase(),
                reporting_due_date: moment( report.reporting_due_date ).format( 'DD MMMM, YYYY' ),
                reports: reportToDoList[report.organization],
                sendername: 'ReportHub'
              }, {
                to: report.email,
                subject: 'ReportHub - Stock Reporting Period for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ).toUpperCase() + ' Now Open!'
              }, function(err) {
                
                // return error
                if (err) return res.negotiate( err );

                // add to counter
                counter++;
                // return 
                if ( counter === length ) {
                  // email sent
                  return res.json(200, { 'data': 'success' });
                }

              });            

          });

      });

    } else {

      // return reports
      return res.json( 200, { msg: 'Reporting not open for ' + moment().format( 'MMMM' ) + '!' } );
    }
  }

};

