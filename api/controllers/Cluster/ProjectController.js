/**
 * ProjectController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var json2csv = require('json2csv');
var Promise  = require('bluebird');
var moment   = require('moment');
var async    = require('async');

module.exports = {

  // get all Projects by organization
  getProjectsList: function(req, res) {

    // request input
    if ( !req.param('filter') ) {
      return res.json(401, { err: 'filter required!' });
    }

    // get project by organization_id & status
    Project
      .find( req.param( 'filter' ) )
      .sort('updatedAt DESC')
      .exec(function(err, projects){

        // return error
        if (err) return res.negotiate( err );

        // else
        return res.json(200, projects);

      });

  },

  // get distinct sectors 
  getProjectSectors: function( req, res ) {
    
    // organization_id required
    if ( !req.param('organization_id') ) {
      return res.json(401, { err: 'organization_id required!' });
    }

    // get project by organization_id & status
    Project
      .find( { organization_id: req.param( 'organization_id' ) } )
      .exec( function( err, projects ){

        // return error
        if (err) return res.negotiate( err );

        // uniq cluster_id
        var distinct_sectors = _.uniq( projects, function( x ){
          return x.cluster_id;
        });

        // else
        return res.json( 200, distinct_sectors );

      });

  },

  // get projects summary
  getProjects: function(req, res){

    // Guards
    if (!req.param('id')&&!req.param('query')) {
      return res.json(401, { err: 'params required!' });
    }

    var allowedParams =
        ['project_id','organization_id','cluster_id','organization_id','organization_tag','adminRpcode', 'admin0pcode'];

    // if dissallowed parameters sent
    if ( req.param('query') && _.difference(Object.keys(req.param('query')),allowedParams).length > 0 ) {
      return res.json(401, { err: 'ivalid query params!' });
    }

    // build query object
    // legacy `id` api backward compatibility
    if (req.param('id')){
      var query = { project_id : req.param('id') };
      var queryProject = { id : req.param('id') };
    } else {
      var query, queryProject = req.param('query');
      if (req.param('query').project_id){
        queryProject.id = queryProject.project_id;
        delete queryProject.project_id;
      }
    }

    var csv = req.param('csv');

    // process request pipeline
    var pipe = Promise.resolve()
      .then(function(){ return actions._getProjectData(queryProject, query) })
      .then(function(res){ return actions._processCollections(res) })
      .then(function($project){ return actions._doResponse($project) })
      .catch(function(err){ return err === 'NO PROJECT' } , function(err) { return actions._errorNoProjectRes(err) })
      .catch(function(err){ return actions._error(err) });

    // pipeline actions definitions
    var actions = {

    _error : function(err){
      return res.negotiate(err);
    },

    _errorNoProjectRes : function(err){
      return res.json( 200, [] );
    },

    _getProjectData : function(queryProject, query){

                  return Promise.props({
                    project: Project.find( queryProject ),
                    budget: BudgetProgress.find( query ),
                    beneficiaries: TargetBeneficiaries.find( query ),
                    targetlocations: TargetLocation.find( query ),
                    //Report.find( findProject, updatedRelationsUser ),
                    //Location.update( findProject, updatedRelationsUser ),
                    //Beneficiaries.find( findProject, updatedRelationsUser ),
                  })

    },

    _processCollections : function(data){

      // no project found
      if ( !data.project.length ) return Promise.reject('NO PROJECT');

      // all projects
      $project = [];

      var _comparatorBuilder = this._comparatorBuilder

      // populate&sort fields
                        // TODO maybe realate models via populate
      var uppendDataToProject = function(project){

                    var projectId = project.id;
                    var i = data.project.indexOf(project);
                    // assemble project data
                    $project[i] = project;
                    $project[i].project_budget_progress = _.filter(data.budget, { 'project_id' : projectId}) ;
                    $project[i].target_beneficiaries = _.filter(data.beneficiaries, { 'project_id' : projectId}) ;
                    $project[i].target_locations = _.filter(data.targetlocations,       { 'project_id' : projectId}) ;

                    /// order
                    $project[i].target_beneficiaries
                               .sort(function(a, b){ return a.id.localeCompare( b.id ) });
                    $project[i].project_budget_progress
                               .sort(function(a, b){ return a.id > b.id });
                    $project[i].target_locations
                               .sort(function(a, b){
                                  if (a.site_type_name){
                                    if(a.admin3name){
                                      return eval(_comparatorBuilder(['admin1name','admin2name','admin3name','site_type_name','site_name']));
                                    } else {
                                      return eval(_comparatorBuilder(['admin1name','admin2name','site_type_name','site_name']));
                                    }
                                  } else {
                                      if( a.admin3name){
                                        return eval(_comparatorBuilder(['admin1name','admin2name','admin3name','site_name']));
                                      } else {
                                        return eval(_comparatorBuilder(['admin1name','admin2name','site_name']));
                                      }
                                    }
                    });

                    $project[i].project_start_date = moment($project[i].project_start_date).format('YYYY-MM-DD');
                    $project[i].project_end_date   = moment($project[i].project_end_date).format('YYYY-MM-DD');
                    $project[i].createdAt          = moment( $project[i].createdAt ).format('YYYY-MM-DD');
                    // callback if error or post work can be called here `cb()`;
                };

      async.each(data.project, uppendDataToProject);

      return $project;
    },

    // build a to b localeCompare from array of props
    _comparatorBuilder : function(compareObj){
        var compareArr = [];
        compareObj.forEach( function (criteria, i ) {
          compareArr.push('a'+'.'+criteria + '.' + 'localeCompare(b.' + criteria + ')');
        });
        return compareArr.join('||')
    },

    // do response
    _doResponse : function($project){
      if (csv) {
        var fields = [ 'cluster', 'organization', 'admin0name', 'id', 'project_status', 'name', 'email', 'phone','project_title', 'project_description', 'project_hrp_code', 'project_start_date', 'project_end_date', 'project_budget', 'project_budget_currency', 'project_donor_list' , 'implementing_partners','strategic_objectives_list', 'beneficiary_type_list','activity_type_list','target_beneficiaries_list', 'target_locations_list','createdAt']
        fieldNames = [ 'Cluster', 'Organization', 'Country', 'Project ID', 'Project Status', 'Focal Point', 'Email', 'Phone', 'Project Title', 'Project Description', 'HRP Project Code', 'project_start_date', 'project_end_date', 'Project Budget', 'Project Budget Currency', 'Project Donors'  ,  'Implementing Partners', 'Strategic Objectives', 'Beneficiary types','Activity types','Target Beneficiaries', 'Target locations','Created' ];
        $project = this._projectJson2Csv($project);

        json2csv({ data: $project, fields: fields, fieldNames: fieldNames }, function( err, csv ) {
          if ( err ) return res.negotiate( err );
          return res.json( 200, { data: csv } );
        });

      } else {
      // return Project
      return res.json( 200, $project.length===1?$project[0]:$project );
      }
    },

    // flatten subdocuments values
    // takes array of projects
    _projectJson2Csv : function(projects){

        var setKey = function(p, keyfrom,keyto,array){
          if ( p.hasOwnProperty(keyfrom)&&Array.isArray(p[keyfrom]) ) {
                var pa = [];
                p[keyfrom].forEach( function( p,i ){
                  if(p&&typeof p==='object'&&p!==null){
                    var ka = [];
                    var row = array.forEach(function( v,i ){
                      if (v.substring(0,4)==='key:'){
                        if (p.hasOwnProperty(v.substring(4))){
                          ka.push( v.substring(4)+':'+p[v.substring(4)] );
                        }
                      }else{
                        if (p.hasOwnProperty(v)) ka.push( p[v] );
                      }
                    });
                    var kl = ka.join(',');
                    if (p) pa.push( kl );
                  } //else if (p) pa.push(p);
                    //if old no obj array benef format
                });
              p[keyto] = pa.join('; ');
            }
          };
        // takes subdocuments key and produces flattened list of its values ->key_list
        var updateJson = function(project){
            setKey( project, 'strategic_objectives', 'strategic_objectives_list', ['objective_type_name', 'objective_type_description'] );
            setKey( project, 'beneficiary_type', 'beneficiary_type_list', ['beneficiary_type_name'] );
            setKey( project, 'project_donor', 'project_donor_list', ['project_donor_name'] );
            setKey( project, 'activity_type', 'activity_type_list', ['cluster', 'activity_type_name']  );
            setKey( project, 'inter_cluster_activities', 'inter_cluster_activities_list', ['cluster']  );
            setKey( project, 'activity_type', 'activity_type_list', ['cluster', 'activity_type_name']  );
            setKey( project, 'target_beneficiaries', 'target_beneficiaries_list', ['beneficiary_type_name', 'activity_type_name', 'activity_description_name', 'delivery_type_name',
            'key:units', 'key:cash_amount', 'key:households', 'key:sessions', 'key:families', 'key:boys', 'key:girls', 'key:men', 'key:women', 'key:elderly_men', 'key:elderly_women', 'key:unit_type_id' ]  );
            setKey( project, 'target_locations', 'target_locations_list', ['admin0name', 'admin1name','key:admin1pcode','admin2name','key:admin2pcode','site_name','key:admin2lng','key:admin2lat', 'key:conflict','key:name', 'email']  );

        };

        async.each(projects, updateJson);

        return projects;
        }
      }
  },

  // get project details by id
  getProjectById: function(req, res){

    // request input
    if (!req.param('id')) {
      return res.json(401, { err: 'id required!' });
    }

    // project for UI
    var $project = {};

    // get project by organization_id
    Project
      .findOne( { id: req.param('id') } )
      .exec( function( err, project ){

        // return error
        if ( err ) return res.negotiate( err );

        if ( !project ) return res.json( 200, [] );

        // clone project to update
        $project = project;

        // budget
        BudgetProgress
          .find({ project_id: $project.id })
          .exec( function( err, budgetprogress ){

          // return error
          if (err) return res.json({ err: true, error: err });

          // set
          $project.project_budget_progress = budgetprogress;

          // order dates
          $project.project_budget_progress.sort(function(a, b) {
            return a.id > b.id;
          });

          // target beneficiaries
          TargetBeneficiaries
            .find({ project_id: $project.id })
            .exec( function( err, target_beneficiaries ){

            // return error
            if (err) return res.json({ err: true, error: err });

            // set
            $project.target_beneficiaries = target_beneficiaries;

            // sort by id
            $project.target_beneficiaries.sort( function( a, b ) {
              return a.id.localeCompare( b.id );
            });

            // target beneficiaries
            TargetLocation
              .find({ project_id: $project.id })
              .exec( function( err, target_locations ){

              // return error
              if (err) return res.json({ err: true, error: err });

              // set
              $project.target_locations = target_locations;

              // order
              $project.target_locations.sort(function(a, b) {
                if ( a.site_type_name ) {
                  if( a.admin3name ) {
                    return a.admin1name.localeCompare(b.admin1name) ||
                            a.admin2name.localeCompare(b.admin2name) ||
                            a.admin3name.localeCompare(b.admin3name) ||
                            a.site_type_name.localeCompare(b.site_type_name) ||
                            a.site_name.localeCompare(b.site_name);
                  } else {
                    return a.admin1name.localeCompare(b.admin1name) ||
                            a.admin2name.localeCompare(b.admin2name) ||
                            a.site_type_name.localeCompare(b.site_type_name) ||
                            a.site_name.localeCompare(b.site_name);
                  }
                } else {
                  if( a.admin3name ) {
                    return a.admin1name.localeCompare(b.admin1name) ||
                            a.admin2name.localeCompare(b.admin2name) ||
                            a.admin3name.localeCompare(b.admin3name) ||
                            a.site_name.localeCompare(b.site_name);
                  } else {
                    return a.admin1name.localeCompare(b.admin1name) ||
                            a.admin2name.localeCompare(b.admin2name) ||
                            a.site_name.localeCompare(b.site_name);
                  }
                }
              });

              // return Project
              return res.json( 200, $project );

            });

          });

        });

      });

  },

  // set project details
  setProjectById: function(req, res) {

    // request input
    if (!req.param('project')) {
      return res.json(401, { err: 'project required!' });
    }

    // get project
    var $project = req.param('project'),
        $status = req.param('project').project_status,
        $project_budget_progress = req.param('project').project_budget_progress,
        $target_beneficiaries = req.param('project').target_beneficiaries,
        $target_locations = req.param('project').target_locations;
    // update project status if new
    if( $status === 'new' ){
      $project.project_status = 'active';
    }

    // update or create
    Project
      .updateOrCreate( $project, function( err, project ){

      // return error
      if (err) return res.json({ err: true, error: err });

      // clone project to update
      $project = project;

      // target beneficiaries
      BudgetProgress
        .updateOrCreateEach( { project_id: $project.id }, $project_budget_progress, function( err, project_budget_progress ){

        // return error
        if (err) return res.json({ err: true, error: err });

        // set
        $project.project_budget_progress = project_budget_progress;

        // order dates
        $project.project_budget_progress.sort(function(a, b) {
          return a.id > b.id;
        });

        // target beneficiaries
        TargetBeneficiaries
          .updateOrCreateEach( { project_id: $project.id }, $target_beneficiaries, function( err, target_beneficiaries ){

          // return error
          if (err) return res.json({ err: true, error: err });

          // set
          $project.target_beneficiaries = target_beneficiaries;

          // sort by id
          $project.target_beneficiaries.sort( function( a, b ) {
            return a.id.localeCompare( b.id );
          });

          // target beneficiaries
          TargetLocation
            .updateOrCreateEach( { project_id: $project.id }, $target_locations, function( err, target_locations ){

            // return error
            if (err) return res.json({ err: true, error: err });

            // set
            $project.target_locations = target_locations;

            // order
            $project.target_locations.sort(function(a, b) {
              if ( a.site_type_name ) {
                if( a.admin3name ) {
                  return a.admin1name.localeCompare(b.admin1name) ||
                          a.admin2name.localeCompare(b.admin2name) ||
                          a.admin3name.localeCompare(b.admin3name) ||
                          a.site_type_name.localeCompare(b.site_type_name) ||
                          a.site_name.localeCompare(b.site_name);
                } else {
                  return a.admin1name.localeCompare(b.admin1name) ||
                          a.admin2name.localeCompare(b.admin2name) ||
                          a.site_type_name.localeCompare(b.site_type_name) ||
                          a.site_name.localeCompare(b.site_name);
                }
              } else {
                if( a.admin3name ) {
                  return a.admin1name.localeCompare(b.admin1name) ||
                          a.admin2name.localeCompare(b.admin2name) ||
                          a.admin3name.localeCompare(b.admin3name) ||
                          a.site_name.localeCompare(b.site_name);
                } else {
                  return a.admin1name.localeCompare(b.admin1name) ||
                          a.admin2name.localeCompare(b.admin2name) ||
                          a.site_name.localeCompare(b.site_name);
                }
              }
            });
            // project user contact details
            // beside project details related collections updates also report's ones
            // TODO make it return promise
            updateUser($project);

            // update submited data fields
            updateBeneficiaries($project);
            // return Project
            return res.json( 200, $project );

          });

        });

      });

    });

    var updateUser = function($project){
      // user object to update tables
      var updatedRelationsUser = {
        username: $project.username,
        name: $project.name,
        position: $project.position,
        phone: $project.phone,
        email: $project.email
      }

      var findProject = {
        project_id: $project.id
      }

      Promise.all([
        Project.update( { id: $project.id }, updatedRelationsUser ),
        BudgetProgress.update( findProject, updatedRelationsUser ),
        TargetBeneficiaries.update( findProject, updatedRelationsUser ),
        //TargetLocation.update( findProject, updatedRelationsUser ),
        Report.update( findProject, updatedRelationsUser ),
        //Location.update( findProject, updatedRelationsUser ),
        Beneficiaries.update( findProject, updatedRelationsUser ),
      ])
        .catch( function(err) {
          return res.negotiate( err )
        })
        .done();
    };

    var updateBeneficiaries = function($project){

      // add fields here to update
      var updateBeneficiariesFields = {
        project_title: $project.project_title, 
        project_donor: $project.project_donor,
      }

      var findProject = {
        project_id: $project.id
      }

      Promise.all([
      Beneficiaries.update(findProject, updateBeneficiariesFields),
      // TargetBeneficiaries.update(findProject, updateBeneficiariesFields)
        ])
        .catch( function(err) {
          return res.negotiate( err )
        })
        .done();
    };
  },

  // remvoe budget item
  removeBudgetItemById: function(req, res) {
    // request input
    if ( !req.param( 'id' ) ) {
      return res.json({ err: true, error: 'id required!' });
    }

    var id = req.param( 'id' );

    // target beneficiaries
    BudgetProgress
      .update( { id: id }, { project_id: null } )
      .exec( function( err, result ){

        // return error
        if ( err ) return res.json({ err: true, error: err });

        // return Project
        return res.json( 200, { msg: 'Success!' } );

      });
  },

  // remove target beneficiary
  removeBeneficiaryById: function(req, res) {
    // request input
    if ( !req.param( 'id' ) ) {
      return res.json({ err: true, error: 'id required!' });
    }

    var id = req.param( 'id' );

    // target beneficiaries
    TargetBeneficiaries
      .update( { id: id }, { project_id: null } )
      .exec( function( err, result ){

        // return error
        if ( err ) return res.json({ err: true, error: err });

        // return Project
        return res.json( 200, { msg: 'Success!' } );

      });
  },

  // remove target location
  removeLocationById: function( req, res ) {
    // request input
    if ( !req.param( 'id' ) ) {
      return res.json({ err: true, error: 'id required!' });
    }

    var id = req.param( 'id' );

    // target location
    TargetLocation
      .update( { id: id }, { project_id: null, update_location: true } )
      .exec( function( err, result ){

        // return error
        if ( err ) return res.json({ err: true, error: err });

        // return Project
        return res.json( 200, { msg: 'Success!' } );

      });
  },

  // delete project
  deleteProjectById: function(req, res) {

    // request input
    if ( !req.param( 'project_id' ) ) {
      return res.json( 401, { err: 'project_id required!' } );
    }

    // project id
    var project_id = req.param( 'project_id' );

    // set project by project id
    Project.destroy( { id: project_id } )
      .exec( function( err ){

        // return error
        if ( err ) return res.json({ err: true, error: err });

        // target beneficiaries
        TargetBeneficiaries.destroy( { project_id: project_id } )
          .exec( function( err ){

            // return error
            if ( err ) return res.json({ err: true, error: err });

            // target locations
            TargetLocation.destroy( { project_id: project_id } )
              .exec( function( err ){

              // return error
              if ( err ) return res.json({ err: true, error: err });

              // budget progress
              BudgetProgress.destroy( { project_id: project_id } )
                .exec( function( err ){

                  // return error
                  if ( err ) return res.json({ err: true, error: err });

                  // location
                  Report.destroy( { project_id: project_id } )
                    .exec( function( err ){

                      // return error
                      if ( err ) return res.json({ err: true, error: err });

                      // location
                      Location.destroy( { project_id: project_id } )
                        .exec( function( err ){

                          // return error
                          if ( err ) return res.json({ err: true, error: err });

                          // beneficiaries
                          Beneficiaries.destroy( { project_id: project_id } )
                            .exec( function( err ){

                              // return error
                              if ( err ) return res.json({ err: true, error: err });

                                // else
                                return res.json( 200, { msg: 'Project ' + project_id + ' has been deleted!' } );

                              });

                          });

                      });

                  });

              });

        });

      });
  },

  getFinancialDetails: function(req, res){
        // request input
        if ( !req.param( 'project_id' ) ) {
          return res.json( 401, { err: 'project_id required!' } );
        }
        // project id
        var project_id = req.param( 'project_id' );

        // fields
        var fields = [ 'cluster', 'organization', 'admin0name', 'project_title', 'project_description', 'project_hrp_code', 'project_budget', 'project_budget_currency', 'project_donor_name', 'grant_id', 'currency_id', 'project_budget_amount_recieved', 'contribution_status', 'project_budget_date_recieved', 'budget_funds_name', 'financial_programming_name', 'multi_year_funding_name', 'funding_2017', 'reported_on_fts_name', 'fts_record_id', 'email', 'createdAt', 'comments' ]
            fieldNames = [ 'Cluster', 'Organization', 'Country', 'Project Title', 'Project Description', 'HRP Project Code', 'Project Budget', 'Project Budget Currency', 'Project Donor', 'Donor Grant ID', 'Currency Recieved', 'Ammount Received', 'Contribution Status', 'Date of Payment', 'Incoming Funds', 'Financial Programming', 'Multi-Year Funding', '2017 Funding', 'Reported on FTS', 'FTS ID', 'Email', 'createdAt', 'Comments' ];

        // get data by project

        BudgetProgress
          .find()
          .where( { project_id: project_id } )
          .exec( function( err, budget ){

            // return error
            if (err) return res.negotiate( err );

            // return csv
            json2csv({ data: budget, fields: fields, fieldNames: fieldNames }, function( err, csv ) {

              // error
              if ( err ) return res.negotiate( err );

              // success
              if ( req.params.text ) {
                res.set('Content-Type', 'text/csv');
                return res.send( 200, csv );
              } else {
                return res.json( 200, { data: csv } );
              }

            });

          });
  }
};
