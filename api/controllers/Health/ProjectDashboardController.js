/**
 * ProjectController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // get total metrics 
  getTotal: function( req, res ){

    // request input
    if (!req.param('indicator')) {
      return res.json(401, {err: 'indicator required!'});
    }

    var indicator = req.param('indicator'),
        conflict = req.param('conflict') ? req.param('conflict') : false;

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
        Project.count({ project_status: { '!' : 'new' } }).exec(function(err, value){
          
          // return error
          if (err) return res.negotiate( err );

          // return new Project
          return res.json(200, { 'value': value });          

        });

        break;
      case 'locations':

        // empty filter
        var filter = {};

        // if conflict
        if (conflict) {
          // conflict filter
          filter = { conflict: conflict };
        }

        // no. of organizations
        Location.count(filter).exec(function(err, value){
          
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
            value += d.under18male + d.under18female + d.over18male + d.over18female + d.over59male + d.over59female;
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

          data.forEach(function(d){
            indicator.forEach(function(i){
              value += d[i];
            });
          });

          // return new Project
          return res.json(200, { 'value': value });

        });
        break;

    }

  },

  // create Project
  getMarkers: function( req, res ){

    var markers = {};

    // get all locations
    Location.find().exec(function(err, locations){

      // return error
      if (err) return res.negotiate( err );

      // return no locations
      if (!locations.length) return res.json(200, { 'data': {} });

      // foreach location
      locations.forEach(function(d,i){

        // get user details
        User.findOne({ username: d.username }).exec(function(err, user){

          // return error
          if (err) return res.negotiate( err );

          // popup message
          var message = '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">' + user.organization + ' | ' + d.project_title + '</h5>'
                      + '<div style="text-align:center"> in ' + d.prov_name + ', ' + d.dist_name + '</div>'
                      + '<div style="text-align:center">' + d.fac_name + '</div>'
                      + '<div style="text-align:center">' + d.fac_type + '</div>'
                      + '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">CONTACT</h5>'
                      + '<div style="text-align:center">' + user.name + '</div>'
                      + '<div style="text-align:center">' + user.position + '</div>'
                      + '<div style="text-align:center">' + user.phone + '</div>'
                      + '<div style="text-align:center">' + user.email + '</div>';

          // create markers
          markers['marker' + i] = {
            layer: 'health',
            lat: d.lat,
            lng: d.lng,
            message: message
          };


          // if last location
          if(i === locations.length-1){
            
            // return markers
            return res.json(200, { 'data': markers });

          }

        });

      });

    });

  },

  // project details
  getProjectDetailsCsv: function(req, res) {

    // get all projects (not empty)
    Project.find({ project_status: { '!' : 'new' } }).exec(function(err, projects){

      // return error
      if (err) return res.negotiate( err );

        // require
        var fields = [];
        var json2csv = require('json2csv');

        // get field names
        for (var key in projects[0].toObject()) {
          fields.push(key);
        }

        // return csv
        json2csv({ data: projects, fields: fields }, function(err, csv) {
          
          // error
          if (err) return res.negotiate( err );

          // success
          return res.json( 200, { data: csv } );

        });

    });

  },

  // project details
  getProjectLocationsCsv: function(req, res) {

    // get all locations
    Location.find().exec(function(err, locations){

      // return error
      if (err) return res.negotiate( err );

        // require
        var fields = [];
        var json2csv = require('json2csv');

        // get field names
        for (var key in locations[0].toObject()) {
          fields.push(key);
        }

        // return csv
        json2csv({ data: locations, fields: fields }, function(err, csv) {
          
          // error
          if (err) return res.negotiate( err );

          // success
          return res.json( 200, { data: csv } );

        });

    });

  },

  // project details
  getProjectBeneficiariesCsv: function(req, res) {

    // get all beneficiaries
    Beneficiaries.find().exec(function(err, beneficiaries){

      // return error
      if (err) return res.negotiate( err );

        // require
        var fields = [];
        var json2csv = require('json2csv');

        // get field names
        for (var key in beneficiaries[0].toObject()) {
          fields.push(key);
        }

        // return csv
        json2csv({ data: beneficiaries, fields: fields }, function(err, csv) {
          
          // error
          if (err) return res.negotiate( err );

          // success
          return res.json( 200, { data: csv } );

        });

    });

  }

};
