/**
 * ProjectController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // get Provinces
  getDistrictsList: function(req, res) {

    // create Project with organization_id
    District.find().exec(function(err, districts){
      
      // return error
      if (err) return res.negotiate( err );

      // return new Project
      return res.json(200, districts);

    });

  }

};
