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
		organization_type: {
			type: 'string',
			required: true
		},
		organization_name: {
			type: 'string',
			required: true
		},
		organization_tag: {
			type: 'string',
			required: true
		},
		organization: {
			type: 'string',
			required: true
		},
		// cluster_id: {
		// 	type: 'string',
		// 	required: true
		// },
		// cluster: {
		// 	type: 'string',
		// 	required: true
		// },
		project_acbar_partner: {
			type: 'boolean'
    },

    closed_registration: {
			type: 'boolean'
		},
	}

};

