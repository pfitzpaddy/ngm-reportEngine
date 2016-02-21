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
		project_id: {
			type: 'string',
			required: true
		},
		activity_type: {
			type: 'string'
		},
		activity_description: {
			type: 'string'			
		}
	}

};

