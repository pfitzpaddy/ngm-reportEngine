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
		project_code: {
			type: 'string'
		},
		// 2016
		project_type: {
			type: 'array'
		},
		project_type_other: {
			type: 'string'
		},
		project_description: {
			type: 'string'
		},
		// 2017
		activity_type: {
			type: 'string'
		},
		activity_description: {
			type: 'array'
		},
		project_donor: {
			type: 'array'
		},	
		project_donor_id: {
			type: 'string'
		},
		project_donor_name: {
			type: 'string'
		},
		project_title: {
			type: 'string',
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
		project_budget_amount_recieved: {
			type: 'integer',
			required: true
		},
		project_budget_date_recieved: {
			type: 'date',
			required: true
		}
	}

};

