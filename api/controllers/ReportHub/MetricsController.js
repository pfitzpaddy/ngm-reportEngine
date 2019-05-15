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
  }

};
