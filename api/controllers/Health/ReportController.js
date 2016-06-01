/**
 * ReportController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // get all reports by project id
  getReportsList: function( req, res ) {

    // request input
    if ( !req.param( 'filter' ) ) {
      return res.json( 401, { err: 'filter required!' });
    }
    
    // get project by organization_id & status
    Report.find( req.param( 'filter' ) ).sort( 'report_month ASC' ).exec ( function( err, reports ){
      
      // return error
      if ( err ) return res.negotiate( err );

      // else
      return res.json( 200, reports );

    });

  },

  // get all Reports by project id
  getReportById: function( req, res ) {

    // request input
    if ( !req.param( 'id' ) ) {
      return res.json(401, { err: 'id required!' });
    }

    // report for UI
    var $report = {};    
    
    // get report by organization_id
    Report.findOne( { id: req.param( 'id' ) } ).exec( function( err, report ){
      
      // return error
      if (err) return res.negotiate( err );
      
      // clone project to update
      $report = report.toObject();

      // get report by organization_id
      Location.find( { report_id: $report.id } ).populateAll().exec( function( err, locations ){

        // return error
        if (err) return res.negotiate( err );

        // add locations ( associations included )
        $report.locations = locations;

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
    Report.update( { id: $report.id }, $report ).exec( function( err, report ){

      // return error
      if ( err ) return res.negotiate( err );    

      // return Report
      return res.json( 200, report[0] );

    });

  },

  // updates reports required for completion
    // run this 11 day of the month
  setReportsToDo: function( req, res ) {

    // active projects ids
    var moment = require('moment'),
        project_ids = [];

    // only run if date is above monthly reporting period
    // if ( moment().date() >= 15 ) {
  
      // find active projects
      Project.find( { project_status: 'active' } )
        .exec( function( err, projects ){

          // return error
          if ( err ) return res.negotiate( err );            

          // for each project
          projects.forEach( function( project, i ){

            // get project_id
            project_ids.push( project.id );

          });

          // find active reports for the next reporting period
          Report
            .update( { project_id: project_ids, report_month: moment().add( 1, 'M' ).month() },
                     { report_active: true, report_status: 'todo' } )
            .exec( function( err, reports ){

              // return error
              if ( err ) return res.negotiate( err );               

              // return reports
              return res.json( 200, { msg: 'success' } );

          });

      });

    // } else {

      // return reports
      // return res.json( 200, { msg: 'Reporting not open for ' + moment().format('MMM') + '!' } );
    // }

  },

  // send notification for new reporting period
    // run this on return of above method on 11 day of the month
  setReportsOpen: function( req, res ) {

    // active projects ids
    var moment = require('moment'),
        project_ids = [],
        notification = {},
        counter = 0;

    // only run if date is above monthly reporting period
    // if ( moment().date() >= 15 ) {
      
      // find active projects
      Project.find( { project_status: 'active' } )
        .exec( function( err, projects ){

          // return error
          if ( err ) return res.negotiate( err );

          // for each project
          projects.forEach( function( project, i ) {

            // get project_id
            project_ids.push( project.id );

          });

          // find active reports for the next reporting period
            // chaining reads easier!
          Report
            .find()
            .where({ project_id: project_ids })
            // .where({ report_month: moment().add( 1, 'M' ).month() })
            .where({ report_month: moment().subtract( 1, 'M' ).month() })
            .where({ report_active: true })
            .where({ report_status: 'todo' })
            .exec( function( err, reports ){

              // return error
              if ( err ) return res.negotiate( err );

              // no reports return
              if ( !reports.length ) return res.json( 200, { msg: 'No reports pending for ' + moment().format( 'MMMM' ) + '!' } );              

              // for each report, group by username
              reports.forEach( function( report, i ) {

                // if username dosnt exist
                if ( !notification[ report.username ] ) {

                  // add for notification email template
                  notification[ report.username ] = {
                    username: report.username,
                    email: report.email,
                    // report_month: moment().add( 1, 'M' ).format( 'MMMM' ),
                    report_month: moment().subtract( 1, 'M' ).format( 'MMMM' ),
                    reports: []
                  };
                }

                // add report urls
                notification[ report.username ].reports.push({
                  project_title: report.project_title,
                  report_url: req.protocol + '://' + req.host + '/#/health/projects/report/' + report.project_id + '/' + report.id
                });

              });

              // each user, send only one email!
              for ( var user in notification ) {

                // add to counter
                counter++;

                // send email
                sails.hooks.email.send( 'notification-open', {
                    username: notification[ user ].username,
                    email: notification[ user ].email,
                    report_month: notification[ user ].report_month,
                    reports: notification[ user ].reports,
                    sendername: 'ReportHub'
                  }, {
                    to: notification[ user ].email,
                    // subject: 'ReportHub - Reporting Period for ' + moment().add( 1, 'M' ).format( 'MMMM' ) + ' Now Open!'
                    subject: 'ReportHub - Reporting Period for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ) + ' Now Open!'
                  }, function(err) {
                    
                    // return error
                    if (err) return res.negotiate( err );

                    // return 
                    if ( counter === Object.keys( notification ).length ) {
                      
                      // email sent
                      return res.json(200, { 'data': 'success' });
                    }

                  });

              }

          });

      });

    // } else {

    //   // return reports
    //   return res.json( 200, { msg: 'Reporting not open for ' + moment().format( 'MMMM' ) + '!' } );
    // }

  },

  // sends reminder for active reports not yet submitted
  setReportsReminder: function( req, res ) {

    // active projects ids
    var moment = require('moment'),
        project_ids = [],
        notification = {},
        counter = 0;

    // only run if date is 1 week before monthly reporting period required
    if ( moment().date() >= 10 ) {
      
      // find active projects
      Project.find( { project_status: 'active' } )
        .exec( function( err, projects ){

          // return error
          if ( err ) return res.negotiate( err );

          // for each project
          projects.forEach( function( project, i ) {

            // get project_id
            project_ids.push( project.id );

          });

          // find active reports for the next reporting period
            // chaining reads easier!
          Report
            .find()
            .where({ project_id: project_ids })
            .where({ report_month: { '<=': moment().subtract( 1, 'M' ).month() } })
            .where({ report_active: true })
            .where({ report_status: 'todo' })
            .exec( function( err, reports ){

              // return error
              if ( err ) return res.negotiate( err );

              // no reports return
              if ( !reports.length ) return res.json( 200, { msg: 'No reports pending for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ) + '!' } );

              // for each report, group by username
              reports.forEach( function( report, i ) {

                // if username dosnt exist
                if ( !notification[ report.username ] ) {

                  // add for notification email template
                  notification[ report.username ] = {
                    username: report.username,
                    email: report.email,
                    report_month: moment().subtract( 1, 'M' ).format( 'MMMM' ),
                    reporting_due_date: moment( report.reporting_due_date ).format( 'DD MMMM, YYYY' ),
                    reports: []
                  };
                }

                // add report urls
                notification[ report.username ].reports.push({
                  project_title: report.project_title,
                  report_month: moment().month( report.report_month ).format( 'MMMM' ),
                  report_url: req.protocol + '://' + req.host + '/#/health/projects/report/' + report.project_id + '/' + report.id
                });

              });

              // each user, send only one email!
              for ( var user in notification ) {

                // add to counter
                counter++;

                // send email
                sails.hooks.email.send( 'notification-due', {
                    username: notification[ user ].username,
                    email: notification[ user ].email,
                    report_month: notification[ user ].report_month,
                    reporting_due_date: notification[ user ].reporting_due_date,
                    reports: notification[ user ].reports,
                    sendername: 'ReportHub'
                  }, {
                    to: notification[ user ].email,
                    subject: 'ReportHub - Reporting Period for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ) + ' is Due Soon!'
                  }, function(err) {
                    
                    // return error
                    if (err) return res.negotiate( err );

                    // return 
                    if ( counter === Object.keys( notification ).length ) {
                      
                      // email sent
                      return res.json( 200, { 'data': 'success' });
                    }

                  });

              }

            });

          });

      } else {

        // return reports
        return res.json( 200, { msg: 'No reports pending for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ) + '!' } );
      }

  }

};

