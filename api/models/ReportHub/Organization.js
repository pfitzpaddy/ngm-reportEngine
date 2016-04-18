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
		organization_name: {
			type: 'string',
			required: true
		},
		organization_display_name: {
			type: 'string',
			required: true
		},
	}

};

