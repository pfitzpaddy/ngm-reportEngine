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

    // libs
    var _under = require('underscore'),
        moment = require('moment');

    // only run if date is above monthly reporting period
    // if ( moment().date() === 1 ) {
  
      // find active projects
      Project
        .find()
        .where( { project_status: 'active'} )
        .where( { project_end_date: { $gte: moment().subtract( 1, 'M' ).startOf( 'M' ).format( 'YYYY-MM-DD' ) } } )
        .exec( function( err, projects ){

          // return error
          if ( err ) return res.negotiate( err );

          // counter
          var counter = 0;
              length = projects.length;     

          // for each project
          projects.forEach( function( project, i ){

            // create report
            var r = {
              project_id: projects[i].id,
              report_status: 'todo',
              report_active: true,
              report_month: moment().subtract( 1, 'M' ).month(),
              report_year: moment().subtract( 1, 'M' ).year(),
              reporting_period: moment().subtract( 1, 'M' ).set( 'date', 1 ).format(),
              reporting_due_date: moment().set( 'date', 15 ).format()
            };

            // clone project
            var p = _under.clone( projects[i] );
                    delete p.id;

            // create report
            var newReport = _under.extend( {}, r, p );

            // create reports
            Report
              .findOrCreate( { 
                  project_id: newReport.project_id, 
                  report_month: newReport.report_month, 
                  report_year: newReport.report_year
                }, newReport )
              .exec( function( err, report ) {

                // return error
                if ( err ) return res.negotiate( err );

                // get target_locations
                TargetLocation
                  .find()
                  .where( { project_id: r.project_id } )
                  .exec( function( err, target_locations ){

                    // return error
                    if ( err ) return res.negotiate( err );

                    // create report locations
                    Location
                      .createNewReportLocations( report, target_locations, function( err, locations ){

                        // return error
                        if ( err ) return res.negotiate( err );

                        // counter
                        counter++;
                        if ( counter === length ) {
                          return res.json( 200, { msg: 'success' } );
                        }

                    });

                });
            });

          });

      });

    // } else {
    //   // return reports
    //   return res.json( 200, { msg: 'Reporting not open for ' + moment().format('MMM') + '!' } );
    // }

  },

  // send notification for new reporting period
    // run this on return of above method on 1st day of the month
  setReportsOpen: function( req, res ) {

    // active projects ids
    var moment = require('moment'),
        nStore = {},
        notifications =[];


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
            if ( !nStore[ report.email ] ) {

              // add for notification email template
              nStore[ report.email ] = {
                email: report.email,
                username: report.username,
                report_month: moment().subtract( 1, 'M' ).format( 'MMMM' ),
                reports: []
              };
            }

            // add report urls
            nStore[ report.email ].reports.push({
              cluster: report.cluster,
              username: report.username,
              project_title: report.project_title,
              report_url: req.protocol + '://' + req.host + '/desk/#/cluster/projects/report/' + report.project_id + '/' + report.id
            });

          });

          // each user, send only one email!
          for ( var user in nStore ) {

            // order
            nStore[ user ].reports.sort(function(a, b) {
              return a.cluster.localeCompare(b.cluster) || 
                      a.project_title.localeCompare(b.project_title);
            });

            notifications.push( nStore[ user ] );

          }

          // counter
          var counter = 0,
              length = notifications.length;

          // for each
          notifications.forEach( function( notification, i ){
            
            // get name
            User
              .findOne()
              .where({ email: notifications[i].email })
              .exec( function( err, result ){

                // return error
                if ( err ) return res.negotiate( err );

                // really have no idea whats
                if( !result ) {
                  result = {
                    name: notifications[i].username
                  }
                }

                // send email
                sails.hooks.email.send( 'notification-open', {
                    type: 'Project',
                    name: result.name,
                    email: notifications[i].email,
                    report_month: notifications[i].report_month.toUpperCase(),
                    reports: notifications[i].reports,
                    sendername: 'ReportHub'
                  }, {
                    to: notifications[i].email,
                    subject: 'ReportHub - Project Reporting Period for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ).toUpperCase() + ' Now Open!'
                  }, function(err) {
                    
                    // return error
                    if (err) return res.negotiate( err );

                    // add to counter
                    counter++;
                    if ( counter === length ) {
                      
                      // email sent
                      return res.json(200, { 'data': 'success' });
                    }

                  });

              });

          });

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
        nStore = {},
        notifications =[];

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
            if ( !nStore[ report.email ] ) {

              // add for notification email template
              nStore[ report.email ] = {
                email: report.email,
                username: report.username,
                report_month: moment().subtract( 1, 'M' ).format( 'MMMM' ),
                reporting_due_date: moment( report.reporting_due_date ).format( 'DD MMMM, YYYY' ),
                reports: []
              };
            }

            // add report urls
            nStore[ report.email ].reports.push({
              cluster: report.cluster,
              username: report.username,
              project_title: report.project_title,
              report_value: report.report_month,
              report_month: moment( report.reporting_period ).format( 'MMMM' ),
              report_url: req.protocol + '://' + req.host + '/desk/#/cluster/projects/report/' + report.project_id + '/' + report.id
            });

          });

          // each user, send only one email!
          for ( var user in nStore ) {

            // order
            nStore[ user ].reports.sort(function(a, b) {
              return a.cluster.localeCompare(b.cluster) || 
                      a.project_title.localeCompare(b.project_title) || 
                      a.report_value - b.report_value;
            });
            // push
            notifications.push( nStore[ user ] );

          }

          // counter
          var counter = 0,
              length = notifications.length;

          // for each
          notifications.forEach( function( notification, i ){

            User
              .findOne()
              .where({ email: notifications[i].email })
              .exec( function( err, result ){

                // return error
                if ( err ) return res.negotiate( err );

                // really have no idea whats
                if( !result ) {
                  result = {
                    name: notifications[i].username
                  }
                }

                // send email
                sails.hooks.email.send( 'notification-due', {
                    type: 'Project',
                    name: result.name,
                    email: notifications[i].email,
                    report_month: notifications[i].report_month.toUpperCase(),
                    reporting_due_date: notifications[i].reporting_due_date,
                    reports: notifications[i].reports,
                    sendername: 'ReportHub'
                  }, {
                    to: notifications[i].email,
                    subject: 'ReportHub - Project Reporting Period for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ).toUpperCase() + ' is Due Soon!'
                  }, function(err) {
                    
                    // return error
                    if (err) return res.negotiate( err );

                    // add to counter
                    counter++;
                    if ( counter === length ) {
                      
                      // email sent
                      return res.json( 200, { 'data': 'success' });
                    }

                  });

            });

          });

        });

      } else {

        // return reports
        return res.json( 200, { msg: 'No reports pending for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ) + '!' } );
      }

  }

};

