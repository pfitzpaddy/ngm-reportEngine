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
    if (!req.param('organization_id') || !req.param('user_id') || !req.param('username') ) {
      return res.json(401, {err: 'organization_id, user_id, username required!'});
    }

    // project for UI
    var projectObject = {};

    // create Project with organization_id
    Project.create({
      organization_id: req.param('organization_id'),
      user_id: req.param('user_id'),
      username: req.param('username')
    }).exec(function(err, project){
      
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
      return res.json(401, {err: 'organization_id, project_status required!'});
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

  // get project details by id
  getProjectDetailsById: function(req, res){
    
    // request input
    if (!req.param('id')) {
      return res.json(401, {err: 'id required!'});
    }

    // project for UI
    var projectObject = {};
    
    // get project by organization_id
    Project.find({ id: req.param('id') }).exec(function(err, project){
      
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

  // set project details
  setProjectDetails: function(req, res) {

    // request input
    if (!req.param('project')) {
      return res.json(401, {err: 'project required!'});
    }

    // get project
    var project = req.param('project').details,
        locations = req.param('project').locations,
        beneficiaries = req.param('project').beneficiaries;

    // project for UI
    var projectObject = {};        

    // set project by project id
    Project.update({ id: project.id }, project).exec(function(err, project){

      // return error
      if (err) return res.negotiate( err );

      // set details
      projectObject.details = project;      

      // update beneficiaries
      Location.update({ id: project.id }, beneficiaries).exec(function(err, locations){

        // return error
        if (err) return res.negotiate( err );

        // set locations
        projectObject.locations = locations;

        // update beneficiaries
        Beneficiaries.update({ id: project.id }, beneficiaries).exec(function(err, beneficiaries){

          // return error
          if (err) return res.negotiate( err );

          // set beneficiaries
          projectObject.beneficiaries = beneficiaries;

          // return new Project
          return res.json(200, projectObject);

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

      Location.destroy({ project_id: req.param('id') }).exec(function(err){

        // return error
        if (err) return res.negotiate( err );

        Beneficiaries.destroy({ project_id: req.param('id') }).exec(function(err){

          // return error
          if (err) return res.negotiate( err );                
        
          // else
          return res.json(200, { msg: 'Project ' + req.param('id') + ' has been deleted!'});

        });

      });

    });
  }

};
