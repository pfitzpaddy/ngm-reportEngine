/**
 * ReportController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// libs
var Promise = require('bluebird');
var util = require('util');
var async = require('async');
var moment = require( 'moment' );
var _under = require('underscore');

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

			var fields = [ 
						'project_id',
						'report_id',
						'cluster',
						'organization',
						'username',
						'email',
						'project_hrp_code',
						'project_title',
						'project_code',
						'admin0name',
						'admin1pcode',
						'admin1name',
						'admin2pcode',
						'admin2name',
						'admin3pcode',
						'admin3name',
						'site_implementation_name',
						'site_type_name',
						'site_name',
						'report_month',
						'report_year',
						'activity_type_name',
						'activity_description_name',
						'indicator_name',
						'category_type_name',
						'beneficiary_type_name',
						'beneficiary_category_name',
						'strategic_objective_name',
						'strategic_objective_description',
						'sector_objective_name',
						'sector_objective_description',
						'delivery_type_name',
						'units',
						'unit_type_name',
						'transfer_type_value',
						'mpc_delivery_type_id',
						'households',
						'families',
						'boys',
						'girls',
						'men',
						'women',
						'elderly_men',
						'elderly_women',
						'total',
						'createdAt',
						'updatedAt'
					],
					fieldNames = [
						'Project ID',
						'Report ID',
						'Cluster',
						'Organization',
						'Username',
						'Email',
						'HRP Code',
						'Project Title',
						'Project Code',
						'Country',
						'Admin1 Pcode',
						'Admin1 Name',
						'Admin2 Pcode',
						'Admin2 Name',
						'Admin3 Pcode',
						'Admin3 Name',
						'Site Implementation',
						'Site Type',
						'Location Name',
						'Report Month',
						'Report Year',
						'Activity Type',
						'Activity Description',
						'Indicator',
						'Category Type',
						'Beneficiary Type',
						'Beneficiary Category',
						'Strategic Objective',
						'Strategic Objective Description',
						'Sector Objective',
						'Sector Objective Description',
						'Population',
						'Amount',
						'Unit Type',
						'Cash Transfers',
						'Cash Delivery Type',
						'Households',
						'Families',
						'Boys',
						'Girls',
						'Men',
						'Women',
						'Elderly Men',
						'Elderly Women',
						'Total',
						'Created',
						'Last Update'
					];

			// beneficiaries
			Beneficiaries
				.find( )
				.where( { report_id: req.param( 'report_id' ) } )
				.exec(function( err, response ){

					// error
					if ( err ) return res.negotiate( err );

					// format  / sum
					response.forEach(function( d, i ){
						response[i].report_month = moment( response[i].reporting_period ).format( 'MMMM' );
						response[i].total = response[i].boys +
																response[i].girls +
																response[i].men +
																response[i].women +
																response[i].elderly_men +
																response[i].elderly_women;
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
						'stock_status_name',
						'number_in_stock',
						'number_in_pipeline',
						'unit_type_name',
						'beneficiaries_covered',
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
						'Status',
						'No. in Stock',
						'No. in Pipeline',
						'Units',
						'Beneficiary Coverage',
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
					});

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
      Trainings.find( findReport ),
      TrainingParticipants.find( findReport )
    ])
    .catch( function( err ) {
      return res.negotiate( err );
    })
    .then( function( result ) {

    	// gather results
    	var report = result[ 0 ];
    	var locations = result[ 1 ];
    	var beneficiaries = result[ 2 ];
    	var trainings = result[ 3 ];
    	var training_participants = result[ 4 ];

    	// placeholder
    	report.locations = [];

	    // async loop target_beneficiaries
	    async.each( locations, function ( location, next ) {

	    	// counter
	    	var locations_counter = 0;
	    	var locations_features = 2;

    		// set holders
    		location.beneficiaries = [];
    		location.trainings = [];

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

    		// trainings
    		if ( trainings.length ){
	    		async.each( trainings, function ( training, t_next ) {
	    			if ( location.id === training.location_id ) {
	    				// set holders
	    				training.training_participants = [];
	    				// participants
	    				if ( training_participants.length ){
								async.each( training_participants, function ( training_participant, tp_next ) { 						
	    						if ( training.id === training_participant.training_id ){
	    							training.training_participants.push( training_participant );
	    						}
	    						// next
	    						tp_next();
	    					}, function ( err ) {
						    	// error
						      if ( err ) return err;
			    				// push
			    				location.trainings.push( training );
									// next
    							t_next();
								});
	    				} else {
								// next
  							t_next();
	    				}
	    			} else {
	    				// next
	    				t_next();
	    			}
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

		// get report
		var report = req.param( 'report' );
		var locations = req.param( 'report' ).locations;

    // find
    var findProject = {
      project_id: report.project_id
    }
    var findReport = {
      report_id: report.id
    }
    var findLocation;
    var findTargetLocation;
    var findTraining;

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
		    	var locations_features = 2;

	    		// set beneficiaries / trainings
					var beneficiaries = location.beneficiaries;
					var trainings = location.trainings;

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
	        	
	        	// set result, update / create beneficiaries, trainings
	        	location = ReportController.set_result( result );
	        	findLocation = { location_id: location.id }
	        	findTargetLocation = { target_location_reference_id: location.target_location_reference_id }
		    		location.beneficiaries = [];
		    		location.trainings = [];

						// prepare for cloning
			      var location_copy = JSON.parse( JSON.stringify( location ) );
			      delete location_copy.id;

			      // async loop report beneficiaries
			      async.each( beneficiaries, function ( beneficiary, b_next ) {
			      	// clone
			      	var b = _under.extend( {}, report_copy, location_copy, beneficiary );
							// update or create
			        Beneficiaries.updateOrCreate( _under.extend( {}, findProject, findReport, findLocation, findTargetLocation ), { id: b.id }, b ).exec(function( err, result ){
			        	location.beneficiaries.push( ReportController.set_result( result ) );
			        	b_next();
			        });
			      }, function ( err ) {
			        if ( err ) return err;
				      // increment counter
				      set_next( location );
			      });

			     
			      // async loop report beneficiaries
			      async.each( trainings, function ( training, t_next ) {

			      	// clone
			      	var t = _under.extend( {}, report_copy, location_copy, training );

			      	// set beneficiaries / trainings
							var training_participants = t.training_participants;

							// update or create
			        Trainings.updateOrCreate( _under.extend( {}, findProject, findReport, findLocation, findTargetLocation ), { id: t.id }, t ).exec(function( err, result ){
			        	
			        	// set result, update / create beneficiaries, trainings
			        	t = ReportController.set_result( result );
			        	findTraining = { training_id: t.id }
			        	t.training_participants = [];

								// prepare for cloning
					      var triaining_copy = JSON.parse( JSON.stringify( t ) );
					      delete triaining_copy.id;
			        	
			        	// if training_participants
			        	if ( training_participants && training_participants.length ) {
				      		// async loop report beneficiaries
				      		async.each( training_participants, function ( training_participant, tp_next ) {
						      	// clone
						      	var t_participant = _under.extend( {}, report_copy, location_copy, triaining_copy, training_participant );
										// update or create
						        TrainingParticipants.updateOrCreate( _under.extend( {}, findProject, findReport, findLocation, findTargetLocation, findTraining ), { id: t_participant.id }, t_participant ).exec(function( err, result ){
						        	t.training_participants.push( ReportController.set_result( result ) );
						        	tp_next();
						        });
					        }, function ( err ) {
						        if ( err ) return err;
						        // push
						        location.trainings.push( t );
							      // increment counter
							      t_next();
						      });
					      } else {
						      // increment counter
						      t_next();
					      }

					    });
			      }, function ( err ) {
			        if ( err ) return err;
				      // increment counter
				      set_next( location );
			      });


	        });
	      }, function ( err ) {
	      	if ( err ) return err;
					return res.json( 200, report );
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

	// remove
	removeTrainingById: function( req, res ){

		// request input
		if ( !req.param( 'id' ) ) {
			return res.json(401, { err: 'id required!' });
		}

		// get report
		var $id = req.param( 'id' );

		// promise
    Promise.all([
      Trainings.destroy({ id: $id }),
      TrainingParticipants.destroy({ training_id: $id })
    ])
    .catch( function( err ) {
      return res.negotiate( err );
    })
    .then( function( result ) {
    	return res.json( 200, { msg: 'success' } );
    });

	},

	// remove
	removeTraineeById: function( req, res ){

		// request input
		if ( !req.param( 'id' ) ) {
			return res.json(401, { err: 'id required!' });
		}

		// get report
		var $id = req.param( 'id' );

		// destroy
		TrainingParticipants
			.destroy({ id: $id })
			.exec(function( err, b ){

				// return error
				if ( err ) return res.json({ err: true, error: err });

				// return reports
				return res.json( 200, { msg: 'success' } );

			});

	},

};

module.exports = ReportController;
