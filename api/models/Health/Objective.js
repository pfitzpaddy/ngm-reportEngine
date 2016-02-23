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
		username: {
			type: 'string',
			required: true
		},		
		organization_id: {
			type: 'string',
			required: true
		},
		project_id: {
			type: 'string',
			required: true
		},
		indicator_one_id: {
			type: 'string',
			defaultsTo: 'people_served_fatp_services'
		},		
		indicator_one: {
			type: 'integer',
			defaultsTo: 0
		},
		indicator_two_id: {
			type: 'string',
			defaultsTo: 'people_served_conflict_white_areas'
		},		
		indicator_two: {
			type: 'integer',
			defaultsTo: 0
		},
		indicator_three_id: {
			type: 'string',
			defaultsTo: 'alarms_investigated_within_48_hours'
		},		
		indicator_three: {
			type: 'integer'
		},
		indicator_three_total: {
			type: 'integer'
		},		
		indicator_four_id: {
			type: 'string',
			defaultsTo: 'people_served_natural_disasters'
		},		
		indicator_four: {
			type: 'integer',
			defaultsTo: 0
		}
	}

};

