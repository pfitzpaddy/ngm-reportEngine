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
		organization_id: {
			type: 'string',
			required: true
		},
		organization: {
			type: 'string',
			required: true
		},
		// add a reference to Project
		project_id: {
			model: 'project'
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

