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
    if (!req.param('indicator') || !req.param('start_date') || !req.param('end_date') || !req.param('project') || !req.param('beneficiaries') || !req.param('prov_code') || !req.param('dist_code') ) {
      return res.json(401, {err: 'indicator, start_date, end_date, project, beneficiaries, prov_code, dist_code required!'});
    }

    // get params
    var params = {
      indicator: req.param('indicator'),
      start_date: req.param('start_date'),
      end_date: req.param('end_date'),
      project: req.param('project'),
      beneficiaries: req.param('beneficiaries'),
      prov_code: req.param('prov_code'),
      dist_code: req.param('dist_code')
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

        // reset project filter ids
        var project_filter_ids = [];
        // filter by beneficiary params
        beneficiaries.forEach(function(d, i){
          project_filter_ids.push(d.project_id);
        });

        // filter prov/dist for total locations
        var provFilter = params.prov_code !== '*' ? { prov_code: params.prov_code } : {};
        var distFilter = params.dist_code !== '*' ? { dist_code: params.dist_code } : {};        

        // total conflict locations 
        Location.find().where( { project_id: project_filter_ids } ).where( provFilter ).where( distFilter ).exec(function(err, locations){
          
          // return error
          if (err) return res.negotiate( err );

          // filter by beneficiary params
          locations.forEach(function(d, i){
            project_ids.push(d.project_id);
          });

          // return projects to filter
          callback(params, project_ids, res);

        });

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

          // filter prov/dist for total conflict locations
          var provFilter = params.prov_code !== '*' ? { prov_code: params.prov_code } : {};
          var distFilter = params.dist_code !== '*' ? { dist_code: params.dist_code } : {};
          // conflict ?
          var filter = params.conflict ? { conflict: params.conflict } : {};          

          // no. of locations
          Location.find().where( { project_id: project_ids } ).where( provFilter ).where( distFilter ).where( filter ).exec(function(err, value){
            
            // return error
            if (err) return res.negotiate( err );

            // total locations
            if ( !params.conflict ) {
              
              // return new Project
              return res.json(200, { 'value': value.length });

            } else {

              // filter prov/dist for total conflict locations
              var provFilter = params.prov_code !== '*' ? { prov_code: params.prov_code } : {};
              var distFilter = params.dist_code !== '*' ? { dist_code: params.dist_code } : {};

              // total conflict locations 
              District.find().where( provFilter ).where( distFilter ).where( filter ).exec(function(err, total){
                
                // return error
                if (err) return res.negotiate( err );

                // return new Project
                return res.json(200, { 'value': value.length, 'value_total': total.length });

              });
            }

          });

          break;
        case 'beneficiaries':

          // beneficiaries
          var value = 0,
              beneficiaries_filter = params.beneficiaries[0] === 'all' ? {} : { beneficiary_category: params.beneficiaries };

          // beneficiaries find
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
        case 'markers':

          // leaflet markers
          var markers = {};

          // filter prov/dist for total conflict locations
          var provFilter = params.prov_code !== '*' ? { prov_code: params.prov_code } : {};
          var distFilter = params.dist_code !== '*' ? { dist_code: params.dist_code } : {};

          // get all locations
          Location.find().where( { project_id: project_ids } ).where( provFilter ).where( distFilter ).exec(function(err, locations){

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

          break;
        default:

          // labels
          var total = 0,
              under18male = 0,
              under18female = 0,
              under18 = 0,
              over18male = 0,
              over18female = 0,
              over18 = 0,
              over59male = 0,
              over59female = 0,
              over59 = 0,
              result = {
                label: {
                  left: {
                    label: {
                      prefix: 'M',
                      label: 0,
                      postfix: '%'
                    },
                    subLabel: {
                      label: 0
                    }
                  },
                  center: {
                    label: {
                      label: 0,
                      postfix: '%'
                    },
                    subLabel: {
                      label: 0
                    }
                  },
                  right: {
                    label: {
                      prefix: 'F',
                      label: 0,
                      postfix: '%'
                    },
                    subLabel: {
                      label: 0
                    }
                  }
                },
                data: [{
                  'y': 0,
                  'color': '#f48fb1',
                  'name': 'Female',
                  'label': 0,
                },{
                  'y': 0,
                  'color': '#90caf9',
                  'name': 'Male',
                  'label': 0,
                }]
              },
              // beneficiaries filter
              beneficiaries_filter = params.beneficiaries[0] === 'all' ? {} : { beneficiary_category: params.beneficiaries };

          // beneficiaries find
          Beneficiaries.find().where( { project_id: project_ids } ).where( beneficiaries_filter ).exec(function(err, data){

            // return error
            if (err) return res.negotiate( err );

            // totals 
            data.forEach(function(d, i){
              // totals segment
              under18male += d.under18male;
              under18female += d.under18female;
              over18male += d.over18male;
              over18female += d.over18female;
              over59male += d.over59male;
              over59female += d.over59female;              
              // totals baseline
              under18 += d.under18male + d.under18female;
              over18 += d.over18male + d.over18female;
              over59 += d.over59male + d.over59female;
              // total
              total += d.under18male + d.under18female + d.over18male + d.over18female + d.over59male + d.over59female;
            }); 

            // breakdown
            switch(params.indicator){

              // indicator
              case 'under18':

                // calc %
                var malePerCent = ( under18male / ( under18male + under18female ) ) * 100;
                var femalePerCent = ( under18female / ( under18male + under18female ) ) * 100;
                var totalPerCent = ( under18 / ( under18 + over18 + over59 ) ) * 100;
                
                // assign data left
                result.label.left.label.label = parseInt(malePerCent.toFixed(0));
                result.label.left.subLabel.label = under18male;
                // assign data center
                result.label.center.label.label = parseInt(totalPerCent.toFixed(0));
                result.label.center.subLabel.label = under18
                // assign data right
                result.label.right.label.label = parseInt(femalePerCent.toFixed(0));
                result.label.right.subLabel.label = under18female;

                // highcharts female
                result.data[0].y = femalePerCent;
                result.data[0].label = under18;
                // highcharts male
                result.data[1].y = malePerCent;
                result.data[1].label = under18;
                
                break;

              case 'over18':
                
                // calc %
                var malePerCent = ( over18male / ( over18male + over18female ) ) * 100;
                var femalePerCent = ( over18female / ( over18female + over18male ) ) * 100;
                var totalPerCent = ( over18 / ( under18 + over18 + over59 ) ) * 100;
                
                // assign data left
                result.label.left.label.label = malePerCent;
                result.label.left.subLabel.label = over18male;
                // assign data center
                result.label.center.label.label = totalPerCent 
                result.label.center.subLabel.label = over18
                // assign data right
                result.label.right.label.label = femalePerCent;
                result.label.right.subLabel.label = over18female;

                // highcharts female
                result.data[0].y = femalePerCent;
                result.data[0].label = over18;
                // highcharts male
                result.data[1].y = malePerCent;
                result.data[1].label = over18;

                break; 

              case 'over59':
                
                // calc %
                var malePerCent = ( over59male / ( over59male + over59female ) ) * 100;
                var femalePerCent = ( over59female / ( over59male + over59female ) ) * 100;
                var totalPerCent = ( over59 / ( under18 + over18 + over59 ) ) * 100;
                
                // assign data left
                result.label.left.label.label = malePerCent;
                result.label.left.subLabel.label = over59male;
                // assign data center
                result.label.center.label.label = totalPerCent 
                result.label.center.subLabel.label = over59
                // assign data right
                result.label.right.label.label = femalePerCent;
                result.label.right.subLabel.label = over59female;

                // highcharts female
                result.data[0].y = femalePerCent;
                result.data[0].label = over59;
                // highcharts male
                result.data[1].y = malePerCent;
                result.data[1].label = over59;

                break;
            }

            // return new Project
            return res.json(200, result );

          });

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
