/**
 * ReportController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // get list of cluster activities
  getActivities: function( req, res ) {

    // admin0pcode
    var admin0pcode_filter = req.param( 'admin0pcode' ) ? { admin0pcode: { contains: req.param( 'admin0pcode' ) } } : {};

    console.log(admin0pcode_filter)

    // get activity list
    Activities
      .find()
      .where( admin0pcode_filter )
      .exec( function( err, activities ){
        
        // return error
        if ( err ) return res.negotiate( err );

        // return project
        return res.json( 200, activities );

      })

  },

  // get list of donors
  getDonors: function( req, res ) {

    // get donor list
    Donors
      .find()
      .exec( function( err, donors ){
        
        // return donors
        if ( err ) return res.negotiate( err );

        // return donors
        return res.json( 200, donors );

      })

  },

  // get indicators
  getIndicators: function( req, res ) {
    
    // get indicators list
    Indicators
      .find()
      .limit( 1 )
      .exec( function( err, indicators ){

        // return error
        if ( err ) return res.negotiate( err );

        // return indicators
        return res.json( 200, indicators[ 0 ] );

    });

  },

  // get list of stockitems
  getStockItems: function( req, res ) {

    // get stockitems list
    StockItems
      .find()
      .exec( function( err, stockitems ){
        
        // return error
        if ( err ) return res.negotiate( err );

        // return stockitems
        return res.json( 200, stockitems );

      })

  },

  // get list of organizations
  getOrganizations: function( req, res ) {

    // get organizations list
    Organizations
      .find()
      .exec( function( err, organizations ){
        
        // return error
        if ( err ) return res.negotiate( err );

        // return organizations
        return res.json( 200, organizations );

      })

  },

};

