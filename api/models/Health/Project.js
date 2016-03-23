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
		project_title: {
			type: 'string',
			defaultsTo: 'New Project'
		},
		project_type: {
			type: 'string'
		},
		project_description: {
			type: 'string',
			defaultsTo: 'Complete the project details to register a new project'
		},
		prov_code: {
			type: 'array'
		},
		dist_code: {
			type: 'array'
		},
		beneficiary_category: {
			type: 'array'
		},
		project_budget: {
			type: 'integer'
		},
		project_budget_progress: {
			type: 'integer'
		},		
		project_donor: {
			type: 'string'
		},
		project_status: {
			type: 'string',
			defaultsTo: 'new'
		},
		project_start_date: {
			type: 'date',
      defaultsTo: function () {
          return new Date();
      }
		},
		project_end_date: {
			type: 'date',
      defaultsTo: function () {
      	var d = new Date();
        return new Date(d.getFullYear(), d.getMonth() + 1, d.getDate());
      }
		},		
	}

};

