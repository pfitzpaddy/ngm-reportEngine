/**
 * DewsController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// module.exports

var DewsController  = {

  // Outbreak/indicator
  getIndicator: function(req, res) {

    // params
    var query,
        table = 'health.moph_afg_dews_outbreaks_2015 ',
        startDate = req.param( 'start_date' ),
        endDate = req.param( 'end_date' ),
        indicator = req.param( 'indicator' ),
        disease = req.param( 'disease' ),
        provCode = req.param( 'prov_code' );

    // Check input
    if (!startDate || !endDate || !indicator) {
      return res.json(401, {err: '"start_date", "end_date" & "indicator" required for DEWS metric'});
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
            switch(disease){
              case '*':
                // no action required
                break;
              default:
                query += "where disease_id = '" + disease + "' ";
            }

            // prov code (any prov_code)
            switch(provCode){
              case '*':
                // no action required
                break;
              default:
                query += disease !== '*' ? 'and ' : 'where ';
                query += 'prov_code IN(' + provCode +') ';
            }

            // add startDate / endDate
            query += (disease === '*') && (provCode === '*')  ? 'WHERE ' : 'AND ';
            query += "report_date >= '" + startDate + "'"
                  + " AND report_date <= '" + endDate + "';";

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
        startDate = req.param( 'start_date' ),
        endDate = req.param( 'end_date' ),        
        disease = req.param( 'disease' ),
        provCode = req.param( 'prov_code' ),
        result = {};

    // Check input
    if (!startDate || !endDate || !disease) {
      return res.json(401, {err: '"start_date", "end_date" & "disease" required for DEWS calendar'});
    }

    // incidents per date by disease
    query = 'select report_date, sum(u5male + u5female + o5male + o5female) as value '
                + 'from ' + table;

                // disease (any disease)
                switch(disease){
                  case '*':
                    // no action required
                    break;
                  default:
                    query += "where disease_id = '" + disease + "' ";
                }

                // prov code (any prov_code)
                switch(provCode){
                  case '*':
                    // no action
                    break;
                  default:
                    query += disease !== '*' ? 'and ' : 'where ';
                    query += 'prov_code = ' + provCode + ' ';
                }
                
                // add startDate / endDate
                query += (disease === '*') && (provCode === '*')  ? 'WHERE ' : 'AND ';
                query += "report_date >= '" + startDate + "'"
                      + " AND report_date <= '" + endDate + "' ";

                // group by date
                query += 'group by report_date;';


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
        startDate = req.param( 'start_date' ),
        endDate = req.param( 'end_date' ),        
        disease = req.param( 'disease' ),
        provCode = req.param( 'prov_code' );

    // Check input
    if (!startDate || !endDate || !disease) {
      return res.json(401, {err: '"start_date", "end_date" & "disease" required for DEWS map'});
    }

    // geojson query
    query = 'select array_to_json(array_agg(row_to_json(t))) as data '
                + 'from ( '
                  + 'select * from ' + table;
                   
                  // disease (any disease)
                  switch(disease){
                    case '*':
                      // no action required
                      break;
                    default:
                      query += "where disease_id = '" + disease + "' ";
                  }
  
                  // prov code (any prov_code)
                  switch(provCode){
                    case '*':
                      // no action
                      break;
                    default:
                      query += disease !== '*' ? 'and ' : 'where ';
                      query += 'prov_code = ' + provCode + ' ';
                  }

                // add startDate / endDate
                query += (disease === '*') && (provCode === '*')  ? 'WHERE ' : 'AND ';
                query += "report_date >= '" + startDate + "'"
                      + " AND report_date <= '" + endDate + "' ";

                query += ') t;';

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

  getMarkerMessage: function(m, feature){
    
    // marker message 
    var message = '',
        messageArray = m.split('__');
    
    // parse markermessage to set html
    messageArray.forEach(function(d, i){
      // evaluate html from features
      if( d.search('value') > 0 ){
        message += (eval('(' + d + ')').value);
      } else {
        message += d;
      }
    });

    // return html formatted msg
    return message;

  },  

  getMarkers: function(req, res){

    // params
    var query,
        startDate = req.param( 'start_date' ),
        endDate = req.param( 'end_date' ),
        disease = req.param( 'disease' ),
        provCode = req.param( 'prov_code' ),
        layer = req.param( 'layer' ),
        message = req.param( 'message' );


    // Check input
    if (!startDate || !endDate || !disease) {
      return res.json(401, {err: '"start_date", "end_date" & "disease" required for DEWS map'});
    }

    // geojson query
    query = 'SELECT row_to_json(fc) As featureCollection '
              + "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
              + "FROM ( SELECT 'Feature' As type, ST_AsGeoJSON(st_pointonsurface(dews.geom))::json As geometry, "
                + '( SELECT row_to_json(p) '
                  + 'FROM ( SELECT prov_code, dist_code, province, district, disease_name, '
                    + 'sum( u5male + u5female + o5male + o5female) as incidents '
                    + 'GROUP BY prov_code, province, dist_code, district, disease_name '
                  + ')p '
                + ') As properties '
                + 'FROM health.moph_afg_dews_outbreaks_2015 As dews ';

                  // disease (any disease)
                  switch(disease){
                    case '*':
                      // no action required
                      break;
                    default:
                      query += "WHERE disease_id = '" + disease + "' ";
                  }
  
                  // prov code (any prov_code)
                  switch(provCode){
                    case '*':
                      // no action
                      break;
                    default:
                      query += disease !== '*' ? 'AND ' : 'WHERE ';
                      query += 'prov_code = ' + provCode + ' ';
                  }

                  // add startDate / endDate
                  query += (disease === '*') && (provCode === '*')  ? 'WHERE ' : 'AND ';
                  query += "report_date >= '" + startDate + "'"
                        + " AND report_date <= '" + endDate + "' "
                        + "GROUP BY prov_code, province, dist_code, district, disease_name, geom "
                        + ") As f ) As fc;";

    // Execute query
    Dews.query(query, function (err, results){
      if(err || !results.rows.length){
        return res.json({ "status": 0, "error": err });
      } else {

        // markers
        var markers = {}

        // process data for markers
        if (results.rows[0].featurecollection.features) {
          results.rows[0].featurecollection.features.forEach(function(feature, key) {

            // create markers
            markers['marker' + key] = {
              layer: layer,
              lat: feature.geometry.coordinates[1],
              lng: feature.geometry.coordinates[0],
              message: DewsController.getMarkerMessage(message, feature)
            };

          });  

        }

        // return markers
        return res.json(markers);
      }
    });

  },  

  getMap: function(req, res){

    // params
    var query,
        startDate = req.param( 'start_date' ),
        endDate = req.param( 'end_date' ),    
        timeSeries = req.param( 'time_series' ) ? req.param( 'time_series' ) : false,
        disease = req.param( 'disease' ),
        provCode = req.param( 'prov_code' );

    // Check input
    if (!startDate || !endDate || !disease) {
      return res.json(401, {err: '"start_date", "end_date" & "disease" required for DEWS map'});
    }

    if(timeSeries) {
      // geojson query
      query = 'SELECT row_to_json(fc) As featureCollection '
                + "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
                + "FROM ( SELECT 'Feature' As type, ST_AsGeoJSON(st_pointonsurface(dews.geom))::json As geometry, "
                  + '( SELECT row_to_json(p) '
                    + 'FROM ( SELECT prov_code, dist_code, province, district, disease_name, report_date, '
                      + 'sum( u5male + u5female + o5male + o5female) as incidents '
                      + 'GROUP BY prov_code, province, dist_code, district, disease_name, report_date '
                    + ')p '
                  + ') As properties '
                  + 'FROM health.moph_afg_dews_outbreaks_2015 As dews ';
    } else {
      // geojson query
      query = 'SELECT row_to_json(fc) As featureCollection '
                + "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
                + "FROM ( SELECT 'Feature' As type, ST_AsGeoJSON(st_pointonsurface(dews.geom))::json As geometry, "
                  + '( SELECT row_to_json(p) '
                    + 'FROM ( SELECT prov_code, dist_code, province, district, disease_name, '
                      + 'sum( u5male + u5female + o5male + o5female) as incidents '
                      + 'GROUP BY prov_code, province, dist_code, district, disease_name '
                    + ')p '
                  + ') As properties '
                  + 'FROM health.moph_afg_dews_outbreaks_2015 As dews ';
    }

                  // disease (any disease)
                  switch(disease){
                    case '*':
                      // no action required
                      break;
                    default:
                      query += "WHERE disease_id = '" + disease + "' ";
                  }
  
                  // prov code (any prov_code)
                  switch(provCode){
                    case '*':
                      // no action
                      break;
                    default:
                      query += disease !== '*' ? 'AND ' : 'WHERE ';
                      query += 'prov_code = ' + provCode + ' ';
                  }

                  // add startDate / endDate
                  query += (disease === '*') && (provCode === '*')  ? 'WHERE ' : 'AND ';
                  query += "report_date >= '" + startDate + "'"
                        + " AND report_date <= '" + endDate + "' ";              
            
            if(timeSeries) {
              query += "GROUP BY prov_code, province, dist_code, district, disease_name, report_date, geom "
            } else {
              query += "GROUP BY prov_code, province, dist_code, district, disease_name, geom "
            }

            query += ") As f ) As fc;";

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

module.exports = DewsController;
