/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // get organization by id
  getOrganization: function( req, res ){

    // check params
    if ( !req.param( 'organization_id' ) ) {
      return res.json(401, { msg: 'organization_id required' });
    }

    // id params
    var organization_id = req.param( 'organization_id' );

    // find
    Organization
      .findOne()
      .populate('warehouses')
      .where( { id: organization_id } )
      .exec( function( err, organization ){

        // return error
        if ( err ) return res.negotiate( err );

        // return updated user
        return res.json( 200, organization );

      })

  },

  // get organization by id
  getOrganizationIndicator: function( req, res ){

    // set filters
    var adminRpcode_filter = req.param( 'adminRpcode' ) ? { adminRpcode: req.param( 'adminRpcode' ) } : {},
        admin0pcode_filter = req.param( 'admin0pcode' ) ? { admin0pcode: req.param( 'admin0pcode' ) } : {},
        cluster_id_filter = req.param( 'cluster_id' ) ? { cluster_id: req.param( 'cluster_id' ) } : {},
        organization_filter = req.param( 'organization' ) ? { organization: req.param( 'organization' ) } : {};


    // users
    User
      .find()
      .where( adminRpcode_filter )
      .where( admin0pcode_filter )
      .where( cluster_id_filter )
      .where( organization_filter )
      .exec( function( err, users ){

        // return error
        if ( err ) return res.negotiate( err );

        // indicator
        switch( req.param( 'indicator' ) ) {

          // distinct countries
          case 'countries':
            var countries = _.uniq( users, function( user ) { return user.admin0pcode; });
            return res.json( 200, { value: countries.length } );
            break;

          // distinct sectors
          case 'sectors':
            var sectors = _.uniq( users, function( user ) { return user.cluster_id; });
            return res.json( 200, { value: sectors.length } );
            break;

          // total users
          case 'total':
            return res.json( 200, { value: users.length } );
            break;

          // user list
          default:
            return res.json( 200, users );
        }

      });

  },

  // get organization by id
  getOrganizationUsers: function( req, res ){

    // check params
    if ( !req.param( 'admin0pcode' ) || !req.param( 'organization' ) ) {
      return res.json(401, { msg: 'admin0pcode, cluster_id, organization required' });
    }

    // id params
    var admin0pcode = req.param( 'admin0pcode' ),
        cluster_id = req.param( 'cluster_id' ),
        organization = req.param( 'organization' );

    // for all cluster_ids
    var cluster_id_filter = cluster_id ? { cluster_id: cluster_id } : { };

    // find
    User
      .find()
      .where( { admin0pcode: admin0pcode } )
      .where( cluster_id_filter )
      .where( { organization: organization } )
      .exec( function( err, users ){

        // return error
        if ( err ) return res.negotiate( err );

        // return updated user
        return res.json( 200, users );

      });

  },

  // set organizaiton partner
  setOrganizationPartner: function( req, res ){

    // check params
    if ( !req.param( 'organization_id' ) ) {
      return res.json(200, { err: true, msg: 'organization_id, project_acbar_partner required' });
    }

    // set
    var $organization_id = req.param( 'organization_id' ),
        $project_acbar_partner = req.param( 'project_acbar_partner' ) ? true : false;

    // update
    Organization
      .update( { id: $organization_id }, { project_acbar_partner: $project_acbar_partner } )
      .exec( function( err, update ){
        // return error
        if ( err ) return res.negotiate( err );
        // return
        return res.json( 200, { success: true } );
      });    

  },

  setOrganization: function( req, res ){

    // check params
    if ( !req.param( 'organization' ) ) {
      return res.json(401, { msg: 'organization required' });
    }

    // id params
    var organization = req.param( 'organization' );

    // update
    Organization
      .update( { id: organization.id }, organization )
      .exec( function( err, update ){

        // return error
        if ( err ) return res.negotiate( err );

        Organization
          .findOne({ id: organization.id })
          .populate('warehouses')
          .exec( function(err, result){
            
            // return error
            if ( err ) return res.negotiate( err );

            // return
            return res.json( 200, result );

          });

      });

  }

};
