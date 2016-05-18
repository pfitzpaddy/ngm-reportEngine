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
       }]
		},
		visits: {
			type: 'integer',
			defaultsTo: 1
		},
		gravatar_url: {
			type: 'string'
		}
	},

	// encrypt password before create, assign org_id
	beforeCreate: function ( user, next ) {

		// encrypts the password/confirmation to be stored in the db
		require( 'bcrypt' ).hash( user.password, 10, function passwordEncrypted( err, encryptedPassword ) {
			
			// return error
			if ( err ) return next( err );
				
			// encrypt password
			user.password = encryptedPassword;

			// org id by name
			var org_name = user.organization.replace(/ /g, '_').toLowerCase();

			// check if org exists
	    Organization.find( { organization_name: org_name } ).exec(function ( err, organization ){
			  	
			  // error
			  if ( err ) return next( err );

			  // if org dosnt exist, create
			  if( !organization.length ){
			  	
			  	// create org_id
			  	Organization.create({
			  		organization_name: org_name,
			  		organization_display_name: user.organization,
			  	}).exec(function (err, created){
						
						// return error
						if ( err ) return next( err );
					
						// organization_id
						user.organization_id = created.id;

						// next!
						next();						

					});

					// exists
			  } else{
			  	
			  	// organization_id
			  	user.organization_id = organization[0].id;

					// next!
					next();

			  }
			  
			});

		});			

	},

	// after create ensure not malicious user
	afterCreate: function ( user, next ) {

    // get user by email
    User
    	.find()
    	.where({ organization_id: user.organization_id })
    	.sort('createdAt ASC')
    	.exec( function( err, admin ){

				// return
			  if ( err ) return next( err );

			  // if more then 1 user for that org
				if ( admin.length > 1 ) {

	        // send email
	        sails.hooks.email.send( 'new-user', {
	            username: admin[0].username,
	            newusername: user.username,
	            name: user.name,
	            position: user.position,
	            phone: user.phone,
	            email: user.email,
	            sendername: 'ReportHub'
	          }, {
	            to: admin[0].email,
	            subject: 'ReportHub - New ' + admin[0].organization + ' User !'
	          }, function(err) {
		
							// return
						  if ( err ) return next( err );

					  	// next
							next();

	          });

	    	} else {
							  	
			  	// next
					next();

	    	}

      });

	}

};

