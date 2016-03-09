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
		prov_code: {
			type: 'integer',
			required: true
		},
		prov_name: {
			type: 'string',
			required: true
		},
		dist_code: {
			type: 'integer',
			required: true
		},
		dist_name: {
			type: 'string',
			required: true
		},
		fac_id: {
			type: 'integer',
			required: true
		},
		fac_type: {
			type: 'string',
			required: true
		},
		fac_name: {
			type: 'string',
			required: true
		},
		lng: {
			type: 'float',
			required: true
		},
		lat: {
			type: 'float',
			required: true
		}						
	}

};

