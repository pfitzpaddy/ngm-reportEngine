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
      if (user) return res.json(401, { err: 'User already exists! Forgot password?' });

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

  },

  // 
  passwordResetEmail: function(req, res){

    // check params
    if ( !req.param( 'user' ) || !req.param( 'url' ) ) {
      return res.json(401, { err: 'user, url required' });
    }
    
    // get user by email
    User.findOne({ email: req.param( 'user' ).email }).exec(function(err, user){

      // return error
      if (err) return res.negotiate( err );

      // return error
      if (!user) return res.json(401, { err: 'User not found!' });

      // reset user
      var userReset = {
        organization_id: user.organization_id,
        organization: user.organization,
        user_id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        token: jwtToken.issueToken({sid: user.id})
      }

      UserReset.create(userReset).exec(function(err, reset) {

        // return error
        if (err) return res.negotiate( err );

        // send email
        sails.hooks.email.send(
          'email',
          {
            recipientName: reset.name,
            senderName: 'ReportHub',
            url: req.param( 'url' ) + reset.token,
          },
          {
            to: reset.email,
            subject: 'ReportHub Password Reset'
          },
          function(err) { 
            
            // return error
            if (err) return res.negotiate( err );

            // email sent
            return res.json(200, {'data': 'success' });

          }
        );

      }); 

    });

  },

  // 
  passwordReset: function(req, res){

    // check params
    if ( !req.param( 'reset' ) || !req.param( 'token' ) ) {
      return res.json(401, { err: 'user, token required' });
    }

    // get reser user by username
    UserReset.findOne({ token: req.param( 'token' ) }).exec(function(err, userReset){

      // return error
      if (err) return res.negotiate( err );

      // return error
      if (!userReset) return res.json(401, { err: 'Reset token not found!' });

      // get user with userReset params
      User.findOne({ email: userReset.email }).exec(function(err, user){

        // return error
        if (err) return res.negotiate( err );

        // update newPassword
        require( 'bcrypt' ).hash( req.param( 'reset' ).newPassword, 10, function passwordEncrypted( err, encryptedPassword ) {

          if ( err ) return res.json(401, { err: 'Reset password error' });

          // new password
          user.password = encryptedPassword;
          // add new token
          user.token = jwtToken.issueToken({sid: user.id});

          // save updates
          user.save(function(err) {
            if(err) return res.negotiate( err );
          });

          // return updated user
          return res.json(200, user);

        });

      });

    });

  }

};
