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
    Province.find().exec(function(err, provinces){
      
      // return error
      if (err) return res.negotiate( err );

      // return new Project
      return res.json(200, provinces);

    });

  }

};
