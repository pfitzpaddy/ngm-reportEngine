module.exports =  {
  /**
   * Get centroid of the filter provided.
   * @param {Object} filterObject - Object containing admin props.
   * @param {Object} config - default { model: 'Admin2', params: ['adminRpcode', 'admin0pcode', 'admin1pcode', 'admin2pcode'], fallback: 'admin0pcode' }
   * @returns {Object} lat and lng.
   */
  getAreaCentroid: async function (filterObject, config) {
    model     = 'Admin2';
    params    = ['adminRpcode', 'admin0pcode', 'admin1pcode', 'admin2pcode'];
    fallback  = 'admin0pcode';

    if (config) {
      if (config.params) {
        params = config.params;
      }
      if (config.model) {
        model = config.model;
      }
      if (config.fallback){
        fallback = config.fallback;
      }
    }
    // construct query
    query = FilterObjectService.pick(filterObject, params);
    let admin = await global[model].findOne(query);

    // if admin1,2 not found get admin0
    if (!admin && query[fallback]) {
      admin = await global[model].findOne({ [fallback]: query[fallback] });
      if (admin) query = FilterObjectService.pick(filterObject, [fallback]);
    }

    if (admin) coordinates = FilterObjectService.getQueryCoordinates(admin, query);

    // otherwise null island
    if (!admin) {
      coordinates = { lat: 0, lng: 0 };
    }

    return coordinates;

  }
};
