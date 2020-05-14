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

    this.createStockLocations(values, cb);

  },

  afterUpdate: async function(value, cb) {
    try {
      let w = { ...value };
      delete w.updatedAt;
      delete w.createdAt;
      delete w.organization_id;
      delete w.id;

      // update relations
      await Promise.all([
        StockLocation.update({ "stock_warehouse_id": value.id }, w),
        Stock.update({ "stock_warehouse_id": value.id }, w),
      ]);

      // uncomment if warehouse_start_date or warehouse_end_date updated
      // await this.createStockLocations(value, (err) => { if(err) throw new Error(err); })

      cb();
    } catch (err) {
      cb(err);
    }
  },

  // updateOrCreate
  // http://stackoverflow.com/questions/25936910/sails-js-model-insert-or-update-records
  updateOrCreate: function( parent, criteria, values ){
    var self = this; // reference for use by callbacks

    // if exists
    if( criteria.id ){
      // update if updated flag is set otherwise skip
      if ( values.updated ) {
        return self.update( criteria, values );
      } else return values;
    }else{
      // set relation
      for ( key in parent ){ values[ key ] = parent[ key ]; }
      return self.create( values );
    }

  },

  createStockLocations: async function (warehouse, cb) {

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
      let warehouse_copy = JSON.parse( JSON.stringify( warehouse ) );
      warehouse_copy.stock_warehouse_id = warehouse_copy.id;
      const organization_id = warehouse_copy.organization_id;
      delete warehouse_copy.id;
      delete warehouse_copy.createdAt;
      delete warehouse_copy.updatedAt;
      // uncomment for _.merge( {}, organization, report )
      let organization = await Organization.findOne({ id: organization_id })
      delete organization.id;


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
              report = _.merge( {}, organization, report );
              return report;
      });

      const db_promises = reports_array
        .map(async function (report) {

          let new_report = await StockReport.findOrCreate({
            organization_id: report.organization_id,
            report_month: report.report_month,
            report_year: report.report_year
          }, report);

          let l_warehouse_copy = _.merge({}, warehouse_copy, { report_month: new_report.report_month, report_year: new_report.report_year, report_id: new_report.id });

          await StockLocation.findOrCreate({ stock_warehouse_id: l_warehouse_copy.stock_warehouse_id, report_id: new_report.id }, l_warehouse_copy);

        });

      await Promise.all(db_promises);
      cb();
    } catch (err) {
      cb(err);
    }
  }

};

