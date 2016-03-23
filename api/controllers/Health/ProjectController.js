/**
 * ProjectController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // create Project
  create: function(req, res) {

    // request input
    if (!req.param('project') ) {
      return res.json(401, { err: 'project required!' });
    }

    // project for UI
    var projectObject = {};

    // create Project with organization_id
    Project.create(req.param('project')).exec(function(err, project){
      
      // return error
      if (err) return res.negotiate( err );

      // project details
      projectObject.details = project;

      // project locations
      projectObject.locations = [];

      // return new Project
      return res.json(200, projectObject);

    });

  },

  // set project details
  setProjectDetails: function(req, res) {

    // request input
    if (!req.param('project')) {
      return res.json(401, { err: 'project required!' });
    }

    // get project
    var $project = req.param('project').details,
        $status = req.param('project').details.project_status;

    // update project status if new
    if( $status === 'new' ){
      $project.project_status = 'active';
    }

    // set project by project id
    Project.update( { id: $project.id }, $project ).exec(function(err, project){

      // return error
      if (err) return res.negotiate( err );

      // return new Project
      return res.json(200, project);

    });

  },

  // set project locations
  setProjectLocations: function(req, res){

    // request input
    if (!req.param('project')) {
      return res.json(401, { err: 'project required!' });
    }

    // get project
    var $locations = req.param('project').locations;

    // for each location
    $locations.forEach(function(d, i){ 

      // location exists
      if (d.id) {

        // update locations/beneficiaries
        Location.update( { id: d.id }, d ).exec(function(err, locations){
            
            // return error
            if (err) return res.negotiate( err );

            // return new Project
            return res.json(200, locations);

        });

      } else {
        
        // create
        Location.create( d ).exec(function(err, location){

          // return error
          if (err) return res.negotiate( err );

          //
          return res.json(200, location);

        });

      }
    
    });

  },

  // get project details by id
  getProjectDetailsById: function(req, res){
    
    // request input
    if (!req.param('id')) {
      return res.json(401, { err: 'id required!' });
    }

    // project for UI
    var projectObject = {};
    
    // get project by organization_id
    Project.findOne({ id: req.param('id') }).exec(function(err, project){
      
      // return error
      if (err) return res.negotiate( err );

      // set details
      projectObject.details = project;

      // get beneficiaries
      Location.find({ project_id: req.param('id') }).populate( 'beneficiaries' ).exec(function(err, locations){

        // return error
        if (err) return res.negotiate( err );

        // set locations
        projectObject.locations = locations; 

        // return project json
        return res.json(200, projectObject);

      });     


    });    

  },

  // get project details by id
  getProjectFinancialsById: function(req, res){
    
    // request input
    if (!req.param('id')) {
      return res.json(401, { err: 'id required!' });
    }

    // project for UI
    var projectObject = {};
    
    // get project by organization_id
    Project.findOne({ id: req.param('id') }).exec(function(err, project){
      
      // return error
      if (err) return res.negotiate( err );

      // set details
      projectObject.details = project;

      // get financials
      Financial.find({ project_id: req.param('id') }).exec(function(err, financials){

        // return error
        if (err) return res.negotiate( err );

        // set financials
        projectObject.financials = financials;

        // return project json
        return res.json(200, projectObject);

      });     


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
    if ($financials.id) {
      
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
    if (!req.param('organization_id') || !req.param('project_status')) {
      return res.json(401, { err: 'organization_id, project_status required!' });
    }    
    
    // get project by organization_id & status
    Project.find({ 
      organization_id: req.param('organization_id'),
      project_status: req.param('project_status')
    }).sort('updatedAt DESC').exec(function(err, projects){
      
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
