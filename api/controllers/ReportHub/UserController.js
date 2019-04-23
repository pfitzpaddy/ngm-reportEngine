/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var UserController = {

  // create user
  create: function(req, res) {

    // check params
    if (!req.param( 'user' )) {
      return res.json(401, { msg: 'User Required!' });
    }

    // try to look up user using the provided username/email address
    User.findOne({
      username: req.param( 'user' ).username
      // or: [{
      //     username: req.param( 'user' ).username
      //   },{
      //     email: req.param( 'user' ).email
      //   }]
      // username: req.param( 'user' ).username
    }, function foundUser( err, user ) {

      // user exists
      if ( user ) return res.json({ err: true, msg: 'User already exists! Forgot password?' } );

      // else create user
      User
        .create( req.param( 'user' ) )
        .exec( function( err, user ) {

          // err
          if (err) return res.negotiate( err );

          // set token
          user.token = jwtToken.issueToken({ sid: user.id });

          // save
          user.save( function(err){

            // create userHistory
            var userHistory = _.clone( user );
                userHistory.user_id = user.id
                delete userHistory.id;

            // create user history for tracking!
            UserHistory
              .create( userHistory )
              .exec( function( err, newUserHistory ) {
                
                // err
                if (err) return res.negotiate( err );
                
                // return user
                res.json( 200, user );

              });
          });

        });

    });

  },

  // delete user
  delete: function (req, res) {

    // check params
    if (!req.param( 'user' )) {
      return res.json(401, { msg: 'User Required' });
    }

    User
      .destroy( { id: req.param( 'user' ).id } )
      .exec( function( err ){
        
        // generic error
        if ( err ) return res.negotiate( err );

        // user destroyed
        return res.json( 200, { success: true } );

      });

  },

  // Check provided email address and password
  login: function (req, res) {

    // check params
    if (!req.param( 'user' )) {
      return res.json(401, { msg: 'user required' });
    }

    // try to look up user using the provided username/email address
    User.findOne({
      username: req.param( 'user' ).username
      // or: [{
      //     username: req.param( 'user' ).username
      //   },{
      //     email: req.param( 'user' ).email
      //   }]
    }, function foundUser( err, user ) {

      // generic error
      if ( err ) return res.negotiate( err );

      // user not found
      if ( !user ) return res.json({ err: true, msg: 'Invalid Username! User exists?' });

      // user not active
      if ( user.status !== 'active' ) return res.json({ err: true, msg: 'User No Longer Active! Contact Admin' });

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
          return res.json({ err: true, msg: 'Invalid Password! Forgot Password?' });
        },

        // on success
        success: function (){

          // update visit information
          user.visits = user.visits + 1;

          // add token
          user.token = jwtToken.issueToken({ sid: user.id });
          
          // save user data on session
          req.session.session_user = user;

          // save updates
          user.save( function( err ) {

            // err
            if( err ) return res.negotiate( err );

            // Send back user with token
            return res.json( 200, user );

          });

        }
      });
    });

  },

  // get by username for profile
  getUserByUsername: function(req, res){

    // check params
    if ( !req.param( 'username' ) ) {
      return res.json(401, { msg: 'username required' });
    }

    // new profile
    var username = req.param( 'username' );

    // users
    User
      .findOne()
      .where( { username: username } )
      .exec( function( err, user ){

        // return error
        if ( err ) return res.negotiate( err );

        // return updated user
        return res.json( 200, user );

      }); 

  },

  // metrics
  updateLogin: function(req, res){

    // check params
    if ( !req.param( 'user' ) ) {
      return res.json(401, { msg: 'user required' });
    }

    // get user by username
    User
      .findOne({ username: req.param( 'user' ).username })
      .exec(function(err, user){

        // return error
        if (err) return res.negotiate( err );

        // return error
        // if (!user) return res.json( 401, { msg: 'User not found!' } );

        // update visit information
        user.visits++;

        // save updates
        user.save(function(err) {

          // err
          if(err) return res.negotiate( err );

          // return updated user
          return res.json( 200, user );

        });

      });

  },

  // update user profile
  updateProfile: function(req, res){

    // check params
    if ( !req.param( 'user' ) ) {
      return res.json(401, { msg: 'user required' });
    }

    // new profile
    var updatedUser = req.param( 'user' );

    // check to make sure username is not taken
    User.findOne({
      username: updatedUser.username
    }, function foundUser( err, user ) {

      // generic error
      if (err) return res.negotiate( err );

      // if username exists twice!
      if ( user && user.id !== updatedUser.id ) {

        // username already taken
        return res.json( 200, { err: true, msg: 'Username already taken, try again!' });

      } else {

        // check to make sure username is not taken
        User.findOne({
          id: updatedUser.id
        }, function foundUser( err, originalUser ) {

          User
            .update( { id: updatedUser.id }, updatedUser )
            .exec( function( err, result ){

              // generic error
              if (err) return res.negotiate( err );

              // user object to update tables
              var updatedRelationsUser = {
                username: result[0].username,
                name: result[0].name,
                position: result[0].position,
                phone: result[0].phone,
                email: result[0].email
              }

              var findOriginalUser = {
                username: originalUser.username
              }

              // each collection needs to be updated - this needs to change to relational!

              var Promise = require('bluebird');

              Promise.all([
                Project.update( findOriginalUser, updatedRelationsUser ),
                BudgetProgress.update( findOriginalUser, updatedRelationsUser ),
                TargetBeneficiaries.update( findOriginalUser, updatedRelationsUser ),
                TargetLocation.update( findOriginalUser, updatedRelationsUser ),
                Report.update( findOriginalUser, updatedRelationsUser ),
                Location.update( findOriginalUser, updatedRelationsUser ),
                Beneficiaries.update( findOriginalUser, updatedRelationsUser ),
                Trainings.update( findOriginalUser, updatedRelationsUser ),
                TrainingParticipants.update( findOriginalUser, updatedRelationsUser ),
                Stock.update( findOriginalUser, updatedRelationsUser ),
                StockLocation.update( findOriginalUser, updatedRelationsUser ),
                StockReport.update( findOriginalUser, updatedRelationsUser ),
                StockWarehouse.update( findOriginalUser, updatedRelationsUser )
              ])
                .catch( function(err) {
                  return res.negotiate( err );
                })
                .done( function() {

                  // the following is for tracking of iMMAP staff (for now)

                  // update user programme and track
                  if ( originalUser.programme_id && originalUser.programme_id !== result[0].programme_id || 
                        originalUser.contract_start_date && originalUser.contract_start_date.toString() !== result[0].contract_start_date && result[0].contract_start_date.toString() ||
                        originalUser.contract_end_date && originalUser.contract_end_date.toString() !== result[0].contract_end_date && result[0].contract_end_date.toString() ||
                        originalUser.admin0pcode !== result[0].admin0pcode ||
                        originalUser.site_name !== result[0].site_name ){
                    // profile details
                    UserController.updateProfileDetails( req, res, originalUser, result[0] );
                  } else {
                    return res.json( 200, { success: true, user: result[0] } );
                  }
                });

            });

        });

      }

    });

  },

  // update the profile details 
  updateProfileDetails: function( req, res, originalUser, updatedUser ){

    // if country changes, make updates and add new history
    if ( originalUser.admin0pcode !== updatedUser.admin0pcode ) {

      // fetch
      Organization
        .find()
        .where( { admin0pcode: updatedUser.admin0pcode } )
        .exec( function( err, organization ){
          
          // generic error
          if (err) return res.negotiate( err );

          // if no results, create new organization
          if ( !organization.length ) {
            var newOrganizationAdmin0 = _.clone( updatedUser );
                delete newOrganizationAdmin0.id;

            // create new
            Organization
              .create( newOrganizationAdmin0 )
              .exec( function( err, newOrganization ) {
                
                // generic error
                if (err) return res.negotiate( err );

                // update user country
                User
                  .update( { id: updatedUser.id }, { organization_id: newOrganization.id } )
                  .exec( function( err, newOrgUser ){
                    
                    // create new userHistory
                    var newUserHistory = _.clone( newOrgUser[0] );
                        newUserHistory.user_id = newUserHistory.id;
                        delete newUserHistory.id;

                    // create user history for tracking!
                    UserHistory
                      .create( newUserHistory )
                      .exec( function( err, newUserHistory ) {
                        
                        // err
                        if (err) return res.negotiate( err );
                        
                        // return user
                        return res.json( 200, { success: true, user: newOrgUser[0] } );

                      });


                  });

              });

          } else {

            // update user country
            User
              .update( { id: updatedUser.id }, { organization_id: organization[0].id } )
              .exec( function( err, updatedOrgUser ){

                // create new userHistory
                var newUserHistory = _.clone( updatedOrgUser[0] );
                    newUserHistory.user_id = newUserHistory.id;
                    delete newUserHistory.id;

                // create user history for tracking!
                UserHistory
                  .create( newUserHistory )
                  .exec( function( err, newUserHistory ) {
                    
                    // err
                    if (err) return res.negotiate( err );
                    
                    // return user
                    return res.json( 200, { success: true, user: updatedOrgUser[0] } );

                  });

              });

          }

        });

    // udpate prgramme or duty station
    } else if ( originalUser.programme_id !== updatedUser.programme_id ||
              originalUser.site_name !== updatedUser.site_name ) {

      // create new userHistory
      var newUserHistory = _.clone( updatedUser );
          newUserHistory.user_id = newUserHistory.id;
          delete newUserHistory.id;

      // create user history for tracking!
      UserHistory
        .create( newUserHistory )
        .exec( function( err, newUserHistory ) {
          
          // err
          if (err) return res.negotiate( err );
          
          // return user
          return res.json( 200, { success: true, user: updatedUser } );

        });

    // date updates only require update to UserHistory
    } else if ( originalUser.contract_start_date.toString() !== updatedUser.contract_start_date.toString() ||
                  originalUser.contract_end_date.toString() !== updatedUser.contract_end_date.toString() ) {
      
      // update userHistory records dates
      UserHistory
        .update( { user_id: updatedUser.id }, { contract_end_date: updatedUser.contract_start_date, contract_end_date: updatedUser.contract_end_date } )
        .exec( function( err, updatedUserHistory ){
          
          // err
          if (err) return res.negotiate( err );

          // return default
          return res.json( 200, { success: true, user: updatedUser } );

        });
    } else {

      // return default
      return res.json( 200, { success: true, user: updatedUser } );
    }

  },

  // send email for password reset
  passwordResetEmail: function(req, res){

    // check params
    if ( !req.param( 'user' ) || !req.param( 'url' ) ) {
      return res.json(401, { msg: 'user, url required' });
    }

    // file system
    var fs = require('fs');

    // get user by email
    User
      .find({ email: req.param( 'user' ).email })
      .exec(function(err, user){

          // return error
          if (err) return res.negotiate( err );

          // return error
          if (!user.length) return res.json({ err: true, msg: 'Account Not Found!' });

          var resets = [],
              counter = 0,
              length = user.length;

          //
          for (i = 0; i < user.length; i++) {

            // reset user
            var userReset = {
              adminRpcode: user[i].adminRpcode,
              admin0pcode: user[i].admin0pcode,
              organization_id: user[i].organization_id,
              organization_tag: user[i].organization_tag,
              organization: user[i].organization,
              cluster_id: user[i].cluster_id,
              cluster: user[i].cluster,
              user_id: user[i].id,
              name: user[i].name,
              username: user[i].username,
              email: user[i].email,
              token: jwtToken.issueToken({ sid: user[i].id })
            }

            // Add record in reset
            UserReset
              .create( userReset )
              .exec( function( err, reset ) {

                // return error
                if (err) return res.negotiate( err );

                // push
                resets.push(reset);
                // incement
                counter++;
                if( counter === length ){

                  // if no config file, return, else send email ( PROD )
                  if ( !fs.existsSync( '/home/ubuntu/nginx/www/ngm-reportEngine/config/email.js' ) ) return res.json(200, { 'data': 'No email config' });

                  // send email
                  sails.hooks.email.send( 'password-reset', {
                      resets: resets,
                      recipientName: resets[0].username,
                      senderName: 'ReportHub',
                      url: req.param( 'url' ),
                    }, {
                      to: reset.email,
                      subject: 'ReportHub Password Reset ' + new Date()
                    }, function(err) {

                      // return error
                      if (err) return res.negotiate( err );

                      // email sent
                      return res.json(200, { 'data': 'success' });
                  });
                }

              });

          }


        });

  },

  // password reset
  passwordReset: function(req, res){

    // check params
    if ( !req.param( 'reset' ) || !req.param( 'token' ) ) {
      return res.json(401, { msg: 'user, token required' });
    }

    // get reser user by username
    UserReset.findOne({ token: req.param( 'token' ) }).exec(function(err, userReset){

      // return error
      if (err) return res.negotiate( err );

      // return error
      if (!userReset) return res.json({ err: true, msg: 'Reset token not found!' });

      // get user with userReset params
      User
        .findOne({ username: userReset.username })
        .exec(function(err, user){

          // return error
          if (err) return res.negotiate( err );

          // update newPassword
          // require( 'bcrypt' ).hash( req.param( 'reset' ).newPassword, 10, function passwordEncrypted( err, encryptedPassword ) {
          var bcrypt = require('bcrypt-nodejs');
          bcrypt.hash( req.param( 'reset' ).newPassword, bcrypt.genSaltSync( 10 ), null, function passwordEncrypted( err, encryptedPassword ) {

            // err
            if ( err ) return res.json({ err: true, msg: 'Reset password error' } );

            // new password
            user.password = encryptedPassword;
            // add new token
            user.token = jwtToken.issueToken( { sid: user.id } );

            // save updates
            user.save( function( err ) {

              // err
              if ( err ) return res.negotiate( err );

              // return updated user
              return res.json( 200, user );

            });

          });

        });

    });

  }

};

module.exports = UserController;