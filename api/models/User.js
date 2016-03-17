/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	// strict schema
	schema: true,

	// attributes
	attributes: {
		organization_id: {
			type: 'string'
		},
		organization: {
			type: 'string',
			required: true
		},
		username: {
			type: 'string',
			unique: true,
			required: true
		},
		password: {
			type: 'string',
			required: true
		},
		name: {
			type: 'string',
			required: true
		},
		position: {
			type: 'string',
			required: true
		},
		phone: {
			type: 'integer',
			required: true
		},
		email: {
			type: 'email',
			unique: true,
			required: true
		},
		anonymous: {
			type: 'boolean',
			defaultsTo: false
		},
		roles: {
			type: 'array',
			defaultsTo: ["USER"]
		},
		app_home: {
			type: 'string',
			defaultsTo: 'health'
		},
		menu: {
			type: 'array',
			defaultsTo: [{
        icon: "zoom_in",
        liClass: "teal z-depth-2",
        aClass: "white-text",
        iClass: "medium material-icons",
        href: "#/health/project",
        title: "PROJECTS"
       },{
				icon: "assessment",
				liClass: "teal z-depth-2",
				aClass: "white-text",
				iClass: "medium material-icons",
				href: "#/health/4w",
				title: "HEALTH 4W"
      }]
		},
		visits: {
			type: 'integer',
			defaultsTo: 1
		},		
		last_logged_in: {
			type: 'date',
			required: false,
			defaultsTo: new Date()
		},
		gravatar_url: {
			type: 'string'
		}
	},

	// encrypt password before create, assign org_id
	beforeCreate: function ( user, next ) {

		// encrypts the password/confirmation to be stored in the db
		require( 'bcrypt' ).hash( user.password, 10, function passwordEncrypted( err, encryptedPassword ) {
			if ( err ) return next( err );
			user.password = encryptedPassword;
			next();
		});

		// org id by name
		var org_name = user.organization.replace(/ /g, '_').toLowerCase();

		// check if org exists
    Organization.find({ organization_name: org_name }).exec(function (err, organization){
		  
		  if (err) {
		    return res.negotiate(err);
		  }

		  // dosnt exist, create
		  if(!organization.length){
		  	// create org_id
		  	Organization.create({
		  		organization_name: org_name,
		  		organization_display_name: user.organization,
		  	}).exec(function (err, created){
					if (err) {
					  return res.negotiate(err);
					}
					else {
						// organization_id
						user.organization_id = created.id;
					}
				});
		  }

		  // exists
		  else{
		  	// organization_id
		  	user.organization_id = organization[0].id;
		  }
		  
		});

	}

};

