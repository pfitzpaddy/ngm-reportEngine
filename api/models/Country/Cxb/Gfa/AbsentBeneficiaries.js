/**
* Dews.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	// connection
	connection: 'ngmWfpGfaServer',

	// updateOrCreate
		// http://stackoverflow.com/questions/25936910/sails-js-model-insert-or-update-records
	updateOrCreate: function( criteria, values, cb ){
		var self = this; // reference for use by callbacks

		// if exists
		this.findOne( criteria ).then( function ( result ){
			if( result ){
				self.update( criteria, values ).exec(function(err, updated){
					if(err) {
						cb(err, false);
					} else {
						cb(false, updated);
					}					
				});
			}else{
				self.create( values ).exec(function(err, created){
					if(err) {
						cb(err, false);
					} else {
						cb(false, created);
					}
				});
			}
		});

	}

}