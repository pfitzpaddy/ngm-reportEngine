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
		project_budget_usd: {
			type: 'integer',
			required: true
		},
		project_budget_afn: {
			type: 'integer',
			required: true
		},
		project_budget_progress: {
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
			type: 'boolean'
		},
		implementing_partners: {
			type: 'string'
		},
		project_description: {
			type: 'string',
			required: true
		},
		// add reference to target beneficiaries
		target_beneficiaries: {
      collection: 'targetbeneficiaries',
      via: 'project_id'
		},
		prov_code: {
			type: 'array',
			required: true
		},
		dist_code: {
			type: 'array',
			required: true
		},
    // add reference to Locations
    locations: {
      collection: 'location',
      via: 'project_id'
    },
    // add reference to financials
    financials: {
      collection: 'financial',
      via: 'project_id'
    }
	}

};

