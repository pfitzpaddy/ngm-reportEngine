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

		// add a reference to Location
    location_id: {
      model: 'location'
    },
		organization_id: {
			type: 'string',
			required: true
		},
		organization: {
			type: 'string',
			required: true
		},
		project_id: {
			type: 'string',
			required: true
		},
		project_title: {
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
		beneficiary_name: {
			type: 'string',
			required: true
		},
		beneficiary_category: {
			type: 'string',
			required: true
		},		
		under18male:{
			type: 'integer',
			defaultsTo: 0			
		},
		under18female:{
			type: 'integer',
			defaultsTo: 0
		},
		over18male:{
			type: 'integer',
			defaultsTo: 0
		},
		over18female:{
			type: 'integer',
			defaultsTo: 0
		},
		over59male:{
			type: 'integer',
			defaultsTo: 0
		},
		over59female:{
			type: 'integer',
			defaultsTo: 0
		}

	}

};

