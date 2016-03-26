/**
 * ProjectController
 *
 * @description :: Health Cluster Dashboard
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var ProjectDashboardController = {

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

  // financial spending
  getFinancialListCsv: function(req, res){

    // request input
    if ( !req.param('project')  ) {
      return res.json(401, { err: 'project required!' } );
    }

    var $project = req.param('project');

    // require
    var fields = [ 
      'organization_id', 
      'organization', 
      'username', 
      'email', 
      'project_status', 
      'project_title', 
      'project_description',
      'project_start_date',
      'project_end_date',
      'expenditure_item',
      'expenditure_name',
      'expenditure_start_date',
      'expenditure_end_date',
      'expenditure_status',
      'expenditure_budget',
      'createdAt',
      'updatedAt'
    ];
    var json2csv = require('json2csv');

    // add project details to csv
    $project.financials.forEach(function(d, i){
      // set values
      $project.financials[i].email = $project.email;
      $project.financials[i].project_status = $project.project_status;
      $project.financials[i].project_title = $project.project_title;
      $project.financials[i].project_description = $project.project_description;
      $project.financials[i].project_start_date = $project.project_start_date;
      $project.financials[i].project_end_date = $project.project_end_date;
    });

    // return csv
    json2csv({ data: $project.financials, fields: fields }, function(err, csv) {
      
      // error
      if (err) return res.negotiate( err );

      // success
      return res.json( 200, { data: csv } );

    });

  },

  // calculate beneficiaries for $projects
  getBeneficiaries: function( $data, type ){

    var beneficiaries = {
      under18male: 0,
      under18female: 0,
      under18_total: 0,
      over18male: 0,
      over18female: 0,
      over18_total: 0,
      over59male: 0,
      over59female: 0,
      over59_total: 0,
      beneficiaries_total: 0
    };

    // sum beneficiaries
    function sumBeneficiaries(b, k) {
      
      // totals segment
      beneficiaries.under18male += b.under18male;
      beneficiaries.under18female += b.under18female;
      beneficiaries.over18male += b.over18male;
      beneficiaries.over18female += b.over18female;
      beneficiaries.over59male += b.over59male;
      beneficiaries.over59female += b.over59female;              
      // totals baseline
      beneficiaries.under18_total += b.under18male + b.under18female;
      beneficiaries.over18_total += b.over18male + b.over18female;
      beneficiaries.over59_total += b.over59male + b.over59female;
      // total
      beneficiaries.beneficiaries_total += b.under18male + b.under18female + b.over18male + b.over18female + b.over59male + b.over59female;

    }

    // project
    if ( type === 'projects' ) {
      // run for peoject
      $data.forEach(function(p, i){
        // locations
        p.locations.forEach(function(l, j){
          // beneficiareis
          l.beneficiaries.forEach(function(b, k){
            // sum beneficiaries
            sumBeneficiaries(b, k);
          });
        });
      });
    }

    // location
    if ( type === 'locations' ) {
      // locations
      $data.forEach(function(l, j){
        // beneficiareis
        l.beneficiaries.forEach(function(b, k){
          // sum beneficiaries     
          sumBeneficiaries(b, k);
        });
      });
    }

    return beneficiaries;    

  },

  // dashboard params to filter $projects
  getHealthDetails: function( req, res ){

    // request input
    if ( !req.param('start_date') || !req.param('end_date') || !req.param('project_type') || !req.param('beneficiary_category') || !req.param('prov_code') || !req.param('dist_code') ) {
      return res.json(401, {err: 'indicator, start_date, end_date, project_status, project_type, beneficiary_category, prov_code, dist_code required!'});
    }

    // get params
    var params = {
      details: req.param('details') ? req.param('details') : false,
      indicator: req.param('indicator') ? req.param('indicator') : false,
      start_date: req.param('start_date'),
      end_date: req.param('end_date'),
      project_status: req.param('project_status'),
      project_type: req.param('project_type'),
      beneficiary_category: req.param('beneficiary_category'),
      prov_code: req.param('prov_code'),
      dist_code: req.param('dist_code'),
      conflict: req.param('conflict') ? req.param('conflict') : false
    }

    // filtered project
    var $projects = [];

    // filters
    var filters = {
      
      // date_filter
      date_filter: { 
        or: [{
          project_start_date: { '>=': new Date(params.start_date), '<=': new Date(params.end_date) }
        },{ 
          project_end_date: { '>=': new Date(params.start_date), '<=': new Date(params.end_date) } 
        }]
      },
      // project_status
      project_status_filter: params.project_status ? { project_status: params.project_status } : {},
      // project_type
      project_type_filter: params.project_type[0] === 'all' ? {} : { project_type: params.project_type },
      // beneficiaries_filter
      beneficiaries_filter: params.beneficiary_category[0] === 'all' ? {} : { beneficiary_category: params.beneficiary_category },
      // prov locations filter
      prov_code_filter: params.prov_code !== '*' ? { prov_code: params.prov_code } : {},
      // dist locations filter
      dist_code_filter: params.dist_code !== '*' ? { dist_code: params.dist_code } : {},

    };
    
    // get projects by organization_id
    Project.find()
      .where(filters.date_filter)
      .where(filters.project_status_filter)
      .where(filters.project_type_filter)
      .where(filters.beneficiaries_filter)
      .where(filters.prov_code_filter)
      .where(filters.dist_code_filter)
      .exec(function(err, projects){
      
        // return error
        if (err) return res.negotiate( err );

        // if no projects
        if (!projects.length) {
          // return zero
          return res.json( 200, { 'value': 0 } );
        } 

        // for each project, construct full object with associations
        projects.forEach(function(d, i){

          // clone project to update
          $projects[i] = d.toObject();
          // add locations
          $projects[i].locations = [];

          // get locations
          Location.find()
            .where( { project_id: $projects[i].id  } )
            .where(filters.prov_code_filter)
            .where(filters.dist_code_filter)            
            .exec(function( err, locations ){

            // return error
            if (err) return res.negotiate( err );

            // add beneficiaries
            locations.forEach(function(l, j){

              // clone locations
              $projects[i].locations[j] = l.toObject();
              // clone beneficiaries
              $projects[i].locations[j].beneficiaries = [];

              // get beneficiaries
              Beneficiaries.find().where( { location_id: $projects[i].locations[j].id  } ).exec(function( err, beneficiaries ){

                // return error
                if (err) return res.negotiate( err );

                // add beneficiaries
                $projects[i].locations[j].beneficiaries = beneficiaries;

                // run metrics
                if ( i === ( projects.length - 1 ) && j === ( locations.length - 1 ) ) {

                  // process final result (remove projects with empty locations)
                  var projectsFiltered = []
                  $projects.forEach(function(p) {
                    if( p.locations.length ){
                      projectsFiltered.push(p);
                    }
                  });

                  // if indicator, else data
                  if ( params.indicator ) {             

                    // calculate and return metric
                    ProjectDashboardController.getIndicatorMetric( params, filters, projectsFiltered, res );

                  } else {

                    // prepare download
                    ProjectDashboardController.getCsvDownload( params, filters, projectsFiltered, res );

                  }
                
                };

              });

            });

          });

        });

      });

  },

  // calculate indicator value from filtered project ids
  getIndicatorMetric: function( params, filters, $projects, res ) {

    // return indicator
    switch(params.indicator){

        case 'organizations':

          // organization_ids
          var organization_ids = [];
          
          // filter by $projects
          $projects.forEach(function(d, i){
            if ( d.project_status === 'active' ) {
              organization_ids.push(d.organization_id);
            }
          });

          // no. of organizations
          Organization.count( { id: organization_ids } ).exec(function(err, value){

            // return error
            if (err) return res.negotiate( err );

            // return new Project
            return res.json(200, { 'value': value });

          });

          break;
        case 'projects':

          // return new Project
          return res.json(200, { 'value': $projects.length });

          break;
        case 'locations':

          // project locations
          if ( !params.conflict ) {

            // get project locations
            var value = 0;

            $projects.forEach(function(p, i){
              // project dist list count
              value += p.locations.length;
            });
            
            // return new Project
            return res.json(200, { 'value': value });

          } else {

            // get conflict locations
            var value = 0;
            $projects.forEach(function(p, i){
              p.locations.forEach(function(l, j){
                if ( l.conflict ) {
                  value++;
                }
              });
            });

            // total conflict locations 
            District.find()
              .where( filters.prov_code_filter )
              .where( filters.dist_code_filter )
              .where( { conflict: true } ).exec(function(err, total){
              
              // return error
              if (err) return res.negotiate( err );

              // return new Project
              return res.json(200, { 'value': value, 'value_total': total.length });

            });

          }

          break;
        case 'beneficiaries':
          // beneficiaries
          var beneficiaries = ProjectDashboardController.getBeneficiaries( $projects, 'projects' );

          // return new Project
          return res.json(200, { 'value': beneficiaries.beneficiaries_total });

          break;
        case 'markers':

          // leaflet markers
          var markers = {},
              locationIds = [];

          // $projects
          $projects.forEach(function(p, i){
            // each location
            p.locations.forEach(function(l, j){
              locationIds.push(l.id);
            });
          });

          // get all locations
          Location.find( { id: locationIds } ).exec(function(err, locations){

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
          var beneficiaries,
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
              };

          // get beneficiaries
          var beneficiaries = ProjectDashboardController.getBeneficiaries( $projects, 'projects' );

          // breakdown
          switch(params.indicator){

            // indicator
            case 'under18':

              // calc %
              var malePerCent = ( beneficiaries.under18male / ( beneficiaries.under18male + beneficiaries.under18female ) ) * 100;
              var femalePerCent = ( beneficiaries.under18female / ( beneficiaries.under18male + beneficiaries.under18female ) ) * 100;
              var totalPerCent = ( beneficiaries.under18_total / ( beneficiaries.under18_total + beneficiaries.over18_total + beneficiaries.over59_total ) ) * 100;
              
              // assign data left
              result.label.left.label.label = malePerCent;
              result.label.left.subLabel.label = beneficiaries.under18male;
              // assign data center
              result.label.center.label.label = totalPerCent;
              result.label.center.subLabel.label = beneficiaries.under18_total
              // assign data right
              result.label.right.label.label = femalePerCent;
              result.label.right.subLabel.label = beneficiaries.under18female;

              // highcharts female
              result.data[0].y = femalePerCent;
              result.data[0].label = beneficiaries.under18_total;
              // highcharts male
              result.data[1].y = malePerCent;
              result.data[1].label = beneficiaries.under18_total;
              
              break;

            case 'over18':
              
              // calc %
              var malePerCent = ( beneficiaries.over18male / ( beneficiaries.over18male + beneficiaries.over18female ) ) * 100;
              var femalePerCent = ( beneficiaries.over18female / ( beneficiaries.over18female + beneficiaries.over18male ) ) * 100;
              var totalPerCent = ( beneficiaries.over18_total / ( beneficiaries.under18_total + beneficiaries.over18_total + beneficiaries.over59_total ) ) * 100;
              
              // assign data left
              result.label.left.label.label = malePerCent;
              result.label.left.subLabel.label = beneficiaries.over18male;
              // assign data center
              result.label.center.label.label = totalPerCent 
              result.label.center.subLabel.label = beneficiaries.over18_total
              // assign data right
              result.label.right.label.label = femalePerCent;
              result.label.right.subLabel.label = beneficiaries.over18female;

              // highcharts female
              result.data[0].y = femalePerCent;
              result.data[0].label = beneficiaries.over18_total;
              // highcharts male
              result.data[1].y = malePerCent;
              result.data[1].label = beneficiaries.over18_total;

              break; 

            case 'over59':
              
              // calc %
              var malePerCent = ( beneficiaries.over59male / ( beneficiaries.over59male + beneficiaries.over59female ) ) * 100;
              var femalePerCent = ( beneficiaries.over59female / ( beneficiaries.over59male + beneficiaries.over59female ) ) * 100;
              var totalPerCent = ( beneficiaries.over59_total / ( beneficiaries.under18_total + beneficiaries.over18_total + beneficiaries.over59_total ) ) * 100;
              
              // assign data left
              result.label.left.label.label = malePerCent;
              result.label.left.subLabel.label = beneficiaries.over59male;
              // assign data center
              result.label.center.label.label = totalPerCent 
              result.label.center.subLabel.label = beneficiaries.over59_total
              // assign data right
              result.label.right.label.label = femalePerCent;
              result.label.right.subLabel.label = beneficiaries.over59female;

              // highcharts female
              result.data[0].y = femalePerCent;
              result.data[0].label = beneficiaries.over59_total;
              // highcharts male
              result.data[1].y = malePerCent;
              result.data[1].label = beneficiaries.over59_total;

              break;
          }

          // return new Project
          return res.json(200, result );

          break;

      }

  },

  // prepare and return csv based on filtered project
  getCsvDownload: function( params, filters, $projects, res ) {

    // require
    var data = [],
        fields = [],
        _ = require('underscore'),
        json2csv = require('json2csv');

    // return indicator
    switch( params.details ){

      case 'locations':

        var $locations = [];

        // for each project
        $projects.forEach(function(p, i){      
          // create one list of locations 
          p.locations.forEach(function(l, i){
            // push location to list
            $locations.push( l );
          });
        });

        // project
        $locations.forEach(function(l, i){
          
          // add beneficiaries with underscore (get beneficiaries from fn for one location at a time)
          _.extend($locations[i], ProjectDashboardController.getBeneficiaries( [ $locations[i] ], 'locations' ) );

          // remove unwanted keys
          delete $locations[i].id;
          delete $locations[i].project_id;
          delete $locations[i].beneficiaries;
          delete $locations[i].timestamp;          

        });

        // get field names
        for (var key in $locations[0]) {
          // include
          fields.push(key);
        }     
  
        // assign for csv
        data = $locations;

        break;

      // default is projects
      default:

        // project
        $projects.forEach(function(p, i){
          
          // add beneficiaries with underscore (get beneficiaries from fn for one project at a time)
          _.extend($projects[i], ProjectDashboardController.getBeneficiaries( [ $projects[i] ], 'projects' ) );

          // remove unwanted keys
          delete $projects[i].id;
          delete $projects[i].locations;          

        });

        // get field names
        for (var key in $projects[0]) {
          fields.push(key);
        }
  
        // assign for csv
        data = $projects;

        break;  

    }

    // return csv
    json2csv( { data: data, fields: fields }, function( err, csv ) {
      
      // error
      if ( err ) return res.negotiate( err );

      // success
      return res.json( 200, { data: csv } );

    });

  }

};

module.exports = ProjectDashboardController;
