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
  'POST /delete': 'ReportHub/UserController.delete',
  'POST /update': 'ReportHub/UserController.updateLogin',  
  'POST /profile/update': 'ReportHub/UserController.updateProfile',
  'POST /send-email': 'ReportHub/UserController.passwordResetEmail',
  'POST /password-reset': 'ReportHub/UserController.passwordReset',
  // user
  'GET /getUserByUsername': 'ReportHub/UserController.getUserByUsername',
  'POST /getUserByUsername': 'ReportHub/UserController.getUserByUsername',

  // org
  'GET /getOrganization': 'ReportHub/OrganizationController.getOrganization',
  'POST /getOrganization': 'ReportHub/OrganizationController.getOrganization',
  'GET /setOrganization': 'ReportHub/OrganizationController.setOrganization',
  'POST /setOrganization': 'ReportHub/OrganizationController.setOrganization',
  'GET /getOrganizationUsers': 'ReportHub/OrganizationController.getOrganizationUsers',
  'POST /getOrganizationUsers': 'ReportHub/OrganizationController.getOrganizationUsers',
  'GET /getOrganizationMenu': 'ReportHub/OrganizationController.getOrganizationMenu',
  'POST /getOrganizationMenu': 'ReportHub/OrganizationController.getOrganizationMenu',
  'GET /getOrganizationIndicator': 'ReportHub/OrganizationController.getOrganizationIndicator',
  'POST /getOrganizationIndicator': 'ReportHub/OrganizationController.getOrganizationIndicator',
  'GET /setOrganizationPartner': 'ReportHub/OrganizationController.setOrganizationPartner',
	'POST /setOrganizationPartner': 'ReportHub/OrganizationController.setOrganizationPartner',
	'GET /getOrganizationsByFilter': 'ReportHub/OrganizationController.getOrganizationsByFilter',
	'POST /getOrganizationsByFilter': 'ReportHub/OrganizationController.getOrganizationsByFilter',

  // Metrics
  'POST /metrics/set': 'ReportHub/MetricsController.set',
  'GET /metrics/getUsers': 'ReportHub/MetricsController.getUsers',
  'GET /metrics/getLocations': 'ReportHub/MetricsController.getLocations',
  'GET /metrics/getReports': 'ReportHub/MetricsController.getReports',

  // User login stats
  'GET /getUserLoginHistoryIndicator': 'ReportHub/OrganizationController.getUserLoginHistoryIndicator',
  'POST /getUserLoginHistoryIndicator': 'ReportHub/OrganizationController.getUserLoginHistoryIndicator',

  // Upload
  'POST /upload-file': 'ReportHub/FileController.upload',
  'POST /process': 'ReportHub/FileController.process',
  'POST /print': 'ReportHub/FileController.print',
  'POST /proxy': 'ReportHub/FileController.proxy',
  'GET /export': 'ReportHub/FileController.export',
  'GET /getBeneficiairiesCsv': 'ReportHub/FileController.getBeneficiairiesCsv',

  // Documents
  'GET /listProjectDocuments/:project_id': 'ReportHub/FileController.listProjectDocuments',
  'GET /listReportDocuments/:report_id': 'ReportHub/FileController.listReportDocuments',
  'GET /listDocuments': 'ReportHub/FileController.listDocuments',

  'POST /uploadGDrive': 'ReportHub/FileController.uploadGDrive',
  'POST /uploadLocal': 'ReportHub/FileController.uploadLocal',

  'GET /getProjectDocuments/:project_id': 'ReportHub/FileController.getProjectDocuments',
  'GET /getReportDocuments/:report_id': 'ReportHub/FileController.getReportDocuments',
  'GET /getDocuments': 'ReportHub/FileController.getDocuments',


  'DELETE /deleteGDriveFile/:fileid': 'ReportHub/FileController.deleteGDriveFile',
  // 'DELETE /deleteGDriveFilePermanently/:fileid': 'ReportHub/FileController.deleteGDriveFilePermanently',

  // for local files
  'GET /getProjectDocument/:fileid': 'ReportHub/FileController.getLocalProjectDocument',
  'DELETE /deleteLocalDocument/:fileid': 'ReportHub/FileController.deleteLocalDocument',


  // -------- iMMAP --------
  // -------- Products --------
  'GET /immap/products/getProductsData': 'iMMAP/Products/ProductsController.getProductsData',
  'GET /immap/products/latestUpdate': 'iMMAP/Products/ProductsController.getLatestUpdate',
  'GET /immap/products/getProductsMenu': 'iMMAP/Products/ProductsController.getProductsMenu',
  'POST /immap/products/getProductsMenu': 'iMMAP/Products/ProductsController.getProductsMenu',
  'GET /immap/products/indicator': 'iMMAP/Products/ProductsController.getProductsIndicator',
  'POST /immap/products/indicator': 'iMMAP/Products/ProductsController.getProductsIndicator',


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
  'GET /list/getAdmin4List': 'ReportHub/ListController.getAdmin4List',
  'GET /list/getAdmin5List': 'ReportHub/ListController.getAdmin5List',
  'GET /list/getDutyStations': 'ReportHub/ListController.getDutyStations',
  'GET /list/getAdminSites': 'ReportHub/ListController.getAdminSites',



  // Cluster Lists
  'GET /cluster/list/activities': 'Cluster/Lists/ListController.getActivities',
  'GET /cluster/list/donors': 'Cluster/Lists/ListController.getDonors',
  'GET /cluster/list/indicators': 'Cluster/Lists/ListController.getIndicators',
  'GET /cluster/list/stockitems': 'Cluster/Lists/ListController.getStockItems',

  // ADMIN DASHBOARD
  'POST /cluster/admin/indicator': 'Cluster/Dashboards/AdminDashboardController.getClusterAdminIndicator',

  // PROJECTS
  
  // sectors
  'POST /cluster/project/getProjectSectors': 'Cluster/ProjectController.getProjectSectors',
  'GET /cluster/project/getProjectSectors': 'Cluster/ProjectController.getProjectSectors',

  // details
  'POST /cluster/project/getProjectsList': 'Cluster/ProjectController.getProjectsList',
  'POST /cluster/project/getProject': 'Cluster/ProjectController.getProjectById',
  'POST /cluster/project/getProjects': 'Cluster/ProjectController.getProjects',
  'POST /cluster/project/setProject': 'Cluster/ProjectController.setProjectById',
  'POST /cluster/project/removeBudgetItem': 'Cluster/ProjectController.removeBudgetItemById',
  'POST /cluster/project/removeBeneficiary': 'Cluster/ProjectController.removeBeneficiaryById',
  'POST /cluster/project/removeLocation': 'Cluster/ProjectController.removeLocationById',
  // 'POST /cluster/project/checkUserExists': 'ReportHub/UserController.checkUserExists',
  'POST /cluster/project/delete': 'Cluster/ProjectController.deleteProjectById',
  'GET /cluster/project/delete': 'Cluster/ProjectController.deleteProjectById',
  'POST /cluster/project/getFinancialDetails': 'Cluster/ProjectController.getFinancialDetails',


  // STOCK REPORTS
  'POST /cluster/stock/getReportsList': 'Cluster/Stocks/StockReportController.getReportsList',
  'POST /cluster/stock/getReport': 'Cluster/Stocks/StockReportController.getReportById',
  'POST /cluster/stock/setReport': 'Cluster/Stocks/StockReportController.setReportById',
  'POST /cluster/stock/removeStockLocation': 'Cluster/Stocks/StockReportController.removeReportLocation',

  // ACTIVITY REPORTS
  'POST /cluster/report/getReportCsv': 'Cluster/Reports/ReportController.getReportCsv',
  'POST /cluster/report/getReportsList': 'Cluster/Reports/ReportController.getReportsList',
  'POST /cluster/report/getReportDetailsById': 'Cluster/Reports/ReportController.getReportDetailsById',
  'POST /cluster/report/getReport': 'Cluster/Reports/ReportController.getReport',
  'POST /cluster/report/setReport': 'Cluster/Reports/ReportController.setReportById',
	'POST /cluster/report/updateReportStatus': 'Cluster/Reports/ReportController.updateReportStatus',
	'POST /cluster/report/updateReportValidation': 'Cluster/Reports/ReportController.updateReportValidation',
  'POST /cluster/report/removeBeneficiary': 'Cluster/Reports/ReportController.removeBeneficiary',
  'POST /cluster/report/delete': 'Cluster/Reports/ReportController.deleteReportById',


  // STOCK / ACTIVITY REPORTS TASKS
  'GET /cluster/report/setStocksToDo': 'Cluster/Reports/ReportTasksController.setStocksToDo',
  'GET /cluster/report/setReportsToDo': 'Cluster/Reports/ReportTasksController.setReportsToDo',

  'GET /cluster/report/setStocksToDoPreviousMonth': 'Cluster/Reports/ReportTasksController.setStocksToDoPreviousMonth',
  'GET /cluster/report/setReportsToDoPreviousMonth': 'Cluster/Reports/ReportTasksController.setReportsToDoPreviousMonth',

  'GET /cluster/report/setReportsOpen': 'Cluster/Reports/ReportTasksController.setReportsOpen',
  'GET /cluster/report/setReportsReminder': 'Cluster/Reports/ReportTasksController.setReportsReminder',
  'GET /cluster/report/setReportsReminderAllMonths': 'Cluster/Reports/ReportTasksController.setReportsReminderAllMonths',

  // CLUSTER DASHBOARD
  // 'GET /cluster/latestUpdate': 'Cluster/Dashboards/ClusterDashboardController.getlatestUpdate',
  'GET /cluster/indicator': 'Cluster/Dashboards/ClusterDashboardController.getIndicator',
  'POST /cluster/indicator': 'Cluster/Dashboards/ClusterDashboardController.getIndicator', 

  //4wprojectplanDASHBOARD
  'GET /cluster/indicator4wprojectplan': 'Cluster/Dashboards/Cluster4wprojectplanDashboardController.getIndicator',
  'POST /cluster/indicator4wprojectplan': 'Cluster/Dashboards/Cluster4wprojectplanDashboardController.getIndicator', 


   
  //4wplus dashboard 

  'GET /cluster/indicator4wplusdashboard': 'Cluster/Dashboards/Cluster4wplusDashboardController.getIndicator',
  'POST /cluster/indicator4wplusdashboard': 'Cluster/Dashboards/Cluster4wplusDashboardController.getIndicator', 

  //find exchange rates from EURO to others currencies
  'GET /cluster/exchangeRatesCurrencies': 'Cluster/Dashboards/Cluster4wplusDashboardController.exchangeRatesCurrencies',

  'GET /cluster/exchangeRatesCurrenciesProjectPlanDashboard': 'Cluster/Dashboards/Cluster4wprojectplanDashboardController.exchangeRatesCurrencies',

