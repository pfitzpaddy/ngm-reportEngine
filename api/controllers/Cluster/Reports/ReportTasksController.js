/**
 * ReportController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */



module.exports = {

  // updates reports required for completion
    // run this 1st day of the month
  setReportsToDo: function( req, res ) {

    // active projects ids
    var moment = require('moment'),
        project_ids = [];

    // only run if date is above monthly reporting period
    if ( moment().date() === 1 ) {
  
      // find active projects
      Project
        .find()
        .where( { project_status: 'active' } )
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
            .update( { project_id: project_ids, report_month: moment().subtract( 1, 'M' ).month(), report_year: moment().subtract( 1, 'M' ).year() },
                     { report_active: true, report_status: 'todo' } )
            .exec( function( err, reports ){

              // return error
              if ( err ) return res.negotiate( err );               

              // return reports
              return res.json( 200, { msg: 'success' } );

          });

      });

    } else {

      // return reports
      return res.json( 200, { msg: 'Reporting not open for ' + moment().format('MMM') + '!' } );
    }

  },

  // send notification for new reporting period
    // run this on return of above method on 1st day of the month
  setReportsOpen: function( req, res ) {

    // active projects ids
    var moment = require('moment'),
        notification = {},
        counter = 0;

    // only run if date is above monthly reporting period
    if ( moment().date() === 1 ) {

      // find active reports for the next reporting period
      Report
        .find()
        .where( { report_month: moment().subtract( 1, 'M' ).month() } )
        .where( { report_year: moment().subtract( 1, 'M' ).year() } )
        .where( { report_active: true } )
        .where( { report_status: 'todo' } )
        .exec( function( err, reports ){

          // return error
          if ( err ) return res.negotiate( err );

          // no reports return
          if ( !reports.length ) return res.json( 200, { msg: 'No reports pending for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ) + '!' } );

          // for each report, group by username
          reports.forEach( function( report, i ) {

            // if username dosnt exist
            if ( !notification[ report.email ] ) {

              // add for notification email template
              notification[ report.email ] = {
                email: report.email,
                report_month: moment().subtract( 1, 'M' ).format( 'MMMM' ),
                reports: []
              };
            }

            // add report urls
            notification[ report.email ].reports.push({
              cluster: report.cluster,
              username: report.username,
              project_title: report.project_title,
              report_url: req.protocol + '://' + req.host + '/desk/#/cluster/projects/report/' + report.project_id + '/' + report.id
            });

          });

          // each user, send only one email!
          for ( var user in notification ) {

            // order
            notification[ user ].reports.sort(function(a, b) {
              return a.cluster.localeCompare(b.cluster) || 
                      a.project_title.localeCompare(b.project_title);
            });

            User
              .findOne()
              .where({ email: notification[ user ].email })
              .exec( function( err, result ){

                // return error
                if ( err ) return res.negotiate( err );

                // send email
                sails.hooks.email.send( 'notification-open', {
                    type: 'Project',
                    name: result.name,
                    email: notification[ user ].email,
                    report_month: notification[ user ].report_month.toUpperCase(),
                    reports: notification[ user ].reports,
                    sendername: 'ReportHub'
                  }, {
                    to: notification[ user ].email,
                    subject: 'ReportHub - Project Reporting Period for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ).toUpperCase() + ' Now Open!'
                  }, function(err) {
                    
                    // return error
                    if (err) return res.negotiate( err );

                    // add to counter
                    counter++;

                    // return 
                    if ( counter === Object.keys( notification ).length ) {
                      
                      // email sent
                      return res.json(200, { 'data': 'success' });
                    }

                  });

              });

          }

      });

    } else {

      // return reports
      return res.json( 200, { msg: 'Reporting not open for ' + moment().format( 'MMMM' ) + '!' } );
    }

  },

  // sends reminder for active reports not yet submitted
  setReportsReminder: function( req, res ) {

    // active projects ids
    var moment = require('moment'),
        notification = {},
        counter = 0;

    // only run if date is 1 week before monthly reporting period required
    if ( moment().date() >= 10 ) {

      // find active reports for the next reporting period
      Report
        .find()
        .where( { report_month: { '<=': moment().subtract( 1, 'M' ).month() } } )
        .where( { report_active: true } )
        .where( { report_status: 'todo' } )
        .exec( function( err, reports ){

          // return error
          if ( err ) return res.negotiate( err );

          // no reports return
          if ( !reports.length ) return res.json( 200, { msg: 'No reports pending for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ) + '!' } );


          // for each report, group by username
          reports.forEach( function( report, i ) {

            // if username dosnt exist
            if ( !notification[ report.email ] ) {

              // add for notification email template
              notification[ report.email ] = {
                email: report.email,
                report_month: moment().subtract( 1, 'M' ).format( 'MMMM' ),
                reporting_due_date: moment( report.reporting_due_date ).format( 'DD MMMM, YYYY' ),
                reports: []
              };
            }

            // add report urls
            notification[ report.email ].reports.push({
              cluster: report.cluster,
              username: report.username,
              project_title: report.project_title,
              report_value: report.report_month,
              report_month: moment( report.reporting_period ).format( 'MMMM' ),
              report_url: req.protocol + '://' + req.host + '/desk/#/cluster/projects/report/' + report.project_id + '/' + report.id
            });

          });

          // each user, send only one email!
          for ( var user in notification ) {

            // order
            notification[ user ].reports.sort(function(a, b) {
              return a.cluster.localeCompare(b.cluster) || 
                      a.project_title.localeCompare(b.project_title) || 
                      a.report_value - b.report_value;
            });

            User
              .findOne()
              .where({ email: notification[ user ].email })
              .exec( function( err, result ){

                // return error
                if ( err ) return res.negotiate( err );

                // send email
                sails.hooks.email.send( 'notification-due', {
                    type: 'Project',
                    name: result.name,
                    email: notification[ user ].email,
                    report_month: notification[ user ].report_month.toUpperCase(),
                    reporting_due_date: notification[ user ].reporting_due_date,
                    reports: notification[ user ].reports,
                    sendername: 'ReportHub'
                  }, {
                    to: notification[ user ].email,
                    subject: 'ReportHub - Project Reporting Period for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ).toUpperCase() + ' is Due Soon!'
                  }, function(err) {
                    
                    // return error
                    if (err) return res.negotiate( err );

                    // add to counter
                    counter++;
                    
                    // return 
                    if ( counter === Object.keys( notification ).length ) {
                      
                      // email sent
                      return res.json( 200, { 'data': 'success' });
                    }

                  });

            });

          }

        });

      } else {

        // return reports
        return res.json( 200, { msg: 'No reports pending for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ) + '!' } );
      }

  }

};

