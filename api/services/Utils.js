var util = require('util');

module.exports =  {
  /**
   * Common functions.
   */
    // parse results from sails
	set_result: function( result ) {
		if( util.isArray( result ) ) {
			// update ( array )
			return result[0];
		} else {
			// create ( object )
			return result;
		}
	},
};
