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

  // -------- NGM -------- 
  // User authentication / password reset
  'GET /login': 'ReportHub/UserController.login',
  'POST /login': 'ReportHub/UserController.login',
  'POST /create': 'ReportHub/UserController.create',
  'POST /update': 'ReportHub/UserController.updateLogin',
  'POST /profile/update': 'ReportHub/UserController.updateProfile',
  'POST /send-email': 'ReportHub/UserController.passwordResetEmail',
  'POST /password-reset': 'ReportHub/UserController.passwordReset',

  // org
  'GET /getOrganization': 'ReportHub/OrganizationController.getOrganization',
  'POST /getOrganization': 'ReportHub/OrganizationController.getOrganization',
  'GET /setOrganization': 'ReportHub/OrganizationController.setOrganization',
  'POST /setOrganization': 'ReportHub/OrganizationController.setOrganization',
  'GET /getOrganizationUsers': 'ReportHub/OrganizationController.getOrganizationUsers',
  'POST /getOrganizationUsers': 'ReportHub/OrganizationController.getOrganizationUsers',
  'GET /setOrganizationPartner': 'ReportHub/OrganizationController.setOrganizationPartner',
  'POST /setOrganizationPartner': 'ReportHub/OrganizationController.setOrganizationPartner',

  // Metrics
  'POST /metrics/set': 'ReportHub/MetricsController.set',
  'GET /metrics/getUsers': 'ReportHub/MetricsController.getUsers',
  'GET /metrics/getLocations': 'ReportHub/MetricsController.getLocations',
  'GET /metrics/getReports': 'ReportHub/MetricsController.getReports',

  // Upload
  'POST /upload-file': 'ReportHub/FileController.upload',
  'POST /process': 'ReportHub/FileController.process',
  'POST /print': 'ReportHub/FileController.print',
  'POST /proxy': 'ReportHub/FileController.proxy',
  'GET /export': 'ReportHub/FileController.export',
  'GET /getBeneficiairiesCsv': 'ReportHub/FileController.getBeneficiairiesCsv',


  // -------- ETHIOPIA -------- 
  // -------- CTC -------- 
  'GET /ctc/getKoboData': 'Country/Eth/Ctc/CtcController.getKoboData',
  'GET /ctc/latestUpdate': 'Country/Eth/Ctc/CtcDashboard.getLatestUpdate',
  'POST /ctc/menu': 'Country/Eth/Ctc/CtcDashboard.getCtcMenu',
  'POST /ctc/assessments/indicator': 'Country/Eth/Ctc/CtcDashboard.getCtcIndicator',
  'POST /ctc/case_management/indicator': 'Country/Eth/Ctc/CtcDashboard.getCaseManagementIndicator',


  // -------- CLUSTER -------- 
  // Location lists
  'GET /list/organizations': 'ReportHub/ListController.getOrganizations',
  'GET /list/getAdmin1List': 'ReportHub/ListController.getAdmin1List',
  'GET /list/getAdmin2List': 'ReportHub/ListController.getAdmin2List',
  'GET /list/getAdmin3List': 'ReportHub/ListController.getAdmin3List',
  'GET /list/getAdmin2Facilities': 'ReportHub/ListController.getAdmin2Facilities',
  'GET /list/getAdmin3Facilities': 'ReportHub/ListController.getAdmin3Facilities',



  // Cluster Lists
  'GET /cluster/list/activities': 'Cluster/Lists/ListController.getActivities',
  'GET /cluster/list/donors': 'Cluster/Lists/ListController.getDonors',
  'GET /cluster/list/indicators': 'Cluster/Lists/ListController.getIndicators',
  'GET /cluster/list/stockitems': 'Cluster/Lists/ListController.getStockItems',
  
  // ADMIN DASHBOARD
  'POST /cluster/admin/indicator': 'Cluster/Dashboards/AdminDashboardController.getClusterAdminIndicator',

  // PROJECTS
  'POST /cluster/project/getProjectsList': 'Cluster/ProjectController.getProjectsList',
  'POST /cluster/project/getProject': 'Cluster/ProjectController.getProjectById',
  'POST /cluster/project/setProject': 'Cluster/ProjectController.setProjectById',
  'POST /cluster/project/removeBudgetItem': 'Cluster/ProjectController.removeBudgetItemById',
  'POST /cluster/project/removeBeneficiary': 'Cluster/ProjectController.removeBeneficiaryById',
  'POST /cluster/project/removeLocation': 'Cluster/ProjectController.removeLocationById',
  
  'POST /cluster/project/delete': 'Cluster/ProjectController.deleteProjectById',
  'GET /cluster/project/delete': 'Cluster/ProjectController.deleteProjectById',

  // STOCK REPORTS
  'POST /cluster/stock/getReportsList': 'Cluster/Stocks/StockReportController.getReportsList',
  'POST /cluster/stock/getReport': 'Cluster/Stocks/StockReportController.getReportById',
  'POST /cluster/stock/setReport': 'Cluster/Stocks/StockReportController.setReportById',
  'POST /cluster/stock/removeStockLocation': 'Cluster/Stocks/StockReportController.removeReportLocation',

  // ACTIVITY REPORTS
  'POST /cluster/report/getReportCsv': 'Cluster/Reports/ReportController.getReportCsv',
  'POST /cluster/report/getReportsList': 'Cluster/Reports/ReportController.getReportsList',
  'POST /cluster/report/getReport': 'Cluster/Reports/ReportController.getReportById',
  'POST /cluster/report/setReport': 'Cluster/Reports/ReportController.setReportById',
  'POST /cluster/report/removeBeneficiary': 'Cluster/Reports/ReportController.removeBeneficiary',
  'POST /cluster/report/removeTraining': 'Cluster/Reports/ReportController.removeTrainingById',
  'POST /cluster/report/removeTrainee': 'Cluster/Reports/ReportController.removeTraineeById',

  // STOCK / ACTIVITY REPORTS TASKS
  'GET /cluster/report/setStocksToDo': 'Cluster/Reports/ReportTasksController.setStocksToDo',
  'GET /cluster/report/setReportsToDo': 'Cluster/Reports/ReportTasksController.setReportsToDo',
  'GET /cluster/report/setReportsOpen': 'Cluster/Reports/ReportTasksController.setReportsOpen',
  'GET /cluster/report/setReportsReminder': 'Cluster/Reports/ReportTasksController.setReportsReminder',

  // CLUSTER DASHBOARD
  // 'GET /cluster/latestUpdate': 'Cluster/Dashboards/ClusterDashboardController.getlatestUpdate',
  'GET /cluster/indicator': 'Cluster/Dashboards/ClusterDashboardController.getIndicator',
  'POST /cluster/indicator': 'Cluster/Dashboards/ClusterDashboardController.getIndicator',


  // -------- HEALTH -------- 
  // 4W Dashboard
  'POST /health/indicator': 'Cluster/Health/HealthDashboardController.getHealthDetails',
  'POST /health/data/contacts': 'Cluster/Health/HealthDashboardController.getContactListCsv',

  // -------- EPR -------- 
  'GET /epr/getKoboData': 'Country/Afg/Epr/EprController.getKoboData',
  // EPR Dashboard
  'GET /epr/latestUpdate': 'Country/Afg/Epr/EprDashboardController.getlatestUpdate',
  // Epr
  'GET /epr/indicator': 'Country/Afg/Epr/EprDashboardController.getEprIndicator',
  'POST /epr/indicator': 'Country/Afg/Epr/EprDashboardController.getEprIndicator',
  // alerts
  'GET /epr/alerts/indicator': 'Country/Afg/Epr/EprDashboardController.getAlertIndicator',
  'POST /epr/alerts/indicator': 'Country/Afg/Epr/EprDashboardController.getAlertIndicator',
  'GET /epr/alerts/data': 'Country/Afg/Epr/EprDashboardController.getAlertData',
  'POST /epr/alerts/data': 'Country/Afg/Epr/EprDashboardController.getAlertData',
  // disasters
  'GET /epr/disasters/indicator': 'Country/Afg/Epr/EprDashboardController.getDisasterIndicator',
  'POST /epr/disasters/indicator': 'Country/Afg/Epr/EprDashboardController.getDisasterIndicator',
  'GET /epr/disasters/data': 'Country/Afg/Epr/EprDashboardController.getDisasterData',
  'POST /epr/disasters/data': 'Country/Afg/Epr/EprDashboardController.getDisasterData',


  // -------- DEWS -------- 
  'POST /dews/indicator': 'Country/Afg/Dews/DewsController.getIndicator',
  'POST /dews/chart': 'Country/Afg/Dews/DewsController.getChart',
  'POST /dews/calendar': 'Country/Afg/Dews/DewsController.getCalendar',
  'POST /dews/summary': 'Country/Afg/Dews/DewsController.getSummary',
  'POST /dews/data': 'Country/Afg/Dews/DewsController.getData',
  'POST /dews/markers': 'Country/Afg/Dews/DewsController.getMarkers',
  'POST /dews/map': 'Country/Afg/Dews/DewsController.getMap',


  // -------- WATCHKEEPER -------- 
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
