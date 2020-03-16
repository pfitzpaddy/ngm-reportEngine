/**
* Report.js
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
			type: 'string'
		},
		email: {
			type: 'string'
		},
		report_active: {
			type: 'boolean',
			defaultsTo: true
		},
		report_status: {
			type: 'string',
			defaultsTo: 'todo'
		},
		report_month: {
			type: 'integer',
			required: true
		},
		report_year: {
			type: 'integer',
			required: true
		},
		report_submitted: {
			type: 'date'
		},
		reporting_period: {
			type: 'date',
			required: true
		},
		reporting_due_date: {
			type: 'date',
			required: true
		},

    // project acbar
		project_acbar_partner: {
			type: 'boolean'
		},

    notes: {
    	type: 'string'
    }

	},

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
