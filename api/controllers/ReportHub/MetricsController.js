/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = MetricsController = {

  // get users
  getUsers: function (req, res) {

    // count
    User
      .count({})
      .exec( function( err, result ){

        // return error
        if ( err ) return res.negotiate( err );

        // return value
        return res.json( 200, { value: result } );

      });
  },

  getLocations: function (req, res) {

    // count
    TargetLocation
      .count({})
      .exec( function( err, result ){

        // return error
        if ( err ) return res.negotiate( err );

        // return value
        return res.json( 200, { value: result } );

      });
  },

  getReports: function (req, res) {

    // count
    Report
      .count({ report_status: 'complete' })
      .exec( function( err, result ){

        // return error
        if ( err ) return res.negotiate( err );

        // return value
        return res.json( 200, { value: result } );

      });
  },

  // Check provided email address and password
  set: function (req, res) {

    if (!req.param( 'organization' )
          || !req.param( 'username' )
          || !req.param( 'email' )
          || !req.param( 'dashboard' )
          || !req.param( 'theme' )
          || !req.param( 'url' )
          || !req.param( 'format' )) {
      return res.json(401, {err: 'Metric request missing params'});
    }

    Metrics.create({
      organization: req.param('organization'),
      username: req.param('username'),
      email: req.param('email'),
      dashboard: req.param('dashboard'),
      theme: req.param('theme'),
      url: req.param('url'),
      format: req.param('format')
    }).exec(function(err, user) {
      if (err) {
        res.json(err.status, {err: err});
        return;
      }
      if (user) {
        res.json({"metric": "success"});
      }
    });

  },

  // set metrics for api calls
  setApiMetrics: function (config, cb) {
    // default metrics
    config = _.extend({
      organization: 'public',
      email: 'public@immap.org',
      dashboard: 'api',
      theme: 'api',
      username: 'welcome',
      url: '/cluster/indicator',
      format: 'api/text/csv'
    }, config);

    Metrics.create(config).exec(function (err) {
      if (err) {
        cb(err);
      }
      cb();
    });
  },

  getPerformanceStatistics: async function( req, res ) {
    try {
      const Promise = require('bluebird');
      const moment = require('moment');
      // const _ = require('lodash');

      // request inputs
      let params = req.allParams();
      if (!params.admin0pcode || !moment(params.start_date).isValid() || !moment(params.end_date).isValid()) {
        return res.json(400, { error: { type: 'Invalid Parameters', message: 'admin0pcode, start_date, end_date required!'} });
      }
      if (moment(params.start_date) > moment(params.end_date).endOf('day')) {
        return res.json(400, { error: { type: 'Invalid Parameters', message: 'start_date should be greater than end_date!' } });
      }

      const hrp = params.hrp === 'true' ? true : false;

      let date = { $gte: moment(params.start_date).toDate(), $lt: moment(params.end_date).endOf('day').toDate() };
      let dateUpdated = { updatedAt: date };
      let dateCreated = { createdAt: date };
      let datePeriod  = { reporting_period: date };

      let admin0pcode =  params.admin0pcode.toLowerCase() === 'all' ? {} : { admin0pcode: params.admin0pcode.toUpperCase() };
      let admin0pcodeURL = params.admin0pcode.toLowerCase() === 'all' ? {} : { "url" :  { contains : "/" + params.admin0pcode.toLowerCase() + "/" }  };
      let admin0pcodeURL_Native = params.admin0pcode.toLowerCase() === 'all' ? {} : { "url" :  { $regex : "/" + params.admin0pcode.toLowerCase() + "/" }  };

      const $nin_organizations = [ 'immap', 'arcs' ];
      const $nin_organizations_metrics = [ 'iMMAP' ];

      let organization_tag =  { organization_tag: { $nin: $nin_organizations } };
      let organization =  { organization: { $nin: $nin_organizations_metrics } };

      let filterObject = _.extend({}, admin0pcode, organization_tag, hrp ? datePeriod : dateCreated);
      let filterObjectByDateCreated = _.extend({}, admin0pcode, organization_tag, dateCreated);
      let filterObjectByDateUpdated = _.extend({}, admin0pcode, organization_tag, dateUpdated);
      let filterObjectMetrics = _.extend({}, admin0pcodeURL, organization, dateCreated);
      let filterObjectMetricsNative = _.extend({}, admin0pcodeURL_Native, organization, dateCreated);

      // get value from calc
      const getResult = (array, prop) => array[0] ? array[0][prop] : 0;

      // queries

      let beneficiaries = new Promise((resolve, reject) => {
        Beneficiaries.native(function(err, collection) {
          if (err) reject(err)
          collection.aggregate([
            { $match : filterObject },
            { $group: { _id:  null,  sum: { $sum: "$total_beneficiaries" } } },
          ]).toArray(function (err, results) {
            if (err) reject(err)
            resolve(getResult(results, 'sum'));
          });
        })
      });

      let organizations = new Promise((resolve, reject) => {
        Beneficiaries.native(async function(err, collection) {
          if (err) reject(err);
          let results = await collection.distinct( "organization_id", filterObject  );
            resolve(results.length);
          });
      });

      let organizations_reported = new Promise((resolve, reject) => {
        Beneficiaries.native(async function(err, collection) {
          if (err) reject(err);
          let results = await collection.distinct( "organization", filterObject  );
            resolve(results);
          });
      });

      let organizations_reported_by_cluster_affiliation = new Promise((resolve, reject) => {
        Beneficiaries.native(function(err, collection) {
          if (err) reject(err)
          collection.aggregate([
            { $match : filterObject },
            { $group: { _id:  { cluster: "$cluster", organization: "$organization" } } },
            { $project: { cluster: "$_id.cluster", organization: "$_id.organization", _id: 0 } },
            { $group: { _id:  "$organization", clusters: { $addToSet: "$cluster" } } },
            { $project: { organization: "$_id", clusters: "$clusters", _id: 0 } },
            { $sort: { "organization" : 1 } }
          ]).toArray(function (err, results) {
            if (err) reject(err)
            resolve(results);
          });
        })
      });

      let organizations_reported_by_cluster = new Promise((resolve, reject) => {
        Beneficiaries.native(function(err, collection) {
          if (err) reject(err)
          collection.aggregate([
            { $match : filterObject },
            { $group: { _id:  { cluster: "$cluster", organization: "$organization" } } },
            { $project: { cluster: "$_id.cluster", organization: "$_id.organization", _id: 0 } },
            { $group: { _id:  "$cluster", count: { $sum: 1 } } },
            { $project: { cluster: "$_id", count: "$count", _id: 0 } }
          ]).toArray(function (err, results) {
            if (err) reject(err)
            resolve(results);
          });
        })
      });

      let reports = new Promise((resolve, reject) => {
        Beneficiaries.native(async function(err, collection) {
          if (err) reject(err)
          let results = await collection.distinct( "report_id", filterObject  );
            resolve(results.length);
          });
      });

      let reports_stocks = new Promise((resolve, reject) => {
        Stock.native(async function(err, collection) {
          if (err) reject(err)
          let results = await collection.distinct( "report_id", filterObject  );
            resolve(results.length);
          });
      });

      let organizations_stocks = new Promise((resolve, reject) => {
        Stock.native(async function(err, collection) {
          if (err) reject(err);
          let results = await collection.distinct( "organization_id", filterObject  );
            resolve(results.length);
          });
      });

      let organizations_total = await new Promise(async (resolve, reject) => {
          try {
            let beneficiaries = new Promise((resolve, reject) => {
              Beneficiaries.native(async function(err, collection) {
                if (err) reject(err);
                let results = await collection.distinct( "organization_id", filterObject  );
                resolve(results);
              });
            });

            let stocks = new Promise((resolve, reject) => {
              Stock.native(async function(err, collection) {
                if (err) reject(err);
                let results = await collection.distinct( "organization_id", filterObject  );
                resolve(results);
              });
            });
            let organizations = await Promise.all([beneficiaries, stocks])
            let total_orgs = organizations[0].concat(organizations[1]);
            let unique = [...new Set(total_orgs)];
            resolve(unique.length);
        } catch (err) {
          reject(err);
        }
      });

      let locations  = new Promise((resolve, reject) => {
        Beneficiaries.native(function(err, collection) {
          if (err) reject(err);

          collection.aggregate([
            {
              $match : filterObject
            },
            {
              $group: {
                _id: {
                  project_id: '$project_id',
                  site_lat: '$site_lat',
                  site_lng: '$site_lng',
                  site_name: '$site_name'
                }
              }
            },
            {
              $group: {
                _id: 1,
                total: {
                $sum: 1
                }
              }
            }
          ]).toArray(function (err, results) {
            if (err) reject(err);
            resolve(getResult(results, 'total'));
          });
        });
      });

      let projects_created = Project.count(filterObjectByDateCreated);
      let warehouses_created = StockWarehouse.count(filterObjectByDateCreated);

      // let users_registered = User.count( filterObject );
      let users_registered = new Promise((resolve, reject) => {
        UserLoginHistory.native(async function(err, collection) {
          if (err) reject(err)
          let results = await collection.distinct( "user_id", filterObjectByDateCreated );
            resolve(results.length);
          });
      });

      let users_registered_by_cluster = new Promise((resolve, reject) => {
          UserLoginHistory.native(function(err, collection) {
                if (err) reject(err)
                collection.aggregate([
                  { $match : filterObjectByDateCreated },
                  { $group: { _id:  "$cluster",  count: { $sum: 1 } } },
                  { $project: { cluster: "$_id", count: "$count", _id: 0 } }
                ]).toArray(function (err, results) {
                  if (err) reject(err)
                  resolve(results);
                });
          })
      });

      let users_by_cluster = new Promise((resolve, reject) => {
        UserLoginHistory.native(function(err, collection) {
              if (err) reject(err)
              collection.aggregate([
                { $match : filterObjectByDateUpdated },
                { $group: { _id:  "$cluster",  count: { $sum: 1 } } },
                { $project: { cluster: "$_id", count: "$count", _id: 0 } }
              ]).toArray(function (err, results) {
                if (err) reject(err)
                resolve(results);
              });
        })
      });

      let users = new Promise((resolve, reject) => {
        UserLoginHistory.native(async function(err, collection) {
          if (err) reject(err)
          let results = await collection.distinct( "user_id", filterObjectByDateUpdated );
            resolve(results.length);
          });
      });

      let metrics =  Metrics.count(filterObjectMetrics);

      let metrics_by_format = new Promise((resolve, reject) => {
        Metrics.native(function(err, collection) {
          if (err) reject(err)
          collection.aggregate([
            { $match : filterObjectMetricsNative },
            { $group: { _id:  "$format",  count: { $sum: 1 } } },
          ]).toArray(function (err, results) {
            if (err) reject(err);
            resolve(results);
          });
        })
      });

      // calculate queries
      let props = {
        beneficiaries,
        organizations,
        organizations_reported,
        organizations_reported_by_cluster,
        organizations_reported_by_cluster_affiliation,
        reports,
        locations,
        reports_stocks,
        organizations_stocks,
        organizations_total,
        reports_total: undefined,
        projects_created,
        warehouses_created,
        users_registered,
        users,
        users_registered_by_cluster,
        users_by_cluster,
        metrics,
        metrics_by_format
      };

      let data = await Promise.props(props);

      // process
      data.reports_total = data.reports + data.reports_stocks;
      data.organizations_reported_by_cluster_affiliation = data.organizations_reported_by_cluster_affiliation.map(o => ({ organization: o.organization, clusters: o.clusters.sort().join(', ') }));

      data.message = `From ${params.start_date} to ${params.end_date} included, partners reported ${data.beneficiaries} services to beneficiaries in ${data.locations} locations. `
        + `${data.organizations_total} organizations have created ${data.reports_total} reports. ReportHub recorded ${data.metrics} data accesses (data downloads, dashboard consultations). `
        + `iMMAP is proud to welcome ${data.users_registered} new users that joined ReportHub this month and thanks to the ${data.users} users using the system for the continuous trust they put into ReportHub.`;

      data.start_date = params.start_date;
      data.end_date = params.end_date;
      data.admin0pcode = params.admin0pcode.toUpperCase();
      data.version = hrp ? 'hrp' : 'timestamp';

      return res.json( 200, { data : data } );
   } catch (err) {
     return res.json(500, { error: { type: err.name, message: err.message } });
   }
  }

};
