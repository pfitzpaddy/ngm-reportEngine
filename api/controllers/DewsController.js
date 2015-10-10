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

    // sails.log.debug(dewsQuery);
    // return res.json(dewsQuery);

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

    // Check input
    if (!req.param( 'disease' )) {
      return res.json(401, {err: '"indicator" and "disease" required for DEWS metric'});
    }

    // incidents per date by disease
    var dewsQuery = "select report_date, sum(u5male + u5female + o5male + o5female) "
                  += "from dews_outbreaks_2015 "
                  += "where disease_name='" + req.param( 'disease' ) + "' "
                  += "group by report_date";

    // Execute query
    Dews.query(dewsQuery, function (err, results){
      if(err || !results.rows.length){
        return res.json({ "status": 0, "error": err });
      }
      else{
        return res.json({ "data" : results.rows });
      }
    });                  

  }  

};
