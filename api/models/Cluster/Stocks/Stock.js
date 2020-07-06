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
      type: 'string',
			required: true
    },

    // project acbar
		project_acbar_partner: {
			type: 'boolean'
		},

    // warehouse id
    stock_warehouse_id: {
			type: 'string',
			required: true
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
			required: true
    },
    donors: {
			type: 'array'
    },
    implementing_partners: {
			type: 'array'
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
    report_active: {
			type: 'boolean',
			defaultsTo: true
		},
		report_status: {
			type: 'string',
			defaultsTo: 'todo'
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

    // stocks
    stock_type_id: {
      type: 'string',
      defaultsTo: 'stock'
    },
    stock_type_name: {
      type: 'string',
      defaultsTo: 'Stock'
    },
		stock_item_type: {
			type: 'string',
			required: true
		},
		stock_item_name: {
			type: 'string'
    },
    stock_details: {
			type: 'array'
    },
    stock_item_purpose_id: {
			type: 'string',
    },
    stock_item_purpose_name: {
			type: 'string',
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
		stock_targeted_groups_id:{
			type:'string'
		},
		stock_targeted_groups_name: {
			type: 'string'
		},
		beneficiaries_covered:{
			type: 'integer',
			required: true
    },
    // households_covered:{
		// 	type: 'integer',
    // },

    // Remarks
		remarks: {
			type: 'string'
		},

  },

    // updateOrCreate
    // http://stackoverflow.com/questions/25936910/sails-js-model-insert-or-update-records
    updateOrCreate: function( parent, criteria, values ){
      var self = this; // reference for use by callbacks

      // if exists
      if( criteria.id ){
        return self.update( criteria, values );
      }else{
        // set relation
        for ( key in parent ){ values[ key ] = parent[ key ]; }
        return self.create( values );
      }

    }

};

