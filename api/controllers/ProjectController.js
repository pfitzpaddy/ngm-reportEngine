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

    // project for UI
    var projectObject = {};

    // create Project with organization_id
    Project.create({
      organization_id: req.param('organization_id')
    }).exec(function(err, project){
      
      // return error
      if (err) return res.negotiate( err );

      // project 
      projectObject.details = project;

      // create empty activities
      Activity.create({
        organization_id: req.param('organization_id'),
        project_id: project.id
      }).exec(function(err, activity){
      
        // return error
        if (err) return res.negotiate( err );

        // add activities
        projectObject.activities = [activity];
        // set defaults
        projectObject.activities[0].beneficiaries = {
          organization_id: req.param('organization_id'),
          project_id: project.id,
          activity_id: activity.id     
        }
        // add empty location
        projectObject.activities[0].locations = [];

        // return new Project
        return res.json(200, projectObject);

      });

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

  // get all Projects by organization
  getProjectById: function(req, res) {

    // request input
    if (!req.param('id')) {
      return res.json(401, {err: 'id required!'});
    }

    // project for UI
    var projectObject = {};
    
    // get project by organization_id
    Project.findOne({ id: req.param('id') }).exec(function(err, project){

      // return error
      if (err) return res.negotiate( err );

      // set details
      projectObject.details = project;

      // get activity
      Activity.find({ project_id: req.param('id') }).exec(function(err, activities){

        // return error
        if (err) return res.negotiate( err );

        // add to project
        projectObject.activities = activities;

        // get beneficiaries
        Beneficiaries.find({ project_id: req.param('id') }).exec(function(err, beneficiaries){

          // return error
          if (err) return res.negotiate( err );

          // get beneficiaries
          Location.find({ project_id: req.param('id') }).exec(function(err, locations){

            // return error
            if (err) return res.negotiate( err );

            // for each activity
            projectObject.activities.forEach(function(activity, index){

              // for each beneficiaries
              beneficiaries.forEach(function(beneficiary){
                // if activity id is the same
                if( activity.id === beneficiary.activity_id){
                  // add to activities
                  projectObject.activities[index].beneficiaries = beneficiary;
                }
              });

              // for each location
              locations.forEach(function(location){
                // if activity id is the same
                if( activity.id === location.activity_id){
                  // add to activities
                  if(!projectObject.activities[index].locations){
                    projectObject.activities[index].locations = [];
                  }
                  projectObject.activities[index].locations.push(location);
                }
              });              

            });

            // return project json
            return res.json(200, projectObject);

          });          

        });
      
      });

    });

  },

  // set project details
  setProjectById: function(req, res) {

    // request input
    if (!req.param('project')) {
      return res.json(401, {err: 'project required!'});
    }

    // get project
    var project = req.param('project').details,
        activities = req.param('project').activities,
        status = req.param('project').details.project_status;

    // update project status
    project.project_status = 'active';

    // set project by project id
    Project.update({ id: project.id }, project).exec(function(err, project){

      // return error
      if (err) return res.negotiate( err );

      // if new, create
      if(status === 'new') {

        // for each created activity
        activities.forEach(function(activity, index){

          Activity.update({ id: activity.id }, activity).exec(function(err, activity){               

            // beneficiaries
            Beneficiaries.create(activities[index].beneficiaries).exec(function(err, b){

              // return error
              if (err) return res.negotiate( err );

              // locations
              Location.create(activities[index].locations).exec(function(err, l){

                // return error
                if (err) return res.negotiate( err );

                // return new Project
                return res.json(200, project);

              });

            });

          });

        });

      // update
      } else {

        // return new Project
        return res.json(200, project);

      }

    });

  },

  // delete project
  deleteProjectById: function(req, res) {

    // request input
    if (!req.param('id')) {
      return res.json(401, {err: '  id required!'});
    }

    // delete activities first
    Activity.destroy({ project_id: req.param('id') }).exec(function(err){

      // return error
      if (err) return res.negotiate( err );
        
      // set project by project id
      Project.destroy({ id: req.param('id') }).exec(function(err){

        // return error
        if (err) return res.negotiate( err );
          
        // else
        return res.json(200, { msg: 'Project ' + req.param('id') + ' has been deleted!'});

      });

    });

  },

  // create Activity
  createActivity: function(req, res) {

    // request input
    if (!req.param('organization_id') || !req.param('project_id')) {
      return res.json(401, {err: 'organization_id, project_id required!'});
    }

    // create Project with organization_id
    Activity.create({
      organization_id: req.param('organization_id'),
      project_id: req.param('project_id'),
    }).exec(function(err, activity){
      
      // return error
      if (err) return res.negotiate( err );

      // return new Project
      return res.json(200, activity);

    });

  }   

};
