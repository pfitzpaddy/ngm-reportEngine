/**
 * ReportController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // get all Projects by organization
  getReportsList: function( req, res ) {

    // request input
    if ( !req.param( 'filter' ) ) {
      return res.json( 401, { err: 'filter required!' });
    }
    
    // get project by organization_id & status
    Report.find( req.param( 'filter' ) ).sort( 'report_month ASC' ).exec ( function( err, reports ){
      
      // return error
      if ( err ) return res.negotiate( err );

      // else
      return res.json( 200, reports );

    });

  },

  // get all Projects by organization
  getReportById: function( req, res ) {

    // request input
    if ( !req.param( 'id' ) ) {
      return res.json(401, { err: 'id required!' });
    }

    // report for UI
    var $report = {};    
    
    // get report by organization_id
    Report.findOne( { id: req.param( 'id' ) } ).exec( function( err, report ){
      
      // return error
      if (err) return res.negotiate( err );
      
      // clone project to update
      $report = report.toObject();

      // get report by organization_id
      Location.find( { report_id: $report.id } ).populateAll().exec( function( err, locations ){

        // return error
        if (err) return res.negotiate( err );

        // add locations ( associations included )
        $report.locations = locations;

        // return report
        return res.json( 200, $report );

      });

    });  

  },

  // set report details
  setReportById: function(req, res) {

    // request input
    if (!req.param('report')) {
      return res.json(401, { err: 'report required!' });
    }
    
    // get report
    var $report = req.param( 'report' );

    // update report
    Report.update( { id: $report.id }, $report ).exec( function( err, report ){

      // return error
      if (err) return res.negotiate( err );    

      // return Report
      return res.json(200, report[0]);

    });

  }  

};
