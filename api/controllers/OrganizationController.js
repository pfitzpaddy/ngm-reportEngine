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
