/**
 * ProjectController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // get facilityTypes
  getFacilityTypeList: function(req, res) {

    // create Project with organization_id
    Type.find().exec(function(err, facilityTypes){
      
      // return error
      if (err) return res.negotiate( err );

      // return new Project
      return res.json(200, facilityTypes);

    });

  },

  // get facilities
  getFacilityList: function(req, res) {

    // create Project with organization_id
    Facility.find().exec(function(err, facilities){
      
      // return error
      if (err) return res.negotiate( err );

      // return new Project
      return res.json(200, facilities);

    });

  }  

};
