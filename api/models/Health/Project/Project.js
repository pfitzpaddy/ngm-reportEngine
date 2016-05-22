/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	// connection
	connection: 'ngmHealthClusterServer',

	// strict schema
	schema: true,

	// attributes
	attributes: {
		organization_id: {
			type: 'string',
			required: true
		},
		organization: {
			type: 'string',
			required: true
		},
		// add reference to Target beneficiaries
		target_beneficiaries: {
      collection: 'targetbeneficiaries',
      via: 'project_id'
		},		
    // add reference to Target Locations
    target_locations: {
      collection: 'targetlocation',
      via: 'project_id'
    },
		// add reference to Budget Progress
		project_budget_progress: {
      collection: 'budgetprogress',
      via: 'project_id'
		},    
    // add reference to financials ( if WHO associated project )
    financials: {
      collection: 'financial',
      via: 'project_id'
    },
		username: {
			type: 'string',
			required: true
		},
		email: {
			type: 'string',
			required: true
		},
		project_status: {
			type: 'string',
			defaultsTo: 'new'
		},
		project_title: {
			type: 'string',
			required: true
		},
		project_type: {
			type: 'array'
		},
		project_type_other: {
			type: 'string'
		},
		project_code: {
			type: 'string'
		},
		project_donor: {
			type: 'array'
		},
		project_donor_other: {
			type: 'string'
		},
		project_budget: {
			type: 'integer',
			required: true
		},
		project_budget_currency: {
			type: 'string',
			required: true
		},
		project_start_date: {
			type: 'date',
			required: true
		},
		project_end_date: {
			type: 'date',
			required: true
		},
		implementing_partners_checked: {
			type: 'boolean',
			defaultsTo: false
		},
		implementing_partners: {
			type: 'string'
		},
		project_description: {
			type: 'string',
			required: true
		},
		beneficiary_type: {
			type: 'array'
		},
		prov_code: {
			type: 'array',
			required: true
		},
		dist_code: {
			type: 'array',
			required: true
		}
	},

	// add reports to project with project locations
	afterCreate: function( $project, next ) {

		//
		updateReports( $project, next );

	},

	// add reports to project with project locations
	afterUpdate: function( $project, next ) {

		//
		updateReports( $project, next );

	}

};

// update reports
function updateReports( $project, next ) {

		// get new project
		Project.findOne().where( { id: $project.id } ).populateAll().exec( function( err, project ){

			// return error
			if ( err ) return next( err );

			// project start and end date
			var moment = require('moment'),
					$reports = [],
					report_active,
					s_date = moment( project.project_start_date ),
					e_date = moment( project.project_end_date );

			// number of reports
			var reports_duration = moment.duration( e_date.diff( s_date ) ).asMonths().toFixed( 0 );

			// for each report month
			for ( m = 0; m < reports_duration; m++ ) {

				// default is active
				report_active = true;

				// should be reports just for 2016 period!
				if ( moment( s_date ).add( m, 'M' ).year() < 2016  ) {
					report_active = false;
				}

				// report_status 'todo' open from 15th of every month
				var report_status = moment().diff( moment( s_date ).add( m, 'M' ).startOf('month').add( 15, 'd' ) ) >= 0 ? 'todo' : 'pending';

				// create report
				$reports.push({
					// defaults 
					project_id: project.id,
					organization_id: project.organization_id,
					organization: project.organization,
					username: project.username,
					email: project.email,
					project_title: project.project_title,
					project_type: project.project_type,
					report_status: report_status,
					report_active: report_active,
					report_month: moment( s_date ).add( m, 'M' ).month(),
					report_year: moment( s_date ).add( m, 'M' ).year(),
					reporting_period: moment( s_date ).add( m, 'M' ).set('date', 1).format(),
					reporting_due_date: moment( s_date ).add( m+1, 'M' ).set('date', 15).format(),
					locations: []
				});

			}

			// if target_locations exist
			if ( project.target_locations.length ) {

				// for each report
				$reports.forEach( function( report, r_index ) {

					// for each project location
					project.target_locations.forEach( function( location, l_index ) {

						// clone target_location
						var l = location.toObject();
						delete l.id;

						// add location placeholder
						$reports[r_index].locations.push( l );

					});

					// set all reports_active to false
					// Report.update( { project_id: $reports[ r_index ].project_id }, { report_active: false, locations: $reports[r_index].locations } )
					Report.update( { project_id: $reports[ r_index ].project_id }, { report_active: false } )
						.exec( function( err, update_reports ) {

			      // return cb ( error )
			      if ( err ) return next( err );

		    		// findOrCreate
		    		Report
		    			.findOrCreate( { project_id: $reports[ r_index ].project_id,
		    												report_month: $reports[ r_index ].report_month, 
		    												report_year: $reports[ r_index ].report_year 
		    										}, $reports[ r_index ] ).exec( function( err, report ) {

				      // return cb ( error )
				      if ( err ) return next( err );
				      
				      // update reports between project start and end dates back to 'active'
				      if ( ( report.report_year >= 2016  ) && ( moment( s_date ).month() >= report.report_month <= moment( e_date ).month() ) ) {
				      	// set to false
				      	report.report_active = true;
				      	// save
				      	report.save();
				      	
				      }

				      // return once all reports updated
				      if ( r_index === $reports.length-1  ) {

					      // return cb
					      next();

				      }

				    });

		    	});

				});

		  } else {
		      
				// return cb
				next();

		  }

	  });

	}
