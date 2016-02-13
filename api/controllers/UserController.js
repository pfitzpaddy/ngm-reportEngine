/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  create: function(req, res) {
    //
    // if (req.param('password') !== req.param('confirmPassword')) {
    //   return res.json(401, {err: 'Password doesn\'t match'});
    // }

    // try to look up user using the provided username/email address
    User.findOne({
      or: [{
          username: req.param( 'username' )
        },{
          email: req.param( 'password' )
        }]
    }, function foundUser( err, user ) {
      if (user) {
        return res.json(401, {err: 'User already exists! Forgot password?'});
      }

      User.create({
        organization: req.param('organization'),
        username: req.param('username'),
        email: req.param('email'), 
        password: req.param('password')
      }).exec(function(err, user) {
        if (err) {
          res.json(err.status, {err: err});
          return;
        }
        if (user) {
          res.json({
            id: user.id,
            token: jwtToken.issueToken({sid: user.id}),
            organization_id: user.organization_id,
            organization: user.organization,
            username: user.username,
            email: user.email,
            roles: user.roles,
            app_home: user.app_home,
            menu: user.menu
          });
        }
      });

    });
  }

};
