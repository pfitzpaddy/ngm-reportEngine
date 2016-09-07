/**
 * ProjectController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

 // update database
  updateProjectPcodes: function( req, res ){

    // begin
    Project
      .find({})
      .exec( function( err, projects ){
        
        // return error
        if ( err ) return res.negotiate( err );

        // counter
        var counter = 0,
            length = projects.length;

        // each project
        projects.forEach( function( p, i ) {

          // int to string
          var admin1pcodes = [],
              admin2pcodes = [];

          // int to string
          p.prov_code.forEach( function( d, j ){
            admin1pcodes.push( d.toString() )
          });

          // int to string
          p.dist_code.forEach( function( d, j ){
            admin2pcodes.push( d.toString() )
          });

          // update
          Project
            .update( { id: p.id }, { admin1pcode: admin1pcodes, admin2pcode: admin2pcodes } )
            .exec( function( err, t ){
              
              // return error
              if ( err ) return res.negotiate( err );

              // return
              counter++;
              if ( counter === length ) {
                // return
                return res.json( 200, { msg: 'success!' } );
              }

            });            

        });

      });

  },

  // update database
  updateTargetLocationPcodes: function( req, res ){

    // begin
    TargetLocation
      .find()
      .exec( function( err, target ){
        
        // return error
        if ( err ) return res.negotiate( err );

        // counter
        var counter = 0,
            length = target.length;

        // each project
        target.forEach( function( t, i ) {
          
          // update
          TargetLocation
            .update( { id: t.id }, { admin1pcode: t.prov_code, admin1name: t.prov_name, admin2pcode: t.dist_code, admin2name: t.dist_name, admin1lng: t.prov_lng, admin1lat: t.prov_lat, admin2lng: t.dist_lng, admin2lat: t.dist_lat } )
            .exec( function( err, result ){
              
              // return error
              if ( err ) return res.negotiate( err );

              // return
              counter++;
              if ( counter === length ) {
                // return
                return res.json( 200, { msg: 'success!' } );
              }

            });            

        });

      });

  },

  // update database
  updateLocationPcodes: function( req, res ){

    // begin
    Location
      .find()
      .exec( function( err, target ){
        
        // return error
        if ( err ) return res.negotiate( err );

        // counter
        var counter = 0,
            length = target.length;

        // each project
        target.forEach( function( t, i ) {
          
          // update
          Location
            .update( { id: t.id }, { admin1pcode: t.prov_code, admin1name: t.prov_name, admin2pcode: t.dist_code, admin2name: t.dist_name, admin1lng: t.prov_lng, admin1lat: t.prov_lat, admin2lng: t.dist_lng, admin2lat: t.dist_lat } )
            .exec( function( err, result ){
              
              // return error
              if ( err ) return res.negotiate( err );

              // return
              counter++;
              if ( counter === length ) {
                // return
                return res.json( 200, { msg: 'success!' } );
              }

            });            

        });

      });

  },

  // update database
  updateBeneficiariesPcodes: function( req, res ){

    // request input
    var filter = !req.param( 'project_id' ) ? {} : { project_id: req.param( 'project_id' ) };

    // begin
    Beneficiaries
      .find( filter )
      .exec( function( err, target ){
        
        // return error
        if ( err ) return res.negotiate( err );

        // counter
        var counter = 0,
            length = target.length;

        // each project
        target.forEach( function( t, i ) {
          
          // update
          Beneficiaries
            .update( { id: t.id }, { admin1pcode: t.prov_code, admin1name: t.prov_name, admin2pcode: t.dist_code, admin2name: t.dist_name, admin1lng: t.prov_lng, admin1lat: t.prov_lat, admin2lng: t.dist_lng, admin2lat: t.dist_lat } )
            .exec( function( err, result ){
              
              // return error
              if ( err ) return res.negotiate( err );

              // return
              counter++;
              if ( counter === length ) {
                // return
                return res.json( 200, { msg: 'success!' } );
              }

            });            

        });

      });

  },

  

  // update database
  updateTargetBeneficiaries: function( req, res ){

    // begin
    Project
      .find({})
      .exec( function( err, projects ){
        
        // return error
        if ( err ) return res.negotiate( err );

        // counter
        var counter = 0,
            length = projects.length;

        // each project
        projects.forEach( function( p, i ) {

          // update
          TargetBeneficiaries
            .update( { project_id: p.id }, { project_title: p.project_title, project_type: p.project_type } )
            .exec( function( err, t ){
              
              // return error
              if ( err ) return res.negotiate( err );

              // return
              counter++;
              if ( counter === length ) {
                // return
                return res.json( 200, { msg: 'success!' } );
              }

            });            

        });

      });

  },

  // update database
  updateTargetLocations: function( req, res ){

    // begin
    Project
      .find({})
      .exec( function( err, projects ){
        
        // return error
        if ( err ) return res.negotiate( err );

        // counter
        var counter = 0,
            length = projects.length;

        // each project
        projects.forEach( function( p, i ) {

          // update
          TargetLocation
            .update( { project_id: p.id }, { project_title: p.project_title, project_type: p.project_type } )
            .exec( function( err, t ){
              
              // return error
              if ( err ) return res.negotiate( err );

              // return
              counter++;
              if ( counter === length ) {
                // return
                return res.json( 200, { msg: 'success!' } );
              }

            });            

        });

      });

  },

  // update database
  updateLocations: function( req, res ){

    // begin
    Project
      .find({})
      .exec( function( err, projects ){
        
        // return error
        if ( err ) return res.negotiate( err );

        // counter
        var counter = 0,
            length = projects.length;

        // each project
        projects.forEach( function( p, i ) {

          // update
          Location
            .update( { project_id: p.id }, { project_title: p.project_title, project_type: p.project_type } )
            .exec( function( err, t ){
              
              // return error
              if ( err ) return res.negotiate( err );

              // return
              counter++;
              if ( counter === length ) {
                // return
                return res.json( 200, { msg: 'success!' } );
              }

            });            

        });

      });

  }, 

  // update database
  updateBeneficiaries: function( req, res ){

    // begin
    Project
      .find({})
      .exec( function( err, projects ){
        
        // return error
        if ( err ) return res.negotiate( err );

        // counter
        var counter = 0,
            length = projects.length;

        // each project
        projects.forEach( function( p, i ) {

          // update
          Beneficiaries
            .update( { project_id: p.id }, { project_title: p.project_title, project_type: p.project_type } )
            .exec( function( err, t ){
              
              // return error
              if ( err ) return res.negotiate( err );

              // return
              counter++;
              if ( counter === length ) {
                // return
                return res.json( 200, { msg: 'success!' } );
              }

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
        if ( err ) return res.negotiate( err );

        // return project
        return res.json( 200, project );

      });

    } else {
        
      // update project
      Project.update( { id: $project.id }, $project ).exec(function(err, project){

        // return error
        if (err) return res.negotiate( err );    

        // return Project
        return res.json(200, project[0]);

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
