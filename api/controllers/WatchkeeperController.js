/**
 * DewsController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// module.exports

var WatchkeeperController  = {

  // difference
  getDifference: function(req, res) {

    // params
    var query,
        differenceDays,
        comparisonStartMonth,
        comparisonStartDate,
        comparisonEndDate
        table = 'security.acled_africa_incidents_2015 ',
        startDate = req.param( 'start_date' ),
        endDate = req.param( 'end_date' ),
        country = req.param( 'country' );

    // Check input
    if (!startDate || !endDate || !country) {
      return res.json(401, {err: '"start_date", "end_date", & "country" required for metric'});
    }

    // comparison date period
    differenceDays = Math.round((new Date(endDate)-new Date(startDate))/(1000*60*60*24));
    comparisonStartDate = new Date(new Date(startDate).setDate(new Date(startDate).getDate() - differenceDays));
    comparisonEndDate = startDate;

    comparisonStartMonth = comparisonStartDate.getMonth()+1;
    comparisonStartDate = comparisonStartDate.getFullYear() + '-' + comparisonStartMonth + '-' + comparisonStartDate.getDate();

    // 
    query = 'select round(((b.value - a.value)::numeric / a.value) * 100, 2) as value from ';
      query += '(select count(*) as value ';
          query += 'FROM security.acled_africa_incidents_2015 ';
            if (country !== '*'){
              query += "WHERE country = '" + country + "' AND ";
            } else {
              query += "WHERE ";
            }
            query += "event_date >= '" + comparisonStartDate + "' ";
            query += "AND event_date <= '" + comparisonEndDate + "' ) a, ";
        query += '(select count(*) as value ';
          query += 'FROM security.acled_africa_incidents_2015 ';
            if (country !== '*'){
              query += "WHERE country = '" + country + "' AND ";
            } else {
              query += "WHERE ";
            }
            query += "event_date >= '" + startDate + "' ";
            query += "AND event_date <= '" + endDate + "' ) b";

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

  // Outbreak/indicator
  getIndicator: function(req, res) {

    // params
    var query,
        table = 'security.acled_africa_incidents_2015 ',
        startDate = req.param( 'start_date' ),
        endDate = req.param( 'end_date' ),
        country = req.param( 'country' ),
        indicator = req.param( 'indicator' )

    // Check input
    if (!startDate || !endDate || !country || !indicator) {
      return res.json(401, {err: '"start_date", "end_date", "country" & "indicator" required for metric'});
    }

        // prov code (any prov_code)
        switch(indicator){
          case '*':
            query = 'select count(*) as value FROM ' + table + ' WHERE ';
            break;
          case 'fatalities':
            query = 'select sum(fatalities) as value FROM ' + table + ' WHERE ';
            break;
          case 'other':
            query = "select count(*) as value from " + table + " WHERE event_type != 'Riots/Protests' AND ";
            break;          
          default:
            query = "select count(*) as value from " + table + " WHERE event_type = '" + indicator + "' AND ";
        }

        // disease (any disease)
        switch(country){
          case '*':
            // no action required
            break;
          default:
            query += "country = '" + country + "' ";
        }        

          // add startDate / endDate
          query += (country === '*') ? ' ' : 'AND ';
          query += "event_date >= '" + startDate + "'"
                + " AND event_date <= '" + endDate + "';";

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
        table = 'security.acled_africa_incidents_2015 ',
        startDate = req.param( 'start_date' ),
        endDate = req.param( 'end_date' ),        
        country = req.param( 'country' ),
        result = {};

    // Check input
    if (!startDate || !endDate || !country) {
      return res.json(401, {err: '"start_date", "end_date" & "country" required for calendar'});
    }

    // incidents per date by disease
    query = 'select event_date, count(*) as value '
                + 'from ' + table;

                // disease (any disease)
                switch(country){
                  case '*':
                    // no action required
                    break;
                  default:
                    query += "where country = '" + country + "' ";
                }
                
                // add startDate / endDate
                query += (country === '*')  ? 'WHERE ' : 'AND ';
                query += "event_date >= '" + startDate + "'"
                      + " AND event_date <= '" + endDate + "' ";

                // group by date
                query += 'group by event_date;';

    // Execute query
    Dews.query(query, function (err, results){
      if(err || !results.rows.length){
        return res.json({ "status": 0, "error": err });
      }
      else{

        // for each row, format for cal-heatmap
        results.rows.forEach(function(d, i){
          // timestamp is seconds since 1st Jan 1970
          result[new Date(d.event_date).getTime() / 1000] = parseInt(d.value);
        });

        // return result as json
        return res.json({ "data" : result });
      }
    });

  },

  // Flood risk indicators
  getChart: function(req, res) {

    // params
    var query,
        table = 'security.acled_africa_incidents_2015 ',
        startDate = req.param( 'start_date' ),
        endDate = req.param( 'end_date' ),        
        indicator = req.param( 'indicator' ),
        country = req.param( 'country' );

    // Check input
    if (!startDate || !endDate || !country) {
      return res.json(401, {err: '"start_date", "end_date" & "country" required for calendar'});
    }

    // query land type at flood risk area_sqm
    if(indicator === 'incident'){
      query = "SELECT country || ', ' || adm_level_1, country || ', ' || adm_level_1  as name, count(*)::integer as y FROM " + table + " ";
    }else {
      query = "SELECT country || ', ' || adm_level_1, country || ', ' || adm_level_1  as name, sum(fatalities)::integer as y FROM " + table + " ";
    }

              if(country !== '*') {
                query += "WHERE country = '" + country + "' AND ";
              } else {
                query += "WHERE ";
              }
        query += "event_date >= '" + startDate + "' "
              + "AND event_date <= '" + endDate + "' "
              + 'GROUP BY adm_level_1, name '
              + 'ORDER by y desc '
              + 'LIMIT 5';

    // Execute query
    Flood.query(query, function (err, results){
      if(err || !results.rows.length){
        return res.json({ "status": 0, "error": err });
      }
      else{
        //
        return res.json( results.rows );
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
        country = req.param( 'country' ),
        layer = req.param( 'layer' ),
        message = req.param( 'message' );


    // Check input
    if (!startDate || !endDate || !country) {
      return res.json(401, {err: '"start_date", "end_date" & "country" required for map'});
    }

    // geojson query
    query = 'SELECT row_to_json(fc) As featureCollection '
              + "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
              + "FROM ( SELECT 'Feature' As type, ST_AsGeoJSON(acled.geom)::json As geometry, "
                + '( SELECT row_to_json(p) '
                  + 'FROM ( SELECT event_date, event_type, country, adm_level_1, fatalities'
                  + ')p '
                + ') As properties '
                + 'FROM security.acled_africa_incidents_2015 As acled ';

                  // country (any country)
                  switch(country){
                    case '*':
                      // no action required
                      break;
                    default:
                      query += "WHERE country = '" + country + "' ";
                  }

                  // add startDate / endDate
                  query += (country === '*') ? 'WHERE ' : 'AND ';
                  query += "event_date >= '" + startDate + "'"
                        + " AND event_date <= '" + endDate + "' "
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
              lng: feature.geometry.coordinates[0]
            };
            // format message
            if (message) {
              markers['marker' + key].message = WatchkeeperController.getMarkerMessage(message, feature);
            }

          });  

        }

        // return markers
        return res.json(markers);
      }
    });

  }

};

module.exports = WatchkeeperController;
