/**
 * EprController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// require
var moment = require( 'moment' );
var json2csv = require( 'json2csv' );
var $nin_organizations = [ 'immap', 'arcs' ];

var ClusterDashboardController = {

  // flatten json
  flatten: function( json ) {
    var array = [];
    for( var i in json ) {
      if ( json.hasOwnProperty( i ) && json[ i ] instanceof Object ){
        array.push( json[ i ] );
      }
    }
    return array;
  },

  // get params from req
  getParams: function( req, res ){
    
    // request input
    if ( !req.param('indicator') || 
          !req.param('cluster_id') ||
          !req.param('adminRpcode') ||
          !req.param('admin0pcode') ||
          !req.param('organization_tag') ||
          !req.param('admin1pcode') ||
          !req.param('admin2pcode') ||
          !req.param('beneficiaries') ||
          !req.param('start_date') ||
          !req.param('end_date') ) {
      return res.json(401, {err: 'indicator, cluster_id, adminRpcode, admin0pcode, organization_tag, admin1pcode, admin2pcode, beneficiaries, start_date, end_date required!'});
    }

    // return params
    return {      
      csv: req.param('csv') ? req.param('csv') : false,
      ocha: req.param('ocha') ? req.param('ocha') : false,
      list: req.param('list') ? req.param('list') : false,
      indicator: req.param('indicator'),
      cluster_id: req.param('cluster_id'),
      adminRpcode: req.param('adminRpcode'),
      admin0pcode: req.param('admin0pcode'),
      organization_tag: req.param('organization_tag'),
      admin1pcode: req.param('admin1pcode'),
      admin2pcode: req.param('admin2pcode'),
      beneficiaries: req.param('beneficiaries'),
      start_date: req.param('start_date'),
      end_date: req.param('end_date')
    }

  },

  // return filters
  getFilters: function( params ){
    // filters
    return {
      default: { report_year: { '>=': 2017 }, location_id: { '!': null } },
      adminRpcode: params.adminRpcode === 'hq' ? {} : { adminRpcode: params.adminRpcode },
      admin0pcode: params.admin0pcode === 'all' ? {} : { admin0pcode: params.admin0pcode },
      admin1pcode: params.admin1pcode === 'all' ? {} : { admin1pcode: params.admin1pcode },
      admin2pcode: params.admin2pcode === 'all' ? {} : { admin2pcode: params.admin2pcode },
      cluster_id: params.cluster_id === 'all' || params.cluster_id === 'rnr_chapter' || params.cluster_id === 'acbar' ? {} : { or: [{ cluster_id: params.cluster_id }, { mpc_purpose_cluster_id: { contains: params.cluster_id } } ] },
      acbar_partners: params.cluster_id === 'acbar' ? { project_acbar_partner: true } : {},
      organization_tag: params.organization_tag === 'all' ? { organization_tag: { '!': $nin_organizations } } : { organization_tag: params.organization_tag },
      beneficiaries: params.beneficiaries[0] === 'all' ? {} : { beneficiary_type_id: params.beneficiaries },
      date: { reporting_period: { '>=': new Date( params.start_date ), '<=': new Date( params.end_date ) } }
    }
  },

  // indicators
  getIndicator: function ( req, res  ) {
    
    // parmas, filters
    var params = ClusterDashboardController.getParams( req, res );
    var filters = ClusterDashboardController.getFilters( params );

    // switch on indicator
    switch( params.indicator ) {

      case 'latest_update':

        // beneficiaries
        Beneficiaries
          .find()
          .where( filters.default )
          .where( filters.adminRpcode )
          .where( filters.admin0pcode )
          .where( filters.admin1pcode )
          .where( filters.admin2pcode )
          .where( filters.cluster_id )
          .where( filters.acbar_partners )
          .where( filters.organization_tag )
          .where( filters.beneficiaries )
          .where( filters.date )
          .sort( 'updatedAt DESC' )
          .limit(1)
          .exec( function( err, results ){

            // return error
            if (err) return res.negotiate( err );

            // latest update
            return res.json( 200, results[0] );

          });

        break;

      
      case 'organizations':

        // get organizations by project
        Beneficiaries
          .find()
          .where( filters.default )
          .where( filters.adminRpcode )
          .where( filters.admin0pcode )
          .where( filters.admin1pcode )
          .where( filters.admin2pcode )
          .where( filters.cluster_id )
          .where( filters.acbar_partners )
          .where( filters.organization_tag )
          .where( filters.beneficiaries )
          .where( filters.date )
          // .where( filters.$nin_organizations )
          .exec( function( err, beneficiaries ){

            // return error
            if (err) return res.negotiate( err );

            // orgs
            var organizations = [];

            // projects 
            beneficiaries.forEach(function( d, i ){

              // if not existing
              if( !organizations[ d.organization_tag ] ) {
                // add
                organizations[ d.organization_tag ] = {};
                organizations[ d.organization_tag ].organization_tag = d.organization_tag;
                organizations[ d.organization_tag ].organization = d.organization;
              }

            });

            // flatten
            if ( organizations ) {
              organizations = ClusterDashboardController.flatten( organizations );
            }

            // order
            organizations.sort(function(a, b) {
              return a.organization.localeCompare(b.organization);
            });

            // default
            organizations.unshift({
              organization_tag: 'all',
              organization: 'ALL',
            });


            // get a list of projects for side menu
            if ( params.list ) {
              // return org list
              return res.json( 200, organizations );
            } else {
              // return indicator
              return res.json( 200, { 'value': organizations.length-1 });
            }

          });

        break;

      case 'projects':

        // get organizations by project
        Beneficiaries
          .find()
          .where( filters.default )
          .where( filters.adminRpcode )
          .where( filters.admin0pcode )
          .where( filters.admin1pcode )
          .where( filters.admin2pcode )
          .where( filters.cluster_id )
          .where( filters.acbar_partners )
          .where( filters.organization_tag )
          .where( filters.beneficiaries )
          .where( filters.date )
          .exec( function( err, beneficiaries ){

            // return error
            if (err) return res.negotiate( err );

            // orgs
            var projects = [];

            // projects 
            beneficiaries.forEach(function( d, i ){

              // if not existing
              if( !projects[ d.project_id ] ) {
                // add 
                projects[ d.project_id ] = {};
                projects[ d.project_id ].project_id = d.project_id;
              }

            });

            // return org list
            return res.json( 200, { 'value': ClusterDashboardController.flatten( projects ).length } );

          });

        break;


      case 'contacts':

        // require
        var users = [],
            fields = [ 'admin0name', 'cluster', 'organization', 'name', 'position', 'username', 'phone', 'email', 'createdAt' ],
            fieldNames = [ 'Country', 'Cluster', 'Organization', 'Name', 'Position', 'Username', 'Phone', 'Email', 'Joined ReportHub' ];


        // get organizations by project
        Beneficiaries
          .find()
          .where( filters.default )
          .where( filters.adminRpcode )
          .where( filters.admin0pcode )
          .where( filters.admin1pcode )
          .where( filters.admin2pcode )
          .where( filters.cluster_id )
          .where( filters.acbar_partners )
          .where( filters.organization_tag )
          .where( filters.beneficiaries )
          .where( filters.date )
          .exec( function( err, beneficiaries ){

            // return error
            if (err) return res.negotiate( err );

            // orgs
            var users = [];

            // projects 
            beneficiaries.forEach(function( d, i ){

              // if not existing
              users.push( d.username );

            });

            // users
            User
              .find()
              .where( { username: users } )
              .exec( function( err, users ){

                // return error
                if (err) return res.negotiate( err );

                // return csv
                json2csv({ data: users, fields: fields, fieldNames: fieldNames }, function( err, csv ) {
                  
                  // error
                  if ( err ) return res.negotiate( err );

                  // success
                  if ( params.ocha ) {
                    res.set('Content-Type', 'text/csv');
                    return res.send( 200, csv );
                  } else { 
                    return res.json( 200, { data: csv } );
                  }

                });

              });

            });

        break;


      case 'ocha_report':

        // require
        var data = {},
            hxl_codes = {
              cluster: '#sector+name',
              admin1pcode: '#adm1+code',
              admin1name: '#adm1+name',
              organization: '#org+prog',
              implementing_partners: '#org+impl', 
              category_type_name: '',
              beneficiary_type_name: '',
              boys: '#reached+m+children',
              girls: '#reached+f+children',
              men: '#reached+m+adult',
              women: '#reached+f+adult',
              elderly_men: '',
              elderly_men: '',
              total: '#reached'
            },
            fields = [ 'cluster', 'admin1pcode', 'admin1name', 'organization', 'implementing_partners', 'category_type_name', 'beneficiary_type_name', 'boys', 'girls', 'men', 'women', 'elderly_men', 'elderly_women', 'total' ],
            fieldNames = [ 'Cluster', 'Admin1 Pcode', 'Admin1 Name', 'Organizations', 'Implementing Partners', 'Category', 'Beneficiary', 'Boys', 'Girls', 'Men', 'Women', 'Elderly Men', 'Elderly Women', 'Total' ];

        // get organizations by project
        Beneficiaries
          .find()
          .where( filters.default )
          .where( filters.adminRpcode )
          .where( filters.admin0pcode )
          .where( filters.admin1pcode )
          .where( filters.admin2pcode )
          .where( filters.cluster_id )
          .where( filters.acbar_partners )
          .where( filters.organization_tag )
          .where( filters.beneficiaries )
          .where( filters.date )
          .exec( function( err, beneficiaries ){

            // return error
            if (err) return res.negotiate( err );

            // beneficiaries
            beneficiaries.forEach(function( d, i ){
              if ( !data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ] ) {
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ] = {};
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].cluster = [];
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].admin1pcode;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].admin1name;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].organization = [];
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].implementing_partners = [];
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].category_type_name;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].beneficiary_type_name;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].boys = 0;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].girls = 0;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].men = 0;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].women = 0;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].elderly_men = 0;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].elderly_women = 0;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].total = 0;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].lat = d.admin1lat;
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].lng = d.admin1lng;
              }

              // cluster
              if ( data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].cluster.indexOf( d.cluster ) === -1 ){
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].cluster.push( d.cluster );
              }
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].admin1pcode = d.admin1pcode;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].admin1name = d.admin1name;
              
              // organization
              if ( data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].organization.indexOf( d.organization ) === -1 ){
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].organization.push( d.organization );
              }

              // implementing partners
              if ( data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].implementing_partners.indexOf( d.implementing_partners ) === -1 ){
                data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].implementing_partners.push( d.implementing_partners );
              }

              // data
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].category_type_name = d.category_type_name;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].beneficiary_type_name = d.beneficiary_type_name;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].boys += d.boys;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].girls += d.girls;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].men += d.men;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].women += d.women;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].elderly_men += d.elderly_men;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].elderly_women += d.elderly_women;
              data[ d.admin1pcode + d.category_type_id + d.beneficiary_type_id ].total += d.boys + d.girls + d.men + d.women + d.elderly_men + d.elderly_women;
            });

            // flatten
            var report = ClusterDashboardController.flatten( data );

            // array to string
            report.forEach( function( d, i ) {
              report[i].cluster = report[i].cluster.join(', ');
              report[i].organization = report[i].organization.join(', ');
              report[i].implementing_partners = report[i].implementing_partners.join(', ');
            });

            // sort
            report.sort(function(a, b) {
              return a.admin1name.localeCompare(b.admin1name) || 
                      a.category_type_name.localeCompare(b.category_type_name) || 
                      a.beneficiary_type_name.localeCompare(b.beneficiary_type_name)
            });

            // hxl_codes
            report.unshift( hxl_codes );

            // return csv
            json2csv({ data: report, fields: fields, fieldNames: fieldNames }, function( err, csv ) {
              
              // error
              if ( err ) return res.negotiate( err );

              // success
              if ( params.ocha ) {
                res.set('Content-Type', 'text/csv');
                return res.send( 200, csv );
              } else { 
                return res.json( 200, { data: csv } );
              }

            });


          });

        break;

      
      // raw data export
      case 'financial_report':

        // fields
        var fields = [ 'cluster', 'organization', 'admin0name', 'project_title', 'project_description', 'project_hrp_code', 'project_budget', 'project_budget_currency', 'project_donor_name', 'grant_id', 'currency_id', 'project_budget_amount_recieved', 'contribution_status', 'project_budget_date_recieved', 'budget_funds_name', 'financial_programming_name', 'multi_year_funding_name', 'funding_2017', 'reported_on_fts_name', 'fts_record_id', 'email', 'createdAt', 'comments' ]
            fieldNames = [ 'Cluster', 'Organization', 'Country', 'Project Title', 'Project Description', 'HRP Project Code', 'Project Budget', 'Project Budget Currency', 'Project Donor', 'Donor Grant ID', 'Currency Recieved', 'Ammount Received', 'Contribution Status', 'Date of Payment', 'Incoming Funds', 'Financial Programming', 'Multi-Year Funding', '2017 Funding', 'Reported on FTS', 'FTS ID', 'Email', 'createdAt', 'Comments' ];

        // get beneficiaries by project
        BudgetProgress
          .find()
          .where( { project_id: { '!': null } } )
          .where( filters.adminRpcode )
          .where( filters.admin0pcode )
          .where( filters.admin1pcode )
          .where( filters.admin2pcode )
          .where( filters.cluster_id )
          .where( filters.acbar_partners )
          .where( filters.organization_tag )
          .where( { project_budget_date_recieved: { '>=': new Date( params.start_date ), '<=': new Date( params.end_date ) } } )
          .exec( function( err, budget ){

            // return error
            if (err) return res.negotiate( err );

            // return csv
            json2csv({ data: budget, fields: fields, fieldNames: fieldNames }, function( err, csv ) {
              
              // error
              if ( err ) return res.negotiate( err );

              // success
              if ( params.ocha ) {
                res.set('Content-Type', 'text/csv');
                return res.send( 200, csv );
              } else { 
                return res.json( 200, { data: csv } );
              }

            });

          });

        break;
      

      // raw data export
      case 'beneficiaries':

        // get beneficiaries by project
        Beneficiaries
          .find()
          .where( filters.default )
          .where( filters.adminRpcode )
          .where( filters.admin0pcode )
          .where( filters.admin1pcode )
          .where( filters.admin2pcode )
          .where( filters.cluster_id )
          .where( filters.acbar_partners )
          .where( filters.organization_tag )
          .where( filters.beneficiaries )
          .where( filters.date )
          .exec( function( err, beneficiaries ){

            // return error
            if (err) return res.negotiate( err );

            var total = 0;

            // format
            beneficiaries.forEach(function( d, i ){
              // hrp code
              if ( !d.project_hrp_code ) {
                d.project_hrp_code = '-';
              }
              // project code
              if ( !d.project_code ) {
                d.project_code = '-';
              }
              // project donor
              if ( d.project_donor ) {
                  var da = [];
                  d.project_donor.forEach( function( d,i ){
                    if (d) da.push( d.project_donor_name );
                  });
                  da.sort();
                  d.donor = da.join(', ');
              }
              // sum
              var sum = d.boys + d.girls + d.men + d.women + d.elderly_men + d.elderly_women;
              // beneficiaries
              d.total = sum;
              d.report_month_number = d.report_month+1;
              d.report_month = moment( d.reporting_period ).format( 'MMMM' );
              d.reporting_period = moment( d.reporting_period ).format( 'YYYY-MM-DD' );
              // grand total
              total += sum;
            });

            if ( !params.csv ) {

              // return org list
              return res.json( 200, { 'value': total } );

            } else {

              var fields = [
                    'project_id',
                    'report_id',
                    'cluster_id',
                    'cluster',
                    'mpc_purpose_cluster_id',
                    'mpc_purpose_type_name',
                    'organization',
                    'implementing_partners',
                    'project_hrp_code',
                    'project_code',
                    'project_title',
                    'donor',
                    'report_month_number',
                    'report_month',
                    'report_year',
                    'reporting_period',
                    'admin1pcode',
                    'admin1name',
                    'admin2pcode',
                    'admin2name',
                    'admin3pcode',
                    'admin3name',
                    'conflict',
                    'facility_type_name',
                    'facility_name',
                    'category_type_id',
                    'category_type_name',
                    'beneficiary_type_id',
                    'beneficiary_type_name',
                    'activity_type_id',
                    'activity_type_name',
                    'activity_description_id',
                    'activity_description_name',
                    'delivery_type_id',
                    'delivery_type_name',
                    'units',
                    'unit_type_id',
                    'unit_type_name',
                    'transfer_type_value',
                    'households',
                    'families',
                    'boys',
                    'girls',
                    'men',
                    'women',
                    'elderly_men', 
                    'elderly_women',
                    'total',
                    'admin1lng',
                    'admin1lat',
                    'admin2lng',
                    'admin2lat',
                    'admin3lng',
                    'admin3lat',
                    'facility_lng',
                    'facility_lat'
                  ];

              var fieldNames = [
                    'project_id',
                    'report_id',
                    'cluster_id',
                    'cluster',
                    'mpc_purpose_cluster_ids',
                    'mpc_purpose',
                    'organization',
                    'implementing_partners',
                    'project_hrp_code',
                    'project_code',
                    'project_title',
                    'project_donor',
                    'report_month_number',
                    'report_month',
                    'report_year',
                    'reporting_period',
                    'admin1pcode',
                    'admin1name',
                    'admin2pcode',
                    'admin2name',
                    'admin3pcode',
                    'admin3name',
                    'conflict',
                    'facility_type_name',
                    'facility_name',
                    'category_type_id',
                    'category_type_name',
                    'beneficiary_type_id',
                    'beneficiary_type_name',
                    'activity_type_id',
                    'activity_type_name',
                    'activity_description_id',
                    'activity_description_name',
                    'delivery_type_id',
                    'delivery_type_name',
                    'units',
                    'unit_type_id',
                    'unit_type_name',
                    'transfers',
                    'households',
                    'families',
                    'boys',
                    'girls',
                    'men',
                    'women',
                    'elderly_men', 
                    'elderly_women',
                    'total',
                    'admin1lng',
                    'admin1lat',
                    'admin2lng',
                    'admin2lat',
                    'admin3lng',
                    'admin3lat',
                    'facility_lng',
                    'facility_lat'
                  ];

              // eiewg download fields
              if ( params.cluster_id === 'eiewg' ) {
                var fields = [
                    'project_id',
                    'report_id',
                    'cluster_id',
                    'cluster',
                    'mpc_purpose_cluster_id',
                    'organization',
                    'implementing_partners',
                    'project_hrp_code',
                    'project_code',
                    'project_title',
                    'donor',
                    'report_month_number',
                    'report_month',
                    'report_year',
                    'reporting_period',
                    'admin1pcode',
                    'admin1name',
                    'admin2pcode',
                    'admin2name',
                    'conflict',
                    'facility_implementation_name',
                    'facility_type_name',
                    'facility_id',
                    'facility_name',
                    'facility_hub_id',
                    'facility_hub_name',
                    'category_type_id',
                    'category_type_name',
                    'beneficiary_type_id',
                    'beneficiary_type_name',
                    'activity_type_id',
                    'activity_type_name',
                    'activity_description_id',
                    'activity_description_name',
                    'delivery_type_id',
                    'delivery_type_name',
                    'units',
                    'unit_type_id',
                    'unit_type_name',
                    'transfer_type_value',
                    'households',
                    'families',
                    'boys',
                    'girls',
                    'men',
                    'women',
                    'elderly_men', 
                    'elderly_women',
                    'total',
                    'admin1lng',
                    'admin1lat',
                    'admin2lng',
                    'admin2lat',
                    'facility_lng',
                    'facility_lat'
                  ];

                var fieldNames = [
                    'project_id',
                    'report_id',
                    'cluster_id',
                    'cluster',
                    'mpc_purpose_cluster_ids',
                    'organization',
                    'implementing_partners',
                    'project_hrp_code',
                    'project_code',
                    'project_title',
                    'project_donor',
                    'report_month_number',
                    'report_month',
                    'report_year',
                    'reporting_period',
                    'admin1pcode',
                    'admin1name',
                    'admin2pcode',
                    'admin2name',
                    'conflict',
                    'school_status',
                    'school_type',
                    'school_id',
                    'school_name',
                    'school_hub_id',
                    'school_hub_name',
                    'category_type_id',
                    'category_type_name',
                    'beneficiary_type_id',
                    'beneficiary_type_name',
                    'activity_type_id',
                    'activity_type_name',
                    'activity_description_id',
                    'activity_description_name',
                    'delivery_type_id',
                    'delivery_type_name',
                    'units',
                    'unit_type_id',
                    'unit_type_name',
                    'transfers',
                    'households',
                    'families',
                    'boys',
                    'girls',
                    'men',
                    'women',
                    'elderly_men', 
                    'elderly_women',
                    'total',
                    'admin1lng',
                    'admin1lat',
                    'admin2lng',
                    'admin2lat',
                    'facility_lng',
                    'facility_lat'
                  ];
              }

              // return csv
              json2csv({ data: beneficiaries, fields: fields, fieldNames: fieldNames }, function( err, csv ) {
                
                // error
                if ( err ) return res.negotiate( err );

                // success
                if ( params.ocha ) {
                  res.set('Content-Type', 'text/csv');
                  return res.send( 200, csv );
                } else { 
                  return res.json( 200, { data: csv } );
                }

              });

            }

          });

        break;


      // raw data export
      case 'stocks':

        // get beneficiaries by project
        Stock
          .find()
          .where( filters.default )
          .where( filters.adminRpcode )
          .where( filters.admin0pcode )
          .where( filters.admin1pcode )
          .where( filters.admin2pcode )
          .where( filters.cluster_id )
          .where( filters.organization_tag )
          .where( filters.date )
          .exec( function( err, stocks ){

            // return error
            if (err) return res.negotiate( err );

            // format stocks
            stocks.forEach(function( d, i ){ 
              stocks[ i ].report_month_number = d.report_month+1;
              stocks[ i ].report_month = moment( d.reporting_period ).format( 'MMMM' );
              stocks[ i ].reporting_period = moment( d.reporting_period ).format( 'YYYY-MM-DD' );
            });

            var fields = [
                'cluster',
                'report_id',
                'location_id',
                'stock_warehouse_id',
                'stock_item_type',
                'stock_item_name',
                'report_month',
                'report_year',
                'reporting_period',
                'adminRpcode',
                'adminRname',
                'admin0pcode',
                'admin0name',
                'organization',
                'username',
                'email',
                'createdAt',
                'updatedAt',
                'admin1pcode',
                'admin1name',
                'admin2pcode',
                'admin2name',
                'conflict',
                'number_in_stock',
                'number_in_pipeline',
                'beneficiaries_covered',
                'facility_name',
                'facility_lng',
                'facility_lat'
                ];

            var fieldNames = [
                'cluster',
                'report_id',
                'location_id',
                'stock_warehouse_id',
                'stock_item_type',
                'stock_item_name',
                'report_month',
                'report_year',
                'reporting_period',
                'adminRpcode',
                'adminRname',
                'admin0pcode',
                'admin0name',
                'organization',
                'username',
                'email',
                'createdAt',
                'updatedAt',
                'admin1pcode',
                'admin1name',
                'admin2pcode',
                'admin2name',
                'conflict',
                'number_in_stock',
                'number_in_pipeline',
                'beneficiaries_covered',
                'facility_name',
                'facility_lng',
                'facility_lat'
                ];

            // return csv
            json2csv({ data: stocks, fields: fields, fieldNames: fieldNames }, function( err, csv ) {
              
              // error
              if ( err ) return res.negotiate( err );

              // success
              if ( params.ocha ) {
                res.set('Content-Type', 'text/csv');
                return res.send( 200, csv );
              } else { 
                return res.json( 200, { data: csv } );
              }

            });

          });

        break;


      // raw data export
      case 'training_participants':

        // trainings
        TrainingParticipants
          .find()
          .exec( function( err, training_participants ){

            // return error
            if (err) return res.negotiate( err );

            // return csv
            json2csv({ data: training_participants }, function( err, csv ) {
              
              // error
              if ( err ) return res.negotiate( err );

              // success
              if ( params.ocha ) {
                res.set('Content-Type', 'text/csv');
                return res.send( 200, csv );
              } else { 
                return res.json( 200, { data: csv } );
              }

            });

          });

        break;


      // markers
      case 'markers':

        // params
        var locations = [],
            markers = {},
            counter = 0,
            length = 0;

        // get organizations by project
        Beneficiaries
          .find()
          .where( filters.default )
          .where( filters.adminRpcode )
          .where( filters.admin0pcode )
          .where( filters.admin1pcode )
          .where( filters.admin2pcode )
          .where( filters.cluster_id )
          .where( filters.acbar_partners )
          .where( filters.organization_tag )
          .where( filters.beneficiaries )
          .where( filters.date )
          .exec( function( err, beneficiaries ){

            // return error
            if (err) return res.negotiate( err );

            // project ids
            beneficiaries.forEach( function( d, i ){
              if ( !locations[ d.project_id + d.facility_lat + d.facility_lng + d.facility_name ] ) {
                locations[ d.project_id + d.facility_lat + d.facility_lng + d.facility_name ] = d;
              }
            });

            locations = ClusterDashboardController.flatten( locations );

            // return no locations
            if ( !locations.length ) return res.json( 200, { 'data': { 'marker0': { layer: 'projects', lat:34.5, lng:66.0, message: '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">NO PROJECTS</h5>' } } } );

            // length
            length = locations.length;

            // foreach location
            locations.forEach( function( d, i ){

              // popup message
              var message = '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">' + d.cluster + '</h5>'
                          + '<h5 style="text-align:center; font-size:1.3rem; font-weight:100;">' + d.organization + ' | ' + d.project_title + '</h5>'
                          + '<div style="text-align:center">' + d.admin0name + '</div>'
                          if ( d.admin3name ) {
                            message += '<div style="text-align:center">' + d.admin1name + ', ' + d.admin2name + ', ' + d.admin3name + '</div>';
                          } else {
                            message += '<div style="text-align:center">' + d.admin1name + ', ' + d.admin2name + '</div>';
                          }
                          if ( d.cluster_id === 'health' ) {
                            message += '<div style="text-align:center">' + d.facility_type_name + '</div>';
                          }
                          message +=  '<div style="text-align:center">' + d.facility_name + '</div>'
                          + '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">CONTACT</h5>'
                          + '<div style="text-align:center">' + d.organization + '</div>'
                          + '<div style="text-align:center">' + d.name + '</div>'
                          + '<div style="text-align:center">' + d.position + '</div>'
                          + '<div style="text-align:center">' + d.phone + '</div>'
                          + '<div style="text-align:center">' + d.email + '</div>';

              // create markers
              markers[ 'marker' + counter ] = {
                layer: 'projects',
                lat: d.facility_lat,
                lng: d.facility_lng,
                message: message
              };

              // plus
              counter++;

              // if last location
              if( counter === length ){
                
                // return markers
                return res.json(200, { 'data': markers } );

              }

            });

          });

        break;

    }
    
  }


};

module.exports = ClusterDashboardController;
