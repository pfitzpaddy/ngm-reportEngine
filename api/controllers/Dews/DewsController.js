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
        table = 'dews.moph_afg_dews_outbreaks ',
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
                query += 'province_code IN(' + provCode +') ';
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

  // Daily summary 
  getSummary: function(req, res) {
    // params
    var query,
        table = 'dews.moph_afg_dews_outbreaks ',
        date = req.param( 'date' ),
        disease = req.param( 'disease' ),
        provCode = req.param( 'prov_code' ),
        result = {};

    // Check input
    if (!date || !disease || !provCode) {
      return res.json(401, {err: '"date", "disease" & "prov_code" required!'});
    }

    // incidents per date by disease
    query = 'select disease, u5male, u5female, o5male, o5female, u5death, o5death, sum(u5male + u5female + o5male + o5female + u5death + o5death) as total, clinic_confirmed, village, district, province '
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
            query += 'province_code = ' + provCode + ' ';
        }                

        // add startDate / endDate
        query += (disease === '*') && (provCode === '*')  ? 'WHERE ' : 'AND ';
        query += "report_date = '" + date + "' ";
        query += 'GROUP BY disease, u5male, u5female, o5male, o5female, u5death, o5death, clinic_confirmed, village, district, province;';

    // Execute query
    Dews.query(query, function (err, results){
      if(err || !results.rows.length){
        // return error
        return res.json(400, { 
            error: 'Data processing error, please try again!' 
          });
      }
      else{
        // return result as json
        return res.json({ "data" : results.rows });
      }
    });        

  },

  // Incident, death indicator
  getChart: function(req, res) {

    // params
    var query,
        table = 'dews.moph_afg_dews_outbreaks ',
        startDate = req.param( 'start_date' ),
        endDate = req.param( 'end_date' ),        
        disease = req.param( 'disease' ),
        provCode = req.param( 'prov_code' ),
        result = {};

    // Check input
    if (!startDate || !endDate || !disease) {
      return res.json(401, {err: '"start_date", "end_date" & "disease" required for DEWS calendar'});
    }

    query = "with filled_dates as ( "
            + "select day, 0 as blank_count from "
            + "generate_series('" + startDate + "', '" + endDate + "', '1 day'::interval) "
            + "as day "
          + "), "
          + "outbreak_counts as ( "
            + "select date_trunc('day', report_date) as day, sum(total_cases + total_deaths) as outbreak "
              + "from dews.moph_afg_dews_outbreaks ";
                
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
                    query += 'province_code = ' + provCode + ' ';
                }                

      query +=  "group by date_trunc('day', report_date) "
          + ") "
          + "select to_char(filled_dates.day, 'YYYY-MM-DD') as name, "
            + "coalesce(outbreak_counts.outbreak, filled_dates.blank_count) as y "
            + "from filled_dates "
              + "left outer join outbreak_counts on outbreak_counts.day = filled_dates.day "
            + "order by filled_dates.day;"


    // Execute query
    Dews.query(query, function (err, results){
      if(err || !results.rows.length){
        return res.json({ "status": 0, "error": err });
      }
      else{
        // return result as json
        return res.json(200, { data: results.rows });
      }
    });

  },  

  // Incident, death indicator
  getCalendar: function(req, res) {

    // params
    var query,
        table = 'dews.moph_afg_dews_outbreaks ',
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
    query = 'select report_date, sum(total_cases + total_deaths) as value '
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
                    query += 'province_code = ' + provCode + ' ';
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
        table = 'dews.moph_afg_dews_outbreaks ',
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
                  + 'select u5male, o5male, u5female, o5female, u5death, o5death, disease_id, '
                    + 'disease, report_date, investigation_date, epi_week, rumour, '
                    + 'clinic_confirmed, lab_confirmed, num_close_contacts, village, district_code, '
                    + 'district, province_code, province, region, male, female, children_u5, '
                    + 'reported_pc, assessed_pc, num_specimens_collected, date_specimens_sent, ' 
                    + 'num_positive_specimens, date_results_shared, ongoing, controlled, '
                    + 'date_outbreak_started, date_outbreak_declared_over, remarks, '
                    + 'investigated_by, total_cases, total_deaths, ST_X(st_pointonsurface(geom)) as lng, '
                    + 'ST_Y(st_pointonsurface(geom)) as lat from ' + table;
                   
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
                      query += 'province_code = ' + provCode + ' ';
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

        // 
        var fields = [];
        var json2csv = require('json2csv');

        // get field names
        for (var key in results.rows[0].data[0]) {
          fields.push(key);
        }
        
        // return csv
        json2csv({ data: results.rows[0].data, fields: fields }, function(err, csv) {
          if (err) console.log(err);
          return res.json({ data: csv });
        });
      }
    });

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
      return res.json(401, {err: '"start_date", "end_date" & "disease" required for markers'});
    }

    // geojson query
    query = 'SELECT row_to_json(fc) As featureCollection '
              + "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
              + "FROM ( SELECT 'Feature' As type, ST_AsGeoJSON(st_pointonsurface(dews.geom))::json As geometry, "
                + '( SELECT row_to_json(p) '
                  + 'FROM ( SELECT province_code, district_code, province, district, disease, '
                    + 'sum( u5male + u5female + o5male + o5female) as incidents '
                    + 'GROUP BY province_code, province, district_code, district, disease '
                  + ')p '
                + ') As properties '
                + 'FROM dews.moph_afg_dews_outbreaks As dews ';

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
                      query += 'province_code = ' + provCode + ' ';
                  }

                  // add startDate / endDate
                  query += (disease === '*') && (provCode === '*')  ? 'WHERE ' : 'AND ';
                  query += "report_date >= '" + startDate + "'"
                        + " AND report_date <= '" + endDate + "' "
                        + "GROUP BY province_code, province, district_code, district, disease, geom "
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

            // message
            var message = '<div class="count" style="text-align:center">' + feature.properties.incidents + '</div> cases in ' + feature.properties.province + ', ' + feature.properties.district;

            // create markers
            markers['marker' + key] = {
              layer: layer,
              lat: feature.geometry.coordinates[1],
              lng: feature.geometry.coordinates[0],
              message: message
            };

          });  

        }

        // return markers
        return res.json( { status:200, data: markers } );
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
                    + 'FROM ( SELECT province_code, dist_code, province, district, disease_name, report_date, '
                      + 'sum( u5male + u5female + o5male + o5female + u5death + o5death ) as incidents '
                      + 'GROUP BY province_code, province, dist_code, district, disease_name, report_date '
                    + ')p '
                  + ') As properties '
                  + 'FROM dews.moph_afg_dews_outbreaks As dews ';
    } else {
      // geojson query
      query = 'SELECT row_to_json(fc) As featureCollection '
                + "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
                + "FROM ( SELECT 'Feature' As type, ST_AsGeoJSON(st_pointonsurface(dews.geom))::json As geometry, "
                  + '( SELECT row_to_json(p) '
                    + 'FROM ( SELECT province_code, dist_code, province, district, disease_name, '
                      + 'sum( u5male + u5female + o5male + o5female + u5death + o5death ) as incidents '
                      + 'GROUP BY province_code, province, dist_code, district, disease_name '
                    + ')p '
                  + ') As properties '
                  + 'FROM dews.moph_afg_dews_outbreaks As dews ';
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
                      query += 'province_code = ' + provCode + ' ';
                  }

                  // add startDate / endDate
                  query += (disease === '*') && (provCode === '*')  ? 'WHERE ' : 'AND ';
                  query += "report_date >= '" + startDate + "'"
                        + " AND report_date <= '" + endDate + "' ";              
            
            if(timeSeries) {
              query += "GROUP BY province_code, province, dist_code, district, disease_name, report_date, geom "
            } else {
              query += "GROUP BY province_code, province, dist_code, district, disease_name, geom "
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
