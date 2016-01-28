/**
 * EhaController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  getSummary: function(req, res) {

    // get metric
    var query,
        metric = req.param( 'metric' ),
        donor = req.param( 'donor' ),
        organization = req.param( 'organization' );

    query = 'SELECT sum(amount) as label, ( sum(installment_1 + installment_2 + installment_3) / sum(amount) ) * 100 as value FROM eha.project_monitoring ';

      // donor
      switch(donor){
        case '*':
          // no action required
          break;
        default:
          query += "WHERE donor_id = '" + donor + "' ";
      }

      // organization
      switch(organization){
        case '*':
          // no action required
          break;
        default:
          query += donor !== '*' ? 'AND ' : 'WHERE ';
          query += "organization_id = '" + organization + "';";
      }

    // execute query
    Eha.query(query, function (error, results){

      // return error
      if(error) {
        res.json( { status:400, error: error } );
        return;
      }

      // response with value
      return res.json([{
            'y': parseFloat(parseFloat(results.rows[0].value).toFixed(2)),
            'color': req.param('color') ? req.param('color') : '#7cb5ec',
            'name': req.param('name') ? req.param('name') : 'Budget Spent',
            'label': results.rows[0].label,
          },{
            'y': parseFloat(100 - parseFloat(results.rows[0].value).toFixed(2)),
            'color': 'rgba(0,0,0,0.05)',
            'name': 'Total Budget',
            'label': results.rows[0].label,
          }]
        );

    });

  },

  getIndicator: function(req, res) {

    // get metric
    var query,
        metric = req.param( 'metric' ),
        donor = req.param( 'donor' ),
        organization = req.param( 'organization' );

    switch(metric){
      case 'amount':
        query = 'SELECT sum(amount) as value_total, ( sum(installment_1 + installment_2 + installment_3) / sum(amount) ) * 100 as value FROM eha.project_monitoring ';
        break;
      case 'projects':
        query = 'SELECT COUNT(DISTINCT(po_number)) as value FROM eha.project_monitoring ';
        break;
      case 'provinces':
        query = 'SELECT COUNT(DISTINCT(prov_na_en)) as value FROM eha.project_monitoring ';
        break;
      case 'health_facilities':
        query = 'SELECT COUNT(DISTINCT(implementing_hfs)) as value FROM eha.project_monitoring ';
        break;        
    }

    // donor
    switch(donor){
      case '*':
        // no action required
        break;
      default:
        query += "WHERE donor_id = '" + donor + "' ";
    }

    // organization
    switch(organization){
      case '*':
        // no action required
        break;
      default:
        query += donor !== '*' ? 'AND ' : 'WHERE ';
        query += "organization_id = '" + organization + "';";
    }

    // execute query
    Eha.query(query, function (error, results){

      // return error
      if(error) {
        res.json( { status:400, error: error } );
        return;
      }

      // response with value
      return res.json( results.rows[0] );

    });

  },

  getTable: function(req, res) {

    // get metric
    var query,
        donor = req.param( 'donor' ),
        organization = req.param( 'organization' );

      
    // query
    query = 'SELECT po_number, donor, organization, start_date, end_date, project_title, facility_type, implementing_hfs, prov_na_en, dist_na_en FROM eha.project_monitoring ';

    // donor
    switch(donor){
      case '*':
        // no action required
        break;
      default:
        query += "WHERE donor_id = '" + donor + "' ";
    }

    // organization
    switch(organization){
      case '*':
        // no action required
        break;
      default:
        query += donor !== '*' ? 'AND ' : 'WHERE ';
        query += "organization_id = '" + organization + "';";
    }
    
    // execute query
    Eha.query(query, function (error, results){

      // return error
      if(error) {
        res.json( { status:400, error: error } );
        return;
      }

      // response with value
      return res.json( { status:200, data: results.rows } );

    });

  },

  getMarkers: function(req, res) {

    // get metric
    var query,
        donor = req.param( 'donor' ),
        organization = req.param( 'organization' ),
        po_number = req.param( 'po_number' )
        layer = req.param( 'layer' );

      
    // query
    query = 'SELECT markers FROM eha.project_monitoring ';

    // donor
    switch(donor){
      case '*':
        // no action required
        break;
      default:
        query += "WHERE donor_id = '" + donor + "' ";
    }

    // organization
    switch(organization){
      case '*':
        // no action required
        break;
      default:
        query += donor !== '*' ? 'AND ' : 'WHERE ';
        query += "organization_id = '" + organization + "' ";
    }

    // organization
    if(po_number){
      query += "AND po_number = " + po_number + ";";
    }    
    
    // execute query
    Eha.query(query, function (error, results){

      // return error
      if(error) {
        res.json( { status:400, error: error } );
        return;
      }

      var i = 0,
          markers = {};

      results.rows.forEach(function(row, key){
        if(row.markers) {
          row.markers.forEach(function(d, key){
            d.layer = layer;
            d.lng = d.lon;
            d.message = 'PO Number: ' + d.po_number + '<br/>Donor: ' + d.donor + ' | ' + d.organization + '<br/> Facility Type: ' + d.facility_type + '<br/>Location: ' + d.prov_na_en + ', ' + d.dist_na_en;
            markers['marker' + i] = d;
            i++;
          });
        }
      });

      // response with value
      return res.json( { status:200, data: markers } );

    });

  }    

};
