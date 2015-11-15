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
		lastLoggedIn: {
			type: 'date',
			required: true,
			defaultsTo: new Date(0)
		},
		gravatarUrl: {
			type: 'string'
		}
	},

	// encrypt password before create
	beforeCreate: function ( values, next ) {

		// encrypts the password/confirmation to be stored in the db
		require( 'bcrypt' ).hash( values.password, 10, function passwordEncrypted( err, encryptedPassword ) {
			if ( err ) return next( err );
			values.password = encryptedPassword;
			next();
		});		
	}

};

