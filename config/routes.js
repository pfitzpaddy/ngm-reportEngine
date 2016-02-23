/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  // '/': {
  //   view: 'homepage'
  // }

  // User authentication
  'GET /login': 'UserController.login',
  'POST /login': 'UserController.login',
  'POST /create': 'UserController.create',

  // Metrics
  'POST /metrics/set': 'MetricsController.set',

  // Upload
  'POST /upload-file': 'FileController.upload',
  'POST /process': 'FileController.process',
  'POST /print': 'FileController.print',

  // Location lists
  'POST /health/getProvincesList': 'Health/ListController.getProvincesList',
  'POST /health/getDistrictsList': 'Health/ListController.getDistrictsList',
  'POST /health/getFacilityTypeList': 'Health/ListController.getFacilityTypeList',
  'POST /health/getFacilityList': 'Health/ListController.getFacilityList',

  // Health Projects
  'POST /health/project/create': 'Health/ProjectController.create',
  'POST /health/project/getProjectList': 'Health/ProjectController.getProjects',  
  'POST /health/project/getUserProjectCount': 'Health/ProjectController.getUserProjectCountById',
  // get project details, locations, beneficiaries
  'POST /health/project/getProjectDetails': 'Health/ProjectController.getProjectDetailsById',
  'POST /health/project/setProjectDetails': 'Health/ProjectController.setProjectDetails',
  // set project locations
  'POST /health/project/setProjectLocations': 'Health/ProjectController.setProjectLocations',
  'POST /health/project/setProjectBeneficiaries': 'Health/ProjectController.setProjectBeneficiaries',
  // get/set project financials
  'POST /health/project/getProjectFinancials': 'Health/ProjectController.getProjectFinancialsById',
  'POST /health/project/setProjectFinancials': 'Health/ProjectController.setProjectFinancialsById',
  // get/set project objectives
  'POST /health/project/getProjectObjectives': 'Health/ProjectController.getProjectObjectivesById',
  'POST /health/project/setProjectObjectives': 'Health/ProjectController.setProjectObjectivesById',

  'POST /health/project/deleteProject': 'Health/ProjectController.deleteProjectById',

  // Health Dashboard
  'POST /health/total': 'Health/ProjectDashboardController.getTotal',
  'POST /health/markers': 'Health/ProjectDashboardController.getMarkers',

  // Dews 
  'POST /dews/indicator': 'DewsController.getIndicator',
  'POST /dews/chart': 'DewsController.getChart',
  'POST /dews/calendar': 'DewsController.getCalendar',
  'POST /dews/summary': 'DewsController.getSummary',
  'POST /dews/data': 'DewsController.getData',
  'POST /dews/markers': 'DewsController.getMarkers',
  'POST /dews/map': 'DewsController.getMap',

  // Watchkeeper
  'POST /wk/calendar': 'WatchkeeperController.getCalendar',
  'POST /wk/indicator': 'WatchkeeperController.getIndicator',
  'POST /wk/difference': 'WatchkeeperController.getDifference',
  'POST /wk/markers': 'WatchkeeperController.getMarkers',
  'POST /wk/data': 'WatchkeeperController.getData',
  'POST /wk/chart': 'WatchkeeperController.getChart',

  // Flood
  'POST /flood/risk': 'FloodController.getFloodRisk',
  'POST /flood/risk/type': 'FloodController.getFloodRiskType',
  'POST /flood/risk/area': 'FloodController.getFloodRiskArea',

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
