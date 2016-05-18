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
