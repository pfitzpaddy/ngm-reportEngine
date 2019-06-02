/**
* UserLoginHistory.js
*
* @description :: Model to collect user logins.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	// strict schema
	schema: true,

	// attributes
	attributes: {
		// master table user id
        user_id: {
            type: 'string',
            required: true
        },
            // region/country id
        adminRpcode: {
            type: 'string',
            required: true
        },
        adminRname: {
            type: 'string',
            required: true
        },
        adminRtype_name: {
            type: 'string'
        },
        admin0pcode: {
            type: 'string',
            required: true
        },
        admin0name: {
            type: 'string',
            required: true
        },
        admin0type_name: {
            type: 'string'
        },
        admin1pcode: {
            type: 'string'
        },
        admin1name: {
            type: 'string'
        },
        admin1type_name: {
            type: 'string'
        },
        organization_id: {
            type: 'string'
        },
        organization_type: {
            type: 'string'
        },
        organization_name: {
            type: 'string'
        },
        organization_tag: {
            type: 'string',
            required: true
        },
        organization: {
            type: 'string',
            required: true
        },
        cluster_id: {
            type: 'string',
            required: true
        },
        cluster: {
            type: 'string',
            required: true
        },
        contract_start_date: {
            type: 'date'
        },
        contract_end_date: {
            type: 'date'
        },
        programme_id: {
            type: 'string'
        },
        programme_name: {
            type: 'string'
        },
        username: {
            type: 'string',
            unique: true,
            required: true
        },
        name: {
            type: 'string',
            required: true
        },
        position: {
            type: 'string',
            required: true
        },
        phone: {
            type: 'string',
            required: true
        },
        skype: {
            type: 'string'
        },
        email: {
            type: 'string',
            unique: true,
            required: true
        },
        roles: {
            type: 'array',
            defaultsTo: [ "USER" ]
        },
        visits: {
            type: 'integer',
            defaultsTo: 1
        },
        site_class: {
            type: 'string'
        },
        site_type_id: {
            type: 'string'
        },
        site_type_name: {
            type: 'string'
        },
        site_status: {
            type: 'string'
        },
        site_name: {
            type: 'string'
        },
        adminRlng: {
            type: 'float'
        },
        adminRlat: {
            type: 'float'
        },
        admin0lng: {
            type: 'float'
        },
        admin0lat: {
            type: 'float'
        },
        admin1lng: {
            type: 'float'
        },
        admin1lat: {
            type: 'float'
        },
        site_lng: {
            type: 'float'
        },
        site_lat: {
            type: 'float'
        }

	},

};

