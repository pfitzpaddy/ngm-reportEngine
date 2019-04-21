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
		// add a reference to Report
		report_id: {
			model: 'stockreport'
    },
    date_inactivated: {
      // location status
      type: 'date',
    },
    active: {
      // location status
      type: 'boolean',
    },
		report_month: {
			type: 'integer',
			required: true
		},
		report_year: {
			type: 'integer',
			required: true
		},
		stock_warehouse_id: {
			type: 'string',
			required: true
		},

    // project acbar
		project_acbar_partner: {
			type: 'boolean'
		},

		// user/project
		organization_id: {
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
		cluster_id: {
			type: 'string',
		},
		cluster: {
			type: 'string',
		},
		username: {
			type: 'string',
			required: true
		},
		email: {
			type: 'string',
			required: true
		},
		// region/country
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
		admin3pcode: {
			type: 'string'
		},
		admin3name: {
			type: 'string'
		},
		admin4pcode: {
			type: 'string'
		},
		admin4name: {
			type: 'string'
		},
		admin5pcode: {
			type: 'string'
		},
		admin5name: {
			type: 'string'
		},
		conflict: {
			type: 'boolean',
			required: true
		},
		site_name: {
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
		admin3lng: {
			type: 'float'
		},
		admin3lat: {
			type: 'float'
		},
		admin4lng: {
			type: 'float'
		},
		admin4lat: {
			type: 'float'
		},
		admin5lng: {
			type: 'float'
		},
		admin5lat: {
			type: 'float'
		},
		site_lng: {
			type: 'float',
			required: true
		},
		site_lat: {
			type: 'float',
      required: true
    },
    createdOn: {
      type: 'date'
    },


    // add reference to Beneficiaries
    stocks: {
      collection: 'stock',
      via: 'location_id'
    }
	}

};

