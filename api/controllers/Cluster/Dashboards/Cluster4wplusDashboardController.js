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

var Cluster4wplusDashboardController = {

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

		       // console.log("REQ PARAM HRPPLAN: ", req.param('hrpplan'));

		

		// request input
		if ( !req.param('indicator') ||
					!req.param('cluster_id') ||
					!req.param('adminRpcode') ||
					!req.param('admin0pcode') ||
					!req.param('organization_tag') ||
					!req.param('project_type_component') ||
					!req.param('hrpplan')||
					!req.param('implementer')||
					!req.param('donor')||
					!req.param('activity_type_id') ||
					!req.param('admin1pcode') ||
					!req.param('admin2pcode') ||

					//!req.param('beneficiaries') ||
					!req.param('start_date') ||
					!req.param('end_date') ) {
			return res.json(401, {err: 'indicator, cluster_id, adminRpcode, admin0pcode, organization_tag, project_type_component, hrpplan, implementer, donor, activity_type, admin1pcode, admin2pcode, start_date, end_date required!'});
		}

		// return params
		return {
			csv: req.param('csv') ? req.param('csv') : false,
			ocha: req.param('ocha') ? req.param('ocha') : false,
			list: req.param('list') ? req.param('list') : false, 
			indicator: req.param('indicator'),
			cluster_id: req.param('cluster_id'),
			cluster_ids: req.param('cluster_ids') ? req.param('cluster_ids') : [req.param('cluster_id')],
			activity_type_id: req.param( 'activity_type_id' ) ? req.param( 'activity_type_id' ) : 'all',
			adminRpcode: req.param('adminRpcode'),
			admin0pcode: req.param('admin0pcode'),
			organization_tag: req.param('organization_tag'),
			project_type_component: req.param('project_type_component'),
			hrpplan: req.param('hrpplan'),
			implementer: req.param('implementer'),
			donor: req.param('donor'),
			admin1pcode: req.param('admin1pcode'),
			admin2pcode: req.param('admin2pcode'),
			//beneficiaries: req.param('beneficiaries'),
			start_date: req.param('start_date'),
			end_date: req.param('end_date'),
			eurotousd: req.param('eur'),
			coptousd: req.param('cop')
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

			project_plan_component: (params.project_type_component === 'all' && params.hrpplan === 'all')
			     ? {}
			     : (params.project_type_component !== 'all' && params.hrpplan === 'all')
			     ? { plan_component: {$in: [params.project_type_component]}}
			     : (params.project_type_component != 'all' && params.hrpplan === 'true')
			     ? { plan_component : {$in: [params.project_type_component,"hrp_plan"]}}
			     //? {  $and: [ { plan_component : {$in: [params.project_type_component]} } , {plan_component: {$in:["hrp_plan"]}}]}

			     : ( params.project_type_component != 'all' && params.hrpplan === 'false')
			     ? { plan_component: {$in:[params.project_type_component], $nin:["hrp_plan"]}}
			     : ( params.project_type_component === 'all' && params.hrpplan === 'true')
			     ? { plan_component: {$in : ["hrp_plan"]}}
			     : { plan_component: { $nin : ["hrp_plan"]}},
			
           cluster_id:  ( params.cluster_id === 'all' || params.cluster_id === 'rnr_chapter' || params.cluster_id === 'acbar' ) 
								? {} 
								: ( params.cluster_id !== 'cvwg' )
									 ?{cluster_id:params.cluster_id}
			                     : {activity_type:{$elemMatch:{'cluster_id':params.cluster_id}}},
			
			implementer_tag: (params.implementer === 'all')
	                            ? {}
	                            : {implementing_partners: { $elemMatch:{'organization_tag':params.implementer} } },

	        donor_tagBenef: (params.donor === 'all')
	                        ? {}
	                       : {  project_donor : { $elemMatch : { 'project_donor_id' : params.donor}}},
	        donor_tagBudget: (params.donor === 'all')
	                        ? {}

	                        : { project_donor_id: params.donor},

	    
			activity_type_id: params.activity_type_id === 'all'  ? {} : { activity_type_id: params.activity_type_id },
			acbar_partners: params.cluster_id === 'acbar' ? { project_acbar_partner: true } : {},
			organization_tag: params.organization_tag === 'all' ? { organization_tag: { '!': $nin_organizations } } : { organization_tag: params.organization_tag },
			
			//date: { or : [{ reporting_period:{'>=': new Date(params.start_date), '<=': new Date(params.end_date)}},{project_budget_date_recieved: {'>=': new Date(params.start_date), '<=': new Date(params.end_date)}}]},
             
            report_period_ben: {reporting_period:{'>=': new Date(params.start_date), '<=': new Date(params.end_date)}},
            budget_date_recieved: {project_budget_date_recieved: {'>=': new Date(params.start_date), '<=': new Date(params.end_date)}}, 

            project_startDate: { project_start_date : {'>=': new Date( params.start_date)}},
			project_endDate: { project_end_date : {'<=': new Date( params.end_date)}},


			adminRpcode_Native: params.adminRpcode === 'hq'  ? {} : { adminRpcode: params.adminRpcode.toUpperCase() },
			admin0pcode_Native: params.admin0pcode === 'all' ? {} : { admin0pcode: params.admin0pcode.toUpperCase() },
			admin1pcode_Native: params.admin1pcode === 'all' ? {} : { admin1pcode: params.admin1pcode.toUpperCase() },
			admin2pcode_Native: params.admin2pcode === 'all' ? {} : { admin2pcode: params.admin2pcode.toUpperCase() },
		/*cluster_id_Native: ( params.cluster_id === 'all' || params.cluster_id === 'rnr_chapter' || params.cluster_id === 'acbar' ) 
								? {} 
								: ( params.cluster_id !== 'cvwg' )
								
			                  ?{ $or:[{cluster_id:params.cluster_id},{inter_cluster_activities:{$elemMatch:{'cluster_id':params.cluster_id}}}]}
			                    : {inter_cluster_activities:{$elemMatch:{'cluster_id':params.cluster_id}}}, */  
			
             cluster_id_Native1:( params.cluster_id === 'all' || params.cluster_id === 'rnr_chapter' || params.cluster_id === 'acbar' ) 
								? {} 
								: { cluster_id: params.cluster_id } ,
			cluster_id_Native2:( params.cluster_id === 'all' || params.cluster_id === 'rnr_chapter' || params.cluster_id === 'acbar' ) 
								? {} 
								: { activity_type: { $elemMatch:{cluster_id:params.cluster_id}}} ,

								 //: { $in:[{ cluster_id: params.cluster_id }, { inter_cluster_activities: { $elemMatch:{cluster_id:params.cluster_id} }} ]} ,
			project_plan_componentNative: (params.project_type_component === 'all' && params.hrpplan === 'all')
			     ? {}
			     : (params.project_type_component !== 'all' && params.hrpplan === 'all')
			     ? { plan_component: {$in: [params.project_type_component]}}
			     : (params.project_type_component != 'all' && params.hrpplan === 'true')
			     ? {  plan_component : {$in: [params.project_type_component, "hrp_plan"]}} 
			     //? { plan_component : {$in: [params.project_type_component,"hrp_plan"]}}
			     : ( params.project_type_component != 'all' && params.hrpplan === 'false')
			     ? { plan_component: {$in:[params.project_type_component], $nin:["hrp_plan"]}}
			     : ( params.project_type_component === 'all' && params.hrpplan === 'true')
			     ? { plan_component: {$in : ["hrp_plan"]}}
			     : { plan_component: { $nin : ["hrp_plan"]}},


			implementer_tagNative: ( params.implementer === 'all')
	                            ? {}
	                     
	                           : { implementing_partners: { $elemMatch: { 'organization_tag' : params.implementer} }},
					 
	         donor_tagBenef_Native: (params.donor === 'all')
	                        ? {}
	                       : {  project_donor : { $elemMatch : { 'project_donor_id' : params.donor}}},
									/*  : { project_donor_id: params.donor}*/
	        donor_tagBudget_Native: (params.donor === 'all')
	                        ? {}

	                        : { project_donor_id: params.donor},
	                      

			cluster_ids_Native: ( params.cluster_ids.includes('all') || params.cluster_ids.includes('rnr_chapter') || params.cluster_ids.includes('acbar') ) 
								? {} 
								: ( params.cluster_ids.includes('cvwg') )
								
			                     ?{$or:[{cluster_id:params.cluster_id},{activity_type:{ $elemMatch:{'cluster_id':params.cluster_id}}}]}
			                    :{activity_type:{ $elemMatch:{'cluster_id':params.cluster_id}}},
			                 
			is_cluster_ids_array: params.cluster_ids ? true : false,

			organization_tag_Native: params.organization_tag === 'all' ? { organization_tag: { $nin: $nin_organizations } } : { organization_tag: params.organization_tag },
			//dateNative: { $or : [{ reporting_period:{$gte: new Date(params.start_date), $lte: new Date(params.end_date)}},{project_budget_date_recieved: {$gte: new Date(params.start_date), $lte: new Date(params.end_date)}}]},
            report_period_ben_Native: {reporting_period:{$gte: new Date(params.start_date), $lte: new Date(params.end_date)}},
            budget_date_recieved_Native: {project_budget_date_recieved: {$gte: new Date(params.start_date), $lte: new Date(params.end_date)}}, 

             project_startDateNative: { project_start_date : { $lte : new Date( params.end_date) }},
			project_endDateNative: { project_end_date: { $gte: new Date( params.start_date) }},
			



		}
	},

	// indicators
	getIndicator: function ( req, res  ) {
		
         var params = Cluster4wplusDashboardController.getParams( req, res );

		var filters = Cluster4wplusDashboardController.getFilters( params );
		// match clause for native mongo query

		
		/*var filterObject = _.extend({},	filters.default_Native,
										filters.adminRpcode_Native,
										filters.admin0pcode_Native,
										filters.admin1pcode_Native,
										filters.admin2pcode_Native,
										filters.activity_type_id,
										filters.cluster_id_Native,

										
										//filters.is_cluster_ids_array ? filters.cluster_id : filters.cluster_id_Native,
										//filters.is_cluster_ids_array ? filters.cluster_id : filters.cluster_id_Native,

										filters.acbar_partners,
										filters.organization_tag_Native,
										filters.hrp_plan_Native,
										filters.project_typeNative,
										filters.implementer_tagNative,
										filters.donor_tagNative,
										//filters.beneficiaries,
										//filters.date_Native,
										//filters.project_startDateNative,
										//filters.project_endDateNative
										//filters.dateNative,
										filters.report_period_ben,
										filters.budget_date_recieved
										//filters.delivery_type_id()
										//filters.is_cluster_ids_array ? filters.cluster_ids_Native : filters.cluster_id_Native,
										//filters.cluster_id,
										//filters.cluster_id,


           );*/

           var filterObjectBudget = _.extend({},	filters.default_Native,
										filters.adminRpcode_Native,
										filters.admin0pcode_Native,
										filters.admin1pcode_Native,
										filters.admin2pcode_Native,
										filters.activity_type_id,
										filters.cluster_id_Native1,
										filters.acbar_partners,
										filters.organization_tag_Native,
										filters.project_plan_componentNative,
										filters.implementer_tagNative,
										filters.donor_tagBudget_Native,
										filters.budget_date_recieved_Native
							


           );

		var filterObjectBenef = _.extend({},	filters.default_Native,
										filters.adminRpcode_Native,
										filters.admin0pcode_Native,
										filters.admin1pcode_Native,
										filters.admin2pcode_Native,
										filters.activity_type_id,
										filters.cluster_id_Native1,
										filters.acbar_partners,
										filters.organization_tag_Native,
										filters.project_plan_componentNative,
										filters.implementer_tagNative,
										filters.donor_tagBenef_Native,
										filters.report_period_ben_Native
										


           );


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
					.where( filters.clusterid )
					.where( filters.activity_type_id )
					.where( filters.organization_tag )
					.where( filters.project_plan_componentNative)
					.where( filters.implementer_tag)
					.where(filters.donor_tagBenef)
					//.where( filters.beneficiaries )
					.where(filters.report_period_ben)
					
					//.where( filters.date )
					.sort( 'updatedAt DESC' )
					.limit(1)
					.exec( function( err, results ){

						// return error
						if (err) return res.negotiate( err );

						// latest update
						return res.json( 200, results[0] );

					});

				

				break;

			
				//4wDASHBOARDplus


				//activities activity_type

				case 'implementing_partners':
          
                   //console.log("FILTROS IMPLEMENTING PARERS:" ,filters);
                   //console.log("FILTEROBJECT", filterObject );
                 var imppartners = [];
              
				Beneficiaries
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.admin1pcode )
					.where( filters.admin2pcode )
					.where( filters.organization_tag )
					.where( filters.project_plan_componentNative)
					.where( filters.beneficiaries )
					.where( filters.cluster_id)
					.where( filters.implementer_tag)
					//.where( filters.donor_tag)
					.where(filters.donor_tagBenef)
					.where( filters.activity_type_id)
					.where(filters.report_period_ben)
					.exec( function( err, results ) {
						
						if (err) return res.serverError(err);

						//var imppartners = [];


					if(results.length){

						//console.log("RESULTADOS: ",results);

						results.forEach( function( d, i ) {

							if(d.implementing_partners){

								 d.implementing_partners.forEach(function (partner, j){

								 	if(partner.organization_tag){
								 	//console.log("RESULTS EN BENEF: ", partner);


			                             const resultado = imppartners.find( implementer => implementer.organization_tag === partner.organization_tag );

			                             if(!resultado){
			                             	imppartners.push(partner);
			                             }

			                         }
	                            

								});

							}
                        
						});

						var partben = imppartners;
					}

					BudgetProgress
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.admin1pcode )
					.where( filters.admin2pcode )
					.where( filters.organization_tag )
					.where( filters.project_plan_componentNative)
					.where( filters.beneficiaries )
					.where( filters.cluster_id)
					.where( filters.implementer_tag)
					//.where( filters.donor_tag)
					.where(filters.donor_tagBudget)
					.where( filters.activity_type_id)
					//.where( filters.project_startDateNative )
					//.where( filters.project_endDateNative)
					.where(filters.budget_date_recieved)
					.exec( function( err, result ) {
						
						if (err) return res.serverError(err);

						//var imppartners = [];


					if(result.length){


						result.forEach( function( d, i ) {

							if(d.implementing_partners){

								d.implementing_partners.forEach(function(partner,j){
									if(partner){

										if(partner.organization_tag){
										const resultado = imppartners.find( implementer => implementer.organization_tag === partner.organization_tag);

											if (!resultado){
												//console.log("RESULTS en BUDGETPROGRESS: ", partner);
												imppartners.push(partner);
											//	console.log("PROJECT EN BUDGET: ", d.project_id);
											}
										}
									}
								})
							}
                        
						});
					  }
					  return res.json( 200, { 'data': imppartners } );

					});

					

				});


				break;

				//DONORS LIST

				case 'project_donors':

                 var donorslist = [];
              
				
					Beneficiaries
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.admin1pcode )
					.where( filters.admin2pcode )
					.where( filters.organization_tag )
					.where( filters.project_plan_componentNative)
					.where( filters.beneficiaries )
					.where( filters.cluster_id)
					.where( filters.implementer_tag)
					.where(filters.donor_tagBenef)
					.where( filters.activity_type_id)
					//.where( filters.project_startDateNative )
					//.where( filters.project_endDateNative)
					.where(filters.report_period_ben)
					.exec( function( err, results ) {
						
						if (err) return res.serverError(err);

						//var imppartners = [];


					if(results.length){


						results.forEach( function( d, i ) {


							if(d.project_donor){

								 d.project_donor.forEach(function (donororg, j){


	                             const resultado = donorslist.find( donor => donor.project_donor_id === donororg.project_donor_id );

	                             if(!resultado){
	                             	donorslist.push(donororg);
	                             }
	                            

								});

							}
                        
						});
					}


					BudgetProgress
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.admin1pcode )
					.where( filters.admin2pcode )
					.where( filters.organization_tag )
					.where( filters.project_plan_componentNative)
					.where( filters.beneficiaries )
					.where( filters.cluster_id)
					.where( filters.implementer_tag)
					//.where( filters.donor_tag)
					.where(filters.donor_tagBudget)
					.where( filters.activity_type_id)
					//.where( filters.project_startDateNative )
					//.where( filters.project_endDateNative)
					.where(filters.budget_date_recieved)
					.exec( function( err, result ) {
						
						if (err) return res.serverError(err);

						//var imppartners = [];


					if(result.length){


						result.forEach( function( d, i ) {
							
							const resultado = donorslist.find( donor => donor.project_donor_id === d.project_donor_id );

			                             if(!resultado){

			                             	var donortoadd = {
			                             		'project_donor_id':d.project_donor_id,
			                             		'project_donor_name':d.project_donor_name
			                             	}
			                             	donorslist.push(donortoadd);
			                             }
                        
						});

					  }
					  return res.json( 200, { 'data': donorslist } );

					});

					

				});


				break;


				case 'activities_activity_type':




				activities = [];

				if(filters.clusterid === 'all'){

					Activities
					.find()
					.where( filters.default )
					.where( filters.admin0pcode )
			
					.exec( function( err, result ){


						if (err) return res.negotiate( err );


						result.forEach(function(d,i){

							exist = activities.find(act => act.activity_type_id === d.activity_type_id);

							if(!exist){
								activities.push(d);
							}
						});


					return res.json(200, { 'data': activities } );
					});


				}else{



		         	Activities
					.find()
					.where( filters.default )
					.where( filters.admin0pcode )
					.where( filters.cluster_id)
					//.where( filters.activity_type)
			
					.exec( function( err, result ){


						if (err) return res.negotiate( err );

						result.forEach(function(d,i){

							exist = activities.find(act => act.activity_type_id === d.activity_type_id);

							if(!exist){
								activities.push(d);
							}



						});


						return res.json(200, { 'data': activities } );

					});
				};

				
				break;



				case 'projects_4wplusdashboard':


				//console.log("FILTERS: ",filters.project_type);
				



					total_projects = [];

					 Beneficiaries.native(function(err, collection) {
					if (err) return res.serverError(err);
				
					collection.aggregate([
						{ 
							//$match : filterObject 
							$match: filterObjectBenef
						},
						{
							$group: {
								_id: {project_id:'$project_id'}
							}
						}

					]).toArray(function (err, result) {
						if (err) return res.serverError(err);

						projects=_.pluck(result,'_id')		
							projects.sort(function(a, b) {
								if(a.project_id !== null && b.project_id !== null ){
								
								return a.project_id.localeCompare(b.project_id);
							   }
							});

						projects.forEach(function(d,i){

							const exist = total_projects.find(proj => proj.project_id === d.project_id);

										
										if(!exist){

											total_projects.push(d);
											//añadidos = añadidos+1;

										}else{
										}


								});

						BudgetProgress.native(function(err, collection) {
						if (err) return res.serverError(err);
					
						collection.aggregate([
							{ 
								//$match : filterObject 
								$match: filterObjectBudget
							},
							{
							$group: {
								_id: {project_id:'$project_id'}
							}
						}
						]).toArray(function (err, resultbudg) {

							if(err) return res.negotiate(err);

							projectsbud=_.pluck(resultbudg,'_id')		
							projectsbud.sort(function(a, b) {

								if(a.project_id !== null && b.project_id !== null ){
									
									return a.project_id.localeCompare(b.project_id);
								}
							});


			              	projectsbud.forEach(function(d,i){

			              		const exist = total_projects.find(proj => proj.project_id === d.project_id);

			              		if(!exist){
			              			total_projects.push(d);
			              		}else{
			              		}
			              	});
				

			              	return res.json(200,{'value':total_projects.length});

			              });
						


					});
					});
				});

				
				break;

				case 'organizations_4wplusdashboard':
				

				if ( params.list ) {

					organizationList = [];

					organizationList.unshift({
											organization_tag: 'all',
											organization: 'ALL',
										});


				Beneficiaries.native(function(err, collection) {

					
					if (err) return res.serverError(err);
				
					collection.aggregate([
						{ 
							//$match : filterObject 
							$match:filterObjectBenef
						},
						{
							$group: {
								_id: {organization_tag:'$organization_tag', organization:'$organization'}
							}
						}
						]).toArray(function (err, results) {
						
						if (err) return res.serverError(err);


							organizations=_.pluck(results,'_id')		
							organizations.sort(function(a, b) {
								return a.organization.localeCompare(b.organization);
							});
							
							organizations.forEach( function( d, i ) {

							 		if(d.organization_tag){

							 			const resultado = organizationList.find( org => org.organization_tag === d.organization_tag );

							 			if(!resultado){

							 				organizationList.push(d);

							 			}
								 			
			                            
										}
									
						    	});

					BudgetProgress.native(function(err, collection) {
						if (err) return res.serverError(err);
					
						collection.aggregate([
							{ 
								//$match : filterObject 
								$match: filterObjectBudget
							},
							{
								$group: {
								_id: {organization_tag:'$organization_tag', organization:'$organization'}

								}
							}/*,
							{
								$group: {
									_id: 1,
									total: {
									$sum: 1
									}
								}
							}*/
						]).toArray(function (err, resultsbudg) {

								if (err) return res.serverError(err);



						   organizationsBudget=_.pluck(resultsbudg,'_id')		
							organizationsBudget.sort(function(a, b) {
								return a.organization.localeCompare(b.organization);
							});


								   organizationsBudget.forEach( function( d, i ) {

							 		if(d.organization_tag){

							 			const resultado = organizationList.find( org => org.organization_tag === d.organization_tag );

							 			if(!resultado){

							 				organizationList.push(d);


							 			}
								 			
			                            
										}
									
						    	});
                              
                              


							return res.json(200, organizationList);



						});
					});

					});
				});	



			}else {	

				resultsFiltersOrganizations = [];

					Beneficiaries.native(function(err, collection) {
						if (err) return res.serverError(err);
					
						collection.aggregate([
							{ 
								//$match : filterObject 
								$match: filterObjectBenef
							},
							{
								$group: {
									_id: {organization_tag:'$organization_tag', organization:'$organization'}
								}
							}/*,
							{
								$group: {
									_id: 1,
									total: {
									$sum: 1
									}
								}
							}*/
						]).toArray(function (err, results) {

							  organizations=_.pluck(results,'_id')		
							organizations.sort(function(a, b) {
								return a.organization.localeCompare(b.organization);
							});

							organizations.forEach(function(d,i){

								const exist = resultsFiltersOrganizations.find(orgbenef => orgbenef.organization === d.organization)

								if(!exist){

									resultsFiltersOrganizations.push(d);
									
								}

							});

						BudgetProgress.native(function(err, collection) {
						if (err) return res.serverError(err);
					
						collection.aggregate([
							{ 
								//$match : filterObject 
								$match: filterObjectBudget
							},
							{
								$group: {
									_id: {organization_tag:'$organization_tag', organization:'$organization'}
								}
							}/*,
							{
								$group: {
									_id: 1,
									total: {
									$sum: 1
									}
								}
							}*/
						]).toArray(function (err, resultsBudg) {

							


							organizationsBudget=_.pluck(resultsBudg,'_id')		
							organizationsBudget.sort(function(a, b) {
								return a.organization.localeCompare(b.organization);
							});


						   organizationsBudget.forEach( function( d, i ) {

							 		

							 			const resultado = resultsFiltersOrganizations.find( org => org.organization === d.organization );

							 			if(!resultado){

							 				resultsFiltersOrganizations.push(d);
							 		


							 			}
						    	});
			
							return res.json(200, {'value': resultsFiltersOrganizations.length});
						});
					});	
				  });
				});	


			}
				
				break;

				/*case 'total_donors_4wplusdashboard':


					Beneficiaries
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.admin1pcode )
					.where( filters.admin2pcode )
					.where( filters.organization_tag )
					.where( filters.hrp_plan)
					.where( filters.beneficiaries )
					.where( filters.cluster_id)
					.where( filters.project_startDateNative )
					.where( filters.project_endDateNative)
					.exec( function( err, results ){
						if (err) return res.serverError(err);

						var donors = [];
						if(results.length){

								

							 	results.forEach( function( d, i ) {

							 		if(results[i].project_donor){
								 			results[i].project_donor.forEach(function (d, j){


				                             const resultado = donors.find( donante => donante.project_donor_id === results[i].project_donor[j].project_donor_id );

				                             if(!resultado){
				                             	donors.push(results[i].project_donor[j]);
				                             }
			                            
										});

							 		}
									
						    	});

						}
						return res.json(200, {'value':donors.length});


					});
				
				
				break;*/

		       case 'beneficiaries_4wplusdashboard':

				// total sum
				Beneficiaries.native(function(err, collection) {
					if (err) return res.serverError(err);

				
					collection.aggregate(
						[
							{ 
							//	$match : filterObject 
							$match: filterObjectBenef
							},
							{
								$group:
								{
									_id: null,
									// total:  { $sum: { $add: [ "$men", "$women","$boys","$girls","$elderly_men","$elderly_women" ] } }
									//total:  { $sum: { $add: [ "$total_beneficiaries" ] } }
									total: {$sum:{$add:['$total_male','$total_female']}}
								}
							}
						]
					).toArray(function (err, beneficiaries) {
						if (err) return res.serverError(err);

						var total = beneficiaries[0]?beneficiaries[0].total:0;

						return res.json( 200, { 'value': total } );
					});
				});
				/*totalBeneficiariesAll = 0;

				Beneficiaries
					.find()
					.where( filters.default_Native )
					.where( filters.adminRpcode_Native )
					.where( filters.admin0pcode_Native )
					.where( filters.admin1pcode_Native )
					.where( filters.admin2pcode_Native )
					.where( filters.organization_tag_Native )
					.where( filters.project_plan_componentNative)
					.where( filters.cluster_id_Native1)
					.where( filters.implementer_tagNative)
					.where(filters.donor_tagBenef_Native)
					.where( filters.activity_type_id)
					.where(filters.report_period_ben_Native)
					.exec( function( err, results ){
					
						if (err) return res.negotiate( err );

						if(results.length){

							counter = 0;

						    length = results.length;


							results.forEach(function(benefrecordAll,i){

								if(benefrecordAll.total_male && benefrecordAll.total_female){
									totalBeneficiariesAll = totalBeneficiariesAll + benefrecordAll.total_male + benefrecordAll.total_female;
									console.log("SI")
								}else if(benefrecordAll.boys&&benefrecordAll.girls&&benefrecordAll.men &&benefrecordAll.women && benefrecordAll.elderly_women &&benefrecordAll.elderly_men){
									totalBeneficiariesAll = totalBeneficiariesAll + benefrecordAll.boys + benefrecordAll.girls + benefrecordAll.men +benefrecordAll.women + benefrecordAll.elderly_women +benefrecordAll.elderly_men;
								console.log("NO 1")
								}else{
									totalBeneficiariesAll = totalBeneficiariesAll + benefrecordAll.total_beneficiaries;
								console.log("NO 2")
								}

								counter++;
			                    if ( counter === length ) {
			                      // table
									return res.json( 200, {'value': totalBeneficiariesAll} );
			                    }


							});
						}else{


							return res.json( 200, {'value': results.length} );

						}
					});*/
				
				break;

				case 'budgetprogress_4wplusdashboard':

				/*BudgetProgress.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.admin1pcode )
					.where( filters.admin2pcode )
					.where( filters.cluster_id)

					.where( filters.organization_tag )
					.where( filters.project_plan_componentNative)
					.where( filters.beneficiaries )
					.where( filters.implementer_tag)
					//.where( filters.donor_tag)
					.where(filters.donor_tagBudget)
					.where( filters.activity_type_id)
					.where(filters.budget_date_recieved)
					.exec( function( err, budgetprogress )  {*/
						BudgetProgress.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObjectBudget
								},
								/*{
									$group:{
										_id: {cluster_id:'$cluster_id',cluster: '$cluster', project_budget_currency:'$project_budget_currency'},
										totalBudgetProgress: {
											$sum:  "$project_budget_amount_recieved"
										},
										

									}
								}*/
							]).toArray(function (err, budgetprogress) {
						if (err) return res.serverError(err);



						var total_budget_progress = 0;

						budgetprogress.forEach(function(budpro,i){

							//console.log("Cada Uno: ",budpro.project_budget_amount_recieved + '  - '+budpro.currency_id);

							var bpamount = 0;

							if(budpro.currency_id !== 'eur' && budpro.currency_id !== 'cop'){

								bpamount = budpro.project_budget_amount_recieved;
							}else if(budpro.currency_id ==='eur'){

								bpamount = budpro.project_budget_amount_recieved * params.eurotousd;
			
							}else if(budpro.currency_id ==='cop'){

								

								valuetostring=budpro.project_budget_amount_recieved.toString();


								newnumber2=valuetostring.replace(".",'');

								finalnumber = parseFloat(newnumber2);
								

								bpamount = finalnumber / params.coptousd;


							
							}


							total_budget_progress = total_budget_progress+bpamount;

						});

						return res.json( 200, { 'value': total_budget_progress } );
					});
						});
			
				
				break;


				case 'total_implementing_partners_4wplus':

				var imppartners = [];


						Beneficiaries.native(function(err, collection) {
					if (err) return res.serverError(err);
				
					collection.aggregate([
						{ 
							//$match : filterObject 
							$match: filterObjectBenef
						}

					]).toArray(function (err, results) {
						if (err) return res.serverError(err);


					if(results.length){

						results.forEach( function( d, i ) {
								//console.log("IMPL TOTAL BENEF: ", d.project_id);


							if(d.implementing_partners){

								d.implementing_partners.forEach(function (im, j){

									if(im.organization_tag){


			                             const resultado = imppartners.find( implementer => implementer.organization_tag === im.organization_tag );

			                             if(!resultado){
			                             	imppartners.push(im);
			                             }

			                         }
	                            

								});

							}

						});
					   var partners =	imppartners;

					
				    }


						BudgetProgress.native(function(err, collection) {
						if (err) return res.serverError(err);
					
						collection.aggregate([
							{ 
								//$match : filterObject 
								$match: filterObjectBudget
							}
						]).toArray(function (err, resultsbudg) {

								if (err) return res.serverError(err);

						//var imppartners = [];


					if(resultsbudg.length){


						resultsbudg.forEach( function( d, i ) {


							if(d.implementing_partners){

								 d.implementing_partners.forEach(function (im, j){

								 	if(im.organization_tag){

									 const resultado = imppartners.find( implementer => implementer.organization_tag === im.organization_tag );

				                             if(!resultado){
				                             //	console.log("IMPL: ",result[i].implementing_partners[j]);
				                             	imppartners.push(im);
				                             	

				                             }

				                       }

								});

							}
                        
						});
					  }
					 
					  return res.json( 200, { 'value': imppartners.length } );

					});
			



					});
					});

				});
				

				break;

				// count
			case 'locations_4wplusDashboard':

			 locationsTotal = [];

			
			 Beneficiaries.native(function(err, collection) {
					if (err) return res.serverError(err);
				
					collection.aggregate([
						{ 
							//$match : filterObject 
							$match: filterObjectBenef
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
						}/*,
						{
							$group: {
								_id: 1,
								total: {
								$sum: 1
								}
							}
						}*/
					]).toArray(function (err, results) {
						if (err) return res.serverError(err);
						//console.log(results, "RESULTADOS"); 




						results.forEach(function(d,i){

							const exist = locationsTotal.find(locat => (locat.site_lat === d.site_lat && locat.site_lng === d.site_lng));

							if(!exist){

								locationsTotal.push(d._id);
							}

						});



				BudgetProgress.native(function(err, collection) {
					if (err) return res.serverError(err);
				
					collection.aggregate([
						{ 
							//$match : filterObject 
							$match: filterObjectBudget
						},
						{
							$group: {
								_id: {
									project_id: '$project_id',
									admin2lat: '$admin2lat',
									admin2lng: '$admin2lng',
									admin1name: '$admin1name',
									admin2name: '$admin2name'
								}
							}
						}/*,
						{
							$group: {
								_id: 1,
								total: {
								$sum: 1
								}
							}
						}*/
					]).toArray(function (err, resultsLocations) {

					//	console.log("RESULTADOS BUDGETPRO: ",resultsLocations);

						

						resultsLocations.forEach(function(d,i){

							const exist = locationsTotal.find(locati => (locati.site_lat === d._id.admin2lat && locati.site_lng === d._id.admin2lng));

							if(!exist){

								objlocat = {
									
									project_id: d._id.project_id,
									site_lat: d._id.admin2lat,
									site_lng: d._id.admin2lng,
								    site_name: d._id.admin2name + ', '+d._id.admin1name

								};

								locationsTotal.push(objlocat);
							}

						});


				    return res.json(200, {'value': locationsTotal.length});

					});
				  });
			    });
		     
		     });

				
				break;	


				//  markers
			case 'markers4wplusDasbhboard':
					
				// params
				var locationsMarkTotal = [],
					markers = {},
					counter = 0,
					length = 0;
				// groupby	
				Beneficiaries.native(function(err, collection) {
							if (err) return res.serverError(err);
						  
							collection.aggregate([
								{ 
									//$match : filterObject 
									$match: filterObjectBenef
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
										plan_component: '$plan_component',
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
							]).toArray(function (err, results) {
							  	if (err) return res.serverError(err);


							  	results.forEach(function(d,i){

							const exist = locationsMarkTotal.find(locat => (locat._id.site_lat === d.site_lat && locat._id.site_lng === d.site_lng));

							if(!exist){

								locationsMarkTotal.push(d);
							}

						});



					BudgetProgress.native(function(err, collection) {

							if (err) return res.serverError(err);
						
							collection.aggregate([
								{ 
									//$match : filterObject 
									$match: filterObjectBudget
								},
								{
									$group: {
										_id: {
											project_id: '$project_id',
											admin2lat: '$admin2lat',
											admin2lng: '$admin2lng',
											admin1name: '$admin1name',
											admin2name: '$admin2name',
											cluster:'$cluster',
												organization:'$organization',
												plan_component: '$plan_component',
												project_title:'$project_title',
												admin0name:'$admin0name',
												admin3name:'$admin3name',
												admin4name:'$admin4name',
												admin5name:'$admin5name',
												cluster_id:'$cluster_id',
												site_type_name:'$site_type_name',
												name:'$name',
												position:'$position',
												phone:'$phone', 
												email:'$email'
										}
									}
								}/*,
								{
									$group: {
										_id: 1,
										total: {
										$sum: 1
										}
									}
								}*/
							]).toArray( function (err, resultsLocations) {

							   resultsLocations.forEach(function(d,i){
	 
								const exist = locationsMarkTotal.find(locati => (locati._id.site_lat === d._id.admin2lat && locati._id.site_lng === d._id.admin2lng));

								if(!exist){


									d._id = {
										
										project_id: d._id.project_id,
										site_lat: d._id.admin2lat,
										site_lng: d._id.admin2lng,
									    site_name: d._id.admin2name + ', '+d._id.admin1name,
										admin1name: d._id.admin1name,
										admin2name: d._id.admin2name,
										cluster: d._id.cluster,
											organization: d._id.organization,
											plan_component: d._id.plan_component,
											project_title: d._id.project_title,
											admin0name: d._id.admin0name,
											admin3name: d._id.admin3name,
											admin4name: d._id.admin4name,
											admin5name: d._id.admin5name,
											cluster_id: d._id.cluster_id,
											site_type_name: d._id.site_type_name,
											name: d._id.name,
											position:d._id.position,
											phone:d._id.phone, 
											email: d._id.email

									};

									locationsMarkTotal.push(d);
								}

						    	});


					    	 // return no locations
								if ( !locationsMarkTotal.length ) return res.json( 200, { 'data': { 'marker0': { layer: 'projects', lat:4.5973254, lng:-74.0759398, message: '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">NO PROJECTS</h5>' } } } );

								// length
								length = locationsMarkTotal.length;

								// foreach location
								locationsMarkTotal.forEach( function( d, i ){

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
                      }); // close BudgetProgress
                    }); 
                 }); //close beneficiaries

				        
				      
                break;

                //Work in Graphics


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
									//$match : filterObject
									$match: filterObjectBenef
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
										elderTotal: { $sum: { $add: ["$elderly_men", "$elderly_women"] } },
										maleTotal: { $sum: "$total_male"},
										femaleTotal: { $sum: "$total_female"},
										sexTotal: { $sum: { $add: ["$total_male","$total_female"]}},
										age_0_5: { $sum: {$add: ["$boys_0_5","$girls_0_5"]}},
										age_6_11: { $sum: {$add: ["$boys_6_11","$girls_6_11"]}},
										age_12_17: { $sum: {$add: ["$boys_12_17","$girls_12_17"]}}
									}
								}
							]).toArray(function (err, beneficiaries) {
								if (err) return res.serverError(err);								

								// if no length
									if (!beneficiaries.length) {
									result.data[0].y = 100;
									result.data[0].label = 0;
									result.data[0].color = '#c7c7c7';
									return res.json(200, result);
								}


								$beneficiaries = beneficiaries[0];


								switch (req.param('chart_for')) {
									case 'children':
										if ($beneficiaries.femaleTotal < 1 && $beneficiaries.maleTotal < 1) {

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

											//var malePerCent = ($beneficiaries.maleTotal / ($beneficiaries.maleTotal + $beneficiaries.femaleTotal))*100;
											//var femalePerCent = ($beneficiaries.femaleTotal / ($beneficiaries.maleTotal + $beneficiaries.femaleTotal))*100;
											
											var malePerCent = ($beneficiaries.maleTotal / $beneficiaries.sexTotal)*100;
											var femalePerCent = ($beneficiaries.femaleTotal / $beneficiaries.sexTotal)*100;
											var sexTotalPerCent = ($beneficiaries.sexTotal/ ($beneficiaries.maleTotal+$beneficiaries.femaleTotal))*100 ;

											result.label.left.label.label = malePerCent;
											result.label.left.subLabel.label = $beneficiaries.maleTotal;
											// assign data center

											result.label.center.label.label = sexTotalPerCent;
											result.label.center.subLabel.label = $beneficiaries.sexTotal;
											// assign data right
											result.label.right.label.label = femalePerCent;
											result.label.right.subLabel.label = $beneficiaries.femaleTotal;

											// highcharts girls
											result.data[0].y = femalePerCent;
											result.data[0].label = $beneficiaries.sexTotal;
											// highcharts boys
											result.data[1].y = malePerCent;
											result.data[1].label = $beneficiaries.sexTotal;


											
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


				case 'BarChartAges':
			// labels
				var result = {
					
								data: [
								{
									'y': 0,
									'color': '#f48fb1',
									'name': '0-5',
									'label': 0,
									
								},{
									'y': 0,
									'color': '#90caf9',
									'name': '6-11',
									'label': 0,
								},
								{
									'y': 0,
									'color': 'red',
									'name': '12-17',
									'label': 0,
								},
								{
									'y': 0,
									'color': 'blue',
									'name': '18-59',
									'label': 0,

								},{
									'y': 0,
									'color': 'orange',
									'name': '60 more',
									'label': 0,

								}]
							};
						// beneficiaries
						
										
						Beneficiaries.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObjectBenef
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
										elderTotal: { $sum: { $add: ["$elderly_men", "$elderly_women"] } },
										maleTotal: { $sum: "$total_male"},
										femaleTotal: { $sum: "$total_female"},
										sexTotal: { $sum: { $add: ["$total_male","$total_female"]}},
										age_0_5: { $sum: {$add: ["$boys_0_5","$girls_0_5"]}},
										age_6_11: { $sum: {$add: ["$boys_6_11","$girls_6_11"]}},
										age_12_17: { $sum: {$add: ["$boys_12_17","$girls_12_17"]}},
										age_18_59: { $sum: {$add: ["$men","$women"]}},
										age_60_more: { $sum: {$add: ["$elderly_men","$elderly_women"]}}
									}
								}
							]).toArray(function (err, beneficiaries) {
								if (err) return res.serverError(err);								

								// if no length
								if (!beneficiaries.length) {
									result.data[0].y = 0;
									result.data[0].label = 0;
									result.data[0].color = '#c7c7c7';
									return res.json(200, result);
								}


								$beneficiaries = beneficiaries[0];


								switch (req.param('chart_for')) {
									

									case 'ages':
										if ($beneficiaries.maleTotal < 1 && $beneficiaries.femaleTotal < 1) {

										
											result.data[0].y = 0;
											result.data[0].label = 0;
											result.data[0].color = '#c7c7c7';
											// // highcharts elderly_men
											result.data[1].y = 0;
											result.data[1].label = 0;
											result.data[1].color = '#c7c7c7';


											result.data[2].y = 0;
											result.data[2].label = 0;
											result.data[2].color = '#c7c7c7';

											result.data[3].y = 0;
											result.data[3].label = 0;
											result.data[3].color = '#c7c7c7';

											result.data[4].y = 0;
											result.data[4].label = 0;
											result.data[4].color = '#c7c7c7';

											


											
											return res.json(200, result);

										} else {
											// calc

											var mensPerCent = ($beneficiaries.men / ($beneficiaries.men + $beneficiaries.women)) * 100;
											var womensPerCent = ($beneficiaries.women / ($beneficiaries.men + $beneficiaries.women)) * 100;
											var totalPerCent = ($beneficiaries.adultTotal / ($beneficiaries.elderTotal + $beneficiaries.adultTotal + $beneficiaries.childTotal)) * 100;
										
											

											var TotalAge_0_5 = $beneficiaries.age_0_5;
											var TotalAge_6_11 = $beneficiaries.age_6_11;
											var TotalAge_12_17 = $beneficiaries.age_12_17;
											var TotalAge_18_59 = $beneficiaries.age_18_59;
											var TotalAge_60_more = $beneficiaries.age_60_more;

											var TotalAges = $beneficiaries.sexTotal;
											//var TotalAges = TotalAge_6_11 + TotalAge_0_5 +TotalAge_12_17 +  TotalAge_18_59 + TotalAge_60_more;

											var age_0_5PerCent = ($beneficiaries.age_0_5 / (TotalAges))*100;
											var age_6_11PerCent = ($beneficiaries.age_6_11 / (TotalAges))*100;
											var age_12_17PerCent = ($beneficiaries.age_12_17 / (TotalAges))*100;
											var age_18_59PerCent = ($beneficiaries.age_18_59 / (TotalAges))*100;
											var age_60_morePerCent = ($beneficiaries.age_60_more / (TotalAges))*100;


											var string0_5label = 'Age 0-5: ' + $beneficiaries.age_0_5 + ' - ' + age_0_5PerCent.toFixed(1)+'%';
											
							


											result.data[0].y = $beneficiaries.age_0_5;
											result.data[0].color = '#c7c7c7';
											result.data[0].label = age_0_5PerCent;
											// // highcharts men
											result.data[1].y = TotalAge_6_11 ;
											//result.data[1].y = 579 ;
											result.data[1].label = age_6_11PerCent ;
											//console.log("LABEL: ",result.data[1]);
											result.data[1].color = '#90caf9';

											result.data[2].y = TotalAge_12_17;
											result.data[2].label = age_12_17PerCent ;
											result.data[2].color = 'red';

											result.data[3].y = TotalAge_18_59;
											result.data[3].label = age_18_59PerCent ;
											result.data[3].color = 'blue';

											result.data[4].y = TotalAge_60_more;
											result.data[4].label = age_60_morePerCent ;
											result.data[4].color = 'orange';

											
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


				case 'BarChartBeneficiaryAdmin1pcode':

				Beneficiaries.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObjectBenef
								},
								{
									$group:{
										_id: {admin1pcode:'$admin1pcode',admin1name: '$admin1name'},
										totalBeneficiaries: {
											$sum: { $add: ["$total_male", "$total_female"] }
										},
										

									}
								}
							]).toArray(function (err, beneficiaries) {
								if (err) return res.serverError(err);	

								
								


								if(beneficiaries.length){


									var result = {data:[]};

									beneficiaries.totalBeneficiariesAdmin1 = 0

									beneficiaries.forEach(function(clus,i){

										beneficiaries.totalBeneficiariesAdmin1 = beneficiaries.totalBeneficiariesAdmin1+clus.totalBeneficiaries 

										/*var newclusterbeneficiary = {
											'y':clus.totalBeneficiaries,
											'color':'blue',
											'name': clus._id.cluster,
											'label':0
										};

										result.data.push(newclusterbeneficiary)*/

									});
								}else{
									var result = {	
										data: [{
											'y': 0,
											'color': '#f48fb1',
											'name': 'Province',
											'label': 0,
										}]
									};

									beneficiaries = [{totalBeneficiaries:0}];
									

								}

								$beneficiariesOne = beneficiaries[0];


							
								
								switch (req.param('chart_for')) {
									case 'beneficiaryAdmin1pcode':
										if ($beneficiariesOne.totalBeneficiaries < 1 && $beneficiariesOne.totalBeneficiaries < 1) {
											
											var result = {	
																	data: [{
																		'y': 0,
																		'color': '#f48fb1',
																		'name': 'Province',
																		'label': 0,
																	}]
																};
											
											
											return res.json(200, result);
										} else {

												beneficiaries.sort(function(a, b) {
										  return b.totalBeneficiaries - a.totalBeneficiaries;
											});

											beneficiaries.forEach(function(benadmin1,i){

												if(i<5){



													var newadmin1beneficiary = {
														'y':benadmin1.totalBeneficiaries,
														'color':'blue',
														'name': benadmin1._id.admin1name,
														'label': (benadmin1.totalBeneficiaries / (beneficiaries.totalBeneficiariesAdmin1))*100
													};


												result.data.push(newadmin1beneficiary);
												}

											});
											
											return res.json(200, result);
										}
										break;
									
										default:
											return res.json( 200, { value:0 });
											break;
									}

			
								});
							});	

				break;



				//BeneficiarioCategoria

				case 'BarChartBeneficiaryType':
			// labels
			
										
						Beneficiaries.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObjectBenef
								},
								{
									$group:{
										_id: {beneficiary_type_id:'$beneficiary_type_id',beneficiary_type_name: '$beneficiary_type_name'},
										totalBeneficiaries: {
											$sum: { $add: ["$total_male", "$total_female"] }
										},
										

									}
								}
							]).toArray(function (err, beneficiaries) {
								if (err) return res.serverError(err);	

								
								


								if(beneficiaries.length){


									var result = {data:[]};

									beneficiaries.totalBeneficiariesType = 0

									beneficiaries.forEach(function(clus,i){

										beneficiaries.totalBeneficiariesType = beneficiaries.totalBeneficiariesType+clus.totalBeneficiaries 

										/*var newclusterbeneficiary = {
											'y':clus.totalBeneficiaries,
											'color':'blue',
											'name': clus._id.cluster,
											'label':0
										};

										result.data.push(newclusterbeneficiary)*/

									});
								}else{
									var result = {	
										data: [{
											'y': 0,
											'color': '#f48fb1',
											'name': 'Type',
											'label': 0,
										}]
									};

									beneficiaries = [{totalBeneficiaries:0}];
									

								}

								$beneficiariesOne = beneficiaries[0];


							
								
								switch (req.param('chart_for')) {
									case 'beneficiaryType':
										if ($beneficiariesOne.totalBeneficiaries < 1 && $beneficiariesOne.totalBeneficiaries < 1) {
											
											var result = {	
																	data: [{
																		'y': 0,
																		'color': '#f48fb1',
																		'name': 'Type',
																		'label': 0,
																	}]
																};
											
											
											return res.json(200, result);
										} else {

											beneficiaries.forEach(function(bentype,i){

											var newclusterbeneficiary = {
												'y':bentype.totalBeneficiaries,
												'color':'blue',
												'name': bentype._id.beneficiary_type_name,
												'label': (bentype.totalBeneficiaries / (beneficiaries.totalBeneficiariesType))*100
											};


												result.data.push(newclusterbeneficiary)

											});
											
											return res.json(200, result);
										}
										break;
									
										default:
											return res.json( 200, { value:0 });
											break;
									}

			
								});
							})					
						
										
				break;

				case 'BarChartBeneficiaryCluster':
			// labels
			
										
						Beneficiaries.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObjectBenef
								},
								{
									$group:{
										_id: {cluster_id:'$cluster_id',cluster: '$cluster'},
										totalBeneficiaries: {
											$sum: { $add: ["$total_male", "$total_female"] }
										},
										

									}
								}
							]).toArray(function (err, beneficiaries) {
								if (err) return res.serverError(err);	

								


								if(beneficiaries.length){


									var result = {data:[]};

									beneficiaries.totalBeneficiariesCluster = 0

									beneficiaries.forEach(function(clus,i){

										beneficiaries.totalBeneficiariesCluster = beneficiaries.totalBeneficiariesCluster+clus.totalBeneficiaries 

										

									});
								}else{
									var result = {	
										data: [{
											'y': 0,
											'color': '#f48fb1',
											'name': 'Cluster',
											'label': 0,
										}]
									};

									beneficiaries = [{totalBeneficiaries:0}];
									

								}

								$beneficiariesOne = beneficiaries[0];


							
								
								switch (req.param('chart_for')) {
									case 'beneficiaryCluster':
										if ($beneficiariesOne.totalBeneficiaries < 1 ) {
											
											var result = {	
																	data: [{
																		'y': 0,
																		'color': '#f48fb1',
																		'name': 'Cluster',
																		'label': 0,
																	}]
																};
											
											
											return res.json(200, result);
										} else {

											beneficiaries.forEach(function(clus,i){

											var newclusterbeneficiary = {
												'y':clus.totalBeneficiaries,
												'color':'blue',
												'name': clus._id.cluster,
												'label': (clus.totalBeneficiaries / (beneficiaries.totalBeneficiariesCluster))*100
											};


												result.data.push(newclusterbeneficiary)

											});
											
											return res.json(200, result);
										}
										break;
									
										default:
											return res.json( 200, { value:0 });
											break;
									}

			
								});
							})					
						
										
				break;


				//financing


				case 'BarChartFinancingTop5ExecutorOrganizations':
			// labels
			//console.log("FILTER BUDGET: ",filterObjectBudget);
										
						BudgetProgress.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObjectBudget
								},
								{
									$group:{
										_id: {organization_tag:'$organization_tag',organization: '$organization', currency_id:'$currency_id'},
										totalBudgetProgress: {
											$sum:  "$project_budget_amount_recieved"
										}

									}
								}
							]).toArray(function (err, budgetprogress) {
								if (err) return res.serverError(err);	

								
								
								if(budgetprogress.length){

								//	console.log("ANTES  BUD: ",budgetprogress);

									


									var result = {data:[]};

									budgetprogress.totalBudgetProgressExecutorOrg = 0

									budgetprogress.forEach(function(clus,i){
										//console.log("BUDGETPROGRESS: ", clus);

										if(clus._id.currency_id === 'cop'){
											var clustotalBudgetsCOPtoUSD = clus.totalBudgetProgress/params.coptousd;

											clus.totalBudgetProgress = clustotalBudgetsCOPtoUSD;

											budgetprogress.totalBudgetProgressExecutorOrg = budgetprogress.totalBudgetProgressExecutorOrg+clus.totalBudgetProgress;


										}else if(clus._id.currency_id === 'eur'){


											var clustotalBudgetsEURtoUSD = clus.totalBudgetProgress*params.eurotousd;
											clus.totalBudgetProgress = clustotalBudgetsEURtoUSD;

											budgetprogress.totalBudgetProgressExecutorOrg = budgetprogress.totalBudgetProgressExecutorOrg+clus.totalBudgetProgress;
											
										

										}else{
											budgetprogress.totalBudgetProgressExecutorOrg = budgetprogress.totalBudgetProgressExecutorOrg+clus.totalBudgetProgress;
										}

										//beneficiaries.totalBudgetProgressCluster = beneficiaries.totalBudgetProgressCluster+clus.totalBeneficiaries 

										

									});
								}else{
									//console.log("BUDGETPROGRESS: ", budgetprogress);

									var result = {	
										data: [{
											'y': 0,
											'color': '#f48fb1',
											'name': 'Organization',
											'label': 0,
										}]
									};

									budgetprogress = [{totalBudgetProgress:0}];
									

								}

							$beneficiariesOne = budgetprogress[0];
							
								
								switch (req.param('chart_for')) {
									case 'FinancingExecutorOrganization':

									
										if ($beneficiariesOne.totalBudgetProgress < 1) {
											
											/*result.data[0].y = 0;
											result.data[0].label = 0;
											result.data[0].color = '#c7c7c7';
											
											
											return res.json(200, result);*/
											var result = {	
																	data: [{
																		'y': 0,
																		'color': '#f48fb1',
																		'name': 'Organization',
																		'label': 0,
																	}]
																};
											
											
											return res.json(200, result);
										} else {

											budgetprogress.sort(function(a, b) {
										  return b.totalBudgetProgress - a.totalBudgetProgress;
											});

									//	console.log("DESPUES BUD: ",budgetprogress);

											//console.log("LOS CLUSTERS: ",budgetprogress);

											budgetprogress.forEach(function(clus,i){

											
											if(i<5){
											var org_name;
											if(clus._id.organization){
												org_name = clus._id.organization;

											}else{
												clus._id.organization_tag;

											}


												clus.totalBudgetProgress = clus.totalBudgetProgress.toFixed(2);


												var newclusterbudgetProgress = {
													'y': parseFloat(clus.totalBudgetProgress),
													'color':'blue',
													'name': org_name+' ('+clus._id.currency_id+')',
													'label': (clus.totalBudgetProgress / (budgetprogress.totalBudgetProgressExecutorOrg))*100
												};


												result.data.push(newclusterbudgetProgress);
											}



											});

										//	console.log("RESULT DATA: ",result.data);
											
											return res.json(200, result);
										}
										break;
									
										default:
											return res.json( 200, { value:0 });
											break;
									}

			
								});
							})					
						
										
				break;


				case 'BarChartFinancingOrgImplementing':
			// labels
			//console.log("FILTER BUDGET: ",filterObjectBudget);
										
						BudgetProgress.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObjectBudget
								}
							]).toArray(function (err, budgetsprogress) {
								if (err) return res.serverError(err);	

								
								
								//console.log("TAMAÑO: ",budgetprogress.lenth);


								if(budgetsprogress.length){



									counter = 0;

									length = budgetsprogress.length;


									var result = {data:[]};

									//budgetprogressimpl.totalBudgetProgressDonor = 0
									budgetsprogress.totalBudgetProgressOrgImpl = 0;

									implementorgbudgetprogress = [];

									totalFinancialFinalOrgImple = 0;

									budgetsprogress.forEach(function(budgprog){



									         		if(budgprog.currency_id === 'cop'){


														totalFinancialFinalOrgImple = totalFinancialFinalOrgImple + (budgprog.project_budget_amount_recieved/params.coptousd);


													}else if(budgprog.currency_id === 'eur'){


														totalFinancialFinalOrgImple = totalFinancialFinalOrgImple + (budgprog.project_budget_amount_recieved*params.eurotousd);
														
													

													}else{


														totalFinancialFinalOrgImple = totalFinancialFinalOrgImple+budgprog.project_budget_amount_recieved;
													}
									   




										if(budgprog.implementing_partners){

											//console.log("IMPLE: ",budgprog.implementing_partners);

											budgprog.implementing_partners.forEach(function (imp, i){

												


												if(imp.organization_tag){




						                           /*  const exist = implementorgbudgetprogress.find( implementer => implementer.organization_tag === imp.organization_tag );

						                             if(!exist){*/

						                             	newimplementorg = {
						                             		'organization_name':imp.organization_name,
						                             		'organization_tag':imp.organization_tag,
						                             		'organization':imp.organization,
						                             		'project_budget_amount_recieved':budgprog.project_budget_amount_recieved,
						                             		'currency_id':budgprog.currency_id
						                             	}
						                             	implementorgbudgetprogress.push(newimplementorg);

						                             	//console.log("HICE PUSH: ",newimplementorg);

														
						                             //}

						                         }
				                            

											});

										}

										counter++;

									    if ( counter === length ) {


									       const budgetprogressByImpleOrg = [...implementorgbudgetprogress.reduce((r, o) => {
														  const key = o.organization_tag + '-' + o.organization + '-'+ o.currency_id;
														  
														  const item = r.get(key) || Object.assign({}, o, {
														    project_budget_amount_recieved: 0,
														    TOTALBUDGET : 0
														  });
														  
														  item.project_budget_amount_recieved += o.project_budget_amount_recieved;
														 
														  item.TOTALBUDGET = item.project_budget_amount_recieved;

														  return r.set(key, item);
														}, new Map).values()];  



									       	budgetprogressByImpleOrg.forEach(function(orgim,i){

									       		if(orgim.currency_id === 'cop'){
														newTotalBudImpl  = orgim.TOTALBUDGET /params.coptousd;
														//console.log("tota cop: ", newTotalBudImpl);
														orgim.TOTALBUDGET = newTotalBudImpl.toFixed(2);
														//console.log("TOT cop: ",orgimplementer.TOTALBUDGET);

													}else if(orgim.currency_id === 'eur'){

														newTotalBudImpl = orgim.TOTALBUDGET *params.eurotousd;
														//console.log("tota eur: ", newTotalBudImpl);

														orgim.TOTALBUDGET = newTotalBudImpl.toFixed(2);
														//console.log("TOT euro: ",orgimplementer.TOTALBUDGET);

													}

											});

									        // console.log("TOTAL: ",totalFinancialFinalOrgImple);

									         switch (req.param('chart_for')) {
									case 'financingOrgImplementing':

									//console.log("TOTAL-2: ", budgetprogress.totalBudgetProgressCluster);
										if (!budgetprogressByImpleOrg.length) {
											
											var result = {	
												data: [{
												'y': 0,
												'color': '#f48fb1',
												'label': 0,
												}]
												};
									return res.json(200, result);


										} else {

										//console.log("DENTRO  DEL CHART: ");
										var result = {data:[]};


											budgetprogressByImpleOrg.sort(function(a, b) {
										  return b.TOTALBUDGET - a.TOTALBUDGET;
											});

									//	console.log("DESPUES BUD: ",budgetprogress);

											//console.log("LOS CLUSTERS: ",budgetprogress);

											budgetprogressByImpleOrg.forEach(function(orgimplementer,i){

											
									//	console.log("UBICA; ",i);
											if(i<5){

												//console.log("CADA GRUPO: ", orgimplementer);

											var orgimplementer_name;
											if(orgimplementer.organization_name){
												orgimplementer_name = orgimplementer.organization_name;

											}else{
												orgimplementer.organization_tag;

											}



												var neworgimplefinancial = {
													'y': parseFloat(orgimplementer.TOTALBUDGET),
													'color':'blue',
													'name': orgimplementer_name+' ('+orgimplementer.currency_id+')',
													'label': (orgimplementer.TOTALBUDGET / (totalFinancialFinalOrgImple))*100
												};

												//console.log("AGREGADO A RESULT: ", neworgimplefinancial);



												result.data.push(neworgimplefinancial);
											}



											});

										//	console.log("RESULT DATA: ",result.data);
											
											return res.json(200, result);
										}
										break;
									
										default:
											return res.json( 200, { value:0 });
											break;
									}





									     }	

									});



									
						}else{
									var result = {	
										data: [{
											'y': 0,
											'color': '#f48fb1',
											'name': 'Implement Org',
											'label': 0,
										}]
									};

									return res.json( 200,result);
									

						}
					});
				})					
						
										
				break;


				case 'BarChartFinancingTop5Donors':
			// labels
			//console.log("FILTER BUDGET: ",filterObjectBudget);
										
						BudgetProgress.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObjectBudget
								},
								{
									$group:{
										_id: {project_donor_id:'$project_donor_id', project_donor_name:'$project_donor_name',currency_id:'$currency_id'},
										totalBudgetProgressDonor: {
											$sum:  "$project_budget_amount_recieved"
										}

									}
								}
							]).toArray(function (err, budgetprogressdonor) {
								if (err) return res.serverError(err);	

								
							

								//console.log("TAMAÑO: ",budgetprogress.lenth);


							if(budgetprogressdonor.length){

								   //	console.log("ANTES  BUD: ",budgetprogress);

									var result = {data:[]};

									totalBudget = 0

									budgetprogressdonor.forEach(function(don,i){
										//console.log("BUDGETPROGRESS: ", clus);

										if(don._id.currency_id === 'cop'){
											var dontotalBudgetsCOPtoUSD = don.totalBudgetProgressDonor/params.coptousd;

											don.totalBudgetProgressDonor = dontotalBudgetsCOPtoUSD;

											totalBudget =totalBudget+don.totalBudgetProgressDonor;
											

										}else if(don._id.currency_id === 'eur'){


											var dontotalBudgetsEURtoUSD = don.totalBudgetProgressDonor*params.eurotousd;
											don.totalBudgetProgressDonor = dontotalBudgetsEURtoUSD;

											totalBudget = totalBudget+don.totalBudgetProgressDonor;
											
											
										

										}else{
											totalBudget = totalBudget+don.totalBudgetProgressDonor;
											//console.log("TOTAL3: ",totalBudgetProgressDonor);
										}

									});

								

							
							
								
								switch (req.param('chart_for')) {
									case 'FinancingDonors':

									//console.log("TOTAL-2: ", budgetprogress.totalBudgetProgressCluster);
										if (!budgetprogressdonor.length) {
											
											var result = {	
																	data: [{
																		'y': 0,
																		'color': '#f48fb1',
																		'name': 'Donor',
																		'label': 0,
																	}]
																};
											
											
											return res.json(200, result);
										} else {

											var result = {data:[]};

											budgetprogressdonor.sort(function(a, b) {
										  return b.totalBudgetProgressDonor - a.totalBudgetProgressDonor;
											});

								

											budgetprogressdonor.forEach(function(donor,i){

										
											if(i<5){
											var donor_name;
											if(donor._id.project_donor_id){
												donor_name = donor._id.project_donor_name;

											}else{
												donor._id.project_donor_id;

											}


												donor.totalBudgetProgressDonor = donor.totalBudgetProgressDonor.toFixed(2);

												
												var newdonorbudgetProgress = {
													'y': parseFloat(donor.totalBudgetProgressDonor),
													'color':'blue',
													'name': donor_name+' ('+donor._id.currency_id+')',
													'label': (donor.totalBudgetProgressDonor / (totalBudget))*100
												};


												result.data.push(newdonorbudgetProgress);
											}



											});

										//	console.log("RESULT DATA: ",result.data);
											
											return res.json(200, result);
										}
										break;
									
										default:
											return res.json( 200, { value:0 });
											break;
									}

							}else{
									//console.log("BUDGETPROGRESS: ", budgetprogress);

									var result = {	
										data: [{
											'y': 0,
											'color': '#f48fb1',
											'name': 'Donor',
											'label': 0,
										}]
									};

									//budgetprogressdonor = [{totalBudgetProgressDonor:0}];
									return res.json( 200,result);
									

								}

			
						});
					});		
						
										
				break;


				case 'BarChartFinancingAdmin1pcode':

				BudgetProgress.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObjectBudget
								},
								{
									$group:{
										_id: {admin1pcode:'$admin1pcode',admin1name: '$admin1name',currency_id:'$currency_id'},
										totalBudgetProgress: {
											$sum:  "$project_budget_amount_recieved"
										},
										

									}
								}
							]).toArray(function (err, budgetprogress) {
								if (err) return res.serverError(err);	

								
								
								if(budgetprogress.length){

								//	console.log("ANTES  BUD: ",budgetprogress);

									


									var result = {data:[]};

									budgetprogress.totalBudgetProgressAdmin1pcode = 0

									budgetprogress.forEach(function(clus,i){

										if(clus._id.currency_id === 'cop'){
											var clustotalBudgetsCOPtoUSD = clus.totalBudgetProgress/params.coptousd;

											clus.totalBudgetProgress = clustotalBudgetsCOPtoUSD;

											budgetprogress.totalBudgetProgressAdmin1pcode = budgetprogress.totalBudgetProgressAdmin1pcode+clus.totalBudgetProgress;


										}else if(clus._id.currency_id === 'eur'){


											var clustotalBudgetsEURtoUSD = clus.totalBudgetProgress*params.eurotousd;
											clus.totalBudgetProgress = clustotalBudgetsEURtoUSD;

											budgetprogress.totalBudgetProgressAdmin1pcode = budgetprogress.totalBudgetProgressAdmin1pcode+clus.totalBudgetProgress;
											
										

										}else{
											budgetprogress.totalBudgetProgressAdmin1pcode = budgetprogress.totalBudgetProgressAdmin1pcode+clus.totalBudgetProgress;
										}

										//beneficiaries.totalBudgetProgressCluster = beneficiaries.totalBudgetProgressCluster+clus.totalBeneficiaries 

										

									});
								}else{
									var result = {	
										data: [{
											'y': 0,
											'color': '#f48fb1',
											'name': 'Province',
											'label': 0,
										}]
									};

									budgetprogress = [{totalBudgetProgress:0}];
									

								}

								$financingOne = budgetprogress[0];


							
								
								switch (req.param('chart_for')) {
									case 'financingAdmin1pcode':
										if ($financingOne.totalBudgetProgress < 1 && $financingOne.totalBudgetProgress < 1) {
											
											var result = {	
																	data: [{
																		'y': 0,
																		'color': '#f48fb1',
																		'name': 'Province',
																		'label': 0,
																	}]
																};
											
											
											return res.json(200, result);
										} else {

											var result = {data:[]};

												budgetprogress.sort(function(a, b) {
										  return b.totalBudgetProgress - a.totalBudgetProgress;
											});

											budgetprogress.forEach(function(budprogadmin1,i){

												if(i<5){


														budprogadmin1.totalBudgetProgress = budprogadmin1.totalBudgetProgress.toFixed(2);

													var newadmin1financing = {
														'y':parseFloat(budprogadmin1.totalBudgetProgress),
														'color':'blue',
														'name': budprogadmin1._id.admin1name+' ('+budprogadmin1._id.currency_id+')',
														'label': (budprogadmin1.totalBudgetProgress / (budgetprogress.totalBudgetProgressAdmin1pcode))*100
													};


												result.data.push(newadmin1financing);
												}

											});
											
											return res.json(200, result);
										}
										break;
									
										default:
											return res.json( 200, { value:0 });
											break;
									}

			
								});
							});	

				break;

				case 'BarChartFinancingCluster':
			// labels
			//console.log("FILTER BUDGET: ",filterObjectBudget);
										
						BudgetProgress.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObjectBudget
								},
								{
									$group:{
										_id: {cluster_id:'$cluster_id',cluster: '$cluster', currency_id:'$currency_id'},
										totalBudgetProgress: {
											$sum:  "$project_budget_amount_recieved"
										},
										

									}
								}
							]).toArray(function (err, budgetprogress) {
								if (err) return res.serverError(err);	

								
								// if no length
								if (!budgetprogress.length){
								var result = {data:[]};
								return res.json(200, result);
							} 

								//console.log("TAMAÑO: ",budgetprogress.lenth);


								if(budgetprogress.length){


									var result = {data:[]};

									budgetprogress.totalBudgetProgressCluster = 0

									budgetprogress.forEach(function(clus,i){
										//console.log("BUDGETPROGRESS: ", clus);

										if(clus._id.currency_id === 'cop'){
											var clustotalBudgetsCOPtoUSD = clus.totalBudgetProgress/params.coptousd;
											budgetprogress.totalBudgetProgressCluster = budgetprogress.totalBudgetProgressCluster+clustotalBudgetsCOPtoUSD;

										}else if(clus._id.currency_id === 'eur'){


											budgetprogress.totalBudgetProgressCluster = budgetprogress.totalBudgetProgressCluster+(clus.totalBudgetProgress*params.eurotousd);
										

										}else{
											budgetprogress.totalBudgetProgressCluster = budgetprogress.totalBudgetProgressCluster+clus.totalBudgetProgress

										}

										//beneficiaries.totalBudgetProgressCluster = beneficiaries.totalBudgetProgressCluster+clus.totalBeneficiaries 

										

									});
								}else{
									//console.log("BUDGETPROGRESS: ", budgetprogress);

									var result = {	
										data: [{
											'y': 0,
											'color': '#f48fb1',
											'name': 'Cluster',
											'label': 0,
										}]
									};

									budgetprogress = [{totalBudgetProgress:0}];
									

								}

								$beneficiariesBudgetOne = budgetprogress[0];

								//console.log("TOTAL-1: ", budgetprogress.totalBudgetProgressCluster);


							
								
								switch (req.param('chart_for')) {
									case 'FinancingCluster':

									//console.log("TOTAL-2: ", budgetprogress.totalBudgetProgressCluster);
										if ($beneficiariesBudgetOne.totalBudgetProgress < 1 && $beneficiariesBudgetOne.totalBudgetProgress < 1) {
											
											var result = {	
																	data: [{
																		'y': 0,
																		'color': '#f48fb1',
																		'name': 'Cluster',
																		'label': 0,
																	}]
																};
													
										} else {

											//console.log("LOS CLUSTERS: ",budgetprogress);

											budgetprogress.forEach(function(clus,i){

												if(clus._id.currency_id === 'cop'){
											//console.log("Antes2 : ", clus.totalBudgetProgress);
											var clustotalBudgetsCOPtoUSDChart = clus.totalBudgetProgress/params.coptousd;
											//console.log("DESPUES2 : ",clustotalBudgetsCOPtoUSDChart);
											clus.totalBudgetProgress = clustotalBudgetsCOPtoUSDChart;
											clus.totalBudgetProgress = clus.totalBudgetProgress.toFixed(2);
											

										}else if(clus._id.currency_id === 'eur'){

											var clustotalBudgetsEURtoUSDChart = clus.totalBudgetProgress*params.eurotousd;
											//console.log("DESPUES EUR: ",clustotalBudgetsEURtoUSDChart);
											clus.totalBudgetProgress = clustotalBudgetsEURtoUSDChart;

											clus.totalBudgetProgress = clus.totalBudgetProgress.toFixed(2);
										}



											var newclusterbudgetProgress = {
												'y':parseFloat(clus.totalBudgetProgress),
												'color':'blue',
												'name': clus._id.cluster+' ('+clus._id.currency_id+')',
												'label': (clus.totalBudgetProgress / (budgetprogress.totalBudgetProgressCluster))*100
											};


												result.data.push(newclusterbudgetProgress)

											});

											//console.log("RESULT DATA: ",result.data);
											
											return res.json(200, result);
										}
										break;
									
										default:
											return res.json( 200, { value:0 });
											break;
									}

			
								});
							})					
						
										
				break;


				
				
				default: 

					return res.json( 200, { value:0 });
					break;

		}

	}


};

module.exports = Cluster4wplusDashboardController;
