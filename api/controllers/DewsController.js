/**
 * DewsController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // Outbreak summary
  getOutbreaks: function(req, res) {

    // var date

    // var location
    
    var indicator;

    var dewsQuery;

    var dewsSelect = "from dews_outbreaks_2015 "
                   + "where disease_name='" + req.param( 'disease' ) + "'"

    // Check input
    if (!req.param( 'indicator' ) || !req.param( 'disease' )) {
      return res.json(401, {err: '"indicator" and "disease" required for DEWS metric'});
    }

    // province, district, total
    if(req.param( 'indicator' ) === 'total') {
      dewsQuery = "select count(*) as value "
                + dewsSelect;
    } else {
      dewsQuery = "select distinct(" + req.param( 'indicator' ) + ") as value "
                + dewsSelect;
    }

    // Execute query
    Dews.query(dewsQuery, function (err, results){
      if(err || !results.rows.length){
        return res.json({ "status": 0, "error": err });
      }
      else{
        if(req.param( 'indicator' ) === 'total') {
          return res.json( results.rows[0] );
        } else {
          return res.json({ 'value': results.rows.length });
        }
      }
    });    

  },

  // Incident, death indicator
  getIndicator: function(req, res) {

    // var date

    // var location
    
    var indicator;

    var dewsQuery;

    // indicaror: under5 or over5
    if (!req.param( 'type' ) || !req.param( 'indicator' ) || !req.param( 'disease' )) {
      return res.json(401, {err: '"type", "indicator" and "disease" required for DEWS metric'});
    }

    // under5, over5, total
    switch(req.param( 'indicator' )) {
      case 'over5':
        indicator = ['o5male', 'o5female'];
        if (req.param( 'type' ) === 'deaths'){ 
            // death male, female, already aggregated
            indicator = ['o5death', 0];
        }
        break;
      case 'total':
        indicator = ['u5male + u5female', 'o5male + o5female'];
        if (req.param( 'type' ) === 'deaths'){ 
            // death male, female, already aggregated
            indicator = ['u5death', 'o5death'];
        }
        break;        
      default:
        indicator = ['u5male', 'u5female'];
        if (req.param( 'type' ) === 'deaths'){
           // death male, female, already aggregated
            indicator = ['u5death', 0 ];
        }        
    }

    // Tally incidents/deaths
    dewsQuery = "select sum(" + indicator[0] + " + " + indicator[1] + ") as value "
              + "from dews_outbreaks_2015 "
              + "where disease_name='" + req.param( 'disease' ) + "' ";

    // Execute query
    Dews.query(dewsQuery, function (err, results){
      if(err || !results.rows.length){
        return res.json({ "status": 0, "error": err });
      }
      else{
        return res.json( results.rows[0] );
      }
    });

  },

  // Incident, death indicator
  getCalendar: function(req, res) {

    // var date

    // var location

    var result = {};

    // Check input
    if (!req.param( 'disease' )) {
      return res.json(401, {err: '"disease" required for DEWS calendar'});
    }

    // incidents per date by disease
    var dewsQuery = "select report_date, sum(u5male + u5female + o5male + o5female) as value "
                  + "from dews_outbreaks_2015 "
                  + "where disease_name='" + req.param( 'disease' ) + "' "
                  + "group by report_date";

    // Execute query
    Dews.query(dewsQuery, function (err, results){
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

    // Check input
    if (!req.param( 'disease' )) {
      return res.json(401, {err: '"disease" required for DEWS map'});
    }

    // geojson query
    var dewsQuery = "select array_to_json(array_agg(row_to_json(t))) as data "
                  + "from ( "
                    + "select * from dews_outbreaks_2015_points where disease_name = '" + req.param( 'disease' ) + "' "
                  + ") t";

    // Execute query
    Dews.query(dewsQuery, function (err, results){
      if(err || !results.rows.length){
        return res.json({ "status": 0, "error": err });
      }
      else{
        return res.json(results.rows[0]);
      }
    });

  },

  getMap: function(req, res){

    // Check input
    if (!req.param( 'disease' )) {
      return res.json(401, {err: '"disease" required for DEWS map'});
    }    

    // geojson query
    var dewsQuery = "SELECT row_to_json(fc) As featureCollection "
              + "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
              + "FROM ( SELECT 'Feature' As type, ST_AsGeoJSON(st_pointonsurface(dews.geom))::json As geometry, "
                + "( SELECT row_to_json(p) "
                  + "FROM ( SELECT prov_code, dist_code, province, district, disease_name, "
                    + "sum( u5male + u5female + o5male + o5female) as incidents "
                    + "GROUP BY prov_code, province, dist_code, district, disease_name "
                  + ")p "
                + ") As properties "
                + "FROM dews_outbreaks_2015 As dews WHERE disease_name = '" + req.param( 'disease' ) + "' "
                + "GROUP BY prov_code, province, dist_code, district, disease_name, geom "
            + ") As f )  As fc;";

    // Execute query
    Dews.query(dewsQuery, function (err, results){
      if(err || !results.rows.length){
        return res.json({ "status": 0, "error": err });
      }
      else{
        return res.json(results.rows[0].featurecollection);
      }
    });

  }

};
