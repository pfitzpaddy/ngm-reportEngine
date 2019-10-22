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

var Cluster4wprojectplanDashboardController = {

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

	exchangeRatesCurrencies: function(req, res){

		var excangeratescurrencies = []; 

         var request = require('request');

		//api to find exchange rates from EURO to others currencies
			  request.get({
						  url: 'https://api.exchangeratesapi.io/latest'
						}, function(error, response, body) {
						  if (error) {
						  }
						  else {
			
						   newbody = JSON.parse(body);
						
						  excangeratescurrencies.push(newbody.rates.USD);

						// console.log("EURO A DOLAR1 FUNCTION: ", typeof excangeratescurrencies);
						 return res.json( 200, excangeratescurrencies);
						}
					});
	},

	// get params from req
	getParams: function( req, res ){

		// request input
		if ( !req.param('indicator') ||
					!req.param('cluster_id') ||
					!req.param('adminRpcode') ||
					!req.param('admin0pcode') ||
					!req.param('organization_tag') ||
					!req.param('donor_tag') ||
					!req.param('admin1pcode') ||
					!req.param('admin2pcode') ||
					//!req.param('beneficiaries') ||
					!req.param('start_date') ||
					!req.param('end_date') ) {
			return res.json(401, {err: 'indicator, cluster_id, adminRpcode, admin0pcode, organization_tag, donor_tag, admin1pcode, admin2pcode, start_date, end_date required!'});
		}


		// return params
		return {
			csv: req.param('csv') ? req.param('csv') : false,
			ocha: req.param('ocha') ? req.param('ocha') : false,
			list: req.param('list') ? req.param('list') : false,
			indicator: req.param('indicator'),
			cluster_id: req.param('cluster_id'),
			cluster_ids: req.param('cluster_ids') ? req.param('cluster_ids') : [req.param('cluster_id')],
			//activity_type_id: req.param( 'activity_type_id' ) ? req.param( 'activity_type_id' ) : 'all',
			adminRpcode: req.param('adminRpcode'),
			admin0pcode: req.param('admin0pcode'),
			organization_tag: req.param('organization_tag'),
			donor_tag: req.param('donor_tag'),
			admin1pcode: req.param('admin1pcode'),
			admin2pcode: req.param('admin2pcode'),
			//beneficiaries: req.param('beneficiaries'),
			start_date: req.param('start_date'),
			end_date: req.param('end_date'),
			//coptousd: req.param('cop')
			coptousd: req.param('cop'),
			eurotousd :req.param('eur')
		}
		

	},

	// return filters
	getFilters: function( params ){
	
		return {
			//new default
			//default: {  project_status: {$in:['active','complete'] }},

			adminRpcode: params.adminRpcode === 'hq' ? {} : { adminRpcode: params.adminRpcode },
			admin0pcode: params.admin0pcode === 'all' ? {} : { admin0pcode: params.admin0pcode },
			admin1pcode: params.admin1pcode === 'all' ? {} : { admin1pcode: params.admin1pcode },
			admin2pcode: params.admin2pcode === 'all' ? {} : { admin2pcode: params.admin2pcode },
			cluster_id:  ( params.cluster_id === 'all' || params.cluster_id === 'rnr_chapter' || params.cluster_id === 'acbar' ) 
								? {} 
								: ( params.cluster_id !== 'cvwg' )
			                    ?{or:[{cluster_id:params.cluster_id},{inter_cluster_activities:{$elemMatch:{cluster_id:params.cluster_id}}}]}
			                    : {inter_cluster_activities:{$elemMatch:{cluster_id:params.cluster_id}}},
			
			                                
			acbar_partners: params.cluster_id === 'acbar' ? { project_acbar_partner: true } : {},
			organization_tag: params.organization_tag === 'all' ? { organization_tag: { '!': $nin_organizations } } : { organization_tag: params.organization_tag },
			

			donor_tag: params.donor_tag === 'all' ? {} : {  project_donor : { $elemMatch : { 'project_donor_id' : params.donor_tag}}},
			
			project_startDate: { project_start_date: {'>=': new Date(params.start_date)}},
			project_endDate: { project_end_date: {'<=': new Date(params.end_date)}},
	

			adminRpcode_Native: params.adminRpcode === 'hq'  ? {} : { adminRpcode: params.adminRpcode.toUpperCase() },
			admin0pcode_Native: params.admin0pcode === 'all' ? {} : { admin0pcode: params.admin0pcode.toUpperCase() },
			admin1pcode_Native: params.admin1pcode === 'all' ? {} : { admin1pcode: params.admin1pcode.toUpperCase() },
			admin2pcode_Native: params.admin2pcode === 'all' ? {} : { admin2pcode: params.admin2pcode.toUpperCase() },
			cluster_id_Native: ( params.cluster_id === 'all' || params.cluster_id === 'rnr_chapter' || params.cluster_id === 'acbar' ) 
								? {} 
								: ( params.cluster_id !== 'cvwg' )
							
			                    ?{$or:[{cluster_id:params.cluster_id},{inter_cluster_activities:{$elemMatch:{'cluster_id':params.cluster_id}}}]}
			                    : {inter_cluster_activities:{$elemMatch:{'cluster_id':params.cluster_id}}} ,
			cluster_ids_Native: ( params.cluster_ids.includes('all') || params.cluster_ids.includes('rnr_chapter') || params.cluster_ids.includes('acbar') ) 
								? {} 
								: ( params.cluster_ids.includes('cvwg') )
			                     ?{$or:[{cluster_id:params.cluster_id},{inter_cluster_activities:{$elemMatch:{'cluster_id':params.cluster_id}}}]}
			                    :{inter_cluster_activities:{$elemMatch:{'cluster_id':params.cluster_id}}},
			                 
			is_cluster_ids_array: params.cluster_ids ? true : false,
			organization_tag_Native: params.organization_tag === 'all' ? { organization_tag: { $nin: $nin_organizations } } : { organization_tag: params.organization_tag },

			donor_tagNative: params.donor_tag === 'all' ? {} : {  project_donor : { $elemMatch : { 'project_donor_id' : params.donor_tag}}},

			project_startDateNative: { project_start_date: { $gte: new Date(params.start_date) }},
			project_endDateNative: { project_end_date: { $lte: new Date(params.end_date) }},



		}
	},
	
	// indicators
	getIndicator: function ( req, res  ) {


		var params = Cluster4wprojectplanDashboardController.getParams( req, res );


        
        var filters = Cluster4wprojectplanDashboardController.getFilters( params );

		// match clause for native mongo query
		var filterObject = _.extend({},	filters.default_Native,
										filters.adminRpcode_Native,
										filters.admin0pcode_Native,
										filters.admin1pcode_Native,
										filters.admin2pcode_Native,
										
										filters.cluster_id_Native,
										filters.acbar_partners,
										filters.organization_tag_Native,
										
										filters.donor_tagNative,
										
										filters.project_startDateNative,
										filters.project_endDateNative,
										//filters.delivery_type_id()
										 );



		// switch on indicator
		switch( params.indicator ) {



			case 'latest_update':

				// beneficiaries
				Project
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.admin1pcode )
					.where( filters.admin2pcode )
					.where( filters.cluster_id )
					.where( filters.organization_tag )
					.where(filters.donor_tag)
					.where(filters.project_startDateNative)
					.where(filters.project_endDateNative)
					.sort( 'updatedAt DESC' )
					.limit(1)
					.exec( function( err, results ){

						// return error
						if (err) return res.negotiate( err );

						// latest update
						return res.json( 200, results[0] );

					});

				break;

			/*	

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
					//.where( filters.activity_type_id )
					.where( filters.acbar_partners )
					.where( filters.organization_tag )
					//.where( filters.beneficiaries )
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
					//.where( filters.activity_type_id )
					.where( filters.acbar_partners )
					.where( filters.organization_tag )
					//.where( filters.beneficiaries )
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
						var report = Cluster4wprojectplanDashboardController.flatten( data );

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
							'currency_id',
							'project_budget_amount_recieved',
							'contribution_status',
							'project_budget_date_recieved',
							'budget_funds_name',
							'financial_programming_name',
							'multi_year_funding_name',
							'funding_2017',
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
							'Currency Recieved',
							'Ammount Received',
							'Contribution Status',
							'Date of Payment',
							'Incoming Funds',
							'Financial Programming',
							'Multi-Year Funding',
							'2017 Funding',
							'Reported on FTS',
							'FTS ID',
							'Email',
							'createdAt',
							'Comments'
						];

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
									total:  { $sum: { $add: [ "$men", "$women","$boys","$girls","$elderly_men","$elderly_women" ] } }
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
				if ( !params.csv ) {
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
										total:  { $sum: { $add: [ "$men", "$women","$boys","$girls","$elderly_men","$elderly_women" ] } } ,
									}
								}
							]
						).toArray(function (err, beneficiaries) {
							if (err) return res.serverError(err);
							
							TrainingParticipants.native(function(err, collection) {
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
												total:  { $sum: { $add: [ "$trainee_men", "$trainee_women" ] } } ,
											}
										}
									]
								).toArray(function (err, training_participants) {
									if (err) return res.serverError(err);
									
									var total = beneficiaries[0]?beneficiaries[0].total:0 + training_participants[0]?training_participants[0].total:0  
				
									return res.json( 200, { 'value': total } );
								});
							});
						});
					});
				}	else	{
					// get beneficiaries export
					Beneficiaries.native(function(err, collection) {
						if (err) return res.serverError(err);
					
						collection.find(filterObject).toArray(function (err, beneficiaries) {
							if (err) return res.serverError(err);
							
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
								'project_start_date',
								'project_end_date',
								'donor',
								'report_month_number',
								'report_month',
								'report_year',
								'reporting_period',
								'admin0pcode',
								'admin0name',
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
								'conflict',
								'site_id',
								'site_class',
								'site_status',
								'site_hub_id',
								'site_hub_name',
								'site_implementation_name',
								'site_type_name',
								'site_name',
								'category_type_id',
								'category_type_name',
								'beneficiary_type_id',
								'beneficiary_type_name',
								'beneficiary_category_name',
								'strategic_objective_id',
								'strategic_objective_name',
								'strategic_objective_description',
								'sector_objective_id',
								'sector_objective_name',
								'sector_objective_description',
								//'activity_type_id',
								'activity_type_name',
								'activity_description_id',
								'activity_description_name',
								'activity_detail_id',
								'activity_detail_name',
								'indicator_id',
								'indicator_name',
								'activity_status_id',
								'activity_status_name',
								'delivery_type_id',
								'delivery_type_name',
								'distribution_status',
								'distribution_start_date',
								'distribution_end_date',
								'partial_kits',
								'kit_details',
								'units',
								'unit_type_id',
								'unit_type_name',
								'transfer_type_value',
								'mpc_delivery_type_id',
								'mpc_delivery_type_name',
								'mpc_mechanism_type_id',
								'mpc_mechanism_type_name',
								'package_type_id',
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
								'admin4lng',
								'admin4lat',
								'admin5lng',
								'admin5lat',
								'site_lng',
								'site_lat',
								'updatedAt',
								'createdAt',
							],

						fieldNames = [
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
								'project_start_date',
								'project_end_date',
								'donor',
								'report_month_number',
								'report_month',
								'report_year',
								'reporting_period',
								'admin0pcode',
								'admin0name',
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
								'conflict',
								'site_id',
								'site_class',
								'site_status',
								'site_hub_id',
								'site_hub_name',
								'site_implementation_name',
								'site_type_name',
								'site_name',
								'category_type_id',
								'category_type_name',
								'beneficiary_type_id',
								'beneficiary_type_name',
								'beneficiary_category_name',
								'strategic_objective_id',
								'strategic_objective_name',
								'strategic_objective_description',
								'sector_objective_id',
								'sector_objective_name',
								'sector_objective_description',
								//'activity_type_id',
								'activity_type_name',
								'activity_description_id',
								'activity_description_name',
								'activity_detail_id',
								'activity_detail_name',
								'indicator_id',
								'indicator_name',
								'activity_status_id',
								'activity_status_name',
								'delivery_type_id',
								'delivery_type_name',
								'distribution_status',
								'distribution_start_date',
								'distribution_end_date',
								'partial_kits',
								'kit_details',
								'units',
								'unit_type_id',
								'unit_type_name',
								'transfer_type_value',
								'mpc_delivery_type_id',
								'mpc_delivery_type_name',
								'mpc_mechanism_type_id',
								'mpc_mechanism_type_name',
								'package_type_id',
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
								'admin4lng',
								'admin4lat',
								'admin5lng',
								'admin5lat',
								'site_lng',
								'site_lat',
								'updatedAt',
								'createdAt'
							];

							var total = 0;
							
							// format beneficiaries
							async.eachLimit(beneficiaries, 200, function (d, next) {
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

								//implementing_partner
								if (Array.isArray(d.implementing_partners)) {
									var im = [];
									d.implementing_partners.forEach(function (impl, i) {
										if (impl) im.push(impl.organization_name);
									});
									im.sort();
									d.implementing_partners = im.join(', ');
								}

								// sum
								var sum = d.boys + d.girls + d.men + d.women + d.elderly_men + d.elderly_women;
								// beneficiaries
								d.total = sum;
								d.report_month_number = d.report_month + 1;
								d.report_month = moment(d.reporting_period).format('MMMM');
								d.reporting_period = moment(d.reporting_period).format('YYYY-MM-DD');
								d.updatedAt = moment(d.updatedAt).format('YYYY-MM-DD HH:mm:ss');
								d.createdAt = moment(d.createdAt).format('YYYY-MM-DD HH:mm:ss');
								// grand total
								total += sum;
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
						})
					});
				}
				
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
								'report_id',
								'location_id',
								'cluster',
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
								'admin3pcode',
								'admin3name',
								'admin4pcode',
								'admin4name',
								'admin5pcode',
								'admin5name',
								'site_lng',
								'site_lat',
								'site_name',
								'conflict',
								'number_in_stock',
								'number_in_pipeline',
								'beneficiaries_covered',
							],

						fieldNames = [
								'report_id',
								'location_id',
								'cluster',
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
								'admin3pcode',
								'admin3name',
								'admin4pcode',
								'admin4name',
								'admin5pcode',
								'admin5name',
								'warehouse_lng',
								'warehouse_lat',
								'warehouse_name',
								'conflict',
								'number_in_stock',
								'number_in_pipeline',
								'beneficiaries_covered',
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
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.admin1pcode )
					.where( filters.admin2pcode )
					.where( filters.cluster_id )
					.where( filters.acbar_partners )
					.where( filters.organization_tag )
					//.where( filters.beneficiaries )
					.where( filters.date )
					.exec( function( err, training_participants ){

						// return error
						if (err) return res.negotiate( err );

						var fields = [
							'project_id',
							'project_title',
							'project_description',
							'project_start_date',
							'project_end_date',
							'project_hrp_code',
							'project_code',
							'report_id',
							'report_month',
							'report_year',
							'reporting_period',
							'report_submitted',
							'admin0pcode',
							'admin0name',
							'cluster_id',
							'cluster',
							'organization',
							'organization_tag',
							'training_id',
							'training_title',
							'training_topics',
							'training_start_date',
							'training_end_date',
							'training_days_number',
							'training_conducted_by',
							'training_supported_by',
							'trainee_affiliation_id',
							'trainee_affiliation_name',
							'trainee_health_worker_id',
							'trainee_health_worker_name',
							'trainee_men',
							'trainee_women',
							'site_id',
							'site_class',
							'site_status',
							'site_name',
							'site_implementation_id',
							'site_implementation_name',
							'site_type_id',
							'site_type_name',
							'conflict',
							'admin1lng',
							'admin1lat',
							'admin2lng',
							'admin2lat',
							'admin3lat',
							'admin3lng',
							'admin4lat',
							'admin4lng',
							'admin5lat',
							'admin5lng',
							'site_lng',
							'site_lat',
							'createdAt',
							'updatedAt'
						],

					fieldNames = [
							'project_id',
							'project_title',
							'project_description',
							'project_start_date',
							'project_end_date',
							'project_hrp_code',
							'project_code',
							'report_id',
							'report_month',
							'report_year',
							'reporting_period',
							'report_submitted',
							'admin0pcode',
							'admin0name',
							'cluster_id',
							'cluster',
							'organization',
							'organization_tag',
							'training_id',
							'training_title',
							'training_topics',
							'training_start_date',
							'training_end_date',
							'training_days_number',
							'training_conducted_by',
							'training_supported_by',
							'trainee_affiliation_id',
							'trainee_affiliation_name',
							'trainee_health_worker_id',
							'trainee_health_worker_name',
							'trainee_men',
							'trainee_women',
							'site_id',
							'site_class',
							'site_status',
							'site_name',
							'site_implementation_id',
							'site_implementation_name',
							'site_type_id',
							'site_type_name',
							'conflict',
							'admin1lng',
							'admin1lat',
							'admin2lng',
							'admin2lat',
							'admin3lat',
							'admin3lng',
							'admin4lat',
							'admin4lng',
							'admin5lat',
							'admin5lng',
							'site_lng',
							'site_lat',
							'createdAt',
							'updatedAt'
						];
						// return csv

						training_participants.forEach(function( d, i ){
							training_participants[ i ].report_month_number = d.report_month+1;
							training_participants[ i ].report_month = moment( d.reporting_period ).format( 'MMMM' );
							training_participants[ i ].reporting_period = moment( d.reporting_period ).format( 'YYYY-MM-DD' );
						});

						json2csv({ data: training_participants, fields: fields, fieldNames: fieldNames }, function( err, csv ) {

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

			
			// NG WASH
			// accountability
			case 'accountability':

				var data = [];

				// trainings
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

				// trainings
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

				// trainings
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

				// trainings
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

				// trainings
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

				// trainings
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
								if (!beneficiaries.length) return res.json(200, { 'value': 0 });


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
						
										
				break;*/

				//4wDASHBOARDprojectplan

				case 'projects_4wdashboard_projectplan':

				Project
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.admin1pcode )
					.where( filters.admin2pcode )
					.where( filters.cluster_id )
					.where( filters.organization_tag )
					.where(filters.donor_tag)
					.where( filters.project_startDateNative )
					.where( filters.project_endDateNative)
					.exec( function( err, results ){

						//console.log("RESULTADOS: ", results);
				
					//console.log("TAMAÑO RESULTADOS: ", results.length) ;

						// return error
						if (err) return res.negotiate( err );

						// latest update
						return res.json( 200, {'value': results.length} );


					});

				break;

				case 'total_beneficiariespopulation_4wdashboard_projectplan':


				// total sum
				TargetBeneficiaries.native(function(err, collection) {
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
									//total:  { $sum: { $add: [ "$total_beneficiaries" ] } }
									total:  { $sum: { $add: [ "$total_male","$total_female" ] } }
								}
							}
						]
					).toArray(function (err, targetbeneficiaries) {
						if (err) return res.serverError(err);

						var total = targetbeneficiaries[0]?targetbeneficiaries[0].total:0;

						return res.json( 200, { 'value': total } );
					});
				});
				
		


				break;


					case 'total_financing_4wdashboard_projectplan':


				// total sum
				Project.native(function(err, collection) {
					if (err) return res.serverError(err);
				
					collection.aggregate(
						[
							{ 
								$match : filterObject 
							}/*,
							{
								$group:
								{
									_id: null,
									// total:  { $sum: { $add: [ "$men", "$women","$boys","$girls","$elderly_men","$elderly_women" ] } }
									total:  { $sum: { $add: [ "$project_budget" ] } }
								}
							}*/
						]
					).toArray(function (err, project) {

					
                       var totalfinancing = 0;

						project.forEach(function(pro,i){

							
							//console.log("VALOR ENTRA: ",pro.project_budget);

							if(typeof pro.project_budget === 'string'){


								var stringtonum = parseFloat(pro.project_budget);


								if(stringtonum){
									if(pro.project_budget_currency !=='eur' && pro.project_budget_currency !== 'cop'){

										var financing = stringtonum;

									}else if(pro.project_budget_currency ==='eur'){

										var budeurtodollar = stringtonum*params.eurotousd;
 										
 										//console.log("FINAL BUDG EUR STRING: ",budeurtodollar);

									//	console.log("EURO A DOLAR STRING: ",budeurtodollar);
										
										var  financing = budeurtodollar;


									}else if(pro.project_budget_currency ==='cop'){


									/*	var copchange = stringtonum.replace(".",'');

										console.log("DESPUES DE REEMPLAZAR: ",copchange);*/


										var budcoptodollar = stringtonum/params.coptousd;

										//console.log("FINAL BUDG COP STRING: ",budcoptodollar);

										//console.log("PESO COL A USD SSTRING: ",budcoptodollar);
										var financing = budcoptodollar;


									}


								}else{

									var financing = 0;

								}

							}else if(pro.project_budget ){

									if(pro.project_budget_currency !=='eur' && pro.project_budget_currency !== 'cop'){

									var	financing = pro.project_budget;

									}else if(pro.project_budget_currency ==='eur'){

										var budeurtodollar2 = pro.project_budget*params.eurotousd;
 										
 										//console.log("FINAL BUDG EUR NO STRING: ",budeurtodollar2);

									//	console.log("EURO A DOLAR STRING: ",budeurtodollar);
										
										var financing = budeurtodollar2;


									}else if(pro.project_budget_currency ==='cop'){


										var budcoptodollar2 = pro.project_budget/params.coptousd;

										//console.log("FINAL BUDG COP NO STRING: ",budcoptodollar2);

										//console.log("PESO COL A USD SSTRING: ",budcoptodollar);
										var financing = budcoptodollar2;


									}



								} else{	
								//	console.log("NO ES VALIDO: ", valnum);
									var financing =0;
								}

							

							//console.log("VALOR A GUARDAR:", financing);

						totalfinancing = totalfinancing+financing;
					
							
                       });
						//console.log("FINANCING: ", totalfinancing);

						return res.json( 200, { 'value': totalfinancing } );
						//if (err) return res.serverError(err);
						//var total = projectbudget[0]?projectbudget[0].total:0;
						
					});
				});
				
		


				break;



				case 'organizations_4wdashboard_projectplan':
				
				resultsFiltersOrganizations = [];

				if ( params.list ) {

				Project.native(function(err, collection) {

					
					if (err) return res.serverError(err);
				
					collection.aggregate([
						{ 
							$match : filterObject 
						},
						{
							$group: {
								_id: {organization_tag:'$organization_tag', organization:'$organization'}
							}
						}
						]).toArray(function (err, results) {
						
						if (err) return res.serverError(err);

					
							if (err) return res.serverError(err);

							organizations=_.pluck(results,'_id')		
							organizations.sort(function(a, b) {
								//console.log(a.organization.localeCompare(b.organization), "LO QUE RETORNA");
								return a.organization.localeCompare(b.organization);
							});
							organizations.unshift({
											organization_tag: 'all',
											organization: 'ALL',
										});


							return res.json( 200, organizations );



						//return res.json( 200, { 'value': results[0]?results[0].total:0 } );
					});
				});	
			}else {	// count of organizations
					Project.native(function(err, collection) {
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

														//console.log("ORGANIZATIONS2 : ",results);



							return res.json( 200, { 'value': results[0]?results[0].total:0 } );
						});
					});	
				}
				
				break;

				case 'project_donors':

				//console.log("FILTROS: ", filters);

				var donorslist = [];


				Project.find()
				.where(filters.default)
				.where( filters.adminRpcode )
				.where( filters.admin0pcode )
				.where( filters.organization_tag )
				.where( filters.cluster_id)
				.where( filters.donor_tag)
				.where( filters.project_startDateNative )
				.where( filters.project_endDateNative)
				.exec(function (err, results){

					if (err) return res.serverError(err);

						


					if(results.length){


						results.forEach( function( d, i ) {


							if(d.project_donor.length > 0){

								 d.project_donor.forEach(function (projdonor, j){


	                             const resultado = donorslist.find( donor => donor.project_donor_id === projdonor.project_donor_id );

	                             if(!resultado){
	                             	donorslist.push(projdonor);
	                             	//console.log("METI EL DONANTE: ", projdonor);

	                             }
	                            

								});

							};

						});

					  }

					return res.json(200, {'data':donorslist});

					

				});


				break;

				case 'total_donors_4wdashboard_projectplan':


					Project
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.admin1pcode )
					.where( filters.admin2pcode )
					.where( filters.organization_tag )
					.where( filters.beneficiaries )
					.where( filters.cluster_id)
					.where(filters.donor_tag)
					.where( filters.project_startDateNative )
					.where( filters.project_endDateNative)
					.exec( function( err, results ){
						if (err) return res.serverError(err);

						if(results.length){


						results.forEach( function( d, i ) {


							if(d.project_donor.length > 0){

								 d.project_donor.forEach(function (projdonor, j){


	                             const resultado = donorslist.find( donor => donor.project_donor_id === projdonor.project_donor_id );

	                             if(!resultado){
	                             	donorslist.push(projdonor);
	                             	//console.log("METI EL DONANTE: ", projdonor);

	                             }
	                            

								});

							};

						});

					  }
					return res.json(200, {'value':donorslist.length});



					});
				
				
				break;


				case 'total_implementing_partners_4wdashboard_projectplan':



					Project
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.admin1pcode )
					.where( filters.admin2pcode )
					.where( filters.organization_tag )
					.where( filters.beneficiaries )
					.where( filters.cluster_id)
					.where(filters.donor_tag)
					.where( filters.project_startDateNative )
					.where( filters.project_endDateNative)
					.exec( function( err, results ) {
						if (err) return res.serverError(err);

						var imppartners = [];

					  

					if(results.length){

						results.forEach( function( d, i ) {

							if(results[i].implementing_partners){

								 results[i].implementing_partners.forEach(function (d, j){


	                             const resultado = imppartners.find( implementer => implementer.organization_tag === results[i].implementing_partners[j].organization_tag );

	                             if(!resultado){
	                             	imppartners.push(results[i].implementing_partners[j]);
	                             }
	                            

								});

							}

						
                         


						});
					}


						return res.json( 200, { 'value': imppartners.length } );
					});
				

				break;


				case 'implementing_partners_list_4wdashboard_projectplan':

						var imppartners = [];


					Project
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.admin1pcode )
					.where( filters.admin2pcode )
					.where( filters.organization_tag )
					//.where( filters.beneficiaries )
					.where( filters.cluster_id)
					.where(filters.donor_tag)
					.where( filters.project_startDateNative )
					.where( filters.project_endDateNative)
					.exec( function( err, results ) {
						if (err) return res.serverError(err);


					  

					if(results.length){

						results.forEach( function( d, i ) {

							if(d.implementing_partners){

								 d.implementing_partners.forEach(function (implpartner, j){


	                             const resultado = imppartners.find( implementer => implementer.organization_tag === implpartner.organization_tag );

	                             if(!resultado){
	                             	imppartners.push(implpartner);
	                             }
	                            

								});

							}

						});

					}
					return res.json( 200, { 'data': imppartners } );



				});
				

				break;

				// count
			case 'target_locations_4wdashboard_projectplan':

			
					TargetLocation.native(function(err, collection) {
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
						//console.log(results, "RESULTADOS"); 
					

						return res.json( 200, { 'value': results[0]?results[0].total:0 } );
					});
				});

				
				break;	


				//  markers
			case 'markers4wDasbhboardProjectPlan':
					
				// params
				var targetLocations = [],
					markers = {},
					counter = 0,
					length = 0;
				// groupby	
				TargetLocation.native(function(err, collection) {
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
							]).toArray(function (err, targetlocations) {
							  	if (err) return res.serverError(err);
							
								// return no locations
								if ( !targetlocations.length ) return res.json( 200, { 'data': { 'marker0': { layer: 'projects', lat:4.5973254, lng:-74.0759398, message: '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">NO PROJECTS</h5>' } } } );

								// length
								length = targetlocations.length;
								// foreach location
								targetlocations.forEach( function( d, i ){

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
															+ '<div style="text-align:center">' + d._id.email + '</div>';

											
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


				
				default: 
					return res.json( 200, { value:0 });
					break;

		}

	}


};

module.exports = Cluster4wprojectplanDashboardController;
