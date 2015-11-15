/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  register: function(req, res) {
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
        organisation: req.param('organisation'),
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
            organisation: user.organisation,
            username: user.username,
            email: user.email,
            roles: user.roles
          });
        }
      });

    });
  }

};
