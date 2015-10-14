/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // Check provided email address and password
  set: function (req, res) {

    if (!req.param( 'organisation' ) 
          || !req.param( 'username' ) 
          || !req.param( 'email' ) 
          || !req.param( 'dashboard' ) 
          || !req.param( 'theme' ) 
          || !req.param( 'url' )
          || !req.param( 'format' )) {
      return res.json(401, {err: 'Metric request missing params'});
    }

    Metrics.create({
      organisation: req.param('organisation'),
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
    
  }

};