//COL API - APC
  'GET /cluster/project/getProjectsColAPC': 'Cluster/ProjectController.getProjectsColAPC',

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

 // -------- AF NUTRITION --------
 'GET /nutrition/afghanistan/getKoboData': 'Country/Afg/Nutrition/NutritionController.getKoboData',
 // Nutrition Dashboard
 'GET /nutrition/afghanistan/latestUpdate': 'Country/Afg/Nutrition/NutritionDashboardController.getlatestUpdate',
 // Reports
 'GET /nutrition/afghanistan/indicator': 'Country/Afg/Nutrition/NutritionDashboardController.getNutritionReportsIndicator',
 'POST /nutrition/afghanistan/indicator': 'Country/Afg/Nutrition/NutritionDashboardController.getNutritionReportsIndicator',
 // Beneficiaries
 'GET /nutrition/afghanistan/beneficiaries/indicator': 'Country/Afg/Nutrition/NutritionDashboardController.getNutritionIndicator',
 'POST /nutrition/afghanistan/beneficiaries/indicator': 'Country/Afg/Nutrition/NutritionDashboardController.getNutritionIndicator',
 'GET /nutrition/afghanistan/beneficiaries/data': 'Country/Afg/Nutrition/NutritionDashboardController.getNutritionData',
 'POST /nutrition/afghanistan/beneficiaries/data': 'Country/Afg/Nutrition/NutritionDashboardController.getNutritionData',

 // Edit
 'GET /nutrition/afghanistan/reports/edit/:pk/:dataid': 'Country/Afg/Nutrition/NutritionDashboardController.getEditForm',

 // Delete 
 'DELETE /nutrition/afghanistan/reports/delete/:pk/:dataid': 'Country/Afg/Nutrition/NutritionDashboardController.deleteForm',

	// -------- AF DROUGHT ------------
	// Latest Update Beneficiaries
	'POST /drought/afghanistan/latestUpdate': 'Country/Afg/Drought/DroughtDashboardController.getlatestUpdate',
	// Reports
	'GET /drought/afghanistan/indicator': 'Country/Afg/Drought/DroughtDashboardController.getDroughtReportsIndicator',
	'POST /drought/afghanistan/indicator': 'Country/Afg/Drought/DroughtDashboardController.getDroughtReportsIndicator',
	// Beneficiaries
	'GET /drought/afghanistan/beneficiaries/indicator': 'Country/Afg/Drought/DroughtDashboardController.getDroughtIndicator',
	'POST /drought/afghanistan/beneficiaries/indicator': 'Country/Afg/Drought/DroughtDashboardController.getDroughtIndicator',
	'GET /drought/afghanistan/beneficiaries/data': 'Country/Afg/Drought/DroughtDashboardController.getDroughtData',
	'POST /drought/afghanistan/beneficiaries/data': 'Country/Afg/Drought/DroughtDashboardController.getDroughtData',


  
  
  // -------- CXB GFA ------------
  // setDistributionRound
  'GET /wfp/gfa/gfd/getForms': 'Country/Cxb/Gfa/GfaTaskController.getForms',
  'POST /wfp/gfa/gfd/getForms': 'Country/Cxb/Gfa/GfaTaskController.getForms',
  // setDistributionRound
  'GET /wfp/gfa/gfd/getDistributionRound': 'Country/Cxb/Gfa/GfaTaskController.getDistributionRound',
  'POST /wfp/gfa/gfd/getDistributionRound': 'Country/Cxb/Gfa/GfaTaskController.getDistributionRound',
  // setDistributionRound
  'GET /wfp/gfa/gfd/setDistributionRound': 'Country/Cxb/Gfa/GfaTaskController.setDistributionRound',
  'POST /wfp/gfa/gfd/setDistributionRound': 'Country/Cxb/Gfa/GfaTaskController.setDistributionRound',
  // uploadPlannedBeneficiaries
  'GET /wfp/gfa/gfd/processPlannedBeneficiaries': 'Country/Cxb/Gfa/GfaTaskController.processPlannedBeneficiaries',
  'POST /wfp/gfa/gfd/processPlannedBeneficiaries': 'Country/Cxb/Gfa/GfaTaskController.processPlannedBeneficiaries',
  // setKoboXlsxForm
  'GET /wfp/gfa/gfd/setKoboXlsxForm': 'Country/Cxb/Gfa/GfaTaskController.setKoboXlsxForm',
  'POST /wfp/gfa/gfd/setKoboXlsxForm': 'Country/Cxb/Gfa/GfaTaskController.setKoboXlsxForm',
  // deployKoboXlsxForm
  'GET /wfp/gfa/gfd/deployKoboXlsxForm': 'Country/Cxb/Gfa/GfaTaskController.deployKoboXlsxForm',
  'POST /wfp/gfa/gfd/deployKoboXlsxForm': 'Country/Cxb/Gfa/GfaTaskController.deployKoboXlsxForm',
  // sendKoboManualDeployEmail
  'GET /wfp/gfa/gfd/sendKoboManualDeployEmail': 'Country/Cxb/Gfa/GfaTaskController.sendKoboManualDeployEmail',
  'POST /wfp/gfa/gfd/sendKoboManualDeployEmail': 'Country/Cxb/Gfa/GfaTaskController.sendKoboManualDeployEmail',
  
  
  // getKoboData
  'GET /wfp/gfa/gfd/getKoboData': 'Country/Cxb/Gfa/GfaTaskController.getKoboData',
  'POST /wfp/gfa/gfd/getKoboData': 'Country/Cxb/Gfa/GfaTaskController.getKoboData',
  // set plan to actual
  'GET /wfp/gfa/gfd/setActualDailyDistribution': 'Country/Cxb/Gfa/GfaTaskController.setActualDailyDistribution',
  'POST /wfp/gfa/gfd/setActualDailyDistribution': 'Country/Cxb/Gfa/GfaTaskController.setActualDailyDistribution',
  // set plan to actual for distribution
  'GET /wfp/gfa/gfd/setActualDistribution': 'Country/Cxb/Gfa/GfaTaskController.setActualDistribution',
  'POST /wfp/gfa/gfd/setActualDistribution': 'Country/Cxb/Gfa/GfaTaskController.setActualDistribution',
  // remove absent beneficiary
  'GET /wfp/gfa/gfd/removeAbsentBeneficiary': 'Country/Cxb/Gfa/GfaTaskController.removeAbsentBeneficiary',
  'POST /wfp/gfa/gfd/removeAbsentBeneficiary': 'Country/Cxb/Gfa/GfaTaskController.removeAbsentBeneficiary',  

  

  // get PlannedBeneficiaries
  'GET /wfp/gfa/gfd/getPlannedBeneficiaries': 'Country/Cxb/Gfa/GfaDashboardController.getPlannedBeneficiaries',
  'POST /wfp/gfa/gfd/getPlannedBeneficiaries': 'Country/Cxb/Gfa/GfaDashboardController.getPlannedBeneficiaries',
  // get PlannedBeneficiaries Indicator
  'GET /wfp/gfa/gfd/getPlannedBeneficiariesIndicator': 'Country/Cxb/Gfa/GfaDashboardController.getPlannedBeneficiariesIndicator',
  'POST /wfp/gfa/gfd/getPlannedBeneficiariesIndicator': 'Country/Cxb/Gfa/GfaDashboardController.getPlannedBeneficiariesIndicator',
  // get ActualBeneficiaries Indicator
  'GET /wfp/gfa/gfd/getActualBeneficiariesIndicator': 'Country/Cxb/Gfa/GfaDashboardController.getActualBeneficiariesIndicator',
  'POST /wfp/gfa/gfd/getActualBeneficiariesIndicator': 'Country/Cxb/Gfa/GfaDashboardController.getActualBeneficiariesIndicator',
  // get AbsentBeneficiaries Indicator
  'GET /wfp/gfa/gfd/getAbsentBeneficiariesIndicator': 'Country/Cxb/Gfa/GfaDashboardController.getAbsentBeneficiariesIndicator',
  'POST /wfp/gfa/gfd/getAbsentBeneficiariesIndicator': 'Country/Cxb/Gfa/GfaDashboardController.getAbsentBeneficiariesIndicator',  

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
