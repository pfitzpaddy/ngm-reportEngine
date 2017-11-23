/**
 * ProjectController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

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
                if ( a.facility_type_name ) {
                  if( a.admin3name ) {
                    return a.admin1name.localeCompare(b.admin1name) ||
                            a.admin2name.localeCompare(b.admin2name) ||
                            a.admin3name.localeCompare(b.admin3name) ||
                            a.facility_type_name.localeCompare(b.facility_type_name) ||
                            a.facility_name.localeCompare(b.facility_name);
                  } else {
                    return a.admin1name.localeCompare(b.admin1name) ||
                            a.admin2name.localeCompare(b.admin2name) ||
                            a.facility_type_name.localeCompare(b.facility_type_name) ||
                            a.facility_name.localeCompare(b.facility_name);
                  }
                } else {
                  if( a.admin3name ) {
                    return a.admin1name.localeCompare(b.admin1name) ||
                            a.admin2name.localeCompare(b.admin2name) ||
                            a.admin3name.localeCompare(b.admin3name) ||
                            a.facility_name.localeCompare(b.facility_name);
                  } else {
                    return a.admin1name.localeCompare(b.admin1name) ||
                            a.admin2name.localeCompare(b.admin2name) ||
                            a.facility_name.localeCompare(b.facility_name);
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
              if ( a.facility_type_name ) {
                if( a.admin3name ) {
                  return a.admin1name.localeCompare(b.admin1name) ||
                          a.admin2name.localeCompare(b.admin2name) ||
                          a.admin3name.localeCompare(b.admin3name) ||
                          a.facility_type_name.localeCompare(b.facility_type_name) ||
                          a.facility_name.localeCompare(b.facility_name);
                } else {
                  return a.admin1name.localeCompare(b.admin1name) ||
                          a.admin2name.localeCompare(b.admin2name) ||
                          a.facility_type_name.localeCompare(b.facility_type_name) ||
                          a.facility_name.localeCompare(b.facility_name);
                }
              } else {
                if( a.admin3name ) {
                  return a.admin1name.localeCompare(b.admin1name) ||
                          a.admin2name.localeCompare(b.admin2name) ||
                          a.admin3name.localeCompare(b.admin3name) ||
                          a.facility_name.localeCompare(b.facility_name);
                } else {
                  return a.admin1name.localeCompare(b.admin1name) ||
                          a.admin2name.localeCompare(b.admin2name) ||
                          a.facility_name.localeCompare(b.facility_name);
                }
              }
            });
            // project user contact details
            // beside project details related collections updates also report's ones
            // TODO make it return promise
            updateUser($project);
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
      // TODO make it global
      var Promise = require('bluebird');

      Promise.all([
        Project.update( { id: $project.id }, updatedRelationsUser ),
        BudgetProgress.update( findProject, updatedRelationsUser ),
        TargetBeneficiaries.update( findProject, updatedRelationsUser ),
        TargetLocation.update( findProject, updatedRelationsUser ),
        Report.update( findProject, updatedRelationsUser ),
        Location.update( findProject, updatedRelationsUser ),
        Beneficiaries.update( findProject, updatedRelationsUser ),
      ])
        .catch( function(err) {
          return res.negotiate( err )
        })
        .done();
    }
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
  }

};
