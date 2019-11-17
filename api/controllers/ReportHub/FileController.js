/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var fs = require('fs')
var os = require('os');
var path = require('path');

const { google } = require('googleapis');

// const puppeteer = require('puppeteer')

module.exports = {

	// upload
	upload: function  (req, res) {

		//	call to /upload via GET is error
		if(req.method === 'GET') return res.json({ 'status':'GET not allowed' });

		// skipper
		req.file('file').upload(function onUploadComplete (err, files) {

			//	if error return and send 500 error with error
			if (err) return res.serverError(err);

			// response status 200
			res.json({ status:200, file:files });

		});

	},

	// save file to local
	uploadLocal: function  (req, res) {

		//	call to /upload via GET is

		if(req.method === 'GET') return res.json({ 'status':'GET not allowed' });

		var uploadPath = sails.config.documents.UPLOAD_PATH;
		// skipper
		req.file('file').upload({ dirname:uploadPath },function onUploadComplete (err, files) {
			if (err) return res.serverError(err);

			//	if error return and send 500 error with error
			fileDescriptor = {
				fileid_local : path.parse(files[0].fd).base,
				filename_extension : path.extname(files[0].fd),
				fileid_local_name : path.parse(files[0].fd).name,
				mime_type : files[0].type,
				filename : files[0].filename,
			}

			// set variable metadata TODO: refactor
			if (req.body.project_id){
				fileDescriptor.project_id = req.body.project_id;
			}
			if (req.body.username){
				fileDescriptor.fileowner = req.body.username;
			}
			if (req.session.session_user && req.session.session_user.username){
				fileDescriptor.fileowner = req.session.session_user.username;
			}
			if (req.body.admin0pcode){
				fileDescriptor.admin0pcode = req.body.admin0pcode;
			}
			if (req.session.session_user && req.session.session_user.admin0pcode){
				fileDescriptor.admin0pcode = req.session.session_user.admin0pcode;
			}
			if (req.body.organization_tag){
				fileDescriptor.organization_tag = req.body.organization_tag;
			}
			if (req.session.session_user && req.session.session_user.organization_tag){
				fileDescriptor.organization_tag = req.session.session_user.organization_tag;
			}

			// save docs metadata
			Documents.create(fileDescriptor).exec(function(err, doc) {
				if (err) {
					res.json(err.status, {err: err});
					fs.unlink(files[0].fd)
					return;
				}
				if (doc) {
					res.json({ status:200, file:doc });
				}
			  });


		});

	},

	// download local file
	getLocalProjectDocument: function(req,res){
		if (!req.param('fileid')){
			return res.json(401, {err: 'fileid required!'});
		}
		Documents.findOne( { fileid_local: req.param('fileid') } )
					.then(doc => {
						doc = doc || {fileid_local:"NOTFOUND"};
						return res.download(sails.config.documents.UPLOAD_PATH + "/" + doc.fileid_local, doc.filename)
					})
					.catch( err => res.negotiate(err) )

	},

	// delete local file
	deleteLocalDocument: function(req,res){
		if (!req.param('fileid')){
			return res.json(401, {err: 'fileid required!'});
		}
		fs.unlink(sails.config.documents.UPLOAD_PATH + "/" + req.param('fileid'), function(err){
            if(err) return res.json( 404, { "deleted" : false });
			Documents.destroy({fileid_local:req.param('fileid')}, function(err, d ){
				if (err) {
					return res.negotiate( err );
				}
				return res.json( 200, { "deleted" : true });
			})
        });

	},
	// delete permanently
	deleteGDriveFilePermanently: function(req, res){

		if (!req.param('fileid')){
			return res.json(401, {err: 'fileid required!'});
		}
		var privatkey = sails.config.documents.CREDENTIALS;
		var folderId = sails.config.documents.GDRIVE_FOLDER_ID;
		var uploadPath = sails.config.documents.UPLOAD_PATH;

		jwtClient = new google.auth.JWT(
			privatkey.client_email,
			null,
			privatkey.private_key,
			['https://www.googleapis.com/auth/drive']);

		// prepare gdrive client
		var drive = google.drive({
			version: 'v3',
			auth: jwtClient
		});
		// upload to gdrive
		drive.files.delete({
			fileId: req.param('fileid')
			}, function (err, file) {
				if (err) {
					// Handle error
					return res.negotiate( err );
				} else {
					Documents.destroy({fileid:req.param('fileid')}, function(err){
						if (err) {
							return res.negotiate( err );
						}
						return res.json( 200, { "deleted" : true });
					})
				}
			})
	},

	// move to gdrive trash or remove permissions and delete metadata in db
	deleteGDriveFile: function(req, res){

		if (!req.param('fileid')){
			return res.json(401, {err: 'fileid required!'});
		}
		var privatkey = sails.config.documents.CREDENTIALS;
		var folderId = sails.config.documents.GDRIVE_FOLDER_ID;
		var trashFolderId = sails.config.documents.GDRIVE_TRASH_FOLDER_ID;
		var uploadPath = sails.config.documents.UPLOAD_PATH;

		jwtClient = new google.auth.JWT(
			privatkey.client_email,
			null,
			privatkey.private_key,
			['https://www.googleapis.com/auth/drive']);

		// prepare gdrive client
		var drive = google.drive({
			version: 'v3',
			auth: jwtClient
		});
		// // trash files, move to gdrive trash
		// drive.files.update({
		// 	fileId: req.param('fileid'),
		// 	requestBody: {
		// 		  trashed: true
		// 		}
		// 	}, function (err, file) {

		// or move to trash folder and delete permission, not possible to view
		drive.files.update({
				fileId: req.param('fileid'),
				addParents: trashFolderId,
				removeParents: folderId
			}, function (err, file) {
			if (err) {
				// Handle error
				return res.negotiate( err );
			} else {
				drive.permissions.delete({
					fileId: req.param('fileid'),
					permissionId: 'anyone'
					}, function (err, permissions) {
					if (err) {
						// Handle error
						return res.negotiate( err );
					} else {
						// remove metadata from rh
						Documents.destroy({ fileid:req.param('fileid') }, function(err){
							if (err) {
								return res.negotiate( err );
							}
							return res.json( 200, { "deleted" : true });
						})
					}
				})
			}
		})
	},

	// upload files to google drive
	uploadGDrive: function  (req, res) {

		if(req.method === 'GET') return res.json({ 'status':'GET not allowed' });

		// get configuration data
		var privatkey = sails.config.documents.CREDENTIALS;
		var folderId = sails.config.documents.GDRIVE_FOLDER_ID;
		var uploadPath = sails.config.documents.UPLOAD_PATH;
		var maxBytes = sails.config.documents.MAX_BYTES || 15000000;
		var timeout = sails.config.documents.REQUEST_TIMEOUT_UPLOAD || 10*60*1000;
		req.setTimeout(timeout);
		var hrstart = process.hrtime()

		// save to disk
		req.file('file').upload({ dirname:uploadPath, maxBytes:maxBytes },function onUploadComplete (err, files) {
			if (err) return res.serverError(err);
			// prepare authentication client
			jwtClient = new google.auth.JWT(
				privatkey.client_email,
				null,
				privatkey.private_key,
				['https://www.googleapis.com/auth/drive']);

			// prepare gdrive client
			var drive = google.drive({
				version: 'v3',
				auth: jwtClient
			});

			// set file gdrive metadata
			var fileMetadata = {
				parents: [folderId],
				name: files[0].filename,
				mimeType: files[0].type
			};

			if (req.body.project_id){
				fileMetadata.description = "project_id: " + req.body.project_id;
			}
			if (req.body.report_id){
				fileMetadata.description ? fileMetadata.description += ", ":"";
				fileMetadata.description += "report_id: " + req.body.report_id;
			}

			// set file media from file on disk
			var media = {
				mimeType: files[0].type,
				body: fs.createReadStream(files[0].fd)
			};

			// set permissions
			permission = {
				role:"reader",
				type:"anyone",
				allowFileDiscovery: true
			};

			// upload to gdrive
			drive.files.create({
				resource: fileMetadata,
				media: media,
				}, function (err, file) {
					if (err) {
						res.negotiate( err );
						fs.unlink(files[0].fd)
						return;
					} else {
						// create permission on file or share entire folder on gdrive ( not working on create )
						drive.permissions.create({ fileId: file.data.id, resource: permission }, function (err, permission){
							if (err) {
								res.negotiate( err );
								fs.unlink(files[0].fd)
								return;
							}
							// save and respond
							saveFileMetadata(file, function(err, doc){
								// delete from local
								fs.unlink(files[0].fd);
								if (err) {
									return res.json(err.status, {err: err});
								}
								if (doc) {
									return res.json({ status:200, file:doc });
								}

							})
						})

					}
				})

			var saveFileMetadata = function(file,cb){

				// set metadata
				fileDescriptor = {
					fileid_local : path.parse(files[0].fd).base,
					// filename_extension : path.extname(files[0].fd),
					// fileid_local_name : path.parse(files[0].fd).name,
					fileid: file.data.id,
					mime_type : file.data.mimeType,
					filename : file.data.name,
					filename_extension : path.extname(file.data.name),
				}

				// set variable metadata TODO: refactor
				setFileMetaOptionalParam(fileDescriptor);

				// save metadata
				Documents.create( fileDescriptor ).exec(function(err, doc) {
					if (err) {
						cb(err);
						// return res.json(err.status, {err: err});
					}
					if (doc) {
						cb(false, doc)
						// return res.json({ status:200, file:doc });
					}
				});

			}

			var setFileMetaOptionalParam = function(fileDescriptor){

				// set variable metadata TODO: refactor ( use schema )
				if (req.body.project_id){
					fileDescriptor.project_id = req.body.project_id;
				}
				if (req.body.report_id){
					fileDescriptor.report_id = req.body.report_id;
				}
				if (req.body.project_start_date){
					fileDescriptor.project_start_date = new Date(req.body.project_start_date);
				}
				if (req.body.project_end_date){
					fileDescriptor.project_end_date = new Date(req.body.project_end_date);
				}
				if (req.body.reporting_period){
					fileDescriptor.reporting_period = new Date(req.body.reporting_period);
				}
				if (req.body.username){
					fileDescriptor.fileowner = req.body.username;
				}
				if (req.body.adminRpcode){
					fileDescriptor.adminRpcode = req.body.adminRpcode.toUpperCase();
				}
				if (req.body.admin0pcode){
					fileDescriptor.admin0pcode = req.body.admin0pcode.toUpperCase();
				}
				if (req.body.organization_tag){
					fileDescriptor.organization_tag = req.body.organization_tag;
				}
				if (req.body.cluster_id){
					fileDescriptor.cluster_id = req.body.cluster_id;
				}

				// set user's meta, who does action ( TODO: action permissions )
				if (req.session.session_user && req.session.session_user.username){
					fileDescriptor.fileowner = req.session.session_user.username;
				}
				// if (req.session.session_user && req.body.adminRpcode){
				// 	fileDescriptor.adminRpcode = req.session.session_user.adminRpcode.toUpperCase();
				// }
				// if (req.session.session_user && req.session.session_user.admin0pcode){
				// 	fileDescriptor.admin0pcode = req.session.session_user.admin0pcode.toUpperCase();
				// }
				// if (req.session.session_user && req.session.session_user.organization_tag){
				// 	fileDescriptor.organization_tag = req.session.session_user.organization_tag;
				// }
				// if (req.session.session_user && req.session.session_user.cluster_id){
				// 	fileDescriptor.cluster_id = req.session.session_user.cluster_id;
				// }

				return fileDescriptor
			}
		});

	},

	// get documents` request params and validate
	_getParams: function( req, res ){

		allowed_params = [ 'project_id','report_id','organization_tag','cluster_id','admin0pcode','adminRpcode', 'start_date', 'end_date', 'type' ];

		// types of documents
		types = { monthly:'monthly', project: 'project', weekly: 'weekly', custom: 'custom', all: 'all' };

		// query params value for all docs
		ALL   = 'all' ;

		var params = req.allParams();
		params.types = types;
		params.ALL = ALL;

		// at least 1 param present
		if (!_.keys(params).filter(v=>allowed_params.includes(v)).length){
			res.json(401, { error : { message: allowed_params.join(', ') + ' required!' } });
			return false
		} else if ( params.type && !Object.values(types).includes(params.type) ) {
			res.json(401, { error : { message: Object.values(types).join(', ') + ' types required!' } });
			return false
		} else if ( params.type && !Date.parse(params.start_date) || !Date.parse(params.end_date) ) {
			res.json(401, { error : { message: 'start_date, end_date required!' } });
			return false
		} else {

			// check here if user allowed for action with incoming query params
			// TODO: middleware if the action allowed

			return params
		}
	},

	// construct filter for documents
	_getFilter: function( params ){

		var filter = {
			adminRpcode: params.adminRpcode ? params.adminRpcode.toUpperCase() : null,
			admin0pcode: params.admin0pcode ? params.admin0pcode.toUpperCase() : null,
			cluster_id: params.cluster_id ? params.cluster_id : null,
			organization_tag: params.organization_tag ? params.organization_tag : null,
			project_id: params.project_id ? params.project_id : null,
			report_id: params.report_id ? params.report_id : null,
			reporting_period: params.type===params.types.monthly && params.start_date && params.end_date ?
								{ '>=' : new Date( params.start_date ), '<=' : new Date( params.end_date ) } : null,
			project_start_date: params.type===params.types.project && params.start_date && params.end_date ?
								{ '<=' : new Date( params.end_date ) } : null,
			project_end_date: params.type===params.types.project && params.start_date && params.end_date ?
								{ '>=' : new Date( params.start_date ) } : null,
			createdAt: params.type===params.types.all ?
								{ '>=' : new Date( params.start_date ), '<=' : new Date( params.end_date ) } : null
		}

		params.ALL_UC = params.ALL.toUpperCase()
		// remove key:value from filter query if value is null or all
		filter = _.omit(filter, (v,k,o)=>v===null||v===params.ALL||v===params.ALL_UC)

		return filter
	},

	// return array of documents meta by query params
	listDocuments: function(req,res) {

		params = this._getParams( req, res )

		if (params){
			filter = this._getFilter( params )
			Documents.find( filter )
					.then( docs => res.json( 200, docs ))
					.catch( err => res.negotiate(err) )
		}
	},

	// return array of project meta documents
	listProjectDocuments: function(req,res) {
		if (!req.param('project_id')){
			return res.json(401, {err: 'project_id required!'});
		}
		Documents.find( { project_id: req.param('project_id') } )
				 .then( docs => res.json( 200, docs ))
				 .catch( err => res.negotiate(err) )
	},

	// return array of report meta documents
	listReportDocuments: function(req,res) {
		if (!req.param('report_id')){
			return res.json(401, {err: 'report_id required!'});
		}
		Documents.find( { report_id: req.param('report_id') } )
				 .then( docs => res.json( 200, docs ))
				 .catch( err => res.negotiate(err) )
	},

	// return zipped documents link by query params
	getDocuments: function( req, res ){
		params = this._getParams( req, res )
		if (params) {
			filter = this._getFilter(params)
			this._getZippedDocuments( req, res, filter )}
	},

	// return zipped project documents link
	getProjectDocuments: function( req, res, filter ){
		if (!req.param('project_id')){
			return res.badRequest({ error: { message:'project_id REQUIRED' } });
		}
		filter = { project_id : req.param('project_id') }

		this._getZippedDocuments( req, res, filter )

	},
	// return zipped report documents link
	getReportDocuments: function( req, res, filter ){
		if (!req.param('report_id')){
			return res.badRequest({ error: { message:'report_id REQUIRED' } });
		}
		filter = { report_id : req.param('report_id') }

		this._getZippedDocuments( req, res, filter )

	},

	// return google link to download zipped folder
	_getZippedDocuments: function( req, res, filter ){

		try {
			var fetch = require('node-fetch');
			var TAKE_OUT_API_KEY = sails.config.documents.TAKE_OUT_API_KEY || 'PROVIDE_KEY';
			var serverUrl = sails.config.documents.TAKE_OUT_SERVER_URL || 'https://takeout-pa.clients6.google.com/v1/exports';
			var pollTime  = sails.config.documents.ZIP_JOB_POLL_TIME || 1000;
			var timeout = sails.config.documents.REQUEST_TIMEOUT_ZIP || 10*60*1000;
			req.setTimeout(timeout);

		} catch (err) {
			return resError(res,req,err);
		}

		Documents.find( filter , { fields: { 'fileid': 1 } }).then(documents => {
			if (!documents.length) return res.json( 200, { message: 'NO DOCUMENTS FOUND' } )

			var files = []

			// construct array of file ids for request
			_.forEach(documents, document => {
				if (document.fileid){
					obj = { 'id': document.fileid }
					files.push(obj)
				}
			})

			// request to start a zip job
			fetch( serverUrl + '?key=' + TAKE_OUT_API_KEY, {
				method: 'POST',
				headers: { 'origin': 'https://drive.google.com', 'content-type': 'application/json' },
				body:    JSON.stringify({"archiveFormat":null,"archivePrefix":null,"conversions":null,"items": files,"locale":null}),
			})
			.then(res => res.json())
			.then(json => {
				// catch api key operational error
				if (json.error){
					return res.serverError({ error:json.error });
				}
				// poll every pollTime for status
				var intervalObj = setInterval( () => {
					fetch( serverUrl + '/' + json.exportJob.id + '?key=' + TAKE_OUT_API_KEY, {
					method: 'GET',
					headers: { 'origin': 'https://drive.google.com', 'content-type': 'application/json' },
					})
					.then(res => res.json())
					.then(json => {
						// catch api key operational error
						if (json.error){
							clearInterval(intervalObj);
							return res.serverError({error:json.error});
						}
						// if in response archive storagePath take it and stop polling
						if (json.exportJob && json.exportJob.archives && json.exportJob.archives[0].storagePath){
							download_url = json.exportJob.archives[0].storagePath;
							clearInterval(intervalObj);
							return res.json( 200, { download_url : download_url } )
						}
					}).catch(err => { clearInterval(intervalObj); return resError(res, req, err); });
				}, pollTime )
			}).catch(err => resError(res, req, err));
		}).catch(err => resError(res, req, err));

		function resError (res, req, err){
			return res.serverError({ error:{ message:"SERVER ERROR", type: err.type, original_message: err.message } });
		}
	},

	//
	process: function  (req, res) {

		var fs = require('fs'),
			exec = require('child_process').exec,
			PythonShell = require('python-shell');

		var options = {
		  mode: 'text',
		  scriptPath: __dirname + '/../../tasks/python',
		  args: [req.param('file'), req.param('schema'), req.param('table')]
		};

		PythonShell.run(req.param('importScript'), options, function (err, results) {
		  if (err) {
		  	// return error
		  	res.json(400, {
		  		error: 'Data import error, please try again!'
		  	});
		  } else {

			// remove file
			fs.unlink(req.param('file'));

			if (!req.param('processScript')) {
				res.json({ status:200 });
			} else {

				// run processing script
				function puts(error, stdout, stderr) { sys.puts(stdout) }
				exec('. ' + options.scriptPath + '/../db/' + req.param('processScript'), function(error, stdout, stderr) {
					if (!error) {
						// success
						res.json({ status:200 });
					} else {
						// return error
					  	res.json(400, {
					  		error: 'Data processing error, please try again!'
					  	});
					}
				});
			}
		  }
		});

	},

	//
  print: async function (req, res) {

    try {
      var report = req.param('report'),
        printUrl = req.param('printUrl'),
        user = req.param('user'),
        viewportWidth = req.param('viewportWidth') ? req.param('viewportWidth') : 1920,
        viewportHeight = req.param('viewportHeight') ? req.param('viewportHeight') : 1570;

      const puppeteer = require('puppeteer');

      const browser = await puppeteer.launch({
        headless: true, args: [
          '--proxy-server="direct://"',
          '--proxy-bypass-list=*',
          '--no-sandbox'
        ]
      });

      const page = await browser.newPage();

      await page.goto(req.protocol + '://' + req.host + '/desk/#/cluster/login');

      await page.evaluate((user) => {
        localStorage.setItem('auth_token', JSON.stringify(user));
      }, user);

      await page.close();

      const pageDashboard = await browser.newPage();
      pageDashboard.setDefaultNavigationTimeout(300000);

      pageDashboard.setViewport({
        width: viewportWidth,
        height: viewportHeight
      });

      await pageDashboard.goto(printUrl, { waitUntil: ['load', 'domcontentloaded', 'networkidle0'] });

      await pageDashboard.evaluate(() => {

        // hide side nav
        $(".ngm-menu").css({ 'width': '0px' });
        // left/right padding
        $("#ngm-report").css({ 'padding-left': '90px' });
        $("#ngm-report").css({ 'padding-right': '90px' });
        // hide btns
        $('.btn').css({ 'display': 'none' });
        $("#ngm-report-download").css({ 'display': 'none' });
        $(".ngm-profile-btn").css({ 'display': 'none' });
        $("#dashboard-btn").parent().parent().css({ "display": "none" });
        // navigation breadcrumb
        $("#ngm-breadcrumb").css({ 'display': 'none' });
        // tabs breadcrumb
        $("#ngm-tabs").css({ 'display': 'none' });
        // menu footer
        $(".ngm-menu-footer").css({ 'display': 'none' });
        $(".upload-view-switch").css({ 'display': 'none' });
        // title size adjustment
        $("#ngm-report-title").css({ 'font-size': '3.1rem' });
        // count size
        $('.count').css({ 'font-size': '2rem' });
        $('.count').css({ 'line-height': '2rem' });
        // position date range
        $("#ngm-report-datepicker").css({ 'padding-left': '20px;' });

        // fix layout issue - for each row
        $('.row').each(function (i, row) {
          // for each widget
          $(row).children().each(function (j, w) {
            if ($(w).attr('class')) {
              // if col is not full length
              if ($(w).attr('class').search('l12') === -1) {
                // get width
                var width = ((parseInt($(w).attr('class').slice(-1)) / 12) * 100).toFixed(2);
                console.log(width)
                // update widget width
                $(w).css({ 'width': width + '%' });
              }
            }
          });
        });

        // if textarea
        if ($('textarea')[0]) {

          // update text color
          $('input').css({ 'color': '#000000' });
          $('select').css({ 'color': '#000000' });

          // expand
          $('textarea').css({ 'color': '#000000' });
          $('textarea').height($('textarea')[0].scrollHeight);
        }

        $('.remove').remove();

        // update all promo charts
        $(".highchart-promo").css({ 'top': '40px', 'left': '10px' });
        // hide map controls
        $(".leaflet-control-container").css({ 'display': 'none' });
        // hide contact card
        $("#ngm-contact").css({ 'display': 'none' });
        // display download date
        $("#ngm-report-extracted").css({ 'display': 'block' });
        // adjust to left donuts
        $(".highcharts-series-group").css({ 'transform': 'translateX(-12px)' });

      });

      // await pageDashboard.screenshot({
      //   path: `/home/ubuntu/nginx/www/ngm-reportPrint/pdf/${report}.jpg`,
      //   type: 'jpg',
      //   quality: 100
      // });

      await pageDashboard.emulateMedia('print');

      const pdf = await pageDashboard.pdf({ path: `/home/ubuntu/nginx/www/ngm-reportPrint/pdf/${report}.pdf`, width: viewportWidth - 280, height: viewportHeight });

      await browser.close();

      res.json({
        status: 200,
        report: report + '.pdf'
      });
    } catch (err) {
      res.json(400, {
        error: err
      });
    }

  },

	/**
   * @deprecated
   *
   * Update to phantom 2.5 is required which supports es6
   */
	print_with_phantomjs: function  (req, res) {

		var report = req.param('report'),
			printUrl = req.param('printUrl'),
			user = req.param('user'),
			pageLoadTime = req.param('pageLoadTime'),
			viewportWidth = req.param('viewportWidth'),
			viewportHeight = req.param('viewportHeight'),
			exec = require('child_process').exec,
			cmd = 'phantomjs /home/ubuntu/nginx/www/ngm-reportPrint/ngm-print.js ' + report + ' '
																																						 + printUrl + ' '
																																						 + user.adminRpcode + ' '
																																						 + user.adminRname + ' '
																																						 + user.admin0pcode + ' '
																																						 + user.admin0name + ' '
																																						 + user.cluster + ' '
																																						 + user.cluster_id + ' '
																																						 + user.organization + ' '
																																						 + user.organization_tag + ' '
																																						 + user.username + ' '
																																						 + user.roles.toString() + ' '
																																						 + user.token + ' '
																																						 + pageLoadTime;

		// width opts
		cmd = viewportWidth ? cmd + ' ' + viewportWidth : cmd;
		// height opts
		cmd = viewportHeight ? cmd + ' ' + viewportHeight: cmd;

		exec( cmd,
			function( error, stdout, stderr ) {
				if (!error) {
					// success
					res.json({
						status:200,
						report: report + '.pdf'
					});
				} else {
					// return error
				  	res.json(400, {
				  		error: 'PDF export error, please try again!'
				  	});
				}
			}
		);
	},

	//
	proxy: function  (req, res) {

    // request input
    if ( !req.param( 'url' ) ) {
      return res.json(401, { err: 'url required!' } );
    }

		var url = req.param( 'url' ),
			exec = require('child_process').exec,
			cmd = 'curl -v -H "Authorization:Basic cGZpdHpnZXJhbGQ6UEB0cmljazc=" -G "' + url + '"';

		exec( cmd, function( error, stdout, stderr ) {
				if (!error) {
					// success
					res.json( 200, JSON.parse( stdout ) );
				} else {
					// return error
				  	res.json(400, { error: 'Request error! Please try again...' });
				}
			}
		);
	},

	//
	export: function( req, res ){

		// request
		var data = [],
				request = require( 'request' ),
				json2csv = require( 'json2csv' ),
				indicator = req.param( 'indicator' ) ? req.param( 'indicator' ) : 'popn_to_health_facilities',
				fieldNames = [ 'Province Name', 'Province Code', '<1h', '<2h', '<3h', '<4h', '<5h', '<6h', '<7h', '<8h', '>8h' ];

		// indicator
		switch ( indicator ) {

			case 'popn_to_prov_capital':
				var fields = [ 'prov_name', 'prov_code', 'l1_h__itsx_prov', 'l2_h__itsx_prov', 'l3_h__itsx_prov', 'l4_h__itsx_prov', 'l5_h__itsx_prov', 'l6_h__tsx_prov', 'l7_h__itsx_prov', 'l8_h__tsx_prov', 'g8_h__itsx_prov' ];
				break;

			case 'popn_to_airport':
				var fields = [ 'prov_name', 'prov_code', 'l1_h__near_airp', 'l2_h__near_airp', 'l3_h__near_airp', 'l4_h__near_airp', 'l5_h__near_airp', 'l6_h__near_airp', 'l7_h__near_airp', 'l8_h__near_airp', 'g8_h__near_airp' ];
				break;

			default:
				var fields = [ 'prov_name', 'prov_code', 'l1_h__near_hltall', 'l2_h__near_hltall', 'l3_h__near_hltall', 'l4_h__near_hltall', 'l5_h__near_hltall', 'l6_h__near_hltall', 'l7_h__near_hltall', 'l8_h__near_hltall', 'g8_h__near_hltall' ];
				break;

		}

		//
		var counter = 0,
				province = [{
					'prov_code': 1, 'prov_name': 'Kabul'
				},{
					'prov_code': 2, 'prov_name': 'Kapisa'
				},{
					'prov_code': 3, 'prov_name': 'Parwan'
				},{
					'prov_code': 4, 'prov_name': 'Wardak'
				},{
					'prov_code': 5, 'prov_name': 'Logar'
				},{
					'prov_code': 6, 'prov_name': 'Nangarhar'
				},{
					'prov_code': 7, 'prov_name': 'Laghman'
				},{
					'prov_code': 8, 'prov_name': 'Panjsher'
				},{
					'prov_code': 9, 'prov_name': 'Baghlan'
				},{
					'prov_code': 10, 'prov_name': 'Bamyan'
				},{
					'prov_code': 11, 'prov_name': 'Ghazni'
				},{
					'prov_code': 12, 'prov_name': 'Paktya'
				},{
					'prov_code': 13, 'prov_name': 'Kunar'
				},{
					'prov_code': 14, 'prov_name': 'Nuristan'
				},{
					'prov_code': 15, 'prov_name': 'Badakhshan'
				},{
					'prov_code': 16, 'prov_name': 'Takhar'
				},{
					'prov_code': 17, 'prov_name': 'Kunduz'
				},{
					'prov_code': 18, 'prov_name': 'Balkh'
				},{
					'prov_code': 19, 'prov_name': 'Samangan'
				},{
					'prov_code': 20, 'prov_name': 'Sar-e-Pul'
				},{
					'prov_code': 21, 'prov_name': 'Ghor'
				},{
					'prov_code': 22, 'prov_name': 'Daykundi'
				},{
					'prov_code': 23, 'prov_name': 'Uruzgan'
				},{
					'prov_code': 24, 'prov_name': 'Zabul'
				},{
					'prov_code': 25, 'prov_name': 'Paktika'
				},{
					'prov_code': 26, 'prov_name': 'Khost'
				},{
					'prov_code': 27, 'prov_name': 'Jawzjan'
				},{
					'prov_code': 28, 'prov_name': 'Faryab'
				},{
					'prov_code': 29, 'prov_name': 'Badghis'
				},{
					'prov_code': 30, 'prov_name': 'Hirat'
				},{
					'prov_code': 31, 'prov_name': 'Farah'
				},{
					'prov_code': 32, 'prov_name': 'Hilmand'
				},{
					'prov_code': 33, 'prov_name': 'Kandahar'
				},{
					'prov_code': 34, 'prov_name': 'Nimroz'
				}];

		// length
		var length = province.length;

		// do request to get province
		province.forEach( function( d, i ){

			// options
			var options = {
			  method: 'post',
			  body: {
					spatialfilter: [],
					flag: 'currentProvince',
					code: d.prov_code
			  },
			  json: true,
			  url: 'http://asdc.immap.org/geoapi/getaccessibilities/',
			  headers: {
			    'Authorization': 'Basic cGZpdHpnZXJhbGQ6UEB0cmljazc='
			  }
			}

			// request
			request( options, function ( err, response, body ) {

			  // error
			  if ( err ) return res.json( 200, err );

			  //
			  data[ i ] = body;

			  // add province details
			  data[ i ].prov_code = d.prov_code;
			  data[ i ].prov_name = d.prov_name;

			  //
			  counter++;

			  // end
			  if ( counter === length ) {
		      // return csv
		      json2csv({ data: data, fields: fields, fieldNames: fieldNames }, function( err, csv ) {

		        // error
		        if ( err ) return res.negotiate( err );

		        // stream csv
					  res.setHeader('Content-disposition', 'attachment; filename=' + indicator + '.csv');
					  res.set('Content-Type', 'text/csv');
					  res.status( 200 ).send( csv );

		      });
			  }

			});


		});

	},

  //
  getBeneficiairiesCsv: function( req, res ) {

  	//
  	var json2csv = require( 'json2csv' );

    //
    Beneficiaries
      .find()
      .exec( function( err, b ){

        // error
        if ( err ) return res.negotiate( err );

        // return csv
        json2csv({ data: b }, function( err, csv ) {

		        // error
		        if ( err ) return res.negotiate( err );

		        // stream csv
					  res.setHeader('Content-disposition', 'attachment; filename=beneficiaries.csv');
					  res.set('Content-Type', 'text/csv');
					  res.status( 200 ).send( csv );

        });

      });

  }

};

