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
  'POST /proxy': 'FileController.proxy',
  'GET /export': 'FileController.export',

  // Locaiton lists
  'GET /location/getProvinceList': 'LocationController.getProvinceList',
  'GET /location/getProvinceMenu': 'LocationController.getProvinceMenu',
  'GET /location/getDistriceList': 'LocationController.getDistrictList',


  // HEALTH

  // workshop
  'GET /health/workshop/create': 'Health/WorkshopController.create',
  'GET /health/workshop/get': 'Health/WorkshopController.getWorkshop',
  'POST /health/workshop/set': 'Health/WorkshopController.setWorkshop',

  // Health Projects
  'POST /health/project/getProjectsList': 'Health/ProjectController.getProjectsList',
  // get project details, locations, beneficiaries
  'POST /health/project/getProject': 'Health/ProjectController.getProjectById',
  'POST /health/project/setProject': 'Health/ProjectController.setProjectById',
  'POST /health/project/delete': 'Health/ProjectController.deleteProjectById',
  'GET /health/project/delete': 'Health/ProjectController.deleteProjectById',
  
  // get project reports
  'POST /health/report/getReportsList': 'Health/ReportController.getReportsList',
  'POST /health/report/getReport': 'Health/ReportController.getReportById',
  'POST /health/report/setReport': 'Health/ReportController.setReportById',
  'GET /health/report/setReportsToDo': 'Health/ReportController.setReportsToDo',
  'GET /health/report/setReportsOpen': 'Health/ReportController.setReportsOpen',
  'GET /health/report/setReportsReminder': 'Health/ReportController.setReportsReminder',

  // report update details
  // 'GET /health/report/setBeneficiariesReportDetails': 'Health/ReportController.setBeneficiariesReportDetails',


  // get project financials
  'POST /health/project/getProjectFinancials': 'Health/ProjectController.getProjectFinancialsById',
  // Health Dashboard & Data
  'POST /health/indicator': 'Health/ProjectDashboardController.getHealthDetails',
  // data 
  'POST /health/data/contacts': 'Health/ProjectDashboardController.getContactListCsv',
  // 'POST /health/data/financials': 'Health/ProjectDashboardController.getFinancialListCsv',


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
