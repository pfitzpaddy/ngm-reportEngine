/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var moment = require('moment');
var _ = require('lodash');

module.exports = {

	// connection
	connection: 'ngmHealthClusterServer',

	// strict schema
	schema: true,

	// attributes
	attributes: {
		// relation
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

    // project acbar
		project_acbar_partner: {
			type: 'boolean'
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
		}

	},

  // after create - create reports & locations
  afterCreate: function (values, cb) {

    createStockLocations(values, cb);

  },

  // updateOrCreate
  // http://stackoverflow.com/questions/25936910/sails-js-model-insert-or-update-records
  updateOrCreate: function( parent, criteria, values ){
    var self = this; // reference for use by callbacks

    // if exists
    if( criteria.id ){
      // uncomment if warehouses updated
      // return self.update( criteria, values );
      return values;
    }else{
      // set relation
      for ( key in parent ){ values[ key ] = parent[ key ]; }
      return self.create( values );
    }

  }

};


async function createStockLocations(warehouse, cb) {
  console.log('start_stock_generation',warehouse)

  try {

    // dates
    const start_date = warehouse.warehouse_start_date ? moment( warehouse.warehouse_start_date ).startOf('month') : moment().startOf('year')
    const end_date = warehouse.warehouse_end_date ? moment( warehouse.warehouse_end_date ).endOf( 'M' ) :  moment().endOf( 'M' );
    const reports_end = moment().endOf( 'M' );
    const s_date = start_date < reports_end ? start_date : reports_end;
    const e_date = end_date < reports_end ? end_date : reports_end;
    const reports_duration = moment.duration( e_date.diff( s_date ) ).asMonths().toFixed(0);
    var reports_array = Array(parseInt( reports_duration )).fill().map((item, index) => 0 + index);


    // prepare for stocklocations
    warehouse.stock_warehouse_id = warehouse.id;
    const organization_id = warehouse.organization_id;
    delete warehouse.id;
    delete warehouse.createdAt;
    delete warehouse.updatedAt;
    // // uncomment for _.merge( {}, organization, report )
    // let organization = await Organization.findOne({ id: organization_id })
    // delete organization.id;


    reports_array = reports_array.map(m => {
            report = {
              report_status: 'todo',
              report_active: true,
              report_month: moment(s_date).add( m, 'M' ).month(),
              report_year: moment(s_date).add( m, 'M' ).year(),
              reporting_period: moment(s_date).add( m, 'M' ).set('date', 1).format(),
              reporting_due_date: moment(s_date).add( m+1, 'M' ).set('date', 10 ).format(),
              organization_id : organization_id
            };
            // report = _.merge( {}, organization, report )
            return report;
    });

    const db_promises = reports_array
      .map(async function (report) {
        var new_report = await StockReport.findOrCreate({
          organization_id: report.organization_id,
          report_month: report.report_month,
          report_year: report.report_year
        }, report);
        var warehouse_copy = _.merge({}, warehouse, { report_month: new_report.report_month, report_year: new_report.report_year, report_id: new_report.id });
        await StockLocation.create(warehouse_copy);
      });

    await Promise.all(db_promises);
    cb();
  } catch (err) {
    cb(err);
  }
};

