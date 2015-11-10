/**
 * DewsController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // Outbreak/indicator
  getIndicator: function(req, res) {

    // params
    var query,
        table = 'health.moph_afg_dews_outbreaks_2015 ',
        indicator = req.param( 'indicator' ),
        disease = req.param( 'disease' ),
        provCode = req.param( 'prov_code' );

    // Check input
    if (!indicator) {
      return res.json(401, {err: '"indicator" required for DEWS metric'});
    }

    // indicator (any table column)
    switch(indicator){
      case '*':
        query = 'select count(' + indicator + ') as value from ' + table;
        break;
      default:
        query = 'select sum(' + indicator + ') as value from ' + table;
    }

    // disease (any disease)
    if(disease){
      query += "where disease_name = '" + disease + "' ";
    }

    // prov code (any prov_code)
    switch(provCode){
      case '*':
        // no action
        break;
      default:
        query += disease ? 'and ' : 'where ';
        query += 'prov_code IN(' + provCode +') ';
    }

    // Execute query
    Dews.query(query, function (err, results){
      if(err || !results.rows.length){
        return res.json({ "status": 0, "error": err });
      }
      else{
        return res.json(results.rows[0]);
      }
    }); 

  },

  // Incident, death indicator
  getCalendar: function(req, res) {

    // params
    var query,
        table = 'health.moph_afg_dews_outbreaks_2015 ',
        disease = req.param( 'disease' ),
        provCode = req.param( 'prov_code' ),
        result = {};

    // Check input
    if (!disease) {
      return res.json(401, {err: '"disease" required for DEWS calendar'});
    }

    // incidents per date by disease
    query = 'select report_date, sum(u5male + u5female + o5male + o5female) as value '
                + 'from ' + table
                + "where disease_name='" + disease + "' ";

                // prov code (any prov_code)
                switch(provCode){
                  case '*':
                    // no action
                    break;
                  default:
                    query += 'and prov_code = ' + provCode + ' ';
                }
                
                // group by date
                query += 'group by report_date';

    // Execute query
    Dews.query(query, function (err, results){
      if(err || !results.rows.length){
        return res.json({ "status": 0, "error": err });
      }
      else{

        // for each row, format for cal-heatmap
        results.rows.forEach(function(d, i){
          // timestamp is seconds since 1st Jan 1970
          result[new Date(d.report_date).getTime() / 1000] = parseInt(d.value);
        });

        // return result as json
        return res.json({ "data" : result });
      }
    });

  },

  getData: function(req, res){

    // params
    var query,
        table = 'health.moph_afg_dews_outbreaks_2015_pnts ',
        disease = req.param( 'disease' ),
        provCode = req.param( 'prov_code' );

    // Check input
    if (!disease) {
      return res.json(401, {err: '"disease" required for DEWS map'});
    }

    // geojson query
    query = 'select array_to_json(array_agg(row_to_json(t))) as data '
                + 'from ( '
                  + 'select * from ' + table + ' '  
                  + "where disease_name = '" + disease + "' ";
  
                  // prov code (any prov_code)
                  switch(provCode){
                    case '*':
                      // no action
                      break;
                    default:
                      query += 'and prov_code = ' + provCode + ' ';
                  }

                query += ') t';

    // Execute query
    Dews.query(query, function (err, results){
      if(err || !results.rows.length){
        return res.json({ "status": 0, "error": err });
      }
      else{
        return res.json(results.rows[0]);
      }
    });

  },

  getMap: function(req, res){

    // params
    var query,
        disease = req.param( 'disease' ),
        provCode = req.param( 'prov_code' );

    // Check input
    if (!disease) {
      return res.json(401, {err: '"disease" required for DEWS map'});
    }  

    // geojson query
    query = "SELECT row_to_json(fc) As featureCollection "
              + "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
              + "FROM ( SELECT 'Feature' As type, ST_AsGeoJSON(st_pointonsurface(dews.geom))::json As geometry, "
                + "( SELECT row_to_json(p) "
                  + "FROM ( SELECT prov_code, dist_code, province, district, disease_name, report_date, "
                    + "sum( u5male + u5female + o5male + o5female) as incidents "
                    + "GROUP BY prov_code, province, dist_code, district, disease_name, report_date "
                  + ")p "
                + ") As properties "
                + "FROM health.moph_afg_dews_outbreaks_2015 As dews WHERE disease_name = '" + req.param( 'disease' ) + "' ";

                // prov code (any prov_code)
                switch(provCode){
                  case '*':
                    // no action
                    break;
                  default:
                    query += 'AND prov_code = ' + provCode + ' ';
                }

              query += "GROUP BY prov_code, province, dist_code, district, disease_name, report_date, geom "
            + ") As f ) As fc;";

    // Execute query
    Dews.query(query, function (err, results){
      if(err || !results.rows.length){
        return res.json({ "status": 0, "error": err });
      }
      else{
        return res.json(results.rows[0].featurecollection);
      }
    });

  }

};
