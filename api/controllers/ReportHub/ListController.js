/**
 * ProjectController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var json2csv = require( 'json2csv' );

module.exports = {

  // get list of organizations
  getOrganizations: function( req, res ) {

    // get organizations list
    Organizations
      .find()
      .exec( function( err, organizations ){

        // return error
        if ( err ) return res.negotiate( err );

        // return organizations
        return res.json( 200, organizations );

      })

  },

  getOrganizationsCSV: function (req, res) {

    let filter = {};
    if (req.param('admin0pcode')) {
      filter = { or: [{ admin0pcode: { contains: req.param('admin0pcode').toUpperCase() } }, { admin0pcode: { contains: 'ALL' } }] };
    }

    // get organizations list
    Organizations
      .find(filter)
      .exec(function (err, organizations) {

        // return error
        if (err) return res.negotiate(err);

        let fields     = ['admin0pcode', 'organization_name', 'organization_tag', 'organization', 'organization_type'];
        let fieldNames = ['admin0pcode', 'organization_name', 'organization_tag', 'organization', 'organization_type'];

        json2csv({ data: organizations, fields: fields, fieldNames: fieldNames }, function (err, csv) {

          // error
          if (err) return res.negotiate(err);

          // success
          res.set('Content-Type', 'text/csv');
          return res.send(200, csv);
        });

      });

  },

  setOrganization: async function (req, res) {
    try {
      if (!req.param('organization')) {
        return res.json(400, { err: 'organization required!' });
      }
      // check tag not exists
      if (!req.param('organization').id) {
        let tagDuplicate = await Organizations.findOne({ organization_tag: req.param('organization').organization_tag });
        if (tagDuplicate) {
          return res.json(400, { err: 'Organization Tag already exists!' });
        }
      }
      // update or create
      let organization = await Organizations.updateOrCreate({ id: req.param('organization').id }, req.param('organization'));

      // return organization
      return res.json(200, Utils.set_result(organization));

    } catch (err) {
      return res.negotiate(err);
    }
  },

  deleteOrganization: async function (req, res) {
    try {
      if (!req.param('id')) {
        return res.json(400, { err: 'organization id required!' });
      }

      // delete
      var deleted = await Organizations.destroy({ id: req.param('id') });
      // return organization
      if (deleted.length){
        return res.json(200, { msg: 'success' });
      } else {
        return res.json(400, { err: 'organization not exists!' });
      }

    } catch (err) {
      return res.negotiate(err);
    }
  },

  // reset organization collection TODO filter by country
  resetOrganizations: async function (req, res) {
    try {
      if (!Array.isArray(req.body) || !req.body.length || typeof req.body[0] !== 'object') {
        return res.json(400, { err: 'organizations array required!' });
      }

      let headers = ['admin0pcode', 'organization_name', 'organization_tag', 'organization', 'organization_type'];
      // let valid = true;
      for (var i = 0; i < req.body.length; i++) {
        for (header of headers) {
          if (!req.body[i][header]) {
            return res.json(400, { err: 'incorrect values!' });
            // valid = false;
          }
        }
      }

      // if (!valid) return res.json(400, { err: 'incorrect values!' });

      // delete
      await Organizations.destroy({});
      // create
      let organizatoins = await Organizations.create(req.body);

      return res.json(200, organizatoins);

    } catch (err) {
      return res.negotiate(err);
    }
  },

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

  // get admin3 list by admin0
  getAdmin3List: function( req, res ) {

    // !admin0pcode || !admin1pcode
    // if ( !req.param( 'admin0pcode' ) ) {
    //    return res.json( 401, { msg: 'admin0pcode required and must be string' });
    // }

    // admin0pcode
    var admin0pcode,
        admin1pcode,
        admin0pcode_filter = {},
        admin1pcode_filter = {};

    // set
    admin0pcode = req.param( 'admin0pcode' );
    admin1pcode = req.param( 'admin1pcode' );
    admin0pcode_filter = admin0pcode ? { admin0pcode: admin0pcode } : {};
    admin1pcode_filter = admin1pcode ? { admin1pcode: admin1pcode } : {};

    // Ukraine has too many points
    if ( !admin1pcode ) {
      switch( admin0pcode ) {
        case 'UA':
          admin1pcode_filter = { admin1pcode: 'UA44' };
          break;
        default:
          admin1pcode_filter = {};
      }
    }

    // get list
    Admin3
      .find()
      .where( admin0pcode_filter )
      .where( admin1pcode_filter)
      .sort('admin3name ASC')
      .exec( function( err, admin3 ){

        // return error
        if (err) return res.negotiate( err );

        // return new Project
        return res.json( 200, admin3 );

      });

  },

  // get admin4 list by admin0pcode, admin1pcode
  getAdmin4List: function( req, res ) {

    // !admin0pcode || !admin1pcode
    if ( !req.param( 'admin0pcode' ) ) {
       return res.json( 401, { msg: 'admin0pcode, admin1pcode required and must be string' });
    }

    // set
    var admin0pcode = req.param( 'admin0pcode' );
    var admin1pcode = req.param( 'admin1pcode' );

    // Set default to Cox Bazar
    if ( !admin1pcode ) {
      switch( admin0pcode ) {
        case 'BD':
          admin1pcode = '20';
          break;
        case 'CB':
          admin1pcode = '202290';
          break;
        case 'UA':
          admin1pcode = 'UA44';
          break;
      }
    }

    // get list
    Admin4
      .find()
      .where({ admin0pcode: admin0pcode })
      .where({ admin1pcode: admin1pcode })
      .sort('admin4name ASC')
      .exec( function( err, admin4 ){

        // return error
        if (err) return res.negotiate( err );

        // return new Project
        return res.json( 200, admin4 );

      });

  },

  // get admin4 list by admin0pcode, admin1pcode
  getAdmin5List: function( req, res ) {

    // !admin0pcode || !admin1pcode
    if ( !req.param( 'admin0pcode' ) ) {
       return res.json( 401, { msg: 'admin0pcode, admin1pcode required and must be string' });
    }

    // set
    var admin0pcode = req.param( 'admin0pcode' );
    var admin1pcode = req.param( 'admin1pcode' );

    // Set default to Cox Bazar
    if ( !admin1pcode ) {
      switch( admin0pcode ) {
        case 'BD':
          admin1pcode = '20';
          break;
        case 'CB':
          admin1pcode = '202290';
          break;
      }
    }

    // get list
    Admin5
      .find()
      .where({ admin0pcode: admin0pcode })
      .where({ admin1pcode: admin1pcode })
      .sort('admin5name ASC')
      .exec( function( err, admin5 ){

        // return error
        if (err) return res.negotiate( err );

        // return new Project
        return res.json( 200, admin5 );

      });

  },


  // return list of duty stations
  getDutyStations: function( req, res ) {

    DutyStation
      .find()
      .exec( function( err, dutystations ){

        // return error
        if (err) return res.negotiate( err );

        // return new Project
        return res.json( 200, dutystations );

      });
  },

  // get admin2 list by admin0, admin1, admin2name
  getAdmin2Sites: function( req, res ) {

    // !admin0pcode || !admin1pcode
    if ( !req.param( 'cluster_id' ) || !req.param( 'admin0pcode' ) || !req.param( 'admin1pcode' ) || !req.param( 'admin2pcode' ) || !req.param( 'admin2name' ) ) {
       return res.json( 401, { msg: 'admin0pcode, admin1pcode, admin2pcode & admin2name required and must be string' });
    }

    // admin filter on pcode prefered! But Kabul has PDs!
    var admin2filter = req.param( 'admin2pcode' ) === '101' ? { admin2name: req.param( 'admin2name' ) } : { admin2pcode: req.param( 'admin2pcode' ) };

    // get list
    Admin2Sites
      .find()
      .where({ admin0pcode: req.param( 'admin0pcode' ) })
      .where({ admin1pcode: req.param( 'admin1pcode' ) })
      .where( admin2filter )
      .where({ site_class: req.param( 'cluster_id' ) })
      .sort('admin2name ASC')
      .exec( function( err, admin2 ){

        // return error
        if (err) return res.negotiate( err );

        // return new Project
        return res.json( 200, admin2 );

      });

  },

  // get admin3 list by admin0, admin1, admin2name, admin3pcode
  getAdminSites: function( req, res ) {

    // !admin0pcode || !admin1pcode
    if ( !req.param( 'admin0pcode' ) && ( req.param( 'admin0pcode' ) !== 'CB' && !req.param( 'admin1pcode' ) ) ) {
       return res.json( 401, { msg: 'admin0pcode, admin1pcode required and must be string' });
    }

    // filters
    var admin0filter = { admin0pcode: req.param( 'admin0pcode' ) }
    var admin1filter = req.param( 'admin1pcode' ) ? { admin1pcode: req.param( 'admin1pcode' ) } : {}

    // if !== CB and missing admin1
    if ( req.param( 'admin0pcode') !== 'CB' && !req.param( 'admin1pcode' ) ) {
        // return new Project
        return res.json( 200, [] );
    }

    // get list
    AdminSites
      .find()
      .where( admin0filter )
      .where( admin1filter )
      .sort( 'site_name ASC' )
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
