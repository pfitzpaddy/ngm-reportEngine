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

    // begin
    Beneficiaries
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

  // update database
  updateNullBeneficiaries: function( req, res ){

    // begin
    Location
      .find()
      .where({ report_id: null })
      .exec( function( err, locations ){
        
        // return error
        if ( err ) return res.negotiate( err );

        // counter
        var location_ids = [];

        // each project
        locations.forEach( function( l, i ) {

          //
          location_ids.push( l.id )

        });

        // locations
        if ( location_ids.length ) {
          // update
          Beneficiaries
            // .find()
            // .where( { location_id: location_ids } )
            .destroy( { location_id: location_ids } )
            .exec( function( err, b ){
              
              // return error
              if ( err ) return res.negotiate( err );

              // return
              return res.json( 200, { msg: 'Success!' } ); 

            });

        } else {
            // return
            return res.json( 200, { msg: 'No records to delete!' } );
        }      

      });

  }, 

  // update database
  updateNullLocations: function( req, res ){

    // 
    Location
      .destroy({ report_id: null })
      .exec( function( err, l ){
        
        // return error
        if ( err ) return res.negotiate( err );

        // return
        return res.json( 200, { msg: 'Success!' } );

      });   

  },  

  // update database
  updateDatabaseAdmin: function( req, res ){

    // update
    var admin = { adminRpcode: 'EMRO', adminRname: 'EMRO', admin0pcode: 'AF', admin0name: 'Afghanistan' };

    // begin
    User
      .update({}, admin )
      .exec( function( err, user ){
        
        // return error
        if ( err ) return res.negotiate( err );

        Organization
          .update({}, admin )
          .exec( function( err, user ){
            
            // return error
            if ( err ) return res.negotiate( err );

            Project
              .update({}, admin )
              .exec( function( err, user ){
                
                // return error
                if ( err ) return res.negotiate( err );

                TargetBeneficiaries
                  .update({}, admin )
                  .exec( function( err, user ){
                    
                    // return error
                    if ( err ) return res.negotiate( err );

                    TargetLocation
                      .update({}, admin )
                      .exec( function( err, user ){
                        
                        // return error
                        if ( err ) return res.negotiate( err );

                        Location
                          .update({}, admin )
                          .exec( function( err, user ){
                            
                            // return error
                            if ( err ) return res.negotiate( err );

                            Beneficiaries
                              .update({}, admin )
                              .exec( function( err, user ){
                                
                                // return error
                                if ( err ) return res.negotiate( err );

                                Report
                                  .update({}, admin )
                                  .exec( function( err, user ){
                                    
                                    // return error
                                    if ( err ) return res.negotiate( err );

                                    BudgetProgress
                                      .update({}, admin )
                                      .exec( function( err, user ){
                                        
                                        // return error
                                        if ( err ) return res.negotiate( err );

                                          // return
                                          return res.json( 200, { msg: 'success!' } );

                                      });                                    

                                  });                                 

                              });                             

                          });                         

                      });                    

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

  // get project details by id
  getProjectFinancialsById: function(req, res){
    
    // request input
    if (!req.param('id')) {
      return res.json(401, { err: 'id required!' });
    }
    
    // get project by organization_id
    Project.findOne({ id: req.param('id') }).populateAll().exec(function(err, project){
      
      // return error
      if (err) return res.negotiate( err );

      // return project json
      return res.json(200, project);

    });    

  },

  // set project financials by id
  setProjectFinancialsById: function(req, res){

     // request input
    if (!req.param('project')) {
      return res.json(401, { err: 'project required!' });
    }

    // get project
    var $project = req.param('project').details,
        $financials = req.param('project').financials;

    // financials exist
    if ( $financials.id ) {
      
      // update financials
      Financial.update( { id: $financials.id }, $financials ).exec(function(err, financials){
          
          // return error
          if (err) return res.negotiate( err );

          // return new Project
          return res.json(200, financials);
      });
    } else {
      
      // create financials
      Financial.create($financials).exec(function(err, financials){

        // return error
        if (err) return res.negotiate( err );        

        // return new Project
        return res.json(200, financials);        

      });
    }

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
    if (!req.param('id')) {
      return res.json(401, {err: '  id required!'});
    }
        
    // set project by project id
    Project.destroy({ id: req.param('id') }).exec(function(err){

      // return error
      if (err) return res.negotiate( err );
      
      // else
      return res.json(200, { msg: 'Project ' + req.param('id') + ' has been deleted!'});

    });
  }

};
