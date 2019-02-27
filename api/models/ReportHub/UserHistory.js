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
		// master table user id
    user_id: {
			type: 'string',
			required: true
    },
		// region/country id
    adminRpcode: {
			type: 'string',
			required: true
    },
    adminRname: {
			type: 'string',
			required: true
    },
		adminRtype_name: {
			type: 'string'
		},
    admin0pcode: {
			type: 'string',
			required: true
    },
    admin0name: {
			type: 'string',
			required: true
    },
		admin0type_name: {
			type: 'string'
		},
    admin1pcode: {
			type: 'string'
    },
    admin1name: {
			type: 'string'
    },
		admin1type_name: {
			type: 'string'
		},
		organization_id: {
			type: 'string'
		},
		organization_type: {
			type: 'string'
		},
		organization_name: {
			type: 'string'
		},
		organization_tag: {
			type: 'string',
			required: true
		},
		organization: {
			type: 'string',
			required: true
		},
		cluster_id: {
			type: 'string',
			required: true
		},
		cluster: {
			type: 'string',
			required: true
		},
		contract_start_date: {
			type: 'date'
		},
		contract_end_date: {
			type: 'date'
		},
		programme_id: {
			type: 'string'
		},
		programme_name: {
			type: 'string'
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
			type: 'string',
			required: true
		},
		skype: {
			type: 'string'
		},
		email: {
			type: 'string',
			unique: true,
			required: true
		},
		roles: {
			type: 'array',
			defaultsTo: [ "USER" ]
		},
		visits: {
			type: 'integer',
			defaultsTo: 1
		},
		site_class: {
			type: 'string'
		},
		site_type_id: {
			type: 'string'
		},
		site_type_name: {
			type: 'string'
		},
		site_status: {
			type: 'string'
		},
		site_name: {
			type: 'string'
		},
		adminRlng: {
			type: 'float'
		},
		adminRlat: {
			type: 'float'
		},
		admin0lng: {
			type: 'float'
		},
		admin0lat: {
			type: 'float'
		},
		admin1lng: {
			type: 'float'
		},
		admin1lat: {
			type: 'float'
		},
		site_lng: {
			type: 'float'
		},
		site_lat: {
			type: 'float'
		}

	},

	// encrypt password before create, assign org_id
	beforeCreate: function ( user, next ) {

		// encrypts the password/confirmation to be stored in the db
		// require( 'bcrypt' ).hash( user.password, 10, function passwordEncrypted( err, encryptedPassword ) {
			
			// return error
			// if ( err ) return next( err );
				
			// encrypt password
			// user.password = encryptedPassword;

			// check if org exists
	    Organization
	    	.find()
	    	.where( { admin0pcode: user.admin0pcode, cluster_id: user.cluster_id, organization: user.organization } )
	    	.exec(function ( err, organization ){
			  	
				  // error
				  if ( err ) return next( err );

				  // if org dosnt exist, create
				  if( organization.length ){

				  	// organization_id
				  	user.organization_id = organization[0].id;

						// next!
						next();

						// exists
				  } else{

				  	// create org_id
				  	Organization.create({
				  		adminRpcode: user.adminRpcode,
				  		adminRname: user.adminRname,
				  		admin0pcode: user.admin0pcode,
				  		admin0name: user.admin0name,
				  		organization_type: user.organization_type,
				  		organization_name: user.organization_name,
				  		organization_tag: user.organization_tag,
				  		organization: user.organization,
				  		cluster_id: user.cluster_id,
				  		cluster: user.cluster
				  	}).exec(function (err, created){
							
							// return error
							if ( err ) return next( err );
						
							// organization_id
							user.organization_id = created.id;

							// next!
							next();						

						});

				  }
				  
				});

		// });	

	},


};

