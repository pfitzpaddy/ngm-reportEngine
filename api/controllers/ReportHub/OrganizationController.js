/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // get organization by id
  getOrganization: function( req, res ){

    // check params
    if ( !req.param( 'organization_id' ) ) {
      return res.json(401, { msg: 'organization_id required' });
    }

    // id params
    var organization_id = req.param( 'organization_id' );

    // find
    Organization
      .findOne()
      .populate('warehouses')
      .where( { id: organization_id } )
      .exec( function( err, organization ){

        // return error
        if ( err ) return res.negotiate( err );

        // return updated user
        return res.json( 200, organization );

      })

  },

	getOrganizationsByFilter:function(req,res){
		// check params
		if (!req.param('filter')) {
			return res.json(401, { msg: 'filter required' });
		}

		// id params
		// var admin0pcode = req.param('admin0pcode');

		// based on project
		var organizations = [];
		Project
			.find(req.param('filter'))
			.exec(function (err, org) {
				if(org.length){
					org.forEach(function (d, i) {
						// if not existing											
							organizations.push({ organization_tag: d.organization_tag, organization_name: d.organization_name, organization: d.organization });
					});
					distinct = _.uniq(organizations, function (x) {
															return x.organization_tag
														});
					organizations = _.sortBy(distinct, 'organization_tag');
				}
				return res.json(200, organizations);
			})
		// Pure Organization
		// find
		// Organization
		// 	.find(req.param('filter'))
		// 	// .where({ admin0pcode: admin0pcode })
		// 	.exec(function (err, organization) {

		// 		// return error
		// 		if (err) return res.negotiate(err);
		// 		organization = _.sortBy(organization, 'organization_tag');
		// 		// return updated user
		// 		return res.json(200, organization);

		// 	})
	},
  // get org menu
  getOrganizationMenu: function( req, res ){
    
    // request input
    if ( !req.param( 'menu_items' ) ) {
      return res.json( 400, { err: 'menu_items required!' });
    }

    // menu
    var menu = [];
    var admin0name;
    var organization;
    var menu_items = req.param( 'menu_items' );

    // set filters
    var adminRpcode_filter = !req.param( 'adminRpcode' ) || req.param( 'adminRpcode' ) === 'all' ? {} : { adminRpcode: req.param( 'adminRpcode' ) },
        admin0pcode_filter = !req.param( 'admin0pcode' ) || req.param( 'admin0pcode' ) === 'all' ? {} : { admin0pcode: req.param( 'admin0pcode' ) },
        organization_filter = !req.param( 'organization_tag' ) || req.param( 'organization_tag' ) === 'all' ? {} : { organization_tag: req.param( 'organization_tag' ) },
        cluster_id_filter = !req.param( 'cluster_id' ) || req.param( 'cluster_id' ) === 'all' ? {} : { cluster_id: req.param( 'cluster_id' ) };

    // app url
    var url = menu_items.indexOf( 'project' ) !== -1 ? '/desk/#/immap/team/' : '/desk/#/team/';

    // products
    Admin1
      .find()
      .exec( function( err, countries ){

        // return error
        if (err) return res.negotiate( err );

        // organization
        Organization
          .find()
          .where( adminRpcode_filter )
          .where( admin0pcode_filter )
          .where( organization_filter )
          .where( cluster_id_filter )
          .exec( function( err, organizations ){

            // return error
            if (err) return res.negotiate( err );

            // organization
            User
              .find()
              .where( adminRpcode_filter )
              .where( admin0pcode_filter )
              .where( organization_filter )
              .where( cluster_id_filter )
              .exec( function( err, users ){

                // return error
                if (err) return res.negotiate( err );

                // country
                if ( menu_items.indexOf( 'admin0pcode' ) !== -1 ) {
                  
                  // menu
                  menu.push({
                    'search': true,
                    'id': 'search-team-country',
                    'icon': 'person_pin',
                    'title': 'Country',
                    'class': 'teal lighten-1 white-text',
                    'rows':[]
                  });

                  // get unique countries
                  var list = _.uniq( countries, function( d ){
                    return d.admin0pcode;
                  });

                  // sort
                  list.sort(function( a, b ) {
                    return a.admin0name.localeCompare( b.admin0name );
                  });

                  // add all
                  list.unshift({ admin0name: 'All', admin0pcode: 'all' });

                  // for each
                  list.forEach( function( d, i ) {
                    menu[ menu.length-1 ].rows.push({
                      'title': d.admin0name,
                      'param': 'admin0pcode',
                      'active': d.admin0pcode,
                      'class': 'grey-text text-darken-2 waves-effect waves-teal waves-teal-lighten-4',
                      'href': url + d.admin0pcode + '/' + 
                                req.param( 'organization_tag' ) + '/' +
                                req.param( 'project' ) + '/' +
                                req.param( 'cluster_id' )
                    });
                  });

                }

                // organization
                if ( menu_items.indexOf( 'organization_tag' ) !== -1 ) {

                  // menu
                  menu.push({
                    'search': true,
                    'id': 'search-team-organization',
                    'icon': 'supervisor_account',
                    'title': 'Organization',
                    'class': 'teal lighten-1 white-text',
                    'rows':[]
                  });

                  // get unique countries
                  var list = _.uniq( organizations, function( d ){
                    return d.organization;
                  });

                  // sort
                  list.sort(function( a, b ) {
                    return a.organization.localeCompare( b.organization );
                  });

                  // add all
                  list.unshift({ organization: 'All', organization_tag: 'all' });

                  // for each
                  list.forEach( function( d, i ) {
                    menu[ menu.length-1 ].rows.push({
                      'title': d.organization,
                      'param': 'organization_tag',
                      'active': d.organization_tag,
                      'class': 'grey-text text-darken-2 waves-effect waves-teal waves-teal-lighten-4',
                      'href': url + req.param( 'admin0pcode' ) + '/' +
                                d.organization_tag + '/' +
                                req.param( 'project' ) + '/' +
                                req.param( 'cluster_id' )
                    });
                  });

                }

                // project
                if ( menu_items.indexOf( 'project' ) !== -1 ) {

                  // menu
                  menu.push({
                    'search': true,
                    'id': 'search-team-project',
                    'icon': 'recent_actors',
                    'title': 'Project',
                    'class': 'teal lighten-1 white-text',
                    'rows':[]
                  });

                  // get unique countries
                  var list = _.uniq( users, function( d ){
                    if ( d.programme_id ) {
                      return d.programme_id 
                    };
                  });

                  // sort
                  list.sort(function( a, b ) {
                    if ( a.programme_name && b.programme_name ) {
                      return a.programme_name.localeCompare( b.programme_name );  
                    }
                  });

                  // add all
                  list.unshift({ programme_name: 'All', programme_id: 'all' });

                  // for each
                  list.forEach( function( d, i ) {
                    if ( d.programme_id ) {
                      menu[ menu.length-1 ].rows.push({
                        'title': d.programme_name,
                        'param': 'programme_id',
                        'active': d.programme_id,
                        'class': 'grey-text text-darken-2 waves-effect waves-teal waves-teal-lighten-4',
                        'href': url + req.param( 'admin0pcode' ) + '/' +
                                  req.param( 'organization_tag' ) + '/' +
                                  d.programme_id + '/' +
                                  req.param( 'cluster_id' )
                      });
                    }
                  });

                }

                // project
                if ( menu_items.indexOf( 'cluster_id' ) !== -1 ) {

                  // menu
                  menu.push({
                    'search': true,
                    'id': 'search-team-cluster_id',
                    'icon': 'donut_large',
                    'title': 'Sector',
                    'class': 'teal lighten-1 white-text',
                    'rows':[]
                  });

                  // get unique countries
                  var list = _.uniq( users, function( d ){
                    return d.cluster_id;
                  });

                  // sort
                  list.sort(function( a, b ) {
                    return a.cluster.localeCompare( b.cluster );
                  });

                  // add all
                  list.unshift({ cluster: 'All', cluster_id: 'all', admin0pcode: 'all', admin0name: 'All', organization_tag: 'all', organization: 'All' });

                  // for each
                  list.forEach( function( d, i ) {
                    
                    // admin0name
                    if ( d.admin0pcode === req.param( 'admin0pcode' ) ) {
                      admin0name = d.admin0name;
                    }
                    // organization
                    if ( d.organization_tag === req.param( 'organization_tag' ) ) {
                      organization = d.organization;
                    }

                    menu[ menu.length-1 ].rows.push({
                      'title': d.cluster,
                      'param': 'cluster_id',
                      'active': d.cluster_id,
                      'class': 'grey-text text-darken-2 waves-effect waves-teal waves-teal-lighten-4',
                      'href': url + req.param( 'admin0pcode' ) + '/' +
                                req.param( 'organization_tag' ) + '/' +
                                req.param( 'project' ) + '/' +
                                d.cluster_id
                    });
                  });

                }

                // return menu
                return res.json( 200, { organization: organization, admin0name: admin0name, menu: menu } );

              });

          });

      });
  },

  // get organization by id
  getOrganizationIndicator: function( req, res ){

    // set filters
    var adminRpcode_filter = !req.param( 'adminRpcode' ) || req.param( 'adminRpcode' ) === 'all' ? {} : { adminRpcode: req.param( 'adminRpcode' ) },
        admin0pcode_filter = !req.param( 'admin0pcode' ) || req.param( 'admin0pcode' ) === 'all' ? {} : { admin0pcode: req.param( 'admin0pcode' ) },
        organization_filter = !req.param( 'organization_tag' ) || req.param( 'organization_tag' ) === 'all' ? {} : { organization_tag: req.param( 'organization_tag' ) },
        project_filter = !req.param( 'project' ) || req.param( 'project' ) === 'all' ? {} : { programme_id: req.param( 'project' ) },
        cluster_id_filter = !req.param( 'cluster_id' ) || req.param( 'cluster_id' ) === 'all' ? {} : { cluster_id: req.param( 'cluster_id' ) },
        status_filter = !req.param( 'status' ) || req.param( 'status' ) === 'all' ? {} : { status: req.param( 'status' ) };

    // users
    User
      .find()
      .where( adminRpcode_filter )
      .where( admin0pcode_filter )
      .where( organization_filter )
      .where( project_filter )
      .where( cluster_id_filter )
      .where( status_filter )
      .exec( function( err, users ){

        // return error
        if ( err ) return res.negotiate( err );

        // indicator
        switch( req.param( 'indicator' ) ) {

          // distinct organizations
          case 'organizations':
            var organizations = _.uniq( users, function( user ) { return user.organization; });
            return res.json( 200, { value: organizations.length } );
            break;

          // distinct countries
          case 'countries':
            var countries = _.uniq( users, function( user ) { return user.admin0pcode; });
            return res.json( 200, { value: countries.length } );
            break;

          // distinct sectors
          case 'sectors':
            var sectors = _.uniq( users, function( user ) { return user.cluster_id; });
            return res.json( 200, { value: sectors.length } );
            break;

          // total users
          case 'total':
            return res.json( 200, { value: users.length } );
            break;

          // user list
          default:
            return res.json( 200, users );
        }

      });

  },

  // get user login history stats
  getUserLoginHistoryIndicator: function( req, res ){

    // set filters
    var adminRpcode_filter = !req.param( 'adminRpcode' ) || req.param( 'adminRpcode' ) === 'all' ? {} : { adminRpcode: req.param( 'adminRpcode' ) },
        admin0pcode_filter = !req.param( 'admin0pcode' ) || req.param( 'admin0pcode' ) === 'all' ? {} : { admin0pcode: req.param( 'admin0pcode' ) },
        organization_filter = !req.param( 'organization_tag' ) || req.param( 'organization_tag' ) === 'all' ? {} : { organization_tag: req.param( 'organization_tag' ) },
        project_filter = !req.param( 'project' ) || req.param( 'project' ) === 'all' ? {} : { programme_id: req.param( 'project' ) },
        cluster_id_filter = !req.param( 'cluster_id' ) || req.param( 'cluster_id' ) === 'all' ? {} : { cluster_id: req.param( 'cluster_id' ) },
        status_filter = !req.param( 'status' ) || req.param( 'status' ) === 'all' ? {} : { status: req.param( 'status' ) };

    // users
    UserLoginHistory
      .find()
      .where( adminRpcode_filter )
      .where( admin0pcode_filter )
      .where( organization_filter )
      .where( project_filter )
      .where( cluster_id_filter )
      .where( status_filter )
      .exec( function( err, users ){

        // return error
        if ( err ) return res.negotiate( err );

        // indicator
        switch( req.param( 'indicator' ) ) {

          // distinct organizations
          case 'organizations':
            var organizations = _.uniq( users, function( user ) { return user.organization; });
            return res.json( 200, { value: organizations.length } );
            break;

          // distinct countries
          case 'countries':
            var countries = _.uniq( users, function( user ) { return user.admin0pcode; });
            return res.json( 200, { value: countries.length } );
            break;

          // distinct sectors
          case 'sectors':
            var sectors = _.uniq( users, function( user ) { return user.cluster_id; });
            return res.json( 200, { value: sectors.length } );
            break;

          // distinct users
          case 'users':
            var users = _.uniq( users, function( user ) { return user.user_id; });
            return res.json( 200, { value: users.length } );
            break;

          // user list
          default:
            return res.json( 200, users );
        }

      });

  },

  // get organization by id
  getOrganizationUsers: function( req, res ){

    // check params
    if ( !req.param( 'admin0pcode' ) || !req.param( 'organization' ) ) {
      return res.json(401, { msg: 'admin0pcode, cluster_id, organization required' });
    }

    // id params
    var admin0pcode = req.param( 'admin0pcode' ),
        organization = req.param( 'organization' ),
        status_filter = req.param( 'status' ) ? { status: req.param( 'status' ) } : {},
        cluster_id_filter = req.param( 'cluster_id' ) ? { cluster_id: req.param( 'cluster_id' ) } : {};

    // find
    User
      .find()
      .where( status_filter )
      .where( cluster_id_filter )
      .where( { admin0pcode: admin0pcode } )
      .where( { organization: organization } )
      .exec( function( err, users ){

        // return error
        if ( err ) return res.negotiate( err );

        // return updated user
        return res.json( 200, users );

      });

  },

  // set organizaiton partner
  setOrganizationPartner: function( req, res ){

    // check params
    if ( !req.param( 'organization_id' ) ) {
      return res.json(200, { err: true, msg: 'organization_id, project_acbar_partner required' });
    }

    // set
    var $organization_id = req.param( 'organization_id' ),
        $project_acbar_partner = req.param( 'project_acbar_partner' ) ? true : false;

    // update
    Organization
      .update( { id: $organization_id }, { project_acbar_partner: $project_acbar_partner } )
      .exec( function( err, update ){
        // return error
        if ( err ) return res.negotiate( err );
        // return
        return res.json( 200, { success: true } );
      });    

  },

  setOrganization: function( req, res ){

    // check params
    if ( !req.param( 'organization' ) ) {
      return res.json(401, { msg: 'organization required' });
    }

    // id params
    var organization = req.param( 'organization' );

    // update
    Organization
      .update( { id: organization.id }, organization )
      .exec( function( err, update ){

        // return error
        if ( err ) return res.negotiate( err );

        Organization
          .findOne({ id: organization.id })
          .populate('warehouses')
          .exec( function(err, result){
            
            // return error
            if ( err ) return res.negotiate( err );

            // return
            return res.json( 200, result );

          });

      });

  }

};
