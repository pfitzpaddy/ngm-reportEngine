/**
 * ProjectController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // get Provinces
  getProvincesList: function(req, res) {

    // create Project with organization_id
    Province.find().sort('prov_name ASC').exec(function(err, provinces){
      
      // return error
      if (err) return res.negotiate( err );

      // return new Project
      return res.json(200, provinces);

    });

  },

  // get Districts
  getDistrictsList: function(req, res) {

    // create Project with organization_id
    District.find().sort('dist_name ASC').exec(function(err, districts){
      
      // return error
      if (err) return res.negotiate( err );

      // return new Project
      return res.json(200, districts);

    });

  },

  // get facilityTypes
  getFacilityTypeList: function(req, res) {

    // create Project with organization_id
    Type.find().sort('fact_type ASC').exec(function(err, facilityTypes){
      
      // return error
      if (err) return res.negotiate( err );

      // return new Project
      return res.json(200, facilityTypes);

    });

  },

  // get facilities
  getFacilityList: function(req, res) {

    // create Project with organization_id
    Facility.find().sort('fac_name ASC').exec(function(err, facilities){
      
      // return error
      if (err) return res.negotiate( err );

      // return new Project
      return res.json(200, facilities);

    });

  }

};
