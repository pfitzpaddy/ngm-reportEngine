/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	// strict schema
	schema: true,

	// attributes
	attributes: {
		organization_id: {
			type: 'string',
			required: true
		},
		user_id: {
			type: 'integer',
			required: true			
		},
		username: {
			type: 'string',
			required: true			
		},		
		project_name: {
			type: 'string'
		},
		project_description: {
			type: 'string'
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

