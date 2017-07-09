/**
 * ProjectController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // get admin1 list by admin0
  getAdmin1List: function( req, res ) {

    // !admin0pcode
    // if ( !req.param( 'admin0pcode' ) ) {
    //    return res.json( 401, { msg: 'admin0pcode required and must be string' });
    // }

    // get list
    Admin1
      .find()
      // .where({ admin0pcode: req.param( 'admin0pcode' ) })
      .sort('admin1name ASC')
      .exec( function( err, admin1 ){

        // return error
        if (err) return res.negotiate( err );

        // return new Project
        return res.json( 200, admin1 );        

      });

  },

  // get admin2 list by admin0, admin1
  getAdmin2List: function( req, res ) {

    // !admin0pcode || !admin1pcode
    // if ( !req.param( 'admin0pcode' ) ) {
    //    return res.json( 401, { msg: 'admin0pcode required and must be string' });
    // }

    // get list
    Admin2
      .find()
      // .where({ admin0pcode: req.param( 'admin0pcode' ) })
      .sort('admin2name ASC')
      .exec( function( err, admin2 ){

        // return error
        if (err) return res.negotiate( err );

        // return new Project
        return res.json( 200, admin2 );

      });

  },

  // get Provinces for dashboard
  getProvinceMenu: function(req, res) {

    var $provinces = {
      'afghanistan': { prov_code: 'all', prov_name:'Afghanistan', lat:34.5, lng:66, zoom:6 }
    };

    // create Project with organization_id
    Province
      .find()
      .sort('prov_name ASC')
      .exec(function(err, provinces){
      
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

  },

  // get Provinces
  getProvinceList: function(req, res) {

    // create Project with organization_id
    Province
      .find()
      .sort('prov_name ASC')
      .exec(function(err, provinces){
      
        // return error
        if (err) return res.negotiate( err );

        // return new Project
        return res.json(200, provinces);

      });

  },

  // get Districts
  getDistrictList: function(req, res) {

    // create Project with organization_id
    District
      .find()
      .sort('dist_name ASC')
      .exec(function(err, districts){
      
        // return error
        if (err) return res.negotiate( err );

        // return new Project
        return res.json(200, districts);

      });

  }

};
