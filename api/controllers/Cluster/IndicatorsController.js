/**
 * ReportController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // get indicators
  getIndicators: function( req, res ) {
    
    // get beneficiaries
    Indicators
      .find()
      .limit( 1 )
      .exec( function( err, indicators ){

        // return error
        if ( err ) return res.negotiate( err );

        // return reports
        return res.json( 200, indicators[ 0 ] );

    });

  }

};

