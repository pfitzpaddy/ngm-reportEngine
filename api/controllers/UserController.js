/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  create: function(req, res) {

    // check params
    if (!req.param( 'user' )) {
      return res.json(401, { err: 'user required!' });
    }

    // try to look up user using the provided username/email address
    User.findOne({
      or: [{
          username: req.param( 'user' ).username
        },{
          email: req.param( 'user' ).email
        }]
    }, function foundUser( err, user ) {

      // user exists
      if (user) return res.json(401, {err: 'User already exists! Forgot password?'});

      // else create user
      User.create(req.param( 'user' )).exec(function(err, user) {
        if (err) return res.negotiate( err );
      
        // set token
        user.token = jwtToken.issueToken({sid: user.id});

        //  return user
        res.json(200, user);

      });

    });
  
  },

  // Check provided email address and password
  login: function (req, res) {

    // check params
    if (!req.param( 'user' )) {
      return res.json(401, { err: 'user required' });
    }

    // try to look up user using the provided username/email address
    User.findOne({
      or: [{
          username: req.param( 'user' ).username
        },{
          email: req.param( 'user' ).email
        }]
    }, function foundUser( err, user ) {
      if (err) return res.negotiate( err );
      if (!user) return res.notFound();

      // compare params passpwrd to the encrypted db password
      require( 'machinepack-passwords' ).checkPassword({
        passwordAttempt: req.param( 'user' ).password,
        encryptedPassword: user.password
      }).exec({

        // error
        error: function ( err ){
          return res.negotiate( err );
        },

        // password incorrect
        incorrect: function (){
          return res.notFound();
        },

        // on success
        success: function (){

          // update visit information
          user.visits = user.visits + 1;
          user.last_logged_in = new Date();

          // save updates
          user.save(function(err) {
            if(err) return res.negotiate( err );
          });

          // add token
          user.token = jwtToken.issueToken({sid: user.id});

          // Send back user with token
          return res.json(200, user);
        }
      });
    });

  }

};
