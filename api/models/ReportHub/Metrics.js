/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	// strict schema
	attributes: {
    admin0pcode: {
			type: 'string',
			required: true
    },
    admin0name: {
			type: 'string',
			required: true
    },
		organisation: {
			type: 'string',
			required: false
		},
		username: {
			type: 'string',
			required: true
		},
		email: {
			type: 'email',
			required: true
		},
		dashboard: {
			type: 'string',
			required: true
		},
		theme: {
			type: 'string',
			required: true
		},
		url: {
			type: 'string',
			required: true
		},
		format: {
			type: 'string',
			required: true
		}	
	}

};

