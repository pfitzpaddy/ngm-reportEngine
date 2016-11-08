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
  'GET /getOrganization': 'UserController.getOrganization',
  'POST /getOrganization': 'UserController.getOrganization',
  'POST /update': 'UserController.updateLogin',
  'POST /send-email': 'UserController.passwordResetEmail',
  'POST /password-reset': 'UserController.passwordReset',

  // Metrics
  'POST /metrics/set': 'MetricsController.set',
  'GET /metrics/getUsers': 'MetricsController.getUsers',
  'GET /metrics/getLocations': 'MetricsController.getLocations',
  'GET /metrics/getReports': 'MetricsController.getReports',

  // Upload
  'POST /upload-file': 'FileController.upload',
  'POST /process': 'FileController.process',
  'POST /print': 'FileController.print',
  'POST /proxy': 'FileController.proxy',
  'GET /export': 'FileController.export',
  'GET /getBeneficiairiesCsv': 'FileController.getBeneficiairiesCsv',


  // HEALTH

  // collection updates ( general )
  'GET /health/project/updateTargetBeneficiaries': 'Health/ProjectController.updateTargetBeneficiaries',
  'GET /health/project/updateTargetLocations': 'Health/ProjectController.updateTargetLocations',
  'GET /health/project/updateLocations': 'Health/ProjectController.updateLocations',
  'GET /health/project/updateBeneficiaries': 'Health/ProjectController.updateBeneficiaries',

  // collection updates ( pcodes )
  'GET /health/project/updateProjectPcodes': 'Health/ProjectController.updateProjectPcodes',
  'GET /health/project/updateTargetLocationPcodes': 'Health/ProjectController.updateTargetLocationPcodes',
  'GET /health/project/updateLocationPcodes': 'Health/ProjectController.updateLocationPcodes',
  'GET /health/project/updateBeneficiariesPcodes': 'Health/ProjectController.updateBeneficiariesPcodes',
  'GET /health/project/setBeneficiariesLocation': 'Health/ProjectController.setBeneficiariesLocation',


  // Locaiton lists
  'POST /location/getAdmin1List': 'LocationController.getAdmin1List',
  'POST /location/getAdmin2List': 'LocationController.getAdmin2List',

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

  // Admin Dashboard
  'POST /health/admin/indicator': 'Health/AdminDashboardController.getHealthAdminIndicator',

  // 4W Dashboard
  'POST /health/indicator': 'Health/ProjectDashboardController.getHealthDetails',
  'POST /health/data/contacts': 'Health/ProjectDashboardController.getContactListCsv',


  // EPR
  'GET /epr/getKoboData': 'Epr/EprController.getKoboData',
  // EPR Dashboard
  'GET /epr/indicator': 'Epr/EprDashboardController.getIndicator',
  'POST /epr/indicator': 'Epr/EprDashboardController.getIndicator',
  // alerts
  'GET /epr/alerts/data': 'Epr/EprDashboardController.getAlertData',
  'POST /epr/alerts/data': 'Epr/EprDashboardController.getAlertData',
  // disasters
  'GET /epr/disasters/data': 'Epr/EprDashboardController.getDisasterData',
  'POST /epr/disasters/data': 'Epr/EprDashboardController.getDisasterData',

  // DEWS 
  'POST /dews/indicator': 'Dews/DewsController.getIndicator',
  'POST /dews/chart': 'Dews/DewsController.getChart',
  'POST /dews/calendar': 'Dews/DewsController.getCalendar',
  'POST /dews/summary': 'Dews/DewsController.getSummary',
  'POST /dews/data': 'Dews/DewsController.getData',
  'POST /dews/markers': 'Dews/DewsController.getMarkers',
  'POST /dews/map': 'Dews/DewsController.getMap',

  // WATCHKEEPER
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
