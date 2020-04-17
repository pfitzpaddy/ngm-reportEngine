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

  // takes -> arg1: object array, arg2: props(string or array)
  // returns -> concatenated string of props values
  arrayToString: function (arr, props) {
    if (Array.isArray(arr)) {
      var strArr = [];
      arr.forEach(function (e) {
        propsStr = "";
        if (Array.isArray(props)) {
          e[props[0]] && props.forEach(function (p, i) {
            if (i) propsStr += (i > 1) ? ' ' : ': ';
            propsStr += e[p] ? e[p] : "n/a" ;
          })
        } else {
          propsStr += e[props] ? e[props] : "";
        }
        if (e && propsStr) strArr.push(propsStr);
      });
      strArr.sort();
      str = strArr.join(', ');
    } else str = "";
    return str;
  }

};
