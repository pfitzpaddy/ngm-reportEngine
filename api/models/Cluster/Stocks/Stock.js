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
      model: 'stocklocation'
    },

		// user/project
		organization_id: {
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
		username: {
			type: 'string',
			required: true
		},
		email: {
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
    admin0pcode: {
			type: 'string',
			required: true
    },
    admin0name: {
			type: 'string',
			required: true
    },
		admin1pcode: {
			type: 'string',
			required: true
		},
		admin1name: {
			type: 'string',
			required: true
		},
		admin2pcode: {
			type: 'string',
			required: true
		},
		admin2name: {
			type: 'string',
			required: true
		},
		
		// reports
		report_id: {
			type: 'string',
			required: true
		},
		report_month: {
			type: 'integer',
			required: true
		},
		report_year: {
			type: 'integer',
			required: true
		},
		reporting_period: {
			type: 'date',
			required: true
		},
		conflict: {
			type: 'boolean',
			required: true
		},
		fac_name: {
			type: 'string',
			required: true
		},
		admin1lng: {
			type: 'float',
			required: true
		},
		admin1lat: {
			type: 'float',
			required: true
		},
		admin2lng: {
			type: 'float',
			required: true
		},
		admin2lat: {
			type: 'float',
			required: true
		},

		// stocks
		stock_item_type: {
			type: 'string',
			required: true
		},
		stock_item_name: {
			type: 'string'
		},
		unit_type_id: {
			type: 'string'
		},
		unit_type_name: {
			type: 'string'
		},
		number_in_stock: {
			type: 'integer',
			required: true
		},
		number_in_pipeline: {
			type: 'integer',
			required: true
		},
		stock_status_id: {
			type: 'string',
		},
		stock_status_name: {
			type: 'string'
		},
		beneficiaries_covered:{
			type: 'integer',
			required: true
		}

	}

};

