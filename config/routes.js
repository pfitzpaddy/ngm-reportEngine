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

  // User authentication / password reset
  'GET /login': 'UserController.login',
  'POST /login': 'UserController.login',
  'POST /create': 'UserController.create',
  'POST /update': 'UserController.updateLogin',
  'POST /send-email': 'UserController.passwordResetEmail',
  'POST /password-reset': 'UserController.passwordReset',

  // Metrics
  'POST /metrics/set': 'MetricsController.set',

  // Upload
  'POST /upload-file': 'FileController.upload',
  'POST /process': 'FileController.process',
  'POST /print': 'FileController.print',

  // Location lists
  'GET /health/getProvincesList': 'Health/ListController.getProvincesList',
  'GET /health/getDistrictsList': 'Health/ListController.getDistrictsList',
  'GET /health/getFacilityTypeList': 'Health/ListController.getFacilityTypeList',
  'GET /health/getFacilityList': 'Health/ListController.getFacilityList',

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
  'POST /health/total': 'Health/ProjectDashboardController.getIndicator',
  'POST /health/markers': 'Health/ProjectDashboardController.getMarkers',

  // Health data downloads
  'GET /health/data/contacts': 'Health/ProjectDashboardController.getContactListCsv',
  'GET /health/data/details': 'Health/ProjectDashboardController.getProjectDetailsCsv',
  'GET /health/data/locations': 'Health/ProjectDashboardController.getProjectLocationsCsv',
  'GET /health/data/beneficiaries': 'Health/ProjectDashboardController.getProjectBeneficiariesCsv',


  // Dews 
  'POST /dews/indicator': 'Dews/DewsController.getIndicator',
  'POST /dews/chart': 'Dews/DewsController.getChart',
  'POST /dews/calendar': 'Dews/DewsController.getCalendar',
  'POST /dews/summary': 'Dews/DewsController.getSummary',
  'POST /dews/data': 'Dews/DewsController.getData',
  'POST /dews/markers': 'Dews/DewsController.getMarkers',
  'POST /dews/map': 'Dews/DewsController.getMap',

  // Watchkeeper
  'POST /wk/calendar': 'Watchkeeper/WatchkeeperController.getCalendar',
  'POST /wk/indicator': 'Watchkeeper/WatchkeeperController.getIndicator',
  'POST /wk/difference': 'Watchkeeper/WatchkeeperController.getDifference',
  'POST /wk/markers': 'Watchkeeper/WatchkeeperController.getMarkers',
  'POST /wk/data': 'Watchkeeper/WatchkeeperController.getData',
  'POST /wk/chart': 'Watchkeeper/WatchkeeperController.getChart',

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
