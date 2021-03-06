/**
 * ReportController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// libs
var _under = require('underscore');
var moment = require('moment');
var async = require('async');

var REPORTING_DUE_DATE_NOTIFICATIONS_CONFIG = sails.config.REPORTING_DUE_DATE_NOTIFICATIONS_CONFIG;

// ReportTasksController
var ReportTasksController = {

  // TASKs

  // return locations for reports
  getProjectReportLocations: function( reports, target_locations, cb ){

    // report locations
    var locations = [];

    // async loop target_beneficiaries
    async.each( reports, function ( report, next ) {

      // clone report
      var r = JSON.parse( JSON.stringify( report ) );

      // prepare report for cloning
      r.report_id = r.id.valueOf();
      delete r.id;

      // async loop target_beneficiaries
      async.each( target_locations, function ( target_location, tl_next ) {

        // prepare report for cloning
        var l = JSON.parse( JSON.stringify( target_location ) );
        l.target_location_reference_id = l.id.valueOf();
        delete l.id;

        // push to locations
        locations.push( _under.extend( {}, r, l ) );

        // tl next
        tl_next();

      }, function ( err ) {
        if ( err ) return cb( err, false );
        next();
      });

    }, function ( err ) {
      if ( err ) return cb( err, false );
      return cb( false, locations );
    });

  },

  // return locations for warehouses
  getStockReportLocations: function( reports, target_locations, cb ){

    // report locations
    var locations = [];

    // async loop target_beneficiaries
    async.each( reports, function ( report, next ) {

      // clone report
      var r = JSON.parse( JSON.stringify( report ) );

      // prepare report for cloning
      r.report_id = r.id.valueOf();
      delete r.id;
      delete r.createdAt;
      delete r.updatedAt;

      // async loop target_beneficiaries
      async.each( target_locations, function ( target_location, tl_next ) {

        // prepare report for cloning
        var l = JSON.parse( JSON.stringify( target_location ) );
        l.stock_warehouse_id = l.id.valueOf()
        delete l.id;
        delete l.createdAt;
        delete l.updatedAt;

        // push to locations
        locations.push( _under.extend( {}, r, l ) );

        // tl next
        tl_next();

      }, function ( err ) {
        if ( err ) return cb( err, false );
        next();
      });

    }, function ( err ) {
      if ( err ) return cb( err, false );
      return cb( false, locations );
    });

  },
  // APIs

  // updates reports required for completion
  // run this 1st day of the month
  setReportsToDo: function( req, res ) {

    // find active projects
    Project
      .find()
      .where( { project_start_date: { $lte: moment().endOf( 'M' ).format( 'YYYY-MM-DD' ) } } )
      .where( { project_end_date: { $gte: moment().startOf( 'M' ).format( 'YYYY-MM-DD' ) } } )
      .exec( function( err, projects ){

        // err
        if ( err ) return err;


        // ASYNC REQUEST 1
        // async loop target_beneficiaries
        async.each( projects, function ( project, next ) {

          var findProject = { project_id: project.id }

          const admin0pcode = project.admin0pcode;

          let config = REPORTING_DUE_DATE_NOTIFICATIONS_CONFIG.find(obj => obj.admin0pcode === admin0pcode);
          if (!config) config = REPORTING_DUE_DATE_NOTIFICATIONS_CONFIG.find(obj => obj.admin0pcode === "ALL");

          // create report
          var r = {
            project_id: project.id,
            report_status: 'todo',
            report_active: true,
            report_month: moment().month(),
            report_year: moment().year(),
            reporting_period: moment().set( 'date', 1 ).format(),
            reporting_due_date: moment().add( 1, 'M' ).set( 'date', config.reporting_due_date ).format()
          };

          // clone project
          var p = JSON.parse( JSON.stringify( project ) );
                  delete p.id;

          // create report
          var new_report = _under.extend( {}, p, r );
          delete new_report.createdAt;
          delete new_report.updatedAt;

          // find reports
          Report.findOne( { project_id: new_report.project_id, report_month: new_report.report_month, report_year: new_report.report_year } ).then( function ( report ){

            // set
            if( !report ) { report = { id: null } }
            if ( report ) { new_report.report_status = report.report_status; new_report.report_active = report.report_active, new_report.updatedAt = report.updatedAt }

            // create reports
            Report.updateOrCreate( findProject, { id: report.id }, new_report ).exec(function( err, report_result ){

              // err
              if ( err ) return err;

              // make array ( sails returns object on create, array on update )
              if ( !report.id ) {
                report_result = [ report_result ];
              }

              // get target_locations
              TargetLocation
                .find()
                .where( findProject )
                .exec( function( err, target_locations ){

                  // err
                  if ( err ) return err;

                  // generate locations for each report ( requires report_id )
                  ReportTasksController.getProjectReportLocations( report_result, target_locations, function( err, locations ){

                    // err
                    if ( err ) return err;

                    // ASYNC REQUEST 1.1
                    // async loop project_update locations
                    async.each( locations, function ( d, next ) {

                      // find
                      Location.findOne( { project_id: project.id, target_location_reference_id: d.target_location_reference_id, report_month: d.report_month, report_year: d.report_year } ).then( function ( location ){
                        if( !location ) { location = { id: null } }
                        // relations set in getProjectReportLocations
                        Location.updateOrCreate( findProject, { id: location.id }, d ).exec(function( err, location_result ){

                          // err
                          if ( err ) return err;

                          // no need to return locations
                          next();

                        });
                      });
                    }, function ( err ) {
                      if ( err ) return err;
                      next();
                    });

                  });

                });

            });
          });

        }, function ( err ) {
          if ( err ) return err;
          return res.json( 200, { msg: 'success' } );
        });

      });

  },

  setStocksToDo: function( req, res ) {

    let month = moment().month();
    let year = moment().year();
    let reporting_period =  moment().set( 'date', 1 ).format();
    let reporting_due_date =  moment().add( 1, 'M' ).set( 'date', 10 ).format();

    let queryOrganization = { organization_tag: { '!': null } };

    // request input
    if ( req.param( 'organization_id' ) && req.param( 'year' ) && req.param( 'month' )) {
      queryOrganization = { id: req.param( 'organization_id' ) }
      month = req.param( 'month' );
      year  = req.param( 'year' );
      reporting_period =  moment().set({'year': year, 'month': month}).set( 'date', 1 ).format();
      reporting_due_date =  moment().set({'year': year, 'month': month}).add( 1, 'M' ).set( 'date', 10 ).format();
    }
    // find active projects
    Organization
      .find( queryOrganization )
      .exec( function( err, organizations ){

        // err
        if ( err ) return res.negotiate( err );

        // ASYNC REQUEST 1
        // async loop target_beneficiaries
        async.each( organizations, function ( organization, next ) {

          var findOrganization = { organization_id: organization.id }

          // const admin0pcode = organization.admin0pcode;
          // let config = REPORTING_STOCK_DUE_DATE_NOTIFICATIONS_CONFIG.find(obj => obj.admin0pcode === admin0pcode);
          // if (!config) config = REPORTING_STOCK_DUE_DATE_NOTIFICATIONS_CONFIG.find(obj => obj.admin0pcode === "ALL");

          // create report
          var r = {
            report_status: 'todo',
            report_active: true,
            report_month: month,
            report_year: year,
            reporting_period,
            reporting_due_date,
            organization_id : organization.id
          };

          // clone project
          var o = JSON.parse( JSON.stringify( organization ) );
          delete o.id;

          // create report
          var new_report = _under.extend( {}, o, r );
          delete new_report.createdAt;
          delete new_report.updatedAt;

          StockWarehouse
                .find()
                .where( findOrganization )
                .exec( function( err, target_locations ){

                  // err
                  if ( err ) return res.negotiate( err );

                  // if warehouses exist
                  if (target_locations.length){
                      // find reports
                      StockReport.findOne( { organization_id: new_report.organization_id, report_month: new_report.report_month, report_year: new_report.report_year } ).then( function ( report ){

                        // set
                        if( !report ) { report = { id: null } }
                        if ( report ) { new_report.report_status = report.report_status; new_report.report_active = report.report_active, new_report.updatedAt = report.updatedAt }

                        // create reports
                        StockReport.updateOrCreate( findOrganization, { id: report.id }, new_report ).exec(function( err, report_result ){

                          // err
                          if ( err ) return res.negotiate( err );

                          // make array ( sails returns object on create, array on update )
                          if ( !report.id ) {
                            report_result = [ report_result ];
                          }

                          // generate locations for each report ( requires report_id )
                          ReportTasksController.getStockReportLocations( report_result, target_locations, function( err, locations ){

                            // err
                            if ( err ) return res.negotiate( err );

                            // ASYNC REQUEST 1.1
                            // async loop project_update locations
                            async.each( locations, function ( d, next ) {

                              // find
                              StockLocation.findOne( { organization_id: organization.id, stock_warehouse_id: d.stock_warehouse_id, report_month: d.report_month, report_year: d.report_year } ).then( function ( location ){
                                if( !location ) { location = { id: null } }
                                // relations set in getProjectReportLocations
                                StockLocation.updateOrCreate( findOrganization, { id: location.id }, d ).exec(function( err, location_result ){
                                  // err
                                  if ( err ) return res.negotiate( err );
                                  // no need to return locations
                                  next();

                                  });
                                });
                              }, function ( err ) {
                                if ( err ) return res.negotiate( err );
                                next();
                              });

                            });

                          });
                        });
                  } else {
                    next();
                  }
            });

          }, function ( err ) {
            if ( err ) return err;
            return res.json( 200, { msg: 'success' } );
          });

      });

  },

  setReportsToDoPreviousMonth: function( req, res ) {

    // find active projects
    Project
      .find()
      .where( { project_start_date: { $lte: moment().subtract(1, 'month' ).endOf( 'M' ).format( 'YYYY-MM-DD' ) } } )
      .where( { project_end_date: { $gte: moment().subtract(1, 'month' ).startOf( 'M' ).format( 'YYYY-MM-DD' ) } } )
      .exec( function( err, projects ){

        // return error
        if ( err ) return res.negotiate( err );


        // ASYNC REQUEST 1
        // async loop target_beneficiaries
        async.each( projects, function ( project, next ) {

          var findProject = { project_id: project.id }

          // create report
          var r = {
            project_id: project.id,
            report_status: 'todo',
            report_active: true,
            report_month: moment().month(),
            report_year: moment().year(),
            reporting_period: moment().set( 'date', 1 ).format(),
            reporting_due_date: moment().add( 1, 'M' ).set( 'date', 10 ).format()
          };

          // clone project
          var p = JSON.parse( JSON.stringify( project ) );
                  delete p.id;

          // create report
          var new_report = _under.extend( {}, p, r );

          // find reports
          Report.findOne( { project_id: new_report.project_id, report_month: new_report.report_month, report_year: new_report.report_year } ).then( function ( report ){

            // set
            if( !report ) { report = { id: null } }
            if ( report ) { new_report.report_status = report.report_status; new_report.report_active = report.report_active, new_report.updatedAt = report.updatedAt }

            // create reports
            Report.updateOrCreate( findProject, { id: report.id }, new_report ).exec(function( err, report_result ){

              // err
              if ( err ) return err;

              // make array ( sails returns object on create, array on update )
              if ( !report.id ) {
                report_result = [ report_result ];
              }

              // get target_locations
              TargetLocation
                .find()
                .where( findProject )
                .exec( function( err, target_locations ){

                  // err
                  if ( err ) return err;

                  // generate locations for each report ( requires report_id )
                  ReportTasksController.getProjectReportLocations( report_result, target_locations, function( err, locations ){

                    // err
                    if ( err ) return err;

                    // ASYNC REQUEST 1.1
                    // async loop project_update locations
                    async.each( locations, function ( d, next ) {

                      // find
                      Location.findOne( { project_id: project.id, target_location_reference_id: d.target_location_reference_id, report_month: d.report_month, report_year: d.report_year } ).then( function ( location ){
                        if( !location ) { location = { id: null } }
                        // relations set in getProjectReportLocations
                        Location.updateOrCreate( findProject, { id: location.id }, d ).exec(function( err, location_result ){

                          // err
                          if ( err ) return err;

                          // no need to return locations
                          next();

                        });
                      });
                    }, function ( err ) {
                      if ( err ) return err;
                      next();
                    });

                  });

                });

            });
          });

        }, function ( err ) {
          if ( err ) return err;
          return res.json( 200, { msg: 'success' } );
        });

    });

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

    Report
      .find()
      .where( { project_id: { '!' : null } } )
      .where( { report_month: moment().month() } )
      .where( { report_year: moment().year() } )
      .where( { report_active: true } )
      .where( { report_status: 'todo' } )
      .exec( function( err, reports ){

        if ( err ) return res.negotiate( err );
        // find active reports for the next reporting period
        Location
          .find()
          .where( { report_id: { '!' : null } } )
          .where( { report_month: moment().month() } )
          .where( { report_year: moment().year() } )
          .where( { report_active: true } )
          .where( { report_status: 'todo' } )
          .exec( function( err, locations ){

            // return error
            if ( err ) return res.negotiate( err );

            // no reports return
            if ( !locations.length ) return res.json( 200, { msg: 'No reports pending for ' + moment().format( 'MMMM' ) + '!' } );

            // for each report, group by username
            locations.forEach( function( location, i ) {

              // if username dosnt exist
              if ( !nStore[ location.email ] ) {

                // add for notification email template
                nStore[ location.email ] = {
                  email: location.email,
                  username: location.username,
                  report_month: moment().format( 'MMMM' ),
                  reportsStore: []
                };

              }

              // group reports by report!
              if ( !nStore[ location.email ].reportsStore[ location.report_id ] ){
                // add location urls
                nStore[ location.email ].reportsStore[ location.report_id ] = {
                  country: location.admin0name,
                  cluster: location.cluster,
                  username: location.username,
                  project_title: location.project_title,
                  report_url: 'https://' + req.host + '/desk/#/cluster/projects/report/' + location.project_id + '/' + location.report_id
                };
              }

            });

            // catching up with project focal points who are not in locations
            // for each report, group by username
            reports.forEach( function( location, i ) {
              location.report_id = location.id;
              // if username dosnt exist
              if ( !nStore[ location.email ] ) {

                // add for notification email template
                nStore[ location.email ] = {
                  email: location.email,
                  username: location.username,
                  report_month: moment().format( 'MMMM' ),
                  reportsStore: []
                };

              }

              // group reports by report!
              if ( !nStore[ location.email ].reportsStore[ location.report_id ] ){
                // add location urls
                nStore[ location.email ].reportsStore[ location.report_id ] = {
                  country: location.admin0name,
                  cluster: location.cluster,
                  username: location.username,
                  project_title: location.project_title,
                  report_url: 'https://' + req.host + '/desk/#/cluster/projects/report/' + location.project_id + '/' + location.report_id
                };
              }

            });

            // each user, send only one email!
            for ( var user in nStore ) {

              // flatten and order
              for ( var report in nStore[ user ].reportsStore ) {
                if ( !nStore[ user ].reports ) {
                  nStore[ user ].reports = [];
                }
                nStore[ user ].reports.push( nStore[ user ].reportsStore[ report ] );
              }

              // sort
              nStore[ user ].reports.sort(function(a, b) {
                return a.country.localeCompare(b.country) ||
                        a.cluster.localeCompare(b.cluster) ||
                        a.project_title.localeCompare(b.project_title);
              });

              // push
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
                      type: 'Monthly Activity',
                      name: result.name,
                      email: notifications[i].email,
                      report_month: notifications[i].report_month.toUpperCase(),
                      reports: notifications[i].reports,
                      sendername: 'ReportHub'
                    }, {
                      to: notifications[i].email,
                      subject: 'ReportHub - Project Reporting Period for ' + moment().format( 'MMMM' ).toUpperCase() + ' Now Open!'
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
      });

    } else {

      // return reports
      return res.json( 200, { msg: 'Reporting not open for ' + moment().format( 'MMMM' ) + '!' } );
    }

  },

  // sends reminder for active reports not yet submitted
  setReportsReminderAllMonths: function( req, res ) {

    // active projects ids
    var due_date = 10;
    var nStore = {}
    var notifications = [];

    // only run if date is 1 week before monthly reporting period required
    // if ( moment().date() <= 10 ) {
    Report
      .find()
      .where( { project_id: { '!' : null } } )
      .where( { report_year: moment().subtract( 1, 'M' ).year() })
      .where( { report_month: { '<=': moment().subtract( 1, 'M' ).month() } } )
      .where( { report_active: true } )
      .where( { report_status: 'todo' } )
      .sort( 'report_month DESC' )
      .exec( function( err, reports ){

          if ( err ) return res.negotiate( err );
          // no reports return
          if ( !reports.length ) return res.json( 200, { msg: 'No reports pending for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ) + '!' } );

          // for each report, group by username
          reports.forEach( function( location, i ) {

            location.report_id = location.id;
            // if username dosnt exist
            if ( !nStore[ location.email ] ) {
              var due_message = 'PENDING';

              // add for notification email template
              nStore[ location.email ] = {
                email: location.email,
                username: location.username,
                report_month: moment().subtract( 1, 'M' ).format( 'MMMM' ),
                reporting_due_date: moment( location.reporting_due_date ).format( 'DD MMMM, YYYY' ),
                reporting_due_message: due_message,
                projectsStore: []
              };
            }

            // group reports by report!
            if ( !nStore[ location.email ].projectsStore[ location.project_id ] ){
              // add report urls
              nStore[ location.email ].projectsStore[ location.project_id ] = {
                country: location.admin0name,
                cluster: location.cluster,
                project_title: location.project_title,
                reports: []
              }

            }

            // one report per month
            if ( !nStore[ location.email ].projectsStore[ location.project_id ].reports[ location.report_id ] ) {
              // project reports
              nStore[ location.email ].projectsStore[ location.project_id ].reports.push({
                report_value: location.report_month,
                report_month: moment( location.reporting_period ).format( 'MMMM' ),
                report_url: 'https://' + req.host + '/desk/#/cluster/projects/report/' + location.project_id + '/' + location.report_id
              });
              // avoids report row per location
              nStore[ location.email ].projectsStore[ location.project_id ].reports[ location.report_id ] = [{ report: true }];
            }

          });

          // each user, send only one email!
          for ( var user in nStore ) {

            // flatten and order
            for ( var project in nStore[ user ].projectsStore ) {
              if ( !nStore[ user ].projects ) {
                nStore[ user ].projects = [];
              }
              nStore[ user ].projects.push( nStore[ user ].projectsStore[ project ] );
            }

            // sort
            nStore[ user ].projects.sort(function(a, b) {
              return a.country.localeCompare(b.country) ||
                      a.cluster.localeCompare(b.cluster) ||
                      a.project_title.localeCompare(b.project_title);
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
                sails.hooks.email.send( 'notification-due-reports', {
                    type: 'Monthly Activity',
                    name: result.name,
                    email: notifications[i].email,
                    report_month: notifications[i].report_month.toUpperCase(),
                    reporting_due_date: notifications[i].reporting_due_date,
                    reporting_due_message: notifications[i].reporting_due_message,
                    projects: notifications[i].projects,
                    sendername: 'ReportHub'
                  }, {
                    to: notifications[i].email,
                    subject: 'ReportHub - Project Reports ' + notifications[i].reporting_due_message + '!'
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
      // } else { return res.json( 200, { msg: 'No reports pending for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ) + '!' } ); }

  },

  // sends reminder for active current reporting period month not yet submitted
  setReportsReminder: function( req, res ) {

    // active projects ids
    var due_date = 10;
    var nStore = {}
    var notifications = [];

    // only run if date is 1 week before monthly reporting period required
    // if ( moment().date() <= 10 ) {
    Report
      .find()
      .where( { project_id: { '!' : null } } )
      .where( { report_year: moment().subtract( 1, 'M' ).year() })
      .where( { report_month: moment().subtract( 1, 'M' ).month() } )
      .where( { report_active: true } )
      .where( { report_status: 'todo' } )
      .where( { project_status : "active" } )
      .sort( 'report_month DESC' )
      .exec( function( err, reports ){

          if ( err ) return res.negotiate( err );
          // no reports return
          if ( !reports.length ) return res.json( 200, { msg: 'No reports pending for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ) + '!' } );

          // for each report, group by username
          reports.forEach( function( location, i ) {

            const admin0pcode = location.admin0pcode;

            let config = REPORTING_DUE_DATE_NOTIFICATIONS_CONFIG.find(obj => obj.admin0pcode === admin0pcode);
            if (!config) config = REPORTING_DUE_DATE_NOTIFICATIONS_CONFIG.find(obj => obj.admin0pcode === "ALL");

            if (config.soon.includes(moment().date()) || config.pending.includes(moment().date()) || config.today.includes(moment().date())) {

              location.report_id = location.id;
              // if username dosnt exist
              if ( !nStore[ location.email ] ) {
                var due_message = 'due SOON';
                // set due message TODAY
                if ( config.today.includes(moment().date()) ) {
                  due_message = 'due TODAY';
                }
                // set due message PENDING
                if ( config.pending.includes(moment().date()) ) {
                  due_message = 'PENDING';
                }

                // add for notification email template
                nStore[ location.email ] = {
                  email: location.email,
                  username: location.username,
                  report_month: moment().subtract( 1, 'M' ).format( 'MMMM' ),
                  reporting_due_date: moment( location.reporting_due_date ).format( 'DD MMMM, YYYY' ),
                  reporting_due_message: due_message,
                  projectsStore: []
                };
              }

              // group reports by report!
              if ( !nStore[ location.email ].projectsStore[ location.project_id ] ){
                // add report urls
                nStore[ location.email ].projectsStore[ location.project_id ] = {
                  country: location.admin0name,
                  cluster: location.cluster,
                  project_title: location.project_title,
                  reports: []
                }

              }

              // one report per month
              if ( !nStore[ location.email ].projectsStore[ location.project_id ].reports[ location.report_id ] ) {
                // project reports
                nStore[ location.email ].projectsStore[ location.project_id ].reports.push({
                  report_value: location.report_month,
                  report_month: moment( location.reporting_period ).format( 'MMMM' ),
                  report_url: 'https://' + req.host + '/desk/#/cluster/projects/report/' + location.project_id + '/' + location.report_id
                });
                // avoids report row per location
                nStore[ location.email ].projectsStore[ location.project_id ].reports[ location.report_id ] = [{ report: true }];
              }
            }
          });

          // each user, send only one email!
          for ( var user in nStore ) {

            // flatten and order
            for ( var project in nStore[ user ].projectsStore ) {
              if ( !nStore[ user ].projects ) {
                nStore[ user ].projects = [];
              }
              nStore[ user ].projects.push( nStore[ user ].projectsStore[ project ] );
            }

            // sort
            nStore[ user ].projects.sort(function(a, b) {
              return a.country.localeCompare(b.country) ||
                      a.cluster.localeCompare(b.cluster) ||
                      a.project_title.localeCompare(b.project_title);
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
                    type: 'Monthly Activity',
                    name: result.name,
                    email: notifications[i].email,
                    report_month: notifications[i].report_month.toUpperCase(),
                    reporting_due_date: notifications[i].reporting_due_date,
                    reporting_due_message: notifications[i].reporting_due_message,
                    projects: notifications[i].projects,
                    sendername: 'ReportHub'
                  }, {
                    to: notifications[i].email,
                    subject: 'ReportHub - Project Reporting Period for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ).toUpperCase() + ' is ' + notifications[i].reporting_due_message + ' !'
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
      // } else { return res.json( 200, { msg: 'No reports pending for ' + moment().subtract( 1, 'M' ).format( 'MMMM' ) + '!' } ); }

  }

};

module.exports = ReportTasksController;
