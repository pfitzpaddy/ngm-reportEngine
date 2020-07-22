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
var async = require('async');

// xlsx
const XLSX = require('xlsx');
const XLSX_UTILS = XLSX.utils;


// ExcelJS
const ExcelJS = require('exceljs');
// constants
const XLSX_PATH = '/home/ubuntu/data/template/';
const XLSX_TEMPLATE = 'ISCG_4W_Template_2020';

// ClusterDashboardController
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
      json: req.param('json') ? req.param('json') : false,
			ocha: req.param('ocha') ? req.param('ocha') : false,
			list: req.param('list') ? req.param('list') : false,
			indicator: req.param('indicator'),
			report: req.param('report'),
			cluster_id: req.param('cluster_id'),
			cluster_ids: req.param('cluster_ids') ? req.param('cluster_ids') : [req.param('cluster_id')],
			activity_type_id: req.param( 'activity_type_id' ) ? req.param( 'activity_type_id' ) : 'all',
			activity_description_id: req.param( 'activity_description_id' ) ? req.param( 'activity_description_id' ) : 'all',
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
		// filters, for waterline and native mongo queries (_Native)
		return {
			default: { report_year: { '>=': 2017 }, location_id: { '!': null } },
			adminRpcode: params.adminRpcode === 'hq' ? {} : { adminRpcode: params.adminRpcode },
			admin0pcode: params.admin0pcode === 'all' ? {} : { admin0pcode: params.admin0pcode },
			admin0pcode_act: params.admin0pcode === 'all' ? {} : { admin0pcode: { contains: params.admin0pcode.toUpperCase()} },
			admin1pcode: params.admin1pcode === 'all' ? {} : { admin1pcode: params.admin1pcode },
			admin2pcode: params.admin2pcode === 'all' ? {} : { admin2pcode: params.admin2pcode },
			cluster_id:  ( params.cluster_id === 'all' || params.cluster_id === 'rnr_chapter' || params.cluster_id === 'acbar' )
								? {}
								: ( params.cluster_id !== 'cvwg' )
									? { cluster_id: params.cluster_id }
									: { or: [{ cluster_id: params.cluster_id }, { mpc_delivery_type_id: ['cash', 'voucher'] } ] },
			cluster_id_act: params.cluster_id === 'all' ? {} : { cluster_id: params.cluster_id },
			activity_type_id: params.activity_type_id === 'all'  ? {} : { activity_type_id: params.activity_type_id },
			activity_description_id: params.activity_description_id === 'all' ? {} : { activity_description_id: params.activity_description_id},
			acbar_partners: params.cluster_id === 'acbar' ? { project_acbar_partner: true } : {},
			organization_tag: params.organization_tag === 'all' ? { organization_tag: { '!': $nin_organizations } } : { organization_tag: params.organization_tag },
			beneficiaries: params.beneficiaries[0] === 'all' ? {} : { beneficiary_type_id: params.beneficiaries },
			date: { reporting_period: { '>=': new Date( params.start_date ), '<=': new Date( params.end_date ) } },

			default_Native: { report_year: { $gte: 2017 }, location_id: { $ne: null } },
			adminRpcode_Native: params.adminRpcode === 'hq'  ? {} : { adminRpcode: params.adminRpcode.toUpperCase() },
			admin0pcode_Native: params.admin0pcode === 'all' ? {} : { admin0pcode: params.admin0pcode.toUpperCase() },
			admin1pcode_Native: params.admin1pcode === 'all' ? {} : { admin1pcode: params.admin1pcode.toUpperCase() },
			admin2pcode_Native: params.admin2pcode === 'all' ? {} : { admin2pcode: params.admin2pcode.toUpperCase() },
			cluster_id_Native: ( params.cluster_id === 'all' || params.cluster_id === 'rnr_chapter' || params.cluster_id === 'acbar' )
								? {}
								: ( params.cluster_id !== 'cvwg' )
									? { cluster_id: params.cluster_id }
									: { $or: [{ cluster_id: params.cluster_id }, { mpc_delivery_type_id: { $in: ['cash', 'voucher'] } } ] },
			cluster_ids_Native: ( params.cluster_ids.includes('all') || params.cluster_ids.includes('rnr_chapter') || params.cluster_ids.includes('acbar') )
								? {}
								: ( params.cluster_ids.includes('cvwg') )
									? { $or: [{ cluster_id: { $in: params.cluster_ids } }, { mpc_delivery_type_id: { $in: ['cash', 'voucher'] } } ] }
									: { cluster_id: { $in: params.cluster_ids } },
			is_cluster_ids_array: params.cluster_ids ? true : false,
			organization_tag_Native: params.organization_tag === 'all' ? { organization_tag: { $nin: $nin_organizations } } : { organization_tag: params.organization_tag },
			date_Native: { reporting_period: { $gte: new Date( params.start_date ), $lte: new Date( params.end_date )} },
			delivery_type_id: function() {
				var filter = {}
				if ( params.indicator === 'households_population' ) {
					filter = { delivery_type_id: 'population' }
				}
				if ( params.indicator === 'beneficiaries_population' ) {
					filter = { delivery_type_id: 'population' }
				}
				if ( params.indicator === 'beneficiaries_service' ) {
					filter = { delivery_type_id: 'service' }
				}
				return filter
			}

		}
	},

	// indicators
	getIndicator: function ( req, res  ) {

		// parmas, filters
		var params = ClusterDashboardController.getParams( req, res );
		var filters = ClusterDashboardController.getFilters( params );
		// match clause for native mongo query
		var filterObject = _.extend({},	filters.default_Native,
										filters.adminRpcode_Native,
										filters.admin0pcode_Native,
										filters.admin1pcode_Native,
										filters.admin2pcode_Native,
										filters.is_cluster_ids_array ? filters.cluster_ids_Native : filters.cluster_id_Native,
										filters.activity_type_id,
										filters.activity_description_id,
										filters.acbar_partners,
										filters.organization_tag_Native,
										filters.beneficiaries,
										filters.date_Native,
										filters.delivery_type_id() )

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
					.where( filters.activity_type_id )
					.where( filters.activity_description_id )
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
				// list of organizations
				if ( params.list ) {
					Beneficiaries.native(function(err, collection) {
						if (err) return res.serverError(err);

						collection.aggregate([
							{ $match : filterObject },
							{
							$group: {
								_id: {organization_tag:'$organization_tag', organization:'$organization'}
							}
							},
						]).toArray(function (err, results) {
							if (err) return res.serverError(err);
							organizations=_.pluck(results,'_id')
							organizations.sort(function(a, b) {
								return a.organization.localeCompare(b.organization);
							});
							organizations.unshift({
											organization_tag: 'all',
											organization: 'ALL',
										});
							return res.json( 200, organizations );
						});
					});
				} else {	// count of organizations
					Beneficiaries.native(function(err, collection) {
						if (err) return res.serverError(err);

						collection.aggregate([
							{
								$match : filterObject
							},
							{
								$group: {
									_id: '$organization_tag'
								}
							},
							{
								$group: {
									_id: 1,
									total: {
									$sum: 1
									}
								}
							}
						]).toArray(function (err, results) {
							if (err) return res.serverError(err);
							return res.json( 200, { 'value': results[0]?results[0].total:0 } );
						});
					});
				}

				break;

			// count
			case 'projects':
				Beneficiaries.native(function(err, collection) {
					if (err) return res.serverError(err);

					collection.aggregate([
						{
							$match : filterObject
						},
						{
							$group: {
								_id: '$project_id'
							}
						},
						{
							$group: {
								_id: 1,
								total: {
								$sum: 1
								}
							}
						}
					]).toArray(function (err, results) {
						if (err) return res.serverError(err);
						return res.json( 200, { 'value': results[0]?results[0].total:0 } );
					});
				});

				break;

			// count
			case 'locations':
				Beneficiaries.native(function(err, collection) {
					if (err) return res.serverError(err);

					collection.aggregate([
						{
							$match : filterObject
						},
						{
							$group: {
								_id: {
									project_id: '$project_id',
									site_lat: '$site_lat',
									site_lng: '$site_lng',
									site_name: '$site_name'
								}
							}
						},
						{
							$group: {
								_id: 1,
								total: {
								$sum: 1
								}
							}
						}
					]).toArray(function (err, results) {
						if (err) return res.serverError(err);
						return res.json( 200, { 'value': results[0]?results[0].total:0 } );
					});
				});

				break;

			case 'contacts':

				// require
				var users = [],
						fields = [
							'admin0name',
							'cluster',
							'organization',
							'name',
							'position',
							'username',
							'phone',
							'email',
							'createdAt'
						],
						fieldNames = [
							'Country',
							'Cluster',
							'Organization',
							'Name',
							'Position',
							'Username',
							'Phone',
							'Email',
							'Joined ReportHub'
						];


				// get organizations by project
				Beneficiaries
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.admin1pcode )
					.where( filters.admin2pcode )
					.where( filters.cluster_id )
					.where( filters.activity_type_id )
					.where( filters.activity_description_id )
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
						fields = [
							'cluster',
							'admin1pcode',
							'admin1name',
							'organization',
							'implementing_partners',
							'category_type_name',
							'beneficiary_type_name',
							'boys',
							'girls',
							'men',
							'women',
							'elderly_men',
							'elderly_women',
							'total'
						],
						fieldNames = [
							'Cluster',
							'Admin1 Pcode',
							'Admin1 Name',
							'Organizations',
							'Implementing Partners',
							'Category',
							'Beneficiary',
							'Boys',
							'Girls',
							'Men',
							'Women',
							'Elderly Men',
							'Elderly Women',
							'Total'
						];

				// get organizations by project
				Beneficiaries
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.admin1pcode )
					.where( filters.admin2pcode )
					.where( filters.cluster_id )
					.where( filters.activity_type_id )
					.where( filters.activity_description_id )
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
											(a.category_type_name && b.category_type_name && a.category_type_name.localeCompare(b.category_type_name)) ||
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


				if(params.admin0pcode.toUpperCase() === 'COL'){

					var fields = [
							'cluster',
							'organization',
							'admin0name',
							'project_title',
							'project_description',
							'project_budget',
							'project_budget_currency',
							'project_donor_name',
							'currency_id',
							'project_budget_amount_recieved',
							'contribution_status',
							'project_budget_date_recieved',
							'budget_funds_name',
							'email',
							'createdAt',
							'comments'
						],
						fieldNames = [
							'Cluster',
							'Organization',
							'Country',
							'Project Title',
							'Project Description',
							'Project Budget',
							'Project Budget Currency',
							'Project Donor',
							'Currency Recieved',
							'Ammount Received',
							'Contribution Status',
							'Date of Payment',
							'Incoming Funds',
							'Email',
							'createdAt',
							'Comments'
						];
				}else{
				var fields = [
							'cluster',
							'organization',
							'admin0name',
							'project_title',
							'project_description',
							'project_hrp_code',
							'project_budget',
							'project_budget_currency',
							'project_donor_name',
              'grant_id',
              'activity_description_name',
							'currency_id',
							'project_budget_amount_recieved',
							'contribution_status',
							'project_budget_date_recieved',
							'budget_funds_name',
							'financial_programming_name',
							'multi_year_funding_name',
							'multi_year_array',
							'reported_on_fts_name',
							'fts_record_id',
							'email',
							'createdAt',
							'comments'
						],
						fieldNames = [
							'Cluster',
							'Organization',
							'Country',
							'Project Title',
							'Project Description',
							'HRP Project Code',
							'Project Budget',
							'Project Budget Currency',
							'Project Donor',
              'Donor Grant ID',
              'Activity Description',
							'Currency Recieved',
							'Ammount Received',
							'Contribution Status',
							'Date of Payment',
							'Incoming Funds',
							'Financial Programming',
							'Multi-Year Funding',
							'Funding Per Year',
							'Reported on FTS',
							'FTS ID',
							'Email',
							'createdAt',
							'Comments'
						];
					};

					//fiter donor from projects plan or 4wplus activities dasbhoards

					if(req.param('donor') && req.param('donor') !== 'all'){

						project_donor_id = req.param('donor');
						filters.project_donor_id = {  project_donor_id };

					}else{
							filters.project_donor_id = {};


					};


								 //fiter implementer partner from projects plan or 4wplus activities dasbhoards
					if(req.param('implementer') && req.param('implementer') !== 'all'){

						implementing_partner = req.param('implementer');
						filters.implementing_partners = { 'implementing_partners' :{ $elemMatch : { 'organization_tag' : implementing_partner}}};

					}else{
							filters.implementing_partners = {};

					};



					//fiter project type and is hrp plan? from projects plan or 4wplus activities dasbhoards
					if( (req.param('project_type_component')&&req.param('project_type_component')!=='all')  &&  ( req.param('hrpplan') !=='all' && req.param('hrpplan') === 'true') ){

									//is not possible implement operator $and
									plan_component = req.param('project_type_component');
									filters.plan_component = {'plan_component': { $in: [plan_component, 'hrp_plan']}};

								}else if( (req.param('project_type_component') && req.param('project_type_component')!== 'all') && (req.param('hrpplan')!=='all' && req.param('hrpplan') === 'false') ){

									plan_component = req.param('project_type_component');

									filters.plan_component = { 'plan_component' : { $in: [plan_component], $nin: ['hrp_plan']}};
									// delete filterObject.project_type_component;
									// delete filterObject.hrpplan;

								}else if((req.param('project_type_component') && req.param('project_type_component')!== 'all') && req.param('hrpplan') ==='all'){

									plan_component = req.param('project_type_component');
									filters.plan_component = { 'plan_component' : { $in: [plan_component]}};
									// delete queryProject.project_type_component;

								}else if((req.param('project_type_component') && req.param('project_type_component')=== 'all')  &&  (req.param('hrpplan') !== 'all' && req.param('hrpplan') === 'true')){

									 filters.plan_component = { 'plan_component': { $in: ['hrp_plan']}};
								 //  delete queryProject.hrpplan;

								}else if((req.param('project_type_component') && req.param('project_type_component')=== 'all') &&  (req.param('hrpplan') !== 'all' && req.param('hrpplan') === 'false')){
									 filters.plan_component = { 'plan_component': { $nin: ['hrp_plan']}};
								//   delete queryProject.hrpplan;
								}else{

									filters.plan_component = {};

								}

								//fiter activity type from projects plan or 4wplus activities dasbhoards

					if(req.param('activity_type_id') && req.param('activity_type_id') !== 'all'){
							activity_type_id = req.param('activity_type_id');
							filters.activity_type_id = { 'activity_type_id': activity_type_id} ;

						};






				// get beneficiaries by project
				BudgetProgress
					.find()
					.where( { project_id: { '!': null } } )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.admin1pcode )
					.where( filters.admin2pcode )
					.where( filters.cluster_id )
					.where( filters.project_donor_id )
					.where( filters.implementing_partners)
					.where( filters.plan_component)
					.where( filters.activity_type_id)
					.where( filters.acbar_partners )
					.where( filters.organization_tag )
					.where( { project_budget_date_recieved: { '>=': new Date( params.start_date ), '<=': new Date( params.end_date ) } } )
					.exec( function( err, budget ){

						// return error
						if (err) return res.negotiate( err );

						// format multi year
						budget.forEach(function (d, i) {
							if (d.multi_year_array && d.multi_year_array.length) {
								budget[i].multi_year_array = d.multi_year_array.map(e => typeof e.budget === 'undefined' || typeof e.year === 'undefined' ? "" : e.budget + " " + e.year).join("; ")
							}
						});

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

			case 'households_population':

				// total sum
				Beneficiaries.native(function(err, collection) {
					if (err) return res.serverError(err);

					collection.aggregate(
						[
							{
								$match : filterObject
							},
							{
								$group:
								{
									_id: null,
									total:  { $sum: { $add: [ "$households" ] } } ,
								}
							}
						]
					).toArray(function (err, beneficiaries) {
						if (err) return res.serverError(err);

						var total = beneficiaries[0]?beneficiaries[0].total:0;

						return res.json( 200, { 'value': total } );
					});
				});

				break;

			case 'beneficiaries_population':

				// total sum
				Beneficiaries.native(function(err, collection) {
					if (err) return res.serverError(err);

					collection.aggregate(
						[
							{
								$match : filterObject
							},
							{
								$group:
								{
									_id: null,
									// total:  { $sum: { $add: [ "$men", "$women","$boys","$girls","$elderly_men","$elderly_women" ] } }
									total:  { $sum: { $add: [ "$total_beneficiaries" ] } }
								}
							}
						]
					).toArray(function (err, beneficiaries) {
						if (err) return res.serverError(err);

						var total = beneficiaries[0]?beneficiaries[0].total:0;

						return res.json( 200, { 'value': total } );
					});
				});

				break;



			// raw data export
      case 'beneficiaries':

        // download beneficiairies in json format
        if (params.json) {

          Beneficiaries.native(function (err, collection) {
            if (err) return res.serverError(err);

            if (req.param('activity_type_id') && req.param('activity_type_id') !== 'all') {
              filterObject.activity_type_id = req.param('activity_type_id');
            }

            collection.find(filterObject).toArray(function (err, beneficiaries) {
              if (err) return res.serverError(err);

              return res.json(200, { data: beneficiaries });

            });

          });

        // download beneficiairies in CSV format
        } else if (params.csv) {

					// get beneficiaries export
					Beneficiaries.native(function(err, collection) {
						if (err) return res.serverError(err);

						//fiter donor from projects plan or 4wplus activities dasbhoards

						if(req.param('donor') && req.param('donor') !== 'all'){
							filterObject.project_donor = { $elemMatch : { 'project_donor_id' : req.param('donor')}};

						}

						//fiter implementer partner from projects plan or 4wplus activities dasbhoards


						if(req.param('implementer') && req.param('implementer') !== 'all'){
							filterObject.implementing_partners = { $elemMatch : { 'organization_tag' : req.param('implementer')}};

						}

						//fiter project type and is hrp plan? from projects plan or 4wplus activities dasbhoards

						 if( (req.param('project_type_component')&&req.param('project_type_component')!=='all')  &&  ( req.param('hrpplan') !=='all' && req.param('hrpplan') === 'true') ){

									//is not possible implement operator $and
									filterObject.plan_component = {$in: [req.param('project_type_component'), 'hrp_plan']};
									///filterObject.plan_component = {$and: [ { plan_component : {$in: [req.param('project_type_component')]} } , {plan_component: {$in:["hrp_plan"]}}]};


								}else if( (req.param('project_type_component') && req.param('project_type_component')!== 'all') && (req.param('hrpplan')!=='all' && req.param('hrpplan') === 'false') ){

									filterObject.plan_component = { $in: [req.param('project_type_component')], $nin: ['hrp_plan']};
									// delete filterObject.project_type_component;
									// delete filterObject.hrpplan;

								}else if((req.param('project_type_component') && req.param('project_type_component')!== 'all') && req.param('hrpplan') ==='all'){

									filterObject.plan_component = {$in: [req.param('project_type_component')]};
									// delete queryProject.project_type_component;

								}else if((req.param('project_type_component') && req.param('project_type_component')=== 'all')  &&  (req.param('hrpplan') !== 'all' && req.param('hrpplan') === 'true')){

									 filterObject.plan_component = {$in: ['hrp_plan']};
								 //  delete queryProject.hrpplan;

								}else if((req.param('project_type_component') && req.param('project_type_component')=== 'all') &&  (req.param('hrpplan') !== 'all' && req.param('hrpplan') === 'false')){
									 filterObject.plan_component = {$nin: ['hrp_plan']};
								//   delete queryProject.hrpplan;
								}

								//fiter activity type from projects plan or 4wplus activities dasbhoards

							if(req.param('activity_type_id') && req.param('activity_type_id') !== 'all'){
												//activity_typeid = req.param('activity_type_id');
							filterObject.activity_type_id = req.param('activity_type_id');

							}


						collection.find(filterObject).toArray(function (err, beneficiaries) {
							if (err) return res.serverError(err);

              let { fields, fieldNames } = FieldsService.getBeneficiariesDownloadFields(params.admin0pcode, params.cluster_id);

							var total = 0;

							// format beneficiaries
							async.eachLimit(beneficiaries, 200, function (d, next) {
                d._id = d._id.toString();
								// hrp code
								if (!d.project_hrp_code) {
									d.project_hrp_code = '-';
								}
								// project code
								if (!d.project_code) {
									d.project_code = '-';
								}
								// project donor
								if (d.project_donor) {
									var da = [];
									d.project_donor.forEach(function (d, i) {
										if (d) da.push(d.project_donor_name);
									});
									da.sort();
									d.donor = da.join(', ');
								}

								// implementing_partner
								if (Array.isArray(d.implementing_partners)) {
									var im = [];
									d.implementing_partners.forEach(function (impl, i) {
										if (impl) im.push(impl.organization);
									});
									im.sort();
									d.implementing_partners = im.join(', ');
								}

								// programme_partners
								if (Array.isArray(d.programme_partners)) {
									var pp = [];
									d.programme_partners.forEach(function (p, i) {
										if (p) pp.push(p.organization);
									});
									pp.sort();
									d.programme_partners = pp.join(', ');
								}

                d.project_details = Utils.arrayToString(d.project_details, "project_detail_name");
                d.response = Utils.arrayToString(d.response, "response_name");

								//plan_component
								if (Array.isArray(d.plan_component)) {
									d.plan_component = d.plan_component.join(', ');
								}

								// sum
								// var sum = d.boys + d.girls + d.men + d.women + d.elderly_men + d.elderly_women;
								// beneficiaries
								// d.total = sum;
								d.report_month_number = d.report_month + 1;
								d.report_month = moment(d.reporting_period).format('MMMM');
								d.reporting_period = moment(d.reporting_period).format('YYYY-MM-DD');
                d.project_start_date = moment(d.project_start_date).format('YYYY-MM-DD');
                d.project_end_date = moment(d.project_end_date).format('YYYY-MM-DD');
								d.updatedAt = moment(d.updatedAt).format('YYYY-MM-DD HH:mm:ss');
								d.createdAt = moment(d.createdAt).format('YYYY-MM-DD HH:mm:ss');
								// grand total
								// total += sum;
								total += d.total_beneficiaries;
								next();

							}, function (err) {
								if (err) return res.negotiate(err);
								// return csv
								json2csv({ data: beneficiaries, fields: fields, fieldNames: fieldNames }, function (err, csv) {

									// error
									if (err) return res.negotiate(err);

									// success
									if (params.ocha) {
										res.set('Content-Type', 'text/csv');
										filename = req.param('reportname') ? req.param('reportname') : 'beneficiaries'
										res.setHeader('Content-disposition', 'attachment; filename=' + filename + '.csv');
										res.send(200, csv);
										MetricsController.setApiMetrics({
											dashboard: 'cluster_dashboard',
											theme: params.indicator,
											url: req.url,
										}, function (err) { return })
									} else {
										return res.json(200, { data: csv });
									}
								});
							});

						});

					});

				} else {
					// total sum
					Beneficiaries.native(function(err, collection) {
						if (err) return res.serverError(err);

						collection.aggregate(
							[
								{
									$match : filterObject
								},
								{
									$group:
									{
										_id: null,
									// total:  { $sum: { $add: [ "$men", "$women","$boys","$girls","$elderly_men","$elderly_women" ] } }
									total:  { $sum: { $add: [ "$total_beneficiaries" ] } }
									}
								}
							]
						).toArray(function (err, beneficiaries) {
							if (err) return res.serverError(err);

							var total = beneficiaries[0]?beneficiaries[0].total:0;

							return res.json( 200, { 'value': total } );

						});
					});
				}

				break;

			// CB ISCG Tempalte
				// cd /home/ubuntu/nginx/www/ngm-reportEngine
				// npm install exceljs
			case 'sector_iscg_excel':

				// template path
				var xlsx_template_path = XLSX_PATH + params.admin0pcode.toUpperCase() + '/' + XLSX_TEMPLATE + '.xlsx';
				// xlsx_report
				var xlsx_report = XLSX_TEMPLATE + params.report  + '.xlsx';
				// print dir
				var print_dir = '/home/ubuntu/nginx/www/ngm-reportPrint/pdf/';

				// native function
				Beneficiaries.native( function ( err, collection ){
					collection.find( filterObject ).toArray( function ( err, beneficiaries ){
						// return error
						if (err) return res.negotiate( err );

						// read from a file
						var workbook = new ExcelJS.Workbook();
						workbook.xlsx.readFile( xlsx_template_path )
						  .then(function() {

						    // use workbook
						    var worksheet = workbook.getWorksheet('4W');

						    // data object
						    var data = {}

						    // aggregate
						    beneficiaries.forEach(function( d, i ){

						    	// donors string
						    	var project_donors_string = '';
						    	if ( d.project_donor ){
						    		d.project_donor.forEach(function( pd, j ){
						    			if ( pd.project_donor_name ) {
						    				project_donors_string += pd.project_donor_name + ', ';
						    			}
						    		});
						    	}
						    	project_donors_string = project_donors_string.slice(0, -2);

						    	// implementing partners string
						    	var implementing_partners_string = '';
						    	if ( d.implementing_partners ){
						    		d.implementing_partners.forEach(function( ip, j ){
						    			if ( ip.organization_name ) {
						    				implementing_partners_string += ip.organization_name + ', ';
						    			}
						    		});
						    	}
						    	implementing_partners_string = implementing_partners_string.slice(0, -2);

						    	// details
						    	var activity_detail = d.activity_detail_name ? d.activity_description_name + ' - ' + d.activity_detail_name : d.activity_description_name;

						    	// id
						    	var id = d.organization_tag + '_' + implementing_partners_string + '-' + project_donors_string + '-' + d.cluster_id + '-' + d.activity_type_id + '-' + activity_detail + '-' + d.admin3pcode + '-' + d.project_start_date + '-' + d.project_end_date + '-' + d.beneficiary_type_id;

						    	// data
						    	if ( !data[ id ]  ) {
						    		// make baseline
						    		data[ id ] = [
						    			1,
						    			d.organization,
						    			implementing_partners_string,
						    			'',
						    			'',
						    			project_donors_string,
						    			d.cluster,
						    			d.activity_type_name,
						    			activity_detail,
						    			'',
						    			'Chittagong',
						    			d.admin0name,
						    			d.admin1name,
						    			d.admin2name,
						    			d.admin3name,
						    			moment( d.reporting_period ).format('MM-DD-YY'),
						    			moment( d.project_start_date ).format('MM-DD-YY'),
						    			moment( d.project_end_date ).format('MM-DD-YY'),
						    			d.beneficiary_type_name,
						    			0,
						    			0,
						    			0,
						    			0,
						    			0,
						    			0,
						    			0,
						    			0,
						    			0,
						    			'',
						    			d.name,
						    			d.phone,
						    			d.email,
						    			'Chittagong',
						    			d.admin0pcode,
						    			d.admin1pcode,
						    			d.admin2pcode
						    		];
						    	}

						    	// simply add numbers
						    	data[ id ][ 19 ] += d.households;
						    	data[ id ][ 20 ] += d.total_beneficiaries;
						    	data[ id ][ 21 ] += d.boys + d.men + d.elderly_men;
						    	data[ id ][ 22 ] += d.girls + d.women + d.elderly_women;
						    	data[ id ][ 23 ] += d.women + d.elderly_women;
						    	data[ id ][ 24 ] += d.men + d.elderly_men;
						    	data[ id ][ 25 ] += d.girls;
						    	data[ id ][ 26 ] += d.boys;

						    });

						    // create rows
						    var count = 1;
						    var rows = []
								for ( var key in data ) {
									data[ key ][ 0 ] = count;
								  rows.push( data[ key ] );
								  count++;
								}

								// add rows to worksheet
								worksheet.addRows( rows );

						    // write to a file
								workbook.xlsx.writeFile( print_dir + xlsx_report )
							  	.then(function() {
							    	// return
							    	return res.json( 200, { report: xlsx_report });
							  	});

							});

					});
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

            if (!params.json) {
						// format stocks
						stocks.forEach(function( d, i ){
							stocks[ i ].report_month_number = d.report_month+1;
							stocks[ i ].report_month = moment( d.reporting_period ).format( 'MMMM' );
              stocks[ i ].reporting_period = moment( d.reporting_period ).format( 'YYYY-MM-DD' );

              d.updatedAt = moment(d.updatedAt).format('YYYY-MM-DD HH:mm:ss');
              d.createdAt = moment(d.createdAt).format('YYYY-MM-DD HH:mm:ss');

              // array to string
              d.donors = Utils.arrayToString(d.donors, "donor_name");
              d.implementing_partners = Utils.arrayToString(d.implementing_partners, "organization")
              // partial kits
              d.stock_details = Utils.arrayToString(d.stock_details, ["unit_type_name", "unit_type_quantity"]);

						});

						var fields = [
								'report_id',
                'location_id',
                'id',
								'cluster',
                'stock_warehouse_id',
                // 'donor',
                // 'implementing_partners',
                // 'stock_type_name',
								'stock_item_type',
                'stock_item_name',
                'stock_details',
                'stock_item_purpose_name',
                'stock_status_name',
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
								'admin3pcode',
								'admin3name',
								'admin4pcode',
								'admin4name',
								'admin5pcode',
								'admin5name',
								'site_lng',
								'site_lat',
								'site_name',
								'number_in_stock',
                'number_in_pipeline',
                'beneficiaries_covered',
                'stock_targeted_groups_id',
                'stock_targeted_groups_name',
                'remarks'
							],

						fieldNames = [
								'report_id',
                'location_id',
                'stock_id',
								'cluster',
                'stock_warehouse_id',
                // 'donor',
                // 'implementing_partners',
                // 'stock_type_name',
								'stock_item_type',
                'stock_item_name',
                'stock_details',
                'stock_item_purpose_name',
                'stock_status_name',
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
								'admin3pcode',
								'admin3name',
								'admin4pcode',
								'admin4name',
								'admin5pcode',
								'admin5name',
								'warehouse_lng',
								'warehouse_lat',
								'warehouse_name',
								'number_in_stock',
                'number_in_pipeline',
                'beneficiaries_covered',
                'stock_targeted_groups_id',
                'stock_targeted_groups_name',
                'remarks'
              ];

              if ( params.admin0pcode.toUpperCase() === 'ET' ) {
								ix = fields.indexOf('stock_warehouse_id') + 1;
								ix && fields.splice(ix, 0, 'donors', 'implementing_partners', 'stock_type_name');
                ix && fieldNames.splice(ix, 0, 'donors', 'implementing_partners', 'stock_type_name');

                ix = fieldNames.indexOf('beneficiaries_covered');
                ix && fieldNames.splice(ix, 1, 'households_covered');
              }

						// return csv
						json2csv({ data: stocks, fields: fields, fieldNames: fieldNames }, function( err, csv ) {

							// error
							if ( err ) return res.negotiate( err );

							// success
							if ( params.ocha ) {
                res.set('Content-Type', 'text/csv');
										filename = req.param('reportname') ? req.param('reportname') : 'stocks'
										res.setHeader('Content-disposition', 'attachment; filename=' + filename + '.csv');
										res.send(200, csv);
										MetricsController.setApiMetrics({
											dashboard: 'cluster_dashboard',
											theme: params.indicator,
											url: req.url,
                    }, function (err) { return });
							} else {
								return res.json( 200, { data: csv } );
							}

            });
          } else {
              return res.json(200, { data: stocks });
          }

					});

				break;

			// NG WASH
			// accountability
			case 'accountability':

				var data = [];

				// accountability
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
					.populate( params.indicator )
					.exec( function( err, result ){

						// return error
						if (err) return res.negotiate( err );

						// format month
						result.forEach( function( d, i ){
							result[ i ].report_month_number = d.report_month+1;
							result[ i ].report_month = moment( d.reporting_period ).format( 'MMMM' );
							result[ i ].reporting_period = moment( d.reporting_period ).format( 'YYYY-MM-DD' );
							result[ i ][ params.indicator ].forEach( function( a, j ){
								var obj = _.extend( result[ i ],  a );
								delete obj.accountability;
								delete obj.boreholes;
								delete obj.cash;
								delete obj.hygiene;
								delete obj.sanitation;
								delete obj.water;
								delete obj.beneficiary_id;
								delete obj.activity_type;
								delete obj.inter_cluster_activities;
								delete obj.strategic_objectives;
								delete obj.activity_type;
								delete obj.delivery_type_id;
								delete obj.delivery_type_name;
								data.push( obj );
							});
						});

						json2csv({ data: data }, function( err, csv ) {

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


			// boreholes
			case 'boreholes':

				var data = [];

				// boreholes
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
					.populate( params.indicator )
					.exec( function( err, result ){

						// return error
						if (err) return res.negotiate( err );

						// format month
						result.forEach( function( d, i ){
							result[ i ].report_month_number = d.report_month+1;
							result[ i ].report_month = moment( d.reporting_period ).format( 'MMMM' );
							result[ i ].reporting_period = moment( d.reporting_period ).format( 'YYYY-MM-DD' );
							result[ i ][ params.indicator ].forEach( function( a, j ){
								var obj = _.extend( result[ i ],  a );
								delete obj.accountability;
								delete obj.boreholes;
								delete obj.cash;
								delete obj.hygiene;
								delete obj.sanitation;
								delete obj.water;
								delete obj.beneficiary_id;
								delete obj.activity_type;
								delete obj.inter_cluster_activities;
								delete obj.strategic_objectives;
								delete obj.activity_type;
								delete obj.delivery_type_id;
								delete obj.delivery_type_name;
								data.push( obj );
							});
						});

						json2csv({ data: data }, function( err, csv ) {

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

			// cash
			case 'cash':

				var data = [];

				// cash
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
					.populate( params.indicator )
					.exec( function( err, result ){

						// return error
						if (err) return res.negotiate( err );

						// format month
						result.forEach( function( d, i ){
							result[ i ].report_month_number = d.report_month+1;
							result[ i ].report_month = moment( d.reporting_period ).format( 'MMMM' );
							result[ i ].reporting_period = moment( d.reporting_period ).format( 'YYYY-MM-DD' );
							result[ i ][ params.indicator ].forEach( function( a, j ){
								var obj = _.extend( result[ i ],  a );
								delete obj.accountability;
								delete obj.boreholes;
								delete obj.cash;
								delete obj.hygiene;
								delete obj.sanitation;
								delete obj.water;
								delete obj.beneficiary_id;
								delete obj.activity_type;
								delete obj.inter_cluster_activities;
								delete obj.strategic_objectives;
								delete obj.activity_type;
								delete obj.delivery_type_id;
								delete obj.delivery_type_name;
								data.push( obj );
							});
						});

						json2csv({ data: data }, function( err, csv ) {

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


			// hygiene
			case 'hygiene':

				var data = [];

				// hygiene
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
					.populate( params.indicator )
					.exec( function( err, result ){

						// return error
						if (err) return res.negotiate( err );

						// format month
						result.forEach( function( d, i ){
							result[ i ].report_month_number = d.report_month+1;
							result[ i ].report_month = moment( d.reporting_period ).format( 'MMMM' );
							result[ i ].reporting_period = moment( d.reporting_period ).format( 'YYYY-MM-DD' );
							result[ i ][ params.indicator ].forEach( function( a, j ){
								var obj = _.extend( result[ i ],  a );
								delete obj.accountability;
								delete obj.boreholes;
								delete obj.cash;
								delete obj.hygiene;
								delete obj.sanitation;
								delete obj.water;
								delete obj.beneficiary_id;
								delete obj.activity_type;
								delete obj.inter_cluster_activities;
								delete obj.strategic_objectives;
								delete obj.activity_type;
								delete obj.delivery_type_id;
								delete obj.delivery_type_name;
								data.push( obj );
							});
						});

						json2csv({ data: data }, function( err, csv ) {

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


			// sanitation
			case 'sanitation':

				var data = [];

				// sanitation
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
					.populate( params.indicator )
					.exec( function( err, result ){

						// return error
						if (err) return res.negotiate( err );

						// format month
						result.forEach( function( d, i ){
							result[ i ].report_month_number = d.report_month+1;
							result[ i ].report_month = moment( d.reporting_period ).format( 'MMMM' );
							result[ i ].reporting_period = moment( d.reporting_period ).format( 'YYYY-MM-DD' );
							result[ i ][ params.indicator ].forEach( function( a, j ){
								var obj = _.extend( result[ i ],  a );
								delete obj.accountability;
								delete obj.boreholes;
								delete obj.cash;
								delete obj.hygiene;
								delete obj.sanitation;
								delete obj.water;
								delete obj.beneficiary_id;
								delete obj.activity_type;
								delete obj.inter_cluster_activities;
								delete obj.strategic_objectives;
								delete obj.activity_type;
								delete obj.delivery_type_id;
								delete obj.delivery_type_name;
								data.push( obj );
							});
						});

						json2csv({ data: data }, function( err, csv ) {

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


			// water
			case 'water':

				var data = [];

				// water
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
					.populate( params.indicator )
					.exec( function( err, result ){

						// return error
						if (err) return res.negotiate( err );

						// format month
						result.forEach( function( d, i ){
							result[ i ].report_month_number = d.report_month+1;
							result[ i ].report_month = moment( d.reporting_period ).format( 'MMMM' );
							result[ i ].reporting_period = moment( d.reporting_period ).format( 'YYYY-MM-DD' );
							result[ i ][ params.indicator ].forEach( function( a, j ){
								var obj = _.extend( result[ i ],  a );
								delete obj.accountability;
								delete obj.boreholes;
								delete obj.cash;
								delete obj.hygiene;
								delete obj.sanitation;
								delete obj.water;
								delete obj.beneficiary_id;
								delete obj.activity_type;
								delete obj.inter_cluster_activities;
								delete obj.strategic_objectives;
								delete obj.activity_type;
								delete obj.delivery_type_id;
								delete obj.delivery_type_name;
								data.push( obj );
							});
						});

						json2csv({ data: data }, function( err, csv ) {

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
				// groupby
				Beneficiaries.native(function(err, collection) {
							if (err) return res.serverError(err);

							collection.aggregate([
								{
									$match : filterObject
								},
								{
									$group: {
									_id: {
										project_id:'$project_id',
										site_lat :'$site_lat',
										site_lng :'$site_lng',
										site_name:'$site_name',
										cluster:'$cluster',
										organization:'$organization',
										project_title:'$project_title',
										admin0name:'$admin0name',
										admin1name:'$admin1name',
										admin2name:'$admin2name',
										admin3name:'$admin3name',
										admin4name:'$admin4name',
										admin5name:'$admin5name',
										cluster_id:'$cluster_id',
										site_type_name:'$site_type_name',
										site_name:'$site_name',
										name:'$name',
										position:'$position',
										phone:'$phone',
										email:'$email'
									}
									}
								}
							]).toArray(async function (err, locations) {
									if (err) return res.serverError(err);

								// return no locations
								if ( !locations.length ) {
									coordinates = await AreaCentroidService.getAreaCentroid(filterObject);
									return res.json( 200, { 'data': { 'marker0': { layer: 'projects', lat: coordinates.lat, lng: coordinates.lng, message: '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">NO PROJECTS</h5>' } } } );
								}
								// length
								length = locations.length;
								// foreach location
								locations.forEach( function( d, i ){

									// popup message
									var message = '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">' + d._id.cluster + '</h5>'
															+ '<h5 style="text-align:center; font-size:1.3rem; font-weight:100;">' + d._id.organization + ' | ' + d._id.project_title + '</h5>'
															+ '<div style="text-align:center">' + d._id.admin0name + '</div>'
															if ( d._id.admin5name ) {
																message += '<div style="text-align:center">' + d._id.admin1name + ', ' + d._id.admin2name + ', ' + d._id.admin3name + ', ' + d._id.admin4name + ', ' + d._id.admin5name + '</div>';
															} else if ( d._id.admin4name ) {
																message += '<div style="text-align:center">' + d._id.admin1name + ', ' + d._id.admin2name + ', ' + d._id.admin3name + ', ' + d._id.admin4name + '</div>';
															} else if ( d._id.admin3name ) {
																message += '<div style="text-align:center">' + d._id.admin1name + ', ' + d._id.admin2name + ', ' + d._id.admin3name + '</div>';
															} else {
																message += '<div style="text-align:center">' + d._id.admin1name + ', ' + d._id.admin2name + '</div>';
															}
															if ( d._id.site_type_name ){
																message += '<div style="text-align:center">' + d._id.site_type_name + '</div>'
															}
															message += '<div style="text-align:center">' + d._id.site_name + '</div>'
															+ '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">CONTACT</h5>'
															+ '<div style="text-align:center">' + d._id.organization + '</div>'
															+ '<div style="text-align:center">' + d._id.name + '</div>'
															+ '<div style="text-align:center">' + d._id.position + '</div>'
															+ '<div style="text-align:center">' + d._id.phone + '</div>'
															+ '<div style="text-align:center">' + d._id.email + '</div>'
															+ '<div align="center" style="margin-top:10px;"><a style="color:#fff;height: 30px;line-height: 30px;" class="btn" href="#/cluster/projects/summary/' + d._id.project_id +'" target="_blank">'+'Go to Project</a></div>';

									// create markers
									markers[ 'marker' + counter ] = {
										layer: 'projects',
										lat: d._id.site_lat,
										lng: d._id.site_lng,
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
				});

				break;

			case 'pieChart':
			// labels
				var result = {
					label: {
						left: {
							label: {
								prefix: 'M',
								label: 0,
								postfix: '%'
							},
							subLabel: {
											label: 0
										}
									},
									center: {
										label: {
											label: 0,
											postfix: '%'
										},
										subLabel: {
											label: 0
										}
									},
									right: {
										label: {
											prefix: 'F',
											label: 0,
											postfix: '%'
										},
										subLabel: {
											label: 0
										}
									}
								},
								data: [{
									'y': 0,
									'color': '#f48fb1',
									'name': 'Female',
									'label': 0,
								},{
									'y': 0,
									'color': '#90caf9',
									'name': 'Male',
									'label': 0,
								}]
							};
						// beneficiaries


						Beneficiaries.native(function (err, results) {
							if(err) return res.serverError(err);

							results.aggregate([
								{
									$match : filterObject
								},
								{
									$group: {
										_id: null,
										men: { $sum: "$men" },
										women: { $sum: "$women" },
										elderly_men: { $sum: "$elderly_men" },
										elderly_women: { $sum: "$elderly_women" },
										boys: { $sum: "$boys" },
										girls: { $sum: "$girls" },
										childTotal: { $sum: { $add: ["$boys", "$girls"] } },
										adultTotal: { $sum: { $add: ["$men", "$women"] } },
										elderTotal: { $sum: { $add: ["$elderly_men", "$elderly_women"] } }
									}
								}
							]).toArray(function (err, beneficiaries) {
								if (err) return res.serverError(err);

								// if no length
								// if (!beneficiaries.length) return res.json(200, { 'value': 0 });
								if (!beneficiaries.length) {
									result.data[0].y = 100;
									result.data[0].label = 0;
									result.data[0].color = '#c7c7c7';
									return res.json(200, result);
								}


								$beneficiaries = beneficiaries[0];


								switch (req.param('chart_for')) {
									case 'children':
										if ($beneficiaries.boys < 1 && $beneficiaries.girls < 1) {

											// // assign data left
											result.label.left.label.label = 0;
											result.label.left.subLabel.label = 0;
											// // assign data center
											result.label.center.label.label = 0;
											result.label.center.subLabel.label = 0;
											// // assign data right
											result.label.right.label.label = 0;
											result.label.right.subLabel.label = 0;

											// // highcharts elderly_women
											result.data[0].y = 100;
											result.data[0].label = 0;
											result.data[0].color = '#c7c7c7';
											// // highcharts elderly_men
											result.data[1].y = 0;
											result.data[1].label = 0;

											return res.json(200, result);

										} else {
											// calc

											var boysPerCent = ($beneficiaries.boys / ($beneficiaries.boys + $beneficiaries.girls)) * 100;
											var girlsPerCent = ($beneficiaries.girls / ($beneficiaries.boys + $beneficiaries.girls)) * 100;
											var totalPerCent = ($beneficiaries.childTotal / ($beneficiaries.elderTotal + $beneficiaries.adultTotal + $beneficiaries.childTotal)) * 100;

											// assign data left
											result.label.left.label.label = boysPerCent;
											result.label.left.subLabel.label = $beneficiaries.boys;
											// assign data center
											result.label.center.label.label = totalPerCent;
											result.label.center.subLabel.label = $beneficiaries.childTotal;
											if (result.label.center.subLabel.label >= 1000000 && result.label.center.subLabel.label < 1000000000) {
												result.label.center.subLabel.label = result.label.center.subLabel.label / 1000000;
												result.label.center.subLabel.postfix = 'M';
												result.label.center.subLabel.fractionSize = 2;
											}
											if (result.label.center.subLabel.label >= 1000000000) {
												result.label.center.subLabel.label = result.label.center.subLabel.label / 1000000000;
												result.label.center.subLabel.postfix = 'B';
												result.label.center.subLabel.fractionSize = 2;
											}
											// assign data right
											result.label.right.label.label = girlsPerCent;
											result.label.right.subLabel.label = $beneficiaries.girls;

											// highcharts girls
											result.data[0].y = girlsPerCent;
											result.data[0].label = $beneficiaries.childTotal;
											// highcharts boys
											result.data[1].y = boysPerCent;
											result.data[1].label = $beneficiaries.childTotal;

											return res.json(200, result);
										}

										break;

									case 'adult':
										if ($beneficiaries.men < 1 && $beneficiaries.women < 1) {

											// // assign data left
											result.label.left.label.label = 0;
											result.label.left.subLabel.label = 0;
											// // assign data center
											result.label.center.label.label = 0;
											result.label.center.subLabel.label = 0;
											// // assign data right
											result.label.right.label.label = 0;
											result.label.right.subLabel.label = 0;

											// // highcharts elderly_women
											result.data[0].y = 100;
											result.data[0].label = 0;
											result.data[0].color = '#c7c7c7';
											// // highcharts elderly_men
											result.data[1].y = 0;
											result.data[1].label = 0;

											return res.json(200, result);

										} else {
											// calc

											var mensPerCent = ($beneficiaries.men / ($beneficiaries.men + $beneficiaries.women)) * 100;
											var womensPerCent = ($beneficiaries.women / ($beneficiaries.men + $beneficiaries.women)) * 100;
											var totalPerCent = ($beneficiaries.adultTotal / ($beneficiaries.elderTotal + $beneficiaries.adultTotal + $beneficiaries.childTotal)) * 100;

											// // assign data left
											result.label.left.label.label = mensPerCent;
											result.label.left.subLabel.label = $beneficiaries.men;
											// // assign data center
											result.label.center.label.label = totalPerCent;
											result.label.center.subLabel.label = $beneficiaries.adultTotal;
											if (result.label.center.subLabel.label >= 1000000 && result.label.center.subLabel.label < 1000000000) {
												result.label.center.subLabel.label = result.label.center.subLabel.label / 1000000;
												result.label.center.subLabel.postfix = 'M';
												result.label.center.subLabel.fractionSize = 2;
											}
											if (result.label.center.subLabel.label >= 1000000000) {
												result.label.center.subLabel.label = result.label.center.subLabel.label / 1000000000;
												result.label.center.subLabel.postfix = 'B';
												result.label.center.subLabel.fractionSize = 2;
											}
											// // assign data right
											result.label.right.label.label = womensPerCent;
											result.label.right.subLabel.label = $beneficiaries.women;

											// // highcharts women
											result.data[0].y = womensPerCent;
											result.data[0].label = $beneficiaries.adultTotal;
											// // highcharts men
											result.data[1].y = mensPerCent;
											result.data[1].label = $beneficiaries.adultTotal;

											return res.json(200, result);

										}

										break;

									case 'elderly':
										if ($beneficiaries.elderly_men < 1 && $beneficiaries.elderly_women < 1) {

											// // assign data left
											result.label.left.label.label = 0;
											result.label.left.subLabel.label = 0;
											// // assign data center
											result.label.center.label.label = 0;
											result.label.center.subLabel.label = 0;
											// // assign data right
											result.label.right.label.label = 0;
											result.label.right.subLabel.label = 0;

											// // highcharts elderly_women
											result.data[0].y = 100;
											result.data[0].label = 0;
											result.data[0].color = '#c7c7c7';
											// // highcharts elderly_men
											result.data[1].y = 0;
											result.data[1].label = 0;

											return res.json(200, result);

										} else {
											// calc
											var elmensPerCent = ($beneficiaries.elderly_men / ($beneficiaries.elderly_men + $beneficiaries.elderly_women)) * 100;
											var elwomensPerCent = ($beneficiaries.elderly_women / ($beneficiaries.elderly_men + $beneficiaries.elderly_women)) * 100;
											var totalPerCent = ($beneficiaries.elderTotal / ($beneficiaries.elderTotal + $beneficiaries.adultTotal + $beneficiaries.childTotal)) * 100;

											// // assign data left
											result.label.left.label.label = elmensPerCent;
											result.label.left.subLabel.label = $beneficiaries.elderly_men;
											// // assign data center
											result.label.center.label.label = totalPerCent;
											result.label.center.subLabel.label = $beneficiaries.elderTotal;
											if (result.label.center.subLabel.label >= 1000000 && result.label.center.subLabel.label < 1000000000) {
												result.label.center.subLabel.label = result.label.center.subLabel.label / 1000000;
												result.label.center.subLabel.postfix = 'M';
												result.label.center.subLabel.fractionSize =2;
											}
											if (result.label.center.subLabel.label >= 1000000000) {
												result.label.center.subLabel.label = result.label.center.subLabel.label / 1000000000;
												result.label.center.subLabel.postfix = 'B';
												result.label.center.subLabel.fractionSize =2;
											}
											// // assign data right
											result.label.right.label.label = elwomensPerCent;
											result.label.right.subLabel.label = $beneficiaries.elderly_women;

											// // highcharts elderWomen
											result.data[0].y = elwomensPerCent;
											result.data[0].label = $beneficiaries.elderTotal;
											// // highcharts elderMen
											result.data[1].y = elmensPerCent;
											result.data[1].label = $beneficiaries.elderTotal;

											return res.json(200, result);

										}
										break;

										default:
											return res.json( 200, { value:0 });
											break;
									}


								})
							})


				break;
			case 'activities':

				if (params.adminRpcode !== 'hq' && params.admin0pcode === 'all') {
					if (params.adminRpcode === 'afro') {
						adminRpcode_filter = { or: [{ admin0pcode: { contains: 'CD' } }, { admin0pcode: { contains: 'ET' } }, { admin0pcode: { contains: 'NG' } }, { admin0pcode: { contains: 'SS' } }] }
					}
					if (params.adminRpcode === 'amer') {
						adminRpcode_filter = { admin0pcode: { contains: 'COL' } };
					}
					if (params.adminRpcode === 'emro') {
						adminRpcode_filter = { or: [{ admin0pcode: { contains: 'AF' } }, { admin0pcode: { contains: 'SO' } }, { admin0pcode: { contains: 'SY' } }, { admin0pcode: { contains: 'YE' } }] }
					}
					if (params.adminRpcode === 'searo') {
						adminRpcode_filter = { or: [{ admin0pcode: { contains: 'BD' } }, { admin0pcode: { contains: 'CB' } }] }
					}
					if (params.adminRpcode === 'euro') {
						adminRpcode_filter = { admin0pcode: { contains: 'UA' } };
					}
					var filterObjectact = _.extend({}, adminRpcode_filter, filters.cluster_id_act)
				}else{
					var filterObjectact = _.extend({}, filters.admin0pcode_act, filters.cluster_id_act)
				}
				Activities
					.find()
					.where(filterObjectact)
					.exec(function (err, activities) {
						var distinct_activities = _.uniq(activities, function (x) {
							return x.activity_type_name;
						});
						// return error
						if (err) return res.negotiate(err);
						// return project
						return res.json(200, distinct_activities);
					})
				break;
				default:
					return res.json( 200, { value:0 });
					break;


		}

	}


};

module.exports = ClusterDashboardController;
