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
			defaultsTo: []
		},
		visits: {
			type: 'integer',
			defaultsTo: 1
		},		
		last_logged_in: {
			type: 'date',
			required: false,
			defaultsTo: new Date(0)
		},
		gravatar_url: {
			type: 'string'
		}
	},

	// encrypt password before create, assign org_id
	beforeCreate: function ( values, next ) {

		// encrypts the password/confirmation to be stored in the db
		require( 'bcrypt' ).hash( values.password, 10, function passwordEncrypted( err, encryptedPassword ) {
			if ( err ) return next( err );
			values.password = encryptedPassword;
			next();
		});

		// org id by name
		var org_name = values.organization.replace(/ /g, '_').toLowerCase()

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
		  		organization_display_name: values.organization,
		  	}).exec(function (err, created){
					if (err) {
					  return res.negotiate(err);
					}
					else {
						// organization_id
						values.organization_id = created.id;
					}
				});
		  }

		  // exists
		  else{
		  	// organization_id
		  	values.organization_id = organization[0].id;
		  }
		  
		});

	}

};

