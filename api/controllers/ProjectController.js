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
    if (!req.param('organization_id')) {
      return res.json(401, {err: 'organization_id required!'});
    }

    // create Project with organization_id
    Project.create({
      organization_id: req.param('organization_id')
    }).exec(function(err, project){
      
      // return error
      if (err) return res.negotiate( err );

      // return new Project
      return res.json(200, project);

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
    }).exec(function(err, projects){
      
      // return error
      if (err) return res.negotiate( err );

      // else
      return res.json(200, projects);

    });

  },

  // get all Projects by organization
  getProjectById: function(req, res) {

    // request input
    if (!req.param('id')) {
      return res.json(401, {err: 'id required!'});
    }    
    
    // get project by organization_id
    Project.findOne({ id: req.param('id') }).exec(function(err, project){

      // return error
      if (err) return res.negotiate( err );
        
      // else
      return res.json(200, project);

    });

  },

  // set project details
  setProjectById: function(req, res) {

    // set project by project id
    Project.update({ id: req.param('project').id }, req.param('project')).exec(function(err, project){
      
      // return error
      if (err) return res.negotiate( err );

      // else
      return res.json(200, project);

    });

  },  

  // delete project
  deleteProjectById: function(req, res) {

    // set project by project id
    Project.destroy({ id: req.param('id') }).exec(function(err){

      // return error
      if (err) return res.negotiate( err );
        
      // else
      return res.json(200, { msg: 'Project ' + req.param('id') + ' has been deleted!'});

    });

  }

};
