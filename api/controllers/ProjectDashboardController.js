/**
 * ProjectController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // create Project
  getTotal: function( req, res ){

    // request input
    if (!req.param('indicator')) {
      return res.json(401, {err: 'indicator required!'});
    }

    var indicator = req.param('indicator');

    switch(indicator){

      case 'organizations':

        // no. of organizations
        Organization.count().exec(function(err, value){
          
          // return error
          if (err) return res.negotiate( err );

          // return new Project
          return res.json(200, { 'value': value });          

        });

        break;
      case 'projects':

        // no. of organizations
        Project.count().exec(function(err, value){
          
          // return error
          if (err) return res.negotiate( err );

          // return new Project
          return res.json(200, { 'value': value });          

        });

        break;
      case 'locations':

        // no. of organizations
        Location.count().exec(function(err, value){
          
          // return error
          if (err) return res.negotiate( err );

          // return new Project
          return res.json(200, { 'value': value });          

        });

        break;
      case 'beneficiaries':

        var value = 0;

        // beneficiaries
        Beneficiaries.find().exec(function(err, data){

          // return error
          if (err) return res.negotiate( err );

          data.forEach(function(d,i){
            value += d.under5male + d.under5female + d.over5male + d.over5female;
          });

          // return new Project
          return res.json(200, { 'value': value });
          
        });

        break;
      default:

        var value = 0;

        // beneficiaries
        Beneficiaries.find().exec(function(err, data){

          // return error
          if (err) return res.negotiate( err );

          data.forEach(function(d,i){
            value += d[indicator];
          });

          // return new Project
          return res.json(200, { 'value': value });

        });
        break;

    }


  }
};
