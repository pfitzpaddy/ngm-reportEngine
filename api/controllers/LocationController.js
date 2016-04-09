/**
 * ProjectController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // get Provinces
  getProvinceList: function(req, res) {

    // create Project with organization_id
    Province.find().sort('prov_name ASC').exec(function(err, provinces){
      
      // return error
      if (err) return res.negotiate( err );

      // return new Project
      return res.json(200, provinces);

    });

  },

  // get Districts
  getDistrictList: function(req, res) {

    // create Project with organization_id
    District.find().sort('dist_name ASC').exec(function(err, districts){
      
      // return error
      if (err) return res.negotiate( err );

      // return new Project
      return res.json(200, districts);

    });

  },

  // get Provinces
  getProvinceMenu: function(req, res) {

    var $provinces = {
      'afghanistan': { prov_code: '*', prov_name:'Afghanistan', lat:34.5, lng:66, zoom:6 }
    };

    // create Project with organization_id
    Province.find().sort('prov_name ASC').exec(function(err, provinces){
      
      // return error
      if (err) return res.negotiate( err );

      // return new Project
      provinces.forEach( function( d, i ) {

        // key
        var key = d.prov_name.toLowerCase().replace(/\s/g, '-');

        // create menu option
        $provinces[key] = d;

      });

      return res.json(200, $provinces);

    });

  }

};
