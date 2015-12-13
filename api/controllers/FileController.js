/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
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

	process: function  (req, res) {

		var PythonShell = require('python-shell');

		var options = {
		  mode: 'text',
		  scriptPath: __dirname + '/../../tasks/python',
		  args: [req.param('file'), req.param('schema'), req.param('table')]
		};

		PythonShell.run(req.param('importScript'), options, function (err, results) {
		  if (err) {
		  	// return error
		  	res.json(400, { 
		  		error: 'Data import error, please check the ' + req.param('type').toUpperCase() + ' and try again!' 
		  	});
		  } else {
			//
			var exec = require('child_process').exec;

			function puts(error, stdout, stderr) { sys.puts(stdout) }
			exec('. ' + options.scriptPath + '/../db/' + req.param('processScript'), function(error, stdout, stderr) {
				if (!error) {
					// success
					res.json({ status:200 });
				} else {
					// return error
				  	res.json(400, { 
				  		error: 'Data processing error, please check the ' + req.param('type').toUpperCase() + ' and try again!' 
				  	});
				}
			})
		  }
		});

	},		
};

