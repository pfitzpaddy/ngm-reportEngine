/**
* BudgetProgress.js
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
		// region/country id
    adminRpcode: {
			type: 'string',
			required: true
    },
    adminRname: {
			type: 'string',
			required: true
    },
    admin0pcode: {
			type: 'string',
			required: true
    },
    admin0name: {
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
		cluster_id: {
			type: 'string',
			required: true
		},
		cluster: {
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

		// add a reference to Project
		project_id: {
			model: 'project'
		},

		// project
		project_status: {
			type: 'string'
		},
		project_title: {
			type: 'string',
			required: true
		},
		project_description: {
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
		project_budget: {
			type: 'integer',
			required: true
		},
		project_budget_currency: {
			type: 'string',
			required: true
		},
		project_rnr_chapter: {
			type: 'boolean',
			defaultsTo: false
		},
		activity_type: {
			type: 'array',
			required: true
		},
		activity_description: {
			type: 'array'
		},

		// SOs
		strategic_objectives: {
			type: 'array'
		},

		// target beneficiaries
		category_type: {
			type: 'array'
		},
		beneficiary_type: {
			type: 'array',
			required: true
		},

		// target locations
		admin1pcode: {
			type: 'array',
			required: true
		},
		admin2pcode: {
			type: 'array',
			required: true
		},

		// budget item
		project_donor_id: {
			type: 'string'
		},
		project_donor_name: {
			type: 'string'
		},
		project_budget_currency: {
			type: 'string',
			required: true
		},
		project_budget_amount_recieved: {
			type: 'integer',
			required: true
		},
		project_budget_date_recieved: {
			type: 'date',
			required: true
		},




		/*********** 2016 *************/
		project_code: {
			type: 'string'
		},
		project_type: {
			type: 'array'
		},
		project_type_other: {
			type: 'string'
		}

	}

};

