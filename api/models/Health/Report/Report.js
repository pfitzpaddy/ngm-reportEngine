/**
* Report.js
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
		project_id: {
			type: 'string',
			required: true
		},
		organization_id: {
			type: 'string',
			required: true
		},
		organization: {
			type: 'string',
			required: true
		},
		username: {
			type: 'string',
			required: true
		},
		email: {
			type: 'string',
			required: true
		},
		report_active: {
			type: 'boolean',
			defaultsTo: true
		},
		report_status: {
			type: 'string',
			defaultsTo: 'todo'
		},
		report_month: {
			type: 'integer',
			required: true
		},
		report_year: {
			type: 'integer',
			required: true
		},
		reporting_period: {
			type: 'date',
			required: true
		},
		reporting_due_date: {
			type: 'date',
			required: true
		},
		report_submitted: {
			type: 'date'
		},
		project_title: {
			type: 'string',
			required: true
		},
		project_type: {
			type: 'array',
			required: true
		},
    // add reference to Locations
    locations: {
      collection: 'location',
      via: 'report_id'
    },
    notes: {
    	type: 'string'
    }
	}

};

