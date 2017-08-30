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

    // admin0pcode
    var admin0pcode_filter = req.param( 'admin0pcode' ) ? { admin0pcode: req.param( 'admin0pcode' ) } : {};

    // get list
    Admin1
      .find()
      .where( admin0pcode_filter )
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

    // admin0pcode
    var admin0pcode_filter = req.param( 'admin0pcode' ) ? { admin0pcode: req.param( 'admin0pcode' ) } : {};

    // get list
    Admin2
      .find()
      .where( admin0pcode_filter )
      .sort('admin2name ASC')
      .exec( function( err, admin2 ){

        // return error
        if (err) return res.negotiate( err );

        // return new Project
        return res.json( 200, admin2 );

      });

  },

  // get admin2 list by admin0, admin1
  getAdmin3List: function( req, res ) {

    // !admin0pcode || !admin1pcode
    // if ( !req.param( 'admin0pcode' ) ) {
    //    return res.json( 401, { msg: 'admin0pcode required and must be string' });
    // }

    // admin0pcode
    var admin0pcode_filter = req.param( 'admin0pcode' ) ? { admin0pcode: req.param( 'admin0pcode' ) } : {};

    // get list
    Admin3
      .find()
      .where( admin0pcode_filter )
      .sort('admin3name ASC')
      .exec( function( err, admin3 ){

        // return error
        if (err) return res.negotiate( err );

        // return new Project
        return res.json( 200, admin3 );

      });

  },

  // get admin2 list by admin0, admin1, admin2name
  getAdmin2Facilities: function( req, res ) {

    // !admin0pcode || !admin1pcode
    if ( !req.param( 'cluster_id' ) || !req.param( 'admin0pcode' ) || !req.param( 'admin1pcode' ) || !req.param( 'admin2pcode' ) || !req.param( 'admin2name' ) ) {
       return res.json( 401, { msg: 'admin0pcode, admin1pcode, admin2pcode & admin2name required and must be string' });
    }

    // admin filter on pcode prefered! But Kabul has PDs!
    var admin2filter = req.param( 'admin2pcode' ) === '101' ? { admin2name: req.param( 'admin2name' ) } : { admin2pcode: req.param( 'admin2pcode' ) };

    // get list
    Admin2Facilities
      .find()
      .where({ admin0pcode: req.param( 'admin0pcode' ) })
      .where({ admin1pcode: req.param( 'admin1pcode' ) })
      .where( admin2filter )
      .where({ facility_class: req.param( 'cluster_id' ) })
      .sort('admin2name ASC')
      .exec( function( err, admin2 ){

        // return error
        if (err) return res.negotiate( err );

        // return new Project
        return res.json( 200, admin2 );

      });

  },

  // get admin3 list by admin0, admin1, admin2name, admin3pcode
  getAdmin3Facilities: function( req, res ) {

    // !admin0pcode || !admin1pcode
    if ( !req.param( 'admin0pcode' ) || !req.param( 'admin1pcode' ) || !req.param( 'admin2name' ) || !req.param( 'admin3pcode' ) ) {
       return res.json( 401, { msg: 'admin0pcode, admin1pcode, admin2name & admin3pcode required and must be string' });
    }

    // get list
    Admin2Facilities
      .find()
      .where({ admin0pcode: req.param( 'admin0pcode' ) })
      .where({ admin1pcode: req.param( 'admin1pcode' ) })
      .where({ admin2name: req.param( 'admin2name' ) })
      .where({ admin3pcode: req.param( 'admin3pcode' ) })
      .sort('admin3name ASC')
      .exec( function( err, admin3 ){

        // return error
        if (err) return res.negotiate( err );

        // return new Project
        return res.json( 200, admin3 );

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
