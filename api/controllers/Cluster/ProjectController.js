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
        if (err) return res.negotiate( err );

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

          console.log( { project_id: $project.id } )

          // target beneficiaries
          TargetBeneficiaries
            .find({ project_id: $project.id })
            .exec( function( err, target_beneficiaries ){

            // return error
            if (err) return res.json({ err: true, error: err });

            // set
            $project.target_beneficiaries = target_beneficiaries;

            // target beneficiaries
            TargetLocation
              .find({ project_id: $project.id })
              .exec( function( err, target_locations ){

              // return error
              if (err) return res.json({ err: true, error: err });

              // set
              $project.target_locations = target_locations;

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
      TargetBeneficiaries
        .updateOrCreateEach( { project_id: $project.id }, $target_beneficiaries, function( err, target_beneficiaries ){

        // return error
        if (err) return res.json({ err: true, error: err });

        // set
        $project.target_beneficiaries = target_beneficiaries;

        // target beneficiaries
        TargetLocation
          .updateOrCreateEach( { project_id: $project.id }, $target_locations, function( err, target_locations ){

          // return error
          if (err) return res.json({ err: true, error: err });

          // set
          $project.target_locations = target_locations;

          // return Project
          return res.json( 200, $project );

        });

      });

    });

  },

  // remove target beneficiary
  removeBeneficiaryById: function(req, res) {
    // request input
    if ( !req.param( 'id' ) ) {
      // return error
      return res.json({ err: true, error: 'id required!' });
    }

    var id = req.param( 'id' );

    console.log( 'remove' );
    console.log(id);

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
