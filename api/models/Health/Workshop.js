/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	// connection
	connection: 'ngmHealthClusterServer',

	// strict schema
	schema: true,

	// attributes
	attributes: {
    title: {
			type: 'string',
			required: true
		},
    date: {
			type: 'string',
			required: true
		},
		time: {
			type: 'string',
			required: true
		},
    theme: {
			type: 'string',
			required: true
    },
	  participants: {
      collection: 'participant',
      via: 'workshop'
    }
  }
};

