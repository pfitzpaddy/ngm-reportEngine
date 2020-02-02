
module.exports = {

  /**
   * Returns new object filtered by props in array, _.pick(object, *keys).
   * @param {Object} object - To filter.
   * @param {Object[]} propsArray - Array of props.
   * @returns {Object} Filtered object.
   */
  pick: function (object, propsArray) {
    filter = {};
    propsArray = propsArray || [];
    propsArray.map(p => {
      if (object[p]) {
        filter[p] = object[p];
      }
    });
    return filter;
  },

  /**
   * Returns coordinates by query.
   * @param {Object} adminObject - admin document.
   * @param {Object} query - query.
   * @returns {Object} Coordinates.
   */
  getQueryCoordinates: function (adminObject, query) {
    // admin
    query = query || {};
    adminObject = adminObject || {};

    let admins = [
      { level: 'admin5pcode', lat: 'admin5lat', lng: 'admin5lng' },
      { level: 'admin4pcode', lat: 'admin4lat', lng: 'admin4lng' },
      { level: 'admin3pcode', lat: 'admin3lat', lng: 'admin3lng' },
      { level: 'admin2pcode', lat: 'admin2lat', lng: 'admin2lng' },
      { level: 'admin1pcode', lat: 'admin1lat', lng: 'admin1lng' },
      { level: 'admin0pcode', lat: 'admin0lat', lng: 'admin0lng' },
      { level: 'adminRpcode', lat: 'adminRlat', lng: 'adminRlng' }
    ];

    for (i = 0; i < admins.length; i++) {
      admin = admins[i];
      if (query[admin.level]) {
        return { lat: adminObject[admin.lat], lng: adminObject[admin.lng] };
      }
    }

    return { lat: 0, lng: 0 };

  }
}
