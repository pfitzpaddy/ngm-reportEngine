/**
 * FloodController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // Flood risk indicators
  getFloodRisk: function(req, res) {

    // indicator: low, moderate, high, total
    // metric: popn, area
    // prov_code: Agcho provincal code (35 is afghanistan 'total')
    if (!req.param( 'indicator' ) || !req.param( 'metric' ) || !req.param( 'prov_code' )) {
      return res.json(401, {err: '"indicator", "metric", "prov_code" required for Flood indicator'});
    }
    
    var query,
        indicator = req.param( 'indicator' ),
        metric = req.param( 'metric' ),
        provCode = req.param( 'prov_code' );

    // low, moderate, high, total
    switch(indicator) {
      case 'low':
        // if popn
        if (metric == 'popn') {
          query = 'SELECT fld_low_pop as value_total, fld_low_pop_pc as value ';
        } else {
          query = 'SELECT fld_low_area as value_total, fld_low_area_pc as value ';
        }
        break;
      case 'moderate':
        // if popn
        if (metric == 'popn') {
          query = 'SELECT fld_moderate_pop as value_total, fld_moderate_pop_pc as value ';
        } else {
          query = 'SELECT fld_moderate_area as value_total, fld_moderate_area_pc as value ';
        }        
        break;  
      case 'high':
        // if popn
        if (metric == 'popn') {
          query = 'SELECT fld_high_pop as value_total, fld_high_pop_pc as value ';
        } else {
          query = 'SELECT fld_high_area as value_total, fld_high_area_pc as value ';
        }          
        break;
      case 'total':
        // if popn
        if (metric == 'popn') {
          query = 'SELECT fld_pop_tot as value_total, fld_pop_tot_pc as value ';
        } else {
          query = 'SELECT fld_area_tot as value_total, fld_area_tot_pc as value ';
        }
        break;
      default:
        // if popn
        if (metric == 'popn') {
          query = 'SELECT total_population as value ';
        } else {
          query = 'SELECT total_area as value ';
        }      
    }

    // complete query
    query += 'FROM drr.provincial_flood_risk_indicators '

    if(req.param('prov_code')){
      query += " WHERE prov_code = '" + provCode + "';";
    }

    // Execute query
    Flood.query(query, function (err, results){
      if(err || !results.rows.length){
        return res.json({ "status": 0, "error": err });
      }
      else{
        return res.json( results.rows[0] );
      }
    });

  },

 // Flood risk indicators
  getFloodRiskType: function(req, res) {

    // indicator: low, moderate, high, total
    // metric: popn, area
    // prov_code: Agcho provincal code (35 is afghanistan 'total')
    if (!req.param( 'indicator' ) || !req.param( 'metric' ) || !req.param( 'prov_code' )) {
      return res.json(401, {err: '"indicator", "metric", "prov_code" required for Flood indicator'});
    }
    
    var query,
        indicator = req.param( 'indicator' ),
        metric = req.param( 'metric' ),
        provCode = req.param( 'prov_code' );

    // low, moderate, high, total
    switch(indicator) {
      case 'low':
        // if popn
        if (metric == 'popn') {
          query = 'SELECT fld_low_pop as label, fld_low_pop_pc as value ';
        } else {
          query = 'SELECT fld_low_area as label, fld_low_area_pc as value ';
        }
        break;
      case 'moderate':
        // if popn
        if (metric == 'popn') {
          query = 'SELECT fld_moderate_pop as label, fld_moderate_pop_pc as value ';
        } else {
          query = 'SELECT fld_moderate_area as label, fld_moderate_area_pc as value ';
        }        
        break;  
      case 'high':
        // if popn
        if (metric == 'popn') {
          query = 'SELECT fld_high_pop as label, fld_high_pop_pc as value ';
        } else {
          query = 'SELECT fld_high_area as label, fld_high_area_pc as value ';
        }          
        break;    
    }

    // complete query
    query += 'FROM drr.provincial_flood_risk_indicators '

    if(req.param('prov_code')){
      query += " WHERE prov_code = '" + provCode + "';";
    }

    // Execute query
    Flood.query(query, function (err, results){
      if(err || !results.rows.length){
        return res.json({ "status": 0, "error": err });
      }
      else{
        return res.json([{
            'y': parseFloat(results.rows[0].value.toFixed(2)),
            'color': req.param('color') ? req.param('color') : '#7cb5ec',
            'name': req.param('name') ? req.param('name') : 'Flood Risk',
            'label': results.rows[0].label,
          },{
            'y': parseFloat(100 - results.rows[0].value.toFixed(2)),
            'color': 'rgba(0,0,0,0.05)',
            'name': 'Flood Risk Population',
            'label': results.rows[0].label,
          }]
        );
      }
    });

  },

  // Flood risk indicators
  getFloodRiskArea: function(req, res) {

    // prov_code: Agcho provincal code (35 is afghanistan 'total')
    if (!req.param( 'indicator' ) || !req.param( 'prov_code' )) {
      return res.json(401, {err: '"prov_code" required for Flood Risk Area'});
    }
    
    var query,
        indicator = req.param( 'indicator' ),
        provCode = req.param( 'prov_code' );

    // query land type at flood risk area_sqm
    switch(indicator){
      case 'floodRisk':
        query = 'select aggcode_simplified, agg_simplified_description as name, sum(fldarea) / 1000000 as y '
                  + 'from drr.flood_risk_land_type ';
                  
                  if(provCode != 35) {
                    query += 'where prov_code = ' + provCode +' ';
                  }

        query += 'group by aggcode_simplified, agg_simplified_description '
                  + 'order by aggcode_simplified;';
        break;
      default:

        query = 'select aggcode_si, agg_simpli as name, sum(area_sqm) / 1000000 as y '
                + 'from drr.afg_landcover ';
                if(provCode != 35) {
                  query += 'where prov_code = ' + provCode +' ';
                }
                
        query += 'group by aggcode_si, agg_simpli '
                + 'order by aggcode_si';
    }

    // Execute query
    Flood.query(query, function (err, results){
      if(err || !results.rows.length){
        return res.json({ "status": 0, "error": err });
      }
      else{

        // ensure y is numeric
        for(i=0;i<results.rows.length;i++){
          results.rows[i].y = parseInt(results.rows[i].y);
        }

        //
        return res.json( results.rows );
      }
    });

  }  

};
