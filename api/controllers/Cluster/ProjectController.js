/**
 * ProjectController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // set project details
  setProjectById: function(req, res) {

    // request input
    if (!req.param('project')) {
      return res.json(401, { err: 'project required!' });
    }

    // get project
    var $project = req.param('project'),
        $status = req.param('project').project_status;

    // update project status if new
    if( $status === 'new' ){
      $project.project_status = 'active';
    }

    // if no id, create
    if ( !$project.id ) {

      // create
      Project.create( $project ).exec( function( err, project ){

        // return error
        if (err) return res.negotiate( err );       

        Project
          .findOne({ id: project.id })
          .populateAll()
          .exec( function( err, p ){

            // return error
            if (err) return res.negotiate( err );

            // return Project
            return res.json( 200, p );

        });

      });

    } else {
        
      // update project
      Project.update( { id: $project.id }, $project ).exec(function(err, project){

        // return error
        if (err) return res.negotiate( err );

        Project
          .findOne({ id: project[0].id })
          .populateAll()
          .exec( function( err, p ){

            // return error
            if (err) return res.negotiate( err );

            // return Project
            return res.json( 200, p );

        });

      });

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
    Project.findOne( { id: req.param('id') } ).populateAll().exec(function(err, project){
      
      // return error
      if (err) return res.negotiate( err );

      // clone project to update
      $project = project.toObject();

      // return project
      return res.json(200, $project);

    });   

  },

  // get all Projects by organization
  getProjectsList: function(req, res) {

    // request input
    if ( !req.param('filter') ) {
      return res.json(401, { err: 'filter required!' });
    }
    
    // get project by organization_id & status
    Project.find( req.param( 'filter' ) ).sort('updatedAt DESC').exec(function(err, projects){
      
      // return error
      if (err) return res.negotiate( err );

      // else
      return res.json(200, projects);

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
        if ( err ) return res.negotiate( err );

        // target beneficiaries
        TargetBeneficiaries.destroy( { project_id: project_id } )
          .exec( function( err ){

            // return error
            if ( err ) return res.negotiate( err );       

            // target locations
            TargetLocation.destroy( { project_id: project_id } )
              .exec( function( err ){

                // return error
                if ( err ) return res.negotiate( err );

                // beneficiaries
                Beneficiaries.destroy( { project_id: project_id } )
                  .exec( function( err ){

                    // return error
                    if ( err ) return res.negotiate( err );

                    // budget progress
                    BudgetProgress.destroy( { project_id: project_id } )
                      .exec( function( err ){

                        // return error
                        if ( err ) return res.negotiate( err ); 

                        // location
                        Location.destroy( { project_id: project_id } )
                          .exec( function( err ){

                            // return error
                            if ( err ) return res.negotiate( err );

                            // location
                            Report.destroy( { project_id: project_id } )
                              .exec( function( err ){

                                // return error
                                if ( err ) return res.negotiate( err );
      
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
