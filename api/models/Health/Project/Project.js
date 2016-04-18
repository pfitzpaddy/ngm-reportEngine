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
    // add reference to financials
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
			type: 'array',
			required: true
		},
		project_donor: {
			type: 'array',
			required: true
		},
		project_budget_currency: {
			type: 'string',
			required: true
		},
		project_budget: {
			type: 'integer',
			required: true
		},
		project_budget_recieved: {
			type: 'integer'
		},
		project_budget_spent: {
			type: 'integer'
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
			type: 'array',
			required: true			
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

	// add project_id from locations 
	afterCreate: function( $project, next ) {

		// get new project
		Project.findOne().where( { id: $project.id } ).populateAll().exec( function( err, project ){

			// return error
			if ( err ) return next( err );			

			// project start and end date
			var moment = require('moment'),
					s_date = moment( project.project_start_date ),
					e_date = moment( project.project_end_date );

			// number of reports
			var reports = moment.duration( e_date.diff( s_date ) ).asMonths().toFixed( 0 );

			// project reports
			$reports = [];

			// for each report month
			for ( m = 0; m < reports; m++ ) {

				// status
				var report_status = moment().diff( moment( s_date ).add( m, 'M' ) ) >= 0 ? 'todo' : 'pending';

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
					report_month: moment( s_date ).add( m, 'M' ).month(),
					report_year: moment( s_date ).add( m, 'M' ).year(),
					reporting_period: moment( s_date ).add( m, 'M' ).set('date', 1).format( 'YYYY-MM-DD' ),
					reporting_due_date: moment( s_date ).add( m+1, 'M' ).set('date', 10).format( 'YYYY-MM-DD' ),
					locations: []
				});

			}

			// for each report
			$reports.forEach( function( report, r_index ){

				// for each project location
				project.target_locations.forEach( function( location, l_index ){

					// add location placeholder
					$reports[r_index].locations.push({
						organization_id: project.organization_id,
						organization: project.organization,
						project_id: project.id,
						username: project.username,
						email: project.email,
						project_title: project.project_title,
						project_type: project.project_type,
						prov_code: location.prov_code,
						prov_name: location.prov_name,
						dist_code: location.dist_code,
						dist_name: location.dist_name,
						conflict: location.conflict,
						fac_type: location.fac_type,
						fac_name: location.fac_name,
						lat: location.lat,
						lng: location.lng
					});

				});

			});

	    // create
	    Report.create( $reports ).exec( function( err, report ){

	      // return cb ( error )
	      if ( err ) return next( err );

	      // return cb
	      next();

	    });

	  });

	},

	// beforeUpdate: function( $project, next ) {

	// 	// fetch all reports by project

	// 	// from the start of the project till the end
			
	// 		// make a report for each month

	// 			// if month exists 

	// 				// use that

	// 			// else
				
	// 				// each month has each location

	// 				// each location has empty beneficiaries ( maybe not necissary here )

	// 	// 'next!'
	// 	// next();

	// }

};

