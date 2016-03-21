/**
 * ProjectController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var ProjectDashboardController  = {

  // run indicator metrics 
  getIndicator: function( req, res ){

    // request input
    if (!req.param('indicator') || !req.param('start_date') || !req.param('end_date') || !req.param('project') || !req.param('beneficiaries') ) {
      return res.json(401, {err: 'indicator, start_date, end_date, project, beneficiaries required!'});
    }

    // get params
    var params = {
      indicator: req.param('indicator'),
      start_date: req.param('start_date'),
      end_date: req.param('end_date'),
      project: req.param('project'),
      beneficiaries: req.param('beneficiaries')
    }
    // add conflict ?
    params.conflict = req.param('conflict') ? req.param('conflict') : false;

    // run this one
    ProjectDashboardController.getProjectsByFilter(params, res, ProjectDashboardController.getIndicatorValue);

  },

  // filter project ids by dashboard params
  getProjectsByFilter: function(params, res, callback){

    // filters
    var date_filter,
        project_filter,
        beneficiaries_filter;
    
    // id list
    var project_ids = [];

    // date
    date_filter = { 
      or: [{
        project_start_date: { '>=': new Date(params.start_date), '<=': new Date(params.end_date) }
      },{ 
        project_end_date: { '>=': new Date(params.start_date), '<=': new Date(params.end_date) } 
      }]
    };

    // project_type
    project_filter = params.project[0] === 'all' ? {} : { project_type: params.project }; 

    // filter projects by params
    Project.find().where( date_filter ).where( project_filter ).where( { project_status: { '!' : 'new' } } ).exec(function(err, projects){

      // return error
      if (err) return res.negotiate( err );

      // compile ids
      var project_filter_ids = [];
      
      // filter projects
      projects.forEach(function(d, i){
        project_filter_ids.push(d.id);
      });

      // beneficiaries
      beneficiaries_filter = params.beneficiaries[0] === 'all' ? {} : { beneficiary_category: params.beneficiaries };

      // beneficiaries query next
      Beneficiaries.find().where( { project_id: project_filter_ids } ).where( beneficiaries_filter ).exec(function(err, beneficiaries){
        
        // return error
        if (err) return res.negotiate( err );

        // filter by beneficiary params
        beneficiaries.forEach(function(d, i){
          project_ids.push(d.project_id);
        });

        // return projects to filter
        callback(params, project_ids, res);

      });

    });

  },

  // calculate indicator value from filtered project ids
  getIndicatorValue: function(params, project_ids, res) {

    // return indicator
    switch(params.indicator){

        case 'organizations':

          // find prjects by filter
          Project.find().where( { id: project_ids } ).exec(function(err, projects){
            
            // return error
            if (err) return res.negotiate( err );

            // compile ids
            var organization_ids = [];
            // filter by filtered project ids
            projects.forEach(function(d, i){
              organization_ids.push(d.organization_id);
            });

            // no. of organizations
            Organization.count( { id: organization_ids } ).exec(function(err, value){

              // return error
              if (err) return res.negotiate( err );

              // return new Project
              return res.json(200, { 'value': value });

            });

          });

          break;
        case 'projects':

          // no. of organizations
          Project.count( { id: project_ids } ).exec(function(err, value){
            
            // return error
            if (err) return res.negotiate( err );

            // return new Project
            return res.json(200, { 'value': value }); 

          });

          break;
        case 'locations':

          // empty filter
          var filter = params.conflict ? { conflict: params.conflict } : {};

          // no. of organizations
          Location.find().where( { project_id: project_ids } ).where( filter ).exec(function(err, value){
            
            // return error
            if (err) return res.negotiate( err );

            // return new Project
            return res.json(200, { 'value': value.length });

          });

          break;
        case 'beneficiaries':

          var value = 0,
              // beneficiaries
              beneficiaries_filter = params.beneficiaries[0] === 'all' ? {} : { beneficiary_category: params.beneficiaries };

          // beneficiaries
          Beneficiaries.find().where( { project_id: project_ids } ).where( beneficiaries_filter ).exec(function(err, data){

            // return error
            if (err) return res.negotiate( err );

            data.forEach(function(d, i){
              value += d.under18male + d.under18female + d.over18male + d.over18female + d.over59male + d.over59female;
            });

            // return new Project
            return res.json(200, { 'value': value });
            
          });

          break;
        default:



          // add breakdown function to here





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
      locations.forEach(function(d, i){

        // get user details
        User.findOne({ username: d.username }).exec(function(err, user){

          // return error
          if (err) return res.negotiate( err );

          // popup message
          var message = '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">' + user.organization + ' | ' + d.project_title + '</h5>'
                      + '<div style="text-align:center"> in ' + d.prov_name + ', ' + d.dist_name + '</div>'
                      + '<div style="text-align:center">' + d.fac_type + '</div>'
                      + '<div style="text-align:center">' + d.fac_name + '</div>'
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

  // contact list
  getContactListCsv: function(req, res){

    // get all projects (not empty)
    User.find({ app_home: 'health' }).exec(function(err, users){

      // return error
      if (err) return res.negotiate( err );      

      // require
      var fields = ['name', 'organization', 'position', 'phone', 'email', 'createdAt'];
      var json2csv = require('json2csv');

      // return csv
      json2csv({ data: users, fields: fields }, function(err, csv) {
        
        // error
        if (err) return res.negotiate( err );

        // success
        return res.json( 200, { data: csv } );

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

module.exports = ProjectDashboardController;
