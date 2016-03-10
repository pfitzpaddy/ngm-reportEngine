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

      // project beneficiaries
      projectObject.beneficiaries = [];            

      // return new Project
      return res.json(200, projectObject);

    });

  },

  // get all Projects by organization
  getProjects: function(req, res) {

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

  // get the total number of projects by user
  getUserProjectCountById: function(req, res) {
    
    // request input
    if (!req.param('username')) {
      return res.json(401, { err: 'username required!' });
    }

    // get project by organization_id & status
    Project.count({
      username: req.param('username')
    }).exec(function(err, value){
      
      // return error
      if (err) return res.negotiate( err );

      // else
      return res.json(200, { 'value': value });

    });

  },

  // set project details
  setProjectDetails: function(req, res) {

    // request input
    if (!req.param('project')) {
      return res.json(401, { err: 'project required!' });
    }

    // get project
    var project = req.param('project').details,
        status = req.param('project').details.project_status;

    // update project status if new
    if( status === 'new' ){
      project.project_status = 'active';
    }

    // set project by project id
    Project.update({ id: project.id }, project).exec(function(err, project){

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
    var $project = req.param('project').details,
        $locations = req.param('project').locations;

    // destroy all locations
    Location.destroy({ project_id: $project.id }).exec(function(err){

      // return error
      if (err) return res.negotiate( err );

      // create
      Location.create($locations).exec(function(err, locations){

        // return error
        if (err) return res.negotiate( err );        

        // return new Project
        return res.json(200, locations);        

      });

    });

  },

  // set project beneficiaries
  setProjectBeneficiaries: function(req, res){

     // request input
    if (!req.param('project')) {
      return res.json(401, { err: 'project required!' });
    }

    // get project
    var $project = req.param('project').details,
        $beneficiaries = req.param('project').beneficiaries;

    // destroy all beneficiaries
    Beneficiaries.destroy({ project_id: $project.id }).exec(function(err){

      // return error
      if (err) return res.negotiate( err );

      // create
      Beneficiaries.create($beneficiaries).exec(function(err, beneficiaries){

        // return error
        if (err) return res.negotiate( err );        

        // return new Project
        return res.json(200, beneficiaries);        

      });

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
      Location.find({ project_id: req.param('id') }).exec(function(err, locations){

        // return error
        if (err) return res.negotiate( err );

        // set locations
        projectObject.locations = locations;

        // get beneficiaries
        Beneficiaries.find({ project_id: req.param('id') }).exec(function(err, beneficiaries){

          // return error
          if (err) return res.negotiate( err );

          // set locations
          projectObject.beneficiaries = beneficiaries;

          // return project json
          return res.json(200, projectObject);          

        });        

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

      // get beneficiaries
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

    // destroy all financials
    Financial.destroy({ project_id: $project.id }).exec(function(err){

      // return error
      if (err) return res.negotiate( err );

      // create
      Financial.create($financials).exec(function(err, financials){

        // return error
        if (err) return res.negotiate( err );        

        // return new Project
        return res.json(200, financials);        

      });

    });

  },

  // get project details by id
  getProjectObjectivesById: function(req, res){
    
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
      Objective.findOne({ project_id: req.param('id')}).exec(function(err, objectives){

        // return error
        if (err) return res.negotiate( err );

        // set objectives
        projectObject.objectives = objectives;

        // get beneficiaries
        ObjectiveLocation.find({ project_id: req.param('id')}).exec(function(err, locations){

          // return error
          if (err) return res.negotiate( err );

          // set objectives
          projectObject.objectiveLocations = locations;

          // return project json
          return res.json(200, projectObject);    

        });

      });

    });    

  },

  // set project objectives by id
  setProjectObjectivesById: function(req, res){

     // request input
    if (!req.param('project')) {
      return res.json(401, { err: 'project required!' });
    }

    // get project
    var $project = req.param('project').details,
        $objectives = req.param('project').objectives,
        $objectiveLocations = req.param('project').objectiveLocations;

    // destroy all objectives
    Objective.destroy({ project_id: $project.id }).exec(function(err){

      // return error
      if (err) return res.negotiate( err );

      ObjectiveLocation.destroy({ project_id: $project.id }).exec(function(err){

        // return error
        if (err) return res.negotiate( err );

        ObjectiveLocation.create($objectiveLocations).exec(function(err, locations){

          // return error
          if (err) return res.negotiate( err );          

          // create
          Objective.create($objectives).exec(function(err, objectives){

            // return error
            if (err) return res.negotiate( err );

            // return project json
            return res.json(200, objectives);

          });

        });

      });

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
