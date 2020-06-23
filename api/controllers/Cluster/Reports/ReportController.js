/**
 * ReportController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// libs
var Promise = require('bluebird');
var fs = require('fs');
var util = require('util');
var async = require('async');
var moment = require( 'moment' );
var _under = require('underscore');

const ExcelJS = require('exceljs');

var ReportController = {

	// TASKS

	// parse results from sails
	set_result: function( result ) {
		if( util.isArray( result ) ) {
			// update ( array )
			return result[0];
		} else {
			// create ( object )
			return result;
		}
	},

	// request as csv
	getReportCsv: function( req, res ) {

		// request input
		if ( !req.param( 'report_type' ) || !req.param( 'report_id' ) ) {
			return res.json( 401, { err: 'report_type & report_id required!' });
		}

		var json2csv = require( 'json2csv' ),
			moment = require( 'moment' );

		// activity
		if ( req.param( 'report_type' ) === 'activity' ) {

      let { fields, fieldNames } = FieldsService.getReportCsvFields();

			// beneficiaries
			Beneficiaries
				.find( )
				.where( { report_id: req.param( 'report_id' ) } )
				.exec(function( err, response ){

					// error
					if ( err ) return res.negotiate( err );

					// format  / sum
					response.forEach(function( d, i ){

            // project donor
            if (d.project_donor) {
              var da = [];
              d.project_donor.forEach(function (d, i) {
                if (d) da.push(d.project_donor_name);
              });
              da.sort();
              d.donors = da.join(', ');
            }

            // programme partners
            if (Array.isArray(d.programme_partners)) {
              var pp = [];
              d.programme_partners.forEach(function (p, i) {
                if (p) pp.push(p.organization);
              });
              pp.sort();
              d.programme_partners = pp.join(', ');
            }

            // implementing partners
            if (Array.isArray(d.implementing_partners)) {
              var ips = [];
              d.implementing_partners.forEach(function (ip, i) {
                if (ip) ips.push(ip.organization);
              });
              ips.sort();
              d.implementing_partners = ips.join(', ');
            }

            response[i].report_month = moment( response[i].reporting_period ).format( 'MMMM' );

            d.updatedAt = moment(d.updatedAt).format('YYYY-MM-DD HH:mm:ss');
            d.createdAt = moment(d.createdAt).format('YYYY-MM-DD HH:mm:ss');

					});

					// return csv
					json2csv({ data: response, fields: fields, fieldNames: fieldNames }, function( err, csv ) {

						// error
						if ( err ) return res.negotiate( err );

						// success
						return res.json( 200, { data: csv } );

					});

				});

		} else {

			var fields = [
						'organization_id',
						'report_id',
						'organization',
						'username',
						'email',
						'admin0name',
						'admin1pcode',
						'admin1name',
						'admin2pcode',
						'admin2name',
						'admin3pcode',
						'admin3name',
						'site_name',
						'report_month',
						'report_year',
						'cluster',
            'stock_item_name',
            'stock_details',
						'stock_status_name',
						'number_in_stock',
						'number_in_pipeline',
            'unit_type_name',
            'beneficiaries_covered',
            'stock_targeted_groups_name',
            'remarks',
						'createdAt',
						'updatedAt'
					],
					fieldNames = [
						'Organization ID',
						'Report ID',
						'Organization',
						'Username',
						'Email',
						'Country',
						'Admin1 Pcode',
						'Admin1 Name',
						'Admin2 Pcode',
						'Admin2 Name',
						'Admin3 Pcode',
						'Admin3 Name',
						'Warehouse Name',
						'Stock Month',
						'Stock Year',
						'Cluster',
            'Stock Type',
            'Stock Details',
						'Status',
						'No. in Stock',
						'No. in Pipeline',
            'Units',
            'Beneficiary Coverage',
            'Targeted Group',
            'Remarks',
						'Created',
						'Last Update'
					];

			// stocks
			Stock
				.find( )
				.where( { report_id: req.param( 'report_id' ), location_id: { '!' : null } } )
				.exec(function( err, response ){

					// error
					if ( err ) return res.negotiate( err );

					// format month
					response.forEach(function( d, i ){
            response[i].report_month = moment( response[i].reporting_period ).format( 'MMMM' );

            d.updatedAt = moment(d.updatedAt).format('YYYY-MM-DD HH:mm:ss');
            d.createdAt = moment(d.createdAt).format('YYYY-MM-DD HH:mm:ss');

            // array to string
            d.donors = Utils.arrayToString(d.donors, "donor_name");
            d.implementing_partners = Utils.arrayToString(d.implementing_partners, "organization")
            // partial kits
            d.stock_details = Utils.arrayToString(d.stock_details, ["unit_type_name", "unit_type_quantity"]);
          });

          if ( response[0] && response[0].admin0pcode ) {
            if(response[0].admin0pcode==='ET'){
              ix = fields.indexOf('cluster') + 1;
              ix && fields.splice(ix, 0, 'donors', 'implementing_partners', 'stock_type_name');
              ix && fieldNames.splice(ix, 0, 'Donors', 'Implementing Partners', 'Stock/Pipeline');

              ix = fieldNames.indexOf('Beneficiary Coverage');
              ix && fieldNames.splice(ix, 1, 'Number HH');
            }

            if (response[0].admin0pcode === 'AF') {
              ix = fields.indexOf('stock_status_name');
              ix && fields.splice(ix, 0, 'stock_item_purpose_name');
              ix && fieldNames.splice(ix, 0, 'Purpose');
            }
          }

					// return csv
					json2csv({ data: response, fields: fields, fieldNames: fieldNames }, function( err, csv ) {

						// error
						if ( err ) return res.negotiate( err );

						// success
						return res.json( 200, { data: csv } );

					});

				});

		}

	},

  getProjectLists: async function( req, res ) {

    // request inputs
		if ( !req.param( 'project_id' )  ) {
			return res.json( 400, { err: 'project_id required!' });
		}

    const report_id = req.param( 'report_id' );
    const project_id = req.param( 'project_id' );

    try {

      // query project data
      let project = await Project.findOne({ id: project_id });
      if (!project) return res.json( 404, { err: 'Project not found!' });

      let reports = [];
      let locations = [];
      let activity_types = [];

      if (report_id) {
        locations = await Location.find({ report_id: report_id });
        reports = await Report.find({ id: report_id });
        if (!reports[0]) return res.json( 404, { err: 'Report not found!' });
        activity_types = reports[0].activity_type;
      } else {
        reports = await Report.find({ project_id: project_id });
        locations = await TargetLocation.find({ project_id: project_id });
        activity_types = project.activity_type;
      }

      // query project activities
      let queryActivities = a => ({ active: 1, cluster_id: a.cluster_id, activity_type_id: a.activity_type_id, admin0pcode: { contains: project.admin0pcode } });
      let activities = await Promise.all(activity_types.map(a => Activities.find(queryActivities(a))));
      activities = _.flatten(activities);

      // FORMAT
      // format activities
      activities.forEach(function( d, i ){
        d.unit_type_id = Utils.arrayToString(d.unit_type_id, "unit_type_name");
        d.mpc_delivery_type_id = Utils.arrayToString(d.mpc_delivery_type_id, "mpc_delivery_type_name");
        d.mpc_mechanism_type_id = Utils.arrayToString(d.mpc_mechanism_type_id, ["mpc_delivery_type_id", "mpc_mechanism_type_name"]);
        d.mpc_transfer_category_id = Utils.arrayToString(d.mpc_transfer_category_id, ["transfer_category_id", "transfer_category_name"]);
        d.mpc_grant_type_id = Utils.arrayToString(d.mpc_grant_type_id, ["grant_type_id", "grant_type_name"]);
      });

      // format project
      project.project_donor = Utils.arrayToString(project.project_donor, "project_donor_name")
      project.programme_partners = Utils.arrayToString(project.programme_partners, "organization")
      project.implementing_partners = Utils.arrayToString(project.implementing_partners, "organization")

      // format reports
      reports.forEach(function( d, i ){
        d.report_month = moment( d.reporting_period ).format( 'MMMM' );
      });

      // format locations
      locations.forEach(function( d, i ){
        d.implementing_partners = Utils.arrayToString(d.implementing_partners, "organization")
      });

      // XLSX processing
      let workbook = new ExcelJS.Workbook();

      let worksheetActivities = workbook.addWorksheet('Activities');
      let worksheetLocations = workbook.addWorksheet('Locations');
      let worksheetReport = workbook.addWorksheet('Report');
      let worksheetProject = workbook.addWorksheet('Project');

      // let worksheetPopulationGroups = workbook.addWorksheet('Population Groups');
      // let worksheetHRPPopulationGroups = workbook.addWorksheet('HRP Population Groups');
      // let worksheetOther = workbook.addWorksheet('Other');

      // xlsx headers
      worksheetActivities.columns = [
        { header: 'Cluster', key: 'cluster', width: 10 },
        { header: 'Activity Type', key: 'activity_type_name', width: 30 },
        { header: 'Activity Description', key: 'activity_description_name', width: 30 },
        { header: 'Activity Details', key: 'activity_detail_name', width: 30 },
        { header: 'Indicator', key: 'indicator_name', width: 60 },
        { header: 'Unit Types', key: 'unit_type_id', width: 50 },
        { header: 'Cash Delivery Types', key: 'mpc_delivery_type_id', width: 50 },
        { header: 'Cash Mechanism Types', key: 'mpc_mechanism_type_id', width: 50 },
        { header: 'Cash Transfer Categories', key: 'mpc_transfer_category_id', width: 30 },
        { header: 'Cash Grant Types', key: 'mpc_grant_type_id', width: 50 },
      ];

      worksheetLocations.columns = [
        { header: 'Country', key: 'admin0name', width: 30 },
        { header: 'Admin1 Pcode', key: 'admin1pcode', width: 30 },
        { header: 'Admin1 Name', key: 'admin1name', width: 30 },
        { header: 'Admin2 Pcode', key: 'admin2pcode', width: 30 },
        { header: 'Admin2 Name', key: 'admin2name', width: 30 },
        { header: 'Admin3 Pcode', key: 'admin3pcode', width: 30 },
        { header: 'Admin3 Name', key: 'admin3name', width: 30 },
        { header: 'Site Implementation', key: 'site_implementation_name', width: 30 },
        { header: 'Site Type', key: 'site_type_name', width: 30 },
        { header: 'Location Name', key: 'site_name', width: 30 },
        { header: 'Implementing Partners', key: 'implementing_partners', width: 30 },
      ];

      worksheetReport.columns = [
        { header: 'Country', key: 'admin0name', width: 30 },
        { header: 'Organization', key: 'organization', width: 30 },
        { header: 'Report Month', key: 'report_month', width: 30 },
        { header: 'Report Year', key: 'report_year', width: 30 },
        { header: 'Reporting Period', key: 'reporting_period', width: 30 },
        { header: 'Reporting Due Date', key: 'reporting_due_date', width: 30 },
      ];

      worksheetProject.columns = [
        { header: 'Country', key: 'admin0name', width: 20 },
        { header: 'Organization', key: 'organization', width: 20 },
        { header: 'Focal Point', key: 'username', width: 20 },
        { header: 'Email', key: 'email', width: 20 },
        { header: 'HRP Code', key: 'project_hrp_code', width: 30 },
        { header: 'Project Title', key: 'project_title', width: 100 },
        { header: 'Project Start Date', key: 'project_start_date', width: 30 },
        { header: 'Project End Date', key: 'project_end_date', width: 30 },
        { header: 'Project Donors', key: 'project_donor', width: 30 },
        { header: 'Programme Partners', key: 'programme_partners', width: 30 },
        { header: 'Implementing Partners', key: 'implementing_partners', width: 30 },
      ];

      // add rows
      worksheetActivities.addRows(activities);
      worksheetLocations.addRows(locations);
      worksheetReport.addRows(reports);
      worksheetProject.addRow(project);

      // send response
      let filename = "Activity Lists " + project.admin0pcode + " " + project.organization + " " + (project.project_title.length > 50 ? project.project_title.substring(0,49) : project.project_title);
      filename = filename.replace(/,/g, '');

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=' + filename + '.xlsx');

      return workbook.xlsx.write(res);

    } catch (err) {
      return res.negotiate( err );
    }

  },

	// get all reports by project id
	getReportsList: function( req, res ) {

		// request input
		if ( !req.param( 'filter' ) ) {
			return res.json( 401, { err: 'filter required!' });
		}

		// promise
		Promise.all([
			Report.find( req.param( 'filter' ) ).sort( 'report_month ASC' ),
			Beneficiaries.find( req.param( 'filter' ) )
		])
		.catch( function( err ) {
			return res.negotiate( err );
		})
		.then( function( result ) {

			// gather results
			var reports = result[ 0 ];
			var beneficiaries = result[ 1 ];

			// async loop reports
			async.each( reports, function ( report, next ) {

				// add status empty
				report.icon = 'adjust'
				report.status = '#80cbc4';
				report.status_title = 'Empty Submission';

				// if report is 'todo' and before due date!
				if ( report.report_status === 'todo' && moment().isSameOrBefore( moment( report.reporting_due_date ) ) ) {

					// add status todo but ok
					report.icon = 'watch_later';
					report.status = '#4db6ac';
					report.status_title = 'ToDo';

				}

				// if report is 'todo' and past due date!
				if ( report.report_status === 'todo' && moment().isAfter( moment( report.reporting_due_date ) ) ) {

					// set to red (overdue!)
					report.icon = 'error';
					report.status = '#e57373'
					report.status_title = 'Due';

				}

				// async loop beneficiaries
				async.each( beneficiaries, function ( beneficiary, b_next ) {

					// beneficiaries exist for this report
					if ( report.id === beneficiary.report_id ) {

						// if no benficiaries and submitted
						if ( report.report_status === 'complete' ) {
							// add status
							report.icon = 'check_circle';
							report.status = '#4db6ac';
							report.status_title = 'Complete';
							if (report.report_validation && report.report_validation ==='valid' ) {
								report.icon = 'done_all';
								report.status = '#4db6ac';
							}
							if (report.report_validation && report.report_validation === 'invalid') {
								report.icon = 'not_interested';
								report.status = '#f44336';
							}
							if (report.report_validation && report.report_validation === 'checked') {
								report.icon = 'watch_later';
								report.status = '#4db6ac';
							}
						}

						// if report is 'todo' and has records ( is saved )
						if ( report.report_status === 'todo' ) {
							// if beneficiaries ( report has been updated )
							if ( beneficiary ) {
								report.icon = 'watch_later';
								report.status = '#fff176';
								report.status_title = 'Pending';
							}
						}

					}
					b_next();
				}, function ( err ) {
					if ( err ) return err;
					next();
				});
			}, function ( err ) {
				if ( err ) return err;
				// return
				return res.json( 200, reports );
			});

		});

	},

	// update to complete
	getReportDetailsById: function( req, res ) {

		// request input guards
		if ( !req.param( 'id' ) ) {
			return res.json(401, { err: 'id required!' });
		}

		Report
			.findOne( { id: req.param( 'id' ) } )
			.exec(function( err, report ){

				// return error
				if ( err ) return res.json({ err: true, error: err });

				// return reports
				return res.json( 200, report );

			});

	},

	// get all Reports by project id
	getReport: function( req, res ) {

		// request input
		if ( !req.param( 'report_id' ) && ( !req.param( 'project_id' ) || ( !req.param( 'report_month' ) && !( req.param( 'report_month' ) === 0 ) ) || !req.param( 'report_year' ) ) ) {
			return res.json( 401, { err: 'report_id or project_id, report_month, report_year required!' });
		}

		var find;
		var findReport;
		var findLocation;

		// getReportById
		if ( req.param( 'report_id' ) ) {
			// set
			find = { id: req.param( 'report_id' ) }
			findReport = { report_id: req.param( 'report_id' ) }
			findLocation = { report_id: req.param( 'report_id' ) }
		}

		// getReportByParams
		if ( req.param( 'project_id' ) ) {
			// set
			find = { project_id: req.param( 'project_id' ), report_month: req.param( 'report_month' ), report_year: req.param( 'report_year' ) }
			findReport = find;
			findLocation = find;
		}

		// if location_group_id
		if ( req.param( 'location_group_id') ) {
			findLocation = _under.extend( {}, findLocation, { location_group_id: req.param( 'location_group_id') } );
		}

		// promise
		Promise.all([
			Report.findOne( find ),
			Location.find( findLocation ),
			Beneficiaries.find( findReport ).populateAll(),
		])
		.catch( function( err ) {
			return res.negotiate( err );
		})
		.then( function( result ) {

			// gather results
			var report = result[ 0 ];
			var locations = result[ 1 ];
			var beneficiaries = result[ 2 ];

			// placeholder
			report.locations = [];

			// async loop target_beneficiaries
			async.each( locations, function ( location, next ) {

				// counter
				var locations_counter = 0;
				var locations_features = 1;

				// set holders
				location.beneficiaries = [];

				// set next in locations array
				var set_next = function ( location ){
					locations_counter++;
					if( locations_counter === locations_features ){
						report.locations.push( location );
						next();
					}
				}

				// beneficiaries
				if ( beneficiaries.length ){
					async.each( beneficiaries, function ( beneficiary, b_next ) {
						if ( location.id === beneficiary.location_id ) {
							// push
							location.beneficiaries.push( beneficiary );
						}
						// next
						b_next();
					}, function ( err ) {
						// error
						if ( err ) return err;
						// increment counter
						set_next( location );
					});
				} else {
					// increment counter
					set_next( location );
				}

			}, function ( err ) {
				if ( err ) return err;
				return res.json( 200, report );
			});

		});

	},

	// set report details by report id
	setReportById: function( req, res ) {

		// request input guards
		if ( !req.param( 'report' ) ) {
			return res.json(401, { err: 'report required!' });
		}

		// params
		var report = req.param( 'report' );
		var locations = req.param( 'report' ).locations;
		var email_alert = req.param( 'email_alert' ) ? true : false;

		// find
		var findProject = {
			project_id: report.project_id
		}
		var findReport = {
			report_id: report.id
		}
		var findLocation;
		var findTargetLocation;

		// get report by organization_id
		Report
			.update( { id: report.id }, report )
			.exec( function( err, report ){

				// return error
				if (err) return res.negotiate( err );

				// update / create locations
				report = report[0];
				report.locations = [];

				// prepare for cloning
				var report_copy = JSON.parse( JSON.stringify( report ) );
				delete report_copy.id;
				delete report_copy.createdAt;
				delete report_copy.updatedAt;

				// async loop report locations
				async.each( locations, function ( location, next ) {

					// set counter
					var locations_counter = 0;
					var locations_features = 1;

					// set beneficiaries
					var beneficiaries = location.beneficiaries;

					// set next in locations array
					var set_next = function ( location ){
						locations_counter++;
						if( locations_counter === locations_features ){
							report.locations.push( location );
							next();
						}
					}

					// update or create
					Location.updateOrCreate( _under.extend( {}, findProject, findReport ), { id: location.id }, location ).exec(function( err, result ){

						// set result, update / create beneficiaries
						location = ReportController.set_result( result );
						findLocation = { location_id: location.id }
						findTargetLocation = { target_location_reference_id: location.target_location_reference_id }
						location.beneficiaries = [];

						// prepare for cloning
						var location_copy = JSON.parse( JSON.stringify( location ) );
						delete location_copy.id;
						delete location_copy.createdAt;
						delete location_copy.updatedAt;

						// async loop report beneficiaries
						async.eachOf( beneficiaries, function ( beneficiary, i, b_next ) {
            //   delete beneficiary.implementing_partners;
              // clone
              var b = _under.extend( {}, report_copy, location_copy, beneficiary );
              // update or create
						Beneficiaries.updateOrCreate( _under.extend( {}, findProject, findReport, findLocation, findTargetLocation ), { id: b.id }, b ).exec(function( err, result ){
								if ( ReportController.set_result(result).id ) {
	                Beneficiaries.findOne({ id: ReportController.set_result(result).id }).populateAll().exec(function (err, result) {
	                  // location.beneficiaries.push( ReportController.set_result( result ) );
	                  // set beneficiaries in the origin order
	                  location.beneficiaries[i] = ReportController.set_result(result);
	                  b_next();
	                });
	              } else {
	              	b_next();
	              }
							});
						}, function ( err ) {
							if ( err ) return err;
							// increment counter
							set_next( location );
						});


					});
				}, function ( err ) {

					// err
					if ( err ) return err;

					// email alert?
					if ( !email_alert || ( email_alert && report.admin0pcode !== 'ET' ) ) {
						// return report
						return res.json( 200, report );

					} else {

	          // if no config file, return, else send email ( PROD )
	          if ( !fs.existsSync( '/home/ubuntu/nginx/www/ngm-reportEngine/config/email.js' ) ) { return res.json( 200, report ); }

	          // filter
	          var admin_names = '';
	          var admin_emails = '';
	          var filter = {
	          	admin0pcode: report.admin0pcode,
	          	cluster_id: report.cluster_id,
	          	roles: { $in: [ 'CLUSTER' ] }
	          }

						// native function
						User.native( function ( err, collection ){
							collection.find( filter ).toArray( function ( err, admin ){
								// return error
								if (err) return res.negotiate( err );

								// set emails
								admin.forEach(function( d, i ) {
									admin_names += d.name + ', ';
									admin_emails += d.email + ',';
								});
								// remove last comma
								admin_names = admin_names.slice( 0, -1 );
								admin_emails = admin_emails.slice( 0, -1 );

								// report_month
								var report_month = moment( report.reporting_period ).format( 'MMMM' ).toUpperCase();

			          // send email
			          sails.hooks.email.send( 'notification-report-edit', {
			              recipientNames: admin_names,
			              organization: report.organization,
			              report_month: report_month,
			              report_year: report.report_year,
			              report_url: 'https://' + req.host + '/desk/#/cluster/projects/report/' + report.project_id + '/' + report.id,
			              senderName: 'ReportHub',
			            }, {
			              to: admin_emails,
			              subject: 'ReportHub Notificaitons: Edit of ' + report_month + ', '  + report.report_year +' Report by ' + report.organization
			            }, function(err) {
			              // return error
			              if (err) return res.negotiate( err );
						        // return report
										return res.json( 200, report );

			          	});

							});
						});

					}

				});

		});

	},

	// update to complete
	updateReportStatus: function( req, res ) {

		// request input guards
		if ( !req.param( 'report_id' ) && !req.param( 'report_status' ) ) {
			return res.json(401, { err: 'report_id, report_status required!' });
		}

		Report
			.update( { id: req.param( 'report_id' ) }, req.param( 'update' ) )
			.exec(function( err, report ){

				// return error
				if ( err ) return res.json({ err: true, error: err });

				// return reports
				return res.json( 200, report );

			});

	},

	// report validation
	updateReportValidation:function(req,res){

		if (!req.param('report_id') && !req.param('update')){
			return res.json(401, { err: 'report, validation required!' });
		}

		Report
			.update({ id: req.param('report_id') },req.param('update'))
			.exec(function (err,report) {
				// return error
				if (err) return res.json({ err: true, error: err });
				// return success
				return res.json(200, report);
			})

	},

	// remove
	removeBeneficiary: function( req, res ){

		// request input
		if ( !req.param( 'id' ) ) {
			return res.json(401, { err: 'id required!' });
		}

		// get report
		var $id = req.param( 'id' );

		// location_reference_id 're-links' association after any updates
			 // when updating target locations in project details (this affects monthly report)
		Beneficiaries
			// .update({ id: $id }, { location_id: null })
			.destroy({ id: $id })
			.exec(function( err, b ){

				// return error
				if ( err ) return res.json({ err: true, error: err });

				// return reports
				return res.json( 200, { msg: 'success' } );

			});

  },

  deleteReportById: async function (req, res) {
    // request input
    if (!req.param('id')) {
      return res.json(401, { err: 'repor_id required!' });
    }

    var report_id = req.param('id');

    try {

      await Promise.all([
        Report.destroy({ id: report_id }),
        Location.destroy({ report_id: report_id }),
        Beneficiaries.destroy({ report_id: report_id })
      ]);

      return res.json(200, { msg: 'Report ' + report_id + ' has been deleted!' });

    } catch (err) {
      return res.negotiate(err);
    }
  }

};

module.exports = ReportController;
