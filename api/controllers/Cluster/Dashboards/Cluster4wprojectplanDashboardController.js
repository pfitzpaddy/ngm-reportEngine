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
					!req.param('project_type_component') ||
					!req.param('hrpplan')||
					!req.param('implementer_tag')||
					!req.param('donor_tag') ||
					!req.param('activity_type') ||
					!req.param('admin1pcode') ||
					!req.param('admin2pcode') ||
					//!req.param('beneficiaries') ||
					!req.param('start_date') ||
					!req.param('end_date') ) {
			return res.json(401, {err: 'indicator, cluster_id, adminRpcode, admin0pcode, organization_tag, project_type_component, hrpplan, implementer_tag, donor_tag, activity_type, admin1pcode, admin2pcode, start_date, end_date required!'});
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
			project_type_component:req.param('project_type_component'),
			hrpplan:req.param('hrpplan'),
			donor_tag: req.param('donor_tag'),
			implementer_tag: req.param('implementer_tag'),
			activity_type:req.param('activity_type'),
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
			                    ?{or:[{cluster_id:params.cluster_id},{activity_type:{$elemMatch:{cluster_id:params.cluster_id}}}]}
			                    : {activity_type:{$elemMatch:{cluster_id:params.cluster_id}}},
			 activity_type: params.activity_type === 'all' ? {} : {activity_type:{$elemMatch:{activity_type_id:params.activity_type}}},
			
			project_plan_component: (params.project_type_component === 'all' && params.hrpplan === 'all')
			     ? {}
			     : (params.project_type_component !== 'all' && params.hrpplan === 'all')
			     ? { plan_component: {$in: [params.project_type_component]}}
			     : (params.project_type_component != 'all' && params.hrpplan === 'true')
			     ? {  plan_component : {$in: [params.project_type_component, "hrp_plan"]}} 
			    // ? { plan_component : {$in: [params.project_type_component,"hrp_plan"]}}

			     : ( params.project_type_component != 'all' && params.hrpplan === 'false')
			     ? { plan_component: {$in:[params.project_type_component], $nin:["hrp_plan"]}}
			     : ( params.project_type_component === 'all' && params.hrpplan === 'true')
			     ? { plan_component: {$in : ["hrp_plan"]}}
			     : { plan_component: { $nin : ["hrp_plan"]}},
			                                
			acbar_partners: params.cluster_id === 'acbar' ? { project_acbar_partner: true } : {},
			organization_tag: params.organization_tag === 'all' ? { organization_tag: { '!': $nin_organizations } } : { organization_tag: params.organization_tag },
			donor_tag: params.donor_tag === 'all' ? {} : {  project_donor : { $elemMatch : { 'project_donor_id' : params.donor_tag}}},

			implementer_tag: (params.implementer_tag === 'all')
	                            ? {}
	                            : {implementing_partners: { $elemMatch:{'organization_tag':params.implementer_tag} } },
			
			
			project_endDate: { project_end_date: {'>=': new Date(params.start_date)}},
			project_startDate: { project_start_date: {'<=': new Date(params.end_date)}},

			adminRpcode_Native: params.adminRpcode === 'hq'  ? {} : { adminRpcode: params.adminRpcode.toUpperCase() },
			admin0pcode_Native: params.admin0pcode === 'all' ? {} : { admin0pcode: params.admin0pcode.toUpperCase() },
			admin1pcode_Native: params.admin1pcode === 'all' ? {} : { admin1pcode: params.admin1pcode.toUpperCase() },
			admin2pcode_Native: params.admin2pcode === 'all' ? {} : { admin2pcode: params.admin2pcode.toUpperCase() },
			cluster_id_Native: ( params.cluster_id === 'all' || params.cluster_id === 'rnr_chapter' || params.cluster_id === 'acbar' ) 
								? {} 
								: ( params.cluster_id !== 'cvwg' )
								
			                    ?{$or:[{cluster_id:params.cluster_id},{inter_cluster_activities:{$elemMatch:{'cluster_id':params.cluster_id}}}]}
			                    : {inter_cluster_activities:{$elemMatch:{'cluster_id':params.cluster_id}}} ,
			activity_typeNative: params.activity_type === 'all' ? {} : {activity_type:{$elemMatch:{'activity_type_id':params.activity_type}}},
              
		
			  project_plan_componentNative: (params.project_type_component === 'all' && params.hrpplan === 'all')
			     ? {}
			     : (params.project_type_component !== 'all' && params.hrpplan === 'all')
			     ? { plan_component: {$in: [params.project_type_component]}}
			     : (params.project_type_component != 'all' && params.hrpplan === 'true')
			     ? { $and: [ { plan_component : {$in: [params.project_type_component,"hrp_plan"]}}]}
			     //? { plan_component : {$in: [params.project_type_component, "hrp_plan"]}}

			     : ( params.project_type_component != 'all' && params.hrpplan === 'false')
			     ? { plan_component: {$in:[params.project_type_component], $nin:["hrp_plan"]}}
			     : ( params.project_type_component === 'all' && params.hrpplan === 'true')
			     ? { plan_component: {$in : ["hrp_plan"]}}
			     : { plan_component: { $nin : ["hrp_plan"]}},
			                  

			cluster_ids_Native: ( params.cluster_ids.includes('all') || params.cluster_ids.includes('rnr_chapter') || params.cluster_ids.includes('acbar') ) 
								? {} 
								: ( params.cluster_ids.includes('cvwg') )
			                     ?{$or:[{cluster_id:params.cluster_id},{activity_type:{$elemMatch:{'cluster_id':params.cluster_id}}}]}
			                    :{activity_type:{$elemMatch:{'cluster_id':params.cluster_id}}},
			                 
			is_cluster_ids_array: params.cluster_ids ? true : false,
			organization_tag_Native: params.organization_tag === 'all' ? { organization_tag: { $nin: $nin_organizations } } : { organization_tag: params.organization_tag },

			donor_tagNative: params.donor_tag === 'all' ? {} : {  project_donor : { $elemMatch : { 'project_donor_id' : params.donor_tag}}},

			implementer_tagNative: ( params.implementer_tag === 'all')
	                            ? {}
	                     
	                           : { implementing_partners: { $elemMatch: { 'organization_tag' : params.implementer_tag} }},
			
			project_endDateNative: { project_end_date: { $gte: new Date(params.start_date) }},
			project_startDateNative: { project_start_date: { $lte: new Date(params.end_date) }},



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
										filters.activity_typeNative,
										filters.cluster_id_Native,
										filters.acbar_partners,
										filters.organization_tag_Native,
										filters.project_plan_componentNative,
										filters.donor_tagNative,
										filters.implementer_tagNative,
										filters.activity_typeNative,
										filters.project_startDateNative,
										filters.project_endDateNative,
						
										 );
		
		// switch on indicator
		switch( params.indicator ) {



			case 'latest_update':

 			if(params.admin1pcode === 'all'){

				Project
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.cluster_id )
					.where( filters.organization_tag )
					.where(filters.donor_tag)
					.where( filters.implementer_tag)
					.where(filters.activity_type)
					.where(filters.project_plan_component)
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

			 }else{

			 	totalprojectsupdated = [];

					Project
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.cluster_id )
					.where( filters.organization_tag )
					.where(filters.donor_tag)
					.where( filters.implementer_tag)
					.where(filters.activity_type)
					.where(filters.project_plan_component)
					.where(filters.project_startDateNative)
					.where(filters.project_endDateNative)
					.exec( function( err, results ){

						// return error
						if (err) return res.negotiate( err );

						if(results.length){



						
						counter = 0;

						length = results.length;

						results.forEach(function(project,i){

							//console.log("PROJECT ID: ", project.id);

							TargetLocation.find()
							.where( {project_id: project.id})
							.where( filters.admin1pcode )
							.where( filters.admin2pcode ).exec(function(err,targloc){

								//console.log("TOTAL: ",targloc.length + ' - '+project.id);

								if(targloc.length){
								//	console.log("VOY A DAR PUSH: ",project.id);
									totalprojectsupdated.push(project);
								}

								counter++;
			                    if ( counter === length ) {
			                      // table
			                    //   console.log("TOTAL PROYECTOS: ",totalprojects.length);

			                    
			                    totalprojectsupdated.sort(function(a,b){return  b.updatedAt - a.updatedAt});


									return res.json( 200, totalprojectsupdated[0] );
			                    }
							});

						});

					}else{

						return res.json( 200,  totalprojectsupdated);

					}		

					});


			 }

				break;

			

				//4wDASHBOARDprojectplan

				case 'projects_4wdashboard_projectplan':

				if(params.admin1pcode === 'all'){

				Project
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.cluster_id )
					.where( filters.organization_tag )
					.where(filters.donor_tag)
					.where( filters.implementer_tag)
					.where(filters.project_plan_component)
					.where( filters.activity_type)
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

				}else{

					totalprojects = [];

					Project
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.cluster_id )
					.where( filters.organization_tag )
					.where(filters.donor_tag)
					.where( filters.implementer_tag)
					.where(filters.project_plan_component)
					.where( filters.activity_type)
					.where( filters.project_startDateNative )
					.where( filters.project_endDateNative)
					.exec( function( err, results ){

						// return error
						if (err) return res.negotiate( err );

						if(results.length){



						
						counter = 0;

						length = results.length;

						results.forEach(function(project,i){

							//console.log("PROJECT ID: ", project.id);

							TargetLocation.find()
							.where( {project_id: project.id})
							.where( filters.admin1pcode )
							.where( filters.admin2pcode ).exec(function(err,targloc){

								//console.log("TOTAL: ",targloc.length + ' - '+project.id);

								if(targloc.length){
								//	console.log("VOY A DAR PUSH: ",project.id);
									totalprojects.push(project);
								}

								counter++;
			                    if ( counter === length ) {
			                      // table
			                    //   console.log("TOTAL PROYECTOS: ",totalprojects.length);
									return res.json( 200, {'value': totalprojects.length} );
			                    }
							});

						});

					}else{

						return res.json( 200, {'value': totalprojects.length} );

					}		

					});


				}

				break;

				case 'activities_activity_type':




				activities = [];

				if(filters.cluster_id === 'all'){

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

				case 'total_beneficiariespopulation_4wdashboard_projectplan':


				if(params.admin1pcode === 'all'){


				// total sum
				totalBeneficiariesAll = 0;

					TargetBeneficiaries
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.cluster_id )
					.where( filters.organization_tag )
					.where(filters.donor_tag)
					.where( filters.implementer_tag)
					.where(filters.project_plan_component)
					.where( filters.activity_type)
					.where( filters.project_startDateNative )
					.where( filters.project_endDateNative)
					.exec( function( err, results ){
						
						if (err) return res.negotiate( err );

						if(results.length){

							counter = 0;

						    length = results.length; 


							results.forEach(function(benefrecordAll,i){

						


							if(benefrecordAll.total_male){
								totalBeneficiariesAll = totalBeneficiariesAll + benefrecordAll.total_male;
							}	
							if(benefrecordAll.total_female){
								totalBeneficiariesAll = totalBeneficiariesAll + benefrecordAll.total_female;
							}	
							//totalBeneficiariesAll = totalBeneficiariesAll + benefrecordAll.total_male + benefrecordAll.total_female;
									


								counter++;
			                    if ( counter === length ) {
			                      // table
									return res.json( 200, {'value': totalBeneficiariesAll} );
			                    }

							});
						}else{

							return res.json( 200, {'value': results.length} );
						}
					});

			             
					
			}else{

				totalBeneficiaries = 0;

					TargetBeneficiaries
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.cluster_id )
					.where( filters.organization_tag )
					.where(filters.donor_tag)
					.where( filters.implementer_tag)
					.where(filters.project_plan_component)
					.where( filters.activity_type)
					.where( filters.project_startDateNative )
					.where( filters.project_endDateNative)
					.exec( function( err, results ){

						//console.log("TargBenef", results);
						// return error
						if (err) return res.negotiate( err );

						if(results.length){

						counter = 0;

						length = results.length;

						

						results.forEach(function(benefrecord,i){


							TargetLocation.find()
							.where( {project_id: benefrecord.project_id})
							.where( filters.admin1pcode )
							.where( filters.admin2pcode ).exec(function(err,targloc){


								if(targloc.length){

									
									totalBeneficiaries = totalBeneficiaries + benefrecord.total_male + benefrecord.total_female;
									
									
								}

								counter++;
			                    if ( counter === length ) {
			                      // table
									return res.json( 200, {'value': totalBeneficiaries} );
			                    }
								});

							});

						}else{

							return res.json( 200, {'value': results.length} );

						}

					});

			}
				
		break;


		case 'total_financing_4wdashboard_projectplan':

				// total sum
				if(params.admin1pcode === 'all'){

					Project
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.cluster_id )
					.where( filters.organization_tag )
					.where(filters.donor_tag)
					.where( filters.implementer_tag)
					.where(filters.project_plan_component)
					.where( filters.activity_type)
					.where( filters.project_startDateNative )
					.where( filters.project_endDateNative)
					.exec( function( err, results ){

                       var totalfinancing = 0;


						results.forEach(function(pro,i){

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

				}else{


					Project
					.find()
					.where( filters.default )
					.where( filters.adminRpcode )
					.where( filters.admin0pcode )
					.where( filters.cluster_id )
					.where( filters.organization_tag )
					.where(filters.donor_tag)
					.where( filters.implementer_tag)
					.where(filters.project_plan_component)
					.where( filters.activity_type)
					.where( filters.project_startDateNative )
					.where( filters.project_endDateNative)
					.exec( function( err, results ){

						// return error
						if (err) return res.negotiate( err );

						counter = 0;

						length = results.length;

					var totalfinancing = 0;

					if(results.length){

						results.forEach(function(project,i){

							//console.log("PROJECT ID: ", project.id);

							TargetLocation.find()
							.where( {project_id: project.id})
							.where( filters.admin1pcode )
							.where( filters.admin2pcode ).exec(function(err,targloc){

								//console.log("TOTAL: ",targloc.length + ' - '+project.id);

								if(targloc.length){
									
									if(typeof project.project_budget === 'string'){


								var stringtonum = parseFloat(project.project_budget);


								if(stringtonum){
									if(pro.project_budget_currency !=='eur' && project.project_budget_currency !== 'cop'){

										var financing = stringtonum;

									}else if(project.project_budget_currency ==='eur'){

										var budeurtodollar = stringtonum*params.eurotousd;
 										
 										//console.log("FINAL BUDG EUR STRING: ",budeurtodollar);
									//	console.log("EURO A DOLAR STRING: ",budeurtodollar);
										var  financing = budeurtodollar;


									}else if(project.project_budget_currency ==='cop'){

										var budcoptodollar = stringtonum/params.coptousd;

										//console.log("FINAL BUDG COP STRING: ",budcoptodollar);
										//console.log("PESO COL A USD SSTRING: ",budcoptodollar);
										var financing = budcoptodollar;

									}


								}else{

									var financing = 0;

								}

							}else if(project.project_budget ){

									if(project.project_budget_currency !=='eur' && project.project_budget_currency !== 'cop'){

									var	financing = project.project_budget;

									}else if(project.project_budget_currency ==='eur'){

										var budeurtodollar2 = project.project_budget*params.eurotousd;
 										
 										//console.log("FINAL BUDG EUR NO STRING: ",budeurtodollar2);
									//	console.log("EURO A DOLAR STRING: ",budeurtodollar);
										var financing = budeurtodollar2;


									}else if(project.project_budget_currency ==='cop'){


										var budcoptodollar2 = project.project_budget/params.coptousd;

										//console.log("FINAL BUDG COP NO STRING: ",budcoptodollar2);
										//console.log("PESO COL A USD SSTRING: ",budcoptodollar);
										var financing = budcoptodollar2;

									}



								} else{	
								//	console.log("NO ES VALIDO: ", valnum);
									var financing =0;
								}


									totalfinancing = totalfinancing + financing;



								}

								counter++;
			                    if ( counter === length ) {
			                      // table
			                    //   console.log("TOTAL PROYECTOS: ",totalprojects.length);
									return res.json( 200, {'value': totalfinancing} );
			                    }
							});

						});
					}else{
						return res.json( 200, {'value': totalfinancing} );
					}

					});


				}
		break;



		case 'organizations_4wdashboard_projectplan':
				
				if ( params.list ) {

					if(params.admin1pcode === 'all'){

						//console.log("FILTEROBJECT1: ",filterObject);

					
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
						}else{


							
							orgs = [];

							Project
							.find()
							.where( filters.default )
							.where( filters.adminRpcode )
							.where( filters.admin0pcode )
							.where( filters.cluster_id )
							.where( filters.organization_tag )
							.where(filters.donor_tag)
							.where( filters.implementer_tag)
							.where(filters.project_plan_component)
							.where( filters.activity_type)
							.where( filters.project_startDateNative )
							.where( filters.project_endDateNative)
							.exec( function( err, results ){
								
								if (err) return res.serverError(err);

								//console.log("results:  ", results);

								counter = 0;

								length = results.length;

								
								if(results.length){

								results.forEach(function(proj, i){


									TargetLocation.find()
									        .where( {project_id: proj.id})
											.where( filters.admin1pcode )
											.where( filters.admin2pcode ).exec(function(err,targloc){

												if(targloc.length){



					                                  const exist = orgs.find( org => org.organization_tag === proj.organization_tag );

							                             if(!exist){

							                             	var neworg = {
							                             		organization_tag:'',
							                             		organization:'',

							                             	};

							                             	if(proj.organization_tag){
							                             		neworg.organization_tag = proj.organization_tag;

							                             	}

							                             	if(proj.organization_tag){
							                             		neworg.organization = proj.organization;

							                             	}
							                             	//console.log("HAGO PUSH: ",neworg);
							                             	
							                             	orgs.push(neworg);

							                             }
					                            
												}

												counter++;
							                    if ( counter === length ) {
							                    	

							                    	orgs.unshift({
													organization_tag: 'all',
													organization: 'ALL',
												});
													return res.json( 200,  orgs );
							                    }

											});

								});
							}else{
								orgs.unshift({
									organization_tag: 'all',
									organization: 'ALL'}
									);
								return res.json( 200,  orgs );
							}
						});
				

						
					}


			}else {	// count of organizations
					


					if(params.admin1pcode === 'all'){

					
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
								]).toArray(function (err, resultstotal) {
								
								if (err) return res.serverError(err);

							
									if (err) return res.serverError(err);

									organizationstotal=_.pluck(resultstotal,'_id')		
									organizationstotal.sort(function(a, b) {
										//console.log(a.organization.localeCompare(b.organization), "LO QUE RETORNA");
										return a.organization.localeCompare(b.organization);
									});
									

									return res.json( 200, {'value':organizationstotal.length} );



									//return res.json( 200, { 'value': results[0]?results[0].total:0 } );
								});
							});	
						}else{
							
							var orgstotal = [];

							Project.find()
								.where( filters.default )
								.where( filters.adminRpcode )
								.where( filters.admin0pcode )
								.where( filters.cluster_id )
								.where( filters.organization_tag )
								.where(filters.donor_tag)
								.where( filters.implementer_tag)
								.where(filters.project_plan_component)
								.where( filters.activity_type)
								.where( filters.project_startDateNative )
								.where( filters.project_endDateNative)
							.exec( function( err, results ){
								
								if (err) return res.serverError(err);


								counter = 0;

								length = results.length;

								if(results.length){

								results.forEach(function(proj, i){


									TargetLocation.find()
									        .where( {project_id: proj.id})
											.where( filters.admin1pcode )
											.where( filters.admin2pcode ).exec(function(err,targloc){


												if(targloc.length){

					                                  const exist = orgstotal.find( org => org.organization_tag === proj.organization_tag );


							                             if(!exist){




							                             	var neworg = {
							                             		organization_tag:'',
							                             		organization:'',

							                             	};

							                             	if(proj.organization_tag){
							                             		neworg.organization_tag = proj.organization_tag;

							                             	}

							                             	if(proj.organization_tag){
							                             		neworg.organization = proj.organization;

							                             	}
							                             	
							                             	orgstotal.push(neworg);

							                             }

					                            
												}
												counter++;
							                    if ( counter === length ) {
							                    	
													return res.json( 200,  {'value':orgstotal.length} );
							                    }


											});

								});
							}else{
						
								return res.json( 200,  {'value':orgstotal.length} );
							}
						});
				

						
					}
				}
				
				break;

				case 'project_donors':

				//console.log("FILTROS: ", filters);

				if(params.admin1pcode === 'all'){


				var donorslist = [];


				Project.find()
				.where(filters.default)
				.where( filters.adminRpcode )
				.where( filters.admin0pcode )
				.where( filters.organization_tag )
				.where( filters.cluster_id)
				.where( filters.donor_tag)
				.where (filters.implementer_tag)
				.where(filters.project_plan_component)
				.where( filters.activity_type)
				.where( filters.project_startDateNative )
				.where( filters.project_endDateNative)
				.exec(function (err, results){

					if (err) return res.serverError(err);

						


					if(results.length){


						results.forEach( function( d, i ) {


							if(d.project_donor.length > 0){

								 d.project_donor.forEach(function (projdonor, j){

								 	if(projdonor.project_donor_id){


			                             const resultado = donorslist.find( donor => donor.project_donor_id === projdonor.project_donor_id );

			                             if(!resultado){
			                             	donorslist.push(projdonor);
			                             	//console.log("METI EL DONANTE: ", projdonor);

			                             }
			                         }
			                            

								});

							};

						});

					  }

					return res.json(200, {'data':donorslist});

					

				});
			}else{

				var donorslist = [];

				Project.find()
				.where(filters.default)
				.where( filters.adminRpcode )
				.where( filters.admin0pcode )
				.where( filters.organization_tag )
				.where( filters.cluster_id)
				.where( filters.donor_tag)
				.where (filters.implementer_tag)
				.where(filters.project_plan_component)
				.where( filters.activity_type)
				.where( filters.project_startDateNative )
				.where( filters.project_endDateNative)
				.exec(function (err, results){

					if (err) return res.serverError(err);

								if(results.length){


								counter = 0;

								length = results.length;

								results.forEach(function(projrecord,i){


										if(projrecord.project_donor.length > 0){



											TargetLocation.find()
											.where( {project_id: projrecord.id})
											.where( filters.admin1pcode )
											.where( filters.admin2pcode ).exec(function(err,targloc){


												if(targloc.length){

													projrecord.project_donor.forEach(function (projdonor, j){

													if(projdonor.project_donor_id){


					                                  const resultado = donorslist.find( donor => donor.project_donor_id === projdonor.project_donor_id );

							                             if(!resultado){
							                             	donorslist.push(projdonor);

							                             }


							                              }
					                            

													});


													
												}

												counter++;
							                    if ( counter === length ) {
							                      // table
													return res.json( 200, {'data': donorslist} );
							                    }
											});

										}else{
											counter ++;
											 if ( counter === length ) {
							                      // table
													return res.json( 200, {'data': donorslist} );
							                    }
										}
				              });
							}else{
								return res.json( 200, {'data': donorslist} );
							}
						});

			}



				break;
				


				case 'total_implementing_partners_4wdashboard_projectplan':


				if(params.admin1pcode === 'all'){


				Project.find()
				.where(filters.default)
				.where( filters.adminRpcode )
				.where( filters.admin0pcode )
				.where( filters.organization_tag )
				.where( filters.cluster_id)
				.where( filters.donor_tag)
				.where (filters.implementer_tag)
				.where(filters.project_plan_component)
				.where( filters.activity_type)
				.where( filters.project_startDateNative )
				.where( filters.project_endDateNative)
				.exec(function (err, results){


						if (err) return res.serverError(err);

						var imppartners = [];

					if(results.length){

						results.forEach( function( d, i ) {

							if(d.implementing_partners){

								 d.implementing_partners.forEach(function (imppart, j){


								 	if(imppart.organization_tag){

			                             const resultado = imppartners.find( implementer => implementer.organization_tag === imppart.organization_tag );

			                             if(!resultado){
			                             	imppartners.push(imppart);
			                             }
			                         }
	                            

								});

							}

						});
					}


						return res.json( 200, { 'value': imppartners.length } );
					});

				}else{

				var implementpartnerstotal = [];


				Project
				.find()
				.where(filters.default)
				.where( filters.adminRpcode )
				.where( filters.admin0pcode )
				.where( filters.organization_tag )
				.where( filters.cluster_id)
				.where( filters.donor_tag)
				.where (filters.implementer_tag)
				.where(filters.project_plan_component)
				.where( filters.activity_type)
				.where( filters.project_startDateNative )
				.where( filters.project_endDateNative)
				.exec(function (err, results){

					if (err) return res.serverError(err);

							if(results.length){


								counter = 0;

								length = results.length;

								results.forEach(function(projrecord,i){



										if(projrecord.implementing_partners && projrecord.implementing_partners.length > 0){



											TargetLocation.find()
											.where( {project_id: projrecord.id})
											.where( filters.admin1pcode )
											.where( filters.admin2pcode ).exec(function(err,targloc){


											if(targloc.length){

											projrecord.implementing_partners.forEach(function (partner, j){

												if(partner.organization_tag){


					                                  const resultado = implementpartnerstotal.find( implpartner => implpartner.organization_tag === partner.organization_tag );

							                             if(!resultado){
							                             	implementpartnerstotal.push(partner);
							                             	//console.log("METI EL PARTNER: ", partner);

							                             }

							                         }
					                            

												});

													
												}

												counter++;
							                    if ( counter === length ) {

							                      // table
													return res.json( 200, {'value': implementpartnerstotal.length} );
							                    }
											});

										}else{
											counter ++;
											if ( counter === length ) {

							                      // table
													return res.json( 200, {'value': implementpartnerstotal.length} );
							                    }
										}
				              });
							}else{

								return res.json( 200, {'value': implementpartnerstotal.length} );
							}
						});


				}
				

				break;


				case 'implementing_partners_list_4wdashboard_projectplan':

					if(params.admin1pcode === 'all'){


						var imppartners = [];


						Project
						.find()
						.where(filters.default)
						.where( filters.adminRpcode )
						.where( filters.admin0pcode )
						.where( filters.organization_tag )
						.where( filters.cluster_id)
						.where( filters.donor_tag)
						.where (filters.implementer_tag)
						.where(filters.project_plan_component)
						.where( filters.activity_type)
						.where( filters.project_startDateNative )
						.where( filters.project_endDateNative)

						.exec( function( err, results ) {
							if (err) return res.serverError(err);


					  

								if(results.length){

									results.forEach( function( d, i ) {

										if(d.implementing_partners){

											 d.implementing_partners.forEach(function (implpartner, j){

											 	if(implpartner.organization_tag){



						                             const resultado = imppartners.find( implementer => implementer.organization_tag === implpartner.organization_tag );

						                             if(!resultado){
						                             	imppartners.push(implpartner);
						                             }

				                         		}
				                            

											});

										}

									});

								}
								return res.json( 200, { 'data': imppartners } );



						});

					}else{

						var implementpartnerslist = [];


						Project
							.find()
							.where(filters.default)
						.where( filters.adminRpcode )
						.where( filters.admin0pcode )
						.where( filters.organization_tag )
						.where( filters.cluster_id)
						.where( filters.donor_tag)
						.where (filters.implementer_tag)
						.where(filters.project_plan_component)
						.where( filters.activity_type)
						.where( filters.project_startDateNative )
						.where( filters.project_endDateNative)
							.exec( function( err, results ) {


						if (err) return res.serverError(err);

								if(results.length){


								counter = 0;

								length = results.length;

								results.forEach(function(projrecord,i){



										if(projrecord.implementing_partners && projrecord.implementing_partners.length > 0){



											TargetLocation.find()
											.where( {project_id: projrecord.id})
											.where( filters.admin1pcode )
											.where( filters.admin2pcode ).exec(function(err,targloc){


											if(targloc.length){

											//console.log("ID PRJ: ",projrecord.id);
									//console.log("ID PRJ: ",projrecord.implementing_partners);


												 	projrecord.implementing_partners.forEach(function (partner, j){


												 		if(partner.organization_tag){

												 			 const resultado = implementpartnerslist.find( implpartner => implpartner.organization_tag === partner.organization_tag );

									                             if(!resultado){
									                             	implementpartnerslist.push(partner);
									                             	//console.log("METI EL PARTNER: ", partner);

									                             }
									                         }
					                            

														});

													
												}

												counter++;
							                    if ( counter === length ) {

							                    	
							                      // table
													return res.json( 200, {'data': implementpartnerslist} );
							                    }
											});

										}else{
											counter ++;
											if ( counter === length ) {

							                    	
							                      // table
													return res.json( 200, {'data': implementpartnerslist} );
							                    }
										}
				              });
							}else{

								return res.json( 200, {'data': implementpartnerslist} );

							}
						});

			}
				

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
							]).toArray(async function (err, targetlocations) {
							  	if (err) return res.serverError(err);

								// return no locations
								if ( !targetlocations.length ) {
                  coordinates = await AreaCentroidService.getAreaCentroid(filterObject);
                  return res.json(200, { 'data': { 'marker0': { layer: 'projects', lat: coordinates.lat, lng: coordinates.lng, message: '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">NO PROJECTS</h5>' } } });
                  // return res.json( 200, { 'data': { 'marker0': { layer: 'projects', lat:4.5973254, lng:-74.0759398, message: '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">NO PROJECTS</h5>' } } } );
                }
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


				//GRAPHICS

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
				if(params.admin1pcode === 'all'){

					
										
						TargetBeneficiaries.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObject
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
								//if (!beneficiaries.length) return res.json(200, { 'value': 0 });
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
										//var result = {data: []};
											return res.json( 200, { value:0 });
											//return res.json( 200, result);
											break;
									}

			
								});
							})	
					}else{

						TargetBeneficiaries
						.find()
						.where( filters.default )
						.where( filters.adminRpcode )
						.where( filters.admin0pcode )
						.where( filters.cluster_id )
						.where( filters.organization_tag )
						.where(filters.donor_tag)
						.where( filters.implementer_tag)
						.where(filters.project_plan_component)
						.where( filters.activity_type)
						.where( filters.project_startDateNative )
						.where( filters.project_endDateNative)
						.exec( function( err, beneficiaries ){

							
								if (err) return res.serverError(err);								

								// if no length

									if (!beneficiaries.length) {
									result.data[0].y = 100;
									result.data[0].label = 0;
									result.data[0].color = '#c7c7c7';
									return res.json(200, result);
								}
								

								if(beneficiaries.length){

									counter = 0;
									length = beneficiaries.length;
									totalprojectsupdated = [];

									totalMale = 0;
									totalFemale = 0;
									totalSex = 0;


										beneficiaries.forEach(function(targben){

											TargetLocation.find()
												.where( {project_id: targben.project_id})
												.where( filters.admin1pcode )
												.where( filters.admin2pcode ).exec(function(err,targloc){

													if(targloc.length){
															totalprojectsupdated.push(targben);

															totalMale = totalMale+targben.total_male;
															totalFemale = totalFemale+targben.total_female;
															totalSex = totalSex + targben.total_male + targben.total_female;
														}

														counter++;
									                    if ( counter === length ) {
									                    	$totalprojectsupdated = totalprojectsupdated[0];


													switch (req.param('chart_for')) {
													case 'children':
														if (totalMale < 1 && totalFemale < 1) {

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

															var malePerCent = (totalMale / totalSex)*100;
															var femalePerCent = (totalFemale / totalSex)*100;
															var sexTotalPerCent = (totalSex/ (totalMale+totalFemale))*100 ;

															result.label.left.label.label = malePerCent;
															result.label.left.subLabel.label = totalMale;
															// assign data center

															result.label.center.label.label = 100;
															result.label.center.subLabel.label = totalSex;
															// assign data right
															result.label.right.label.label = femalePerCent;
															result.label.right.subLabel.label = totalFemale;

															// highcharts girls
															result.data[0].y = femalePerCent;
															result.data[0].label = totalSex;
															// highcharts boys
															result.data[1].y = malePerCent;
															result.data[1].label = totalSex;


															
															return res.json(200, result);
														}

														break;


														default:
															return res.json( 200, { value:0 });
															
															break;
													}
									                      // table
									                    //   console.log("TOTAL PROYECTOS: ",totalprojects.length);

									                    }
													});
											});


									
								}/*else{
									return res.json(200, { 'value': 0 });
							
									}*/

			
								});
							

						}				
						
										
				break;


				case 'BarChartAges':
			// labels
				var result = {
					
								data: [{
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
						if(params.admin1pcode === 'all'){

										
						TargetBeneficiaries.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObject 
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
								//if (!beneficiaries.length) return res.json(200, { 'value': 0 });
									if (!beneficiaries.length) {
									result.data[0].y = 0;
									result.data[0].label = 0;
									result.data[0].color = '#c7c7c7';
									return res.json(200, result);
								}


								$beneficiaries = beneficiaries[0];




								switch (req.param('chart_for')) {
								
								case 'ages':

								

										if ($beneficiaries.age_0_5 < 1 && $beneficiaries.age_6_11 < 1 && $beneficiaries.age_12_17 < 1  && $beneficiaries.age_18_59 < 1  && $beneficiaries.age_60_more < 1) {

											
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
										

											var total = $beneficiaries.sexTotal;

											var TotalAge_0_5 = $beneficiaries.age_0_5;
											var TotalAge_6_11 = $beneficiaries.age_6_11;
											var TotalAge_12_17 = $beneficiaries.age_12_17;
											var TotalAge_18_59 = $beneficiaries.age_18_59;
											var TotalAge_60_more = $beneficiaries.age_60_more;


											var TotalAges = TotalAge_6_11 + TotalAge_0_5 +TotalAge_12_17 +  TotalAge_18_59 + TotalAge_60_more;

											var age_0_5PerCent = ($beneficiaries.age_0_5 / (total))*100;
											var age_6_11PerCent = ($beneficiaries.age_6_11 / (total))*100;
											var age_12_17PerCent = ($beneficiaries.age_12_17 / (total))*100;
											var age_18_59PerCent = ($beneficiaries.age_18_59 / (total))*100;
											var age_60_morePerCent = ($beneficiaries.age_60_more / (total))*100;


											// // highcharts women
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
								});
							});		

						}else{

							

							TargetBeneficiaries
						.find()
						.where( filters.default )
						.where( filters.adminRpcode )
						.where( filters.admin0pcode )
						.where( filters.cluster_id )
						.where( filters.organization_tag )
						.where(filters.donor_tag)
						.where( filters.implementer_tag)
						.where(filters.project_plan_component)
						.where( filters.activity_type)
						.where( filters.project_startDateNative )
						.where( filters.project_endDateNative)
						.exec( function( err, beneficiaries ){

						
								if (err) return res.serverError(err);								

								// if no length
								if (!beneficiaries.length) {
									result.data[0].y = 0;
									result.data[0].label = 0;
									result.data[0].color = '#c7c7c7';
									return res.json(200, result);
								}

								if(beneficiaries.length){

									counter = 0;
									length = beneficiaries.length;
									totalprojectsupdated = [];

									var TotalAge_0_5 = 0;
									var TotalAge_6_11 = 0;
									var TotalAge_12_17 = 0;
									var TotalAge_18_59 = 0;
									var TotalAge_60_more = 0;

									var TotalAges = 0;

									beneficiaries.forEach(function(targben){

											TargetLocation.find()
												.where( {project_id: targben.project_id})
												.where( filters.admin1pcode )
												.where( filters.admin2pcode ).exec(function(err,targloc){

													if(targloc.length){

															totalprojectsupdated.push(targben);

															TotalAge_0_5 = TotalAge_0_5+targben.boys_0_5 + targben.girls_0_5;
															TotalAge_6_11 = TotalAge_6_11+targben.boys_6_11 + targben.girls_6_11;
															TotalAge_12_17 = TotalAge_12_17 + targben.boys_12_17 + targben.girls_12_17;
															TotalAge_18_59 = TotalAge_18_59 + targben.men + targben.women;
															TotalAge_60_more = TotalAge_60_more + targben.elderly_men + targben.elderly_women;

															TotalAges = TotalAges + targben.total_female + targben.total_male;
														}

														counter++;
									                    if ( counter === length ) {
									                    	$totalprojectsupdated = totalprojectsupdated[0];


													switch (req.param('chart_for')) {
													case 'ages':
														if (TotalAge_0_5 < 1 && TotalAge_6_11 < 1 &&  TotalAge_12_17<1 && TotalAge_18_59 <1 && TotalAge_60_more<1) {

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



															//var TotalAges = TotalAge_6_11 + TotalAge_0_5 +TotalAge_12_17 +  TotalAge_18_59 + TotalAge_60_more;
															var Total = TotalAges;

															var age_0_5PerCent = (TotalAge_0_5 / (Total))*100;
															var age_6_11PerCent = (TotalAge_6_11 / (Total))*100;
															var age_12_17PerCent = (TotalAge_12_17 / (Total))*100;
															var age_18_59PerCent = (TotalAge_18_59 / (Total))*100;
															var age_60_morePerCent = (TotalAge_60_more / (Total))*100;


															// // highcharts women
															var string0_5label = 'Age 0-5: ' + TotalAge_0_5 + ' - ' + age_0_5PerCent.toFixed(1)+'%';
															result.data[0].y = TotalAge_0_5;
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
									   
									                    }
													});
											});


									
								}/*else{
									return res.json(200, { value: 0 });
									
									
									}*/

			
								});


							}			
						
										
				break;



				case 'BarChartBeneficiaryCluster':

				if(params.admin1pcode === 'all'){

					TargetBeneficiaries.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObject
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

								
								// if no length
								//if (!beneficiaries.length) return res.json(200, { 'value': 0 });
								if (!beneficiaries.length) {
									var result = {	
												data: [{
												'y': 0,
												'color': '#f48fb1',
												'label': 0,
												}]
												};
									return res.json(200, result);
								}


								if(beneficiaries.length){



									beneficiaries.totalBeneficiariesCluster= 0

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
										if (beneficiaries.length < 1) {
											
											var result = {	
													data: [{
														'y': 0,
														'color': '#f48fb1',
														'label': 0,
													}]
													};
											
											
											
											return res.json(200, result);
										} else {
											var result = {data: []};

											beneficiaries.forEach(function(bencluster,i){

											var newclusterbeneficiary = {
												'y':bencluster.totalBeneficiaries,
												'color':'blue',
												'name': bencluster._id.cluster,
												'label': (bencluster.totalBeneficiaries / (beneficiaries.totalBeneficiariesCluster))*100
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
							})	;
					}else{

						TargetBeneficiaries
						.find()
						.where( filters.default )
						.where( filters.adminRpcode )
						.where( filters.admin0pcode )
						.where( filters.cluster_id )
						.where( filters.organization_tag )
						.where(filters.donor_tag)
						.where( filters.implementer_tag)
						.where(filters.project_plan_component)
						.where( filters.activity_type)
						.where( filters.project_startDateNative )
						.where( filters.project_endDateNative)
						.exec( function( err, beneficiariesCluster ){

							if (err) return res.serverError(err);

							if (!beneficiariesCluster.length) {
									var result = {	
												data: [{
												'y': 0,
												'color': '#f48fb1',
												'label': 0,
												}]
												};
									return res.json(200, result);
								}

							if(beneficiariesCluster.length){

								counter = 0;
								length = beneficiariesCluster.length;
								listTargetBeneficiariesCluster = [];
								

								beneficiariesCluster.forEach(function(targben){

									TargetLocation.find()
										.where( {project_id: targben.project_id})
										.where( filters.admin1pcode )
										.where( filters.admin2pcode ).exec(function(err,targloc){

												if(targloc.length){

													listTargetBeneficiariesCluster.push(targben);
		
												}

										

											counter++;
									         if ( counter === length ) {

									         
									         	const targetbenefgroupsCluster = [...listTargetBeneficiariesCluster.reduce((r, o) => {
														  const key = o.cluster_id + '-' + o.cluster;
														  
														  const item = r.get(key) || Object.assign({}, o, {
														    total_beneficiaries: 0,
														    total_male : 0,
														    total_female : 0,
														    TOTALBEN : 0
														  });
														  
														  item.total_beneficiaries += o.total_beneficiaries;
														  item.total_male += o.total_male ;
														  item.total_female  += o.total_female;
														  item.TOTALBEN = item.total_male + item.total_female;

														  return r.set(key, item);
														}, new Map).values()];

									         	//console.log("RESULTADO: ",targetbenefgroups);

									         	totalBenFinalCluster = 0;

									         	targetbenefgroupsCluster.forEach(function (groupBen){

									         		totalBenFinalCluster = totalBenFinalCluster + groupBen.TOTALBEN;
									         	});


									         	switch (req.param('chart_for')) {
													case 'beneficiaryCluster':
														if (targetbenefgroupsCluster.length < 1 ) {


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

															var result = {data: []};


															targetbenefgroupsCluster.forEach(function(clus,i){


															

														var newclusbeneficiaryCluster = {
																'y':clus.TOTALBEN,
																'color':'blue',
																'name': clus.cluster,
																'label': (clus.TOTALBEN / (totalBenFinalCluster))*100
															};


																result.data.push(newclusbeneficiaryCluster)

															});

															
															return res.json(200, result);
														}
														break;
													
														default:
															return res.json( 200, { value:0 });
															
															break;
													}
									         }
									   });
									
								});


							}/*else{
								
								return res.json( 200, { value:0 });
						
							}		*/					



						});

					}				
							
											
				break;


				


				case 'BarChartBeneficiaryType':

				if(params.admin1pcode === 'all'){

					TargetBeneficiaries.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObject
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

								
								// if no length
								//if (!beneficiaries.length) return res.json(200, { 'value': 0 });
								

								if (!beneficiaries.length) {
									var result = {	
												data: [{
												'y': 0,
												'color': '#f48fb1',
												'label': 0,
												}]
												};
									return res.json(200, result);
								}
								


								if(beneficiaries.length){


									var result = {data:[]};

									beneficiaries.totalBeneficiariesType = 0

									beneficiaries.forEach(function(ben,i){

										beneficiaries.totalBeneficiariesType = beneficiaries.totalBeneficiariesType+ben.totalBeneficiaries 


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
										if (beneficiaries.length<1) {
											
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
											var result = {data: []};
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
							})	;
					}else{

						TargetBeneficiaries
						.find()
						.where( filters.default )
						.where( filters.adminRpcode )
						.where( filters.admin0pcode )
						.where( filters.cluster_id )
						.where( filters.organization_tag )
						.where(filters.donor_tag)
						.where( filters.implementer_tag)
						.where(filters.project_plan_component)
						.where( filters.activity_type)
						.where( filters.project_startDateNative )
						.where( filters.project_endDateNative)
						.exec( function( err, beneficiaries ){

							if (err) return res.serverError(err);

							if (!beneficiaries.length) {
									var result = {	
												data: [{
												'y': 0,
												'color': '#f48fb1',
												'label': 0,
												}]
												};
									return res.json(200, result);
								}



							if(beneficiaries.length){

								counter = 0;
								length = beneficiaries.length;
								listTargetBeneficiaries = [];
								var result = {data:[]};

								beneficiaries.forEach(function(targben){

									TargetLocation.find()
										.where( {project_id: targben.project_id})
										.where( filters.admin1pcode )
										.where( filters.admin2pcode ).exec(function(err,targloc){

											if(targloc.length){

												listTargetBeneficiaries.push(targben);


											
											}

											counter++;
									         if ( counter === length ) {

									         	//console.log("LISTA FINAL",listTargetBeneficiaries);

													

									         	const targetbenefgroups = [...listTargetBeneficiaries.reduce((r, o) => {
														  const key = o.beneficiary_type_id + '-' + o.beneficiary_type_name;
														  
														  const item = r.get(key) || Object.assign({}, o, {
														    total_beneficiaries: 0,
														    total_male : 0,
														    total_female : 0,
														    TOTALBEN : 0
														  });
														  
														  item.total_beneficiaries += o.total_beneficiaries;
														 
														  item.total_male += o.total_male ;
														  item.total_female  += o.total_female;
														  item.TOTALBEN = item.total_male + item.total_female;

														  return r.set(key, item);
														}, new Map).values()];

									         	//console.log("RESULTADO: ",targetbenefgroups);

									         	totalBenFinal = 0;

									         	targetbenefgroups.forEach(function (groupBen){

									         		totalBenFinal = totalBenFinal + groupBen.TOTALBEN;
									         	});




									         	switch (req.param('chart_for')) {
													case 'beneficiaryType':
														if (targetbenefgroups.length < 1 ) {
															
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

															var result = {data: []};


															targetbenefgroups.forEach(function(ben,i){


															

														var newtypebeneficiary = {
																'y':ben.TOTALBEN,
																'color':'blue',
																'name': ben.beneficiary_type_name,
																'label': (ben.TOTALBEN / (totalBenFinal))*100
															};


																result.data.push(newtypebeneficiary)

															});

															
															return res.json(200, result);
														}
														break;
													
														default:
															return res.json( 200, { value:0 });
															
															break;
													}
									         }
									});
								});


							}/*else{
								
								return res.json( 200, { value:0 });
								
							}*/							



						});

					}				
							
											
				break;

				//FINANCING CHARTS


				case 'BarChartFinancingCluster':

				if(params.admin1pcode === 'all'){

					Project.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObject
								},
								{
									$group:{
										_id: {cluster_id:'$cluster_id',cluster: '$cluster', project_budget_currency:'$project_budget_currency'},
										totalBudget: {
											$sum:  "$project_budget"
										},
										

									}
								}
							]).toArray(function (err, projectsbudget) {
								if (err) return res.serverError(err);	

								
								// if no length
								//if (!beneficiaries.length) return res.json(200, { 'value': 0 });
								if (!projectsbudget.length) {
									var result = {	
												data: [{
												'y': 0,
												'color': '#f48fb1',
												'label': 0,
												}]
												};
									return res.json(200, result);
								}

								//console.log("TAMAÑO: ",budgetprogress.lenth);


								if(projectsbudget.length){


									

									projectsbudget.totalBudgetCluster = 0

									projectsbudget.forEach(function(clus,i){
										//console.log("BUDGETPROGRESS: ", clus);

										if(clus._id.project_budget_currency === 'cop'){
											var clustotalBudgetsCOPtoUSD = clus.totalBudget/params.coptousd;
											projectsbudget.totalBudgetCluster = projectsbudget.totalBudgetCluster+clustotalBudgetsCOPtoUSD;

										}else if(clus._id.project_budget_currency === 'eur'){


											projectsbudget.totalBudgetCluster = projectsbudget.totalBudgetCluster+(clus.totalBudget*params.eurotousd);
										

										}else{
											projectsbudget.totalBudgetCluster = projectsbudget.totalBudgetCluster+clus.totalBudget

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

									projectsbudget = [{totalBudget:0}];
									

								}

								$projectsBudgetOne = projectsbudget[0];


							
								
								switch (req.param('chart_for')) {
									case 'financingCluster':
										if (projectsbudget.length < 1) {
											
											var result = {	
												data: [{
												'y': 0,
												'color': '#f48fb1',
												'label': 0,
												}]
												};
											
											
											return res.json(200, result);
										} else {
												var result = {data:[]};
											//console.log("LOS CLUSTERS: ",budgetprogress);

											projectsbudget.forEach(function(clus,i){

										if(clus._id.project_budget_currency === 'cop'){
											//console.log("Antes2 : ", clus.totalBudgetProgress);
											var clustotalBudgetsCOPtoUSDChart = clus.totalBudget/params.coptousd;
											//console.log("DESPUES2 : ",clustotalBudgetsCOPtoUSDChart);
											clus.totalBudget = clustotalBudgetsCOPtoUSDChart;
											clus.totalBudget = clus.totalBudget.toFixed(2);
											

										}else if(clus._id.project_budget_currency === 'eur'){

											var clustotalBudgetsEURtoUSDChart = clus.totalBudget*params.eurotousd;
											//console.log("DESPUES EUR: ",clustotalBudgetsEURtoUSDChart);
											clus.totalBudget = clustotalBudgetsEURtoUSDChart;
											clus.totalBudget = clus.totalBudget.toFixed(2);
										}



											var newclusterProjectsBudget = {
												'y':parseFloat(clus.totalBudget),
												'color':'blue',
												'name': clus._id.cluster+' ('+clus._id.project_budget_currency+')',
												'label': (clus.totalBudget / (projectsbudget.totalBudgetCluster))*100
											};


												result.data.push(newclusterProjectsBudget)

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
							})	;
					}else{

						Project
						.find()
						.where( filters.default )
						.where( filters.adminRpcode )
						.where( filters.admin0pcode )
						.where( filters.cluster_id )
						.where( filters.organization_tag )
						.where(filters.donor_tag)
						.where( filters.implementer_tag)
						.where(filters.project_plan_component)
						.where( filters.activity_type)
						.where( filters.project_startDateNative )
						.where( filters.project_endDateNative)
						.exec( function( err, projectBudgetCluster ){

							if (err) return res.serverError(err);

							if (!projectBudgetCluster.length) {
									var result = {	
												data: [{
												'y': 0,
												'color': '#f48fb1',
												'label': 0,
												}]
												};
									return res.json(200, result);
								}

							if(projectBudgetCluster.length){

								counter = 0;
								length = projectBudgetCluster.length;
								listProjectsBudgetCluster = [];
								
								var resultCluster = {data:[]};

								projectBudgetCluster.forEach(function(project){

									TargetLocation.find()
										.where( {project_id: project.id})
										.where( filters.admin1pcode )
										.where( filters.admin2pcode ).exec(function(err,targloc){

											if(targloc.length){

												listProjectsBudgetCluster.push(project);


											
											}

											counter++;
									         if ( counter === length ) {

									         	//console.log("LISTA FINAL",listTargetBeneficiaries);

													

									         	const projectsBudgetgroupsByCluster = [...listProjectsBudgetCluster.reduce((r, o) => {
														  const key = o.cluster_id + '-' + o.cluster + '-'+ o.project_budget_currency;
														  
														  const item = r.get(key) || Object.assign({}, o, {
														    project_budget: 0,
														    TOTALBUDGET : 0
														  });
														  
														  item.project_budget += o.project_budget;
														 
														  item.TOTALBUDGET = item.project_budget;

														  return r.set(key, item);
														}, new Map).values()];

									         	//console.log("RESULTADO: ",targetbenefgroups);

									         	totalFinancialFinalCluster = 0;

									         	listProjectsBudgetCluster.forEach(function (project){

									         		if(project.project_budget_currency === 'cop'){
														var clustotalBudgetsCOPtoUSD = project.project_budget/params.coptousd;
														totalFinancialFinalCluster = totalFinancialFinalCluster+clustotalBudgetsCOPtoUSD;

													}else if(project.project_budget_currency === 'eur'){


														totalFinancialFinalCluster = totalFinancialFinalCluster+(project.project_budget*params.eurotousd);
													

													}else{
														totalFinancialFinalCluster = totalFinancialFinalCluster+project.project_budget

													}
									         	});

									         	


									         	switch (req.param('chart_for')) {
													case 'financingCluster':
														if (projectsBudgetgroupsByCluster.length < 1 ) {
															
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

															var result = {data:[]};
														projectsBudgetgroupsByCluster.forEach(function(clus,i){


															if(clus.project_budget_currency === 'cop'){
											//console.log("Antes2 : ", clus.totalBudgetProgress);
											var clustotalBudgetsCOPtoUSDChart = clus.TOTALBUDGET/params.coptousd;
											//console.log("DESPUES2 : ",clustotalBudgetsCOPtoUSDChart);
											clus.TOTALBUDGET = clustotalBudgetsCOPtoUSDChart;
											clus.TOTALBUDGET = clus.TOTALBUDGET.toFixed(2);
											

										}else if(clus.project_budget_currency === 'eur'){

											var clustotalBudgetsEURtoUSDChart = clus.TOTALBUDGET*params.eurotousd;
											//console.log("DESPUES EUR: ",clustotalBudgetsEURtoUSDChart);
											clus.TOTALBUDGET = clustotalBudgetsEURtoUSDChart;
											clus.TOTALBUDGET = clus.TOTALBUDGET.toFixed(2);
										}


															

														var newclusfinancingCluster = {
																'y':parseFloat(clus.TOTALBUDGET),
																'color':'blue',
																'name': clus.cluster+' ('+clus.project_budget_currency+')',
																'label': (clus.TOTALBUDGET / (totalFinancialFinalCluster))*100,
																'drilldown': clus.cluster
															};


																resultCluster.data.push(newclusfinancingCluster)

															});

															
															return res.json(200, resultCluster);
														}
														break;
													
														default:
														return res.json( 200, { value:0 });
														
															break;
													}
									         }
									});
								});


							}/*else{

								return res.json( 200, { value:0 });
								
							}	*/						


						});

					}				
							
											
				break;



				case 'BarChartFinancingExecutorOrg':

				if(params.admin1pcode === 'all'){

					Project.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObject
								},
								{
									$group:{
										_id: {organization_tag:'$organization_tag',organization: '$organization', project_budget_currency:'$project_budget_currency'},
										totalBudgetOrgEx: {
											$sum:  "$project_budget"
										},
										

									}
								}
							]).toArray(function (err, projectsbudgetorg) {
								if (err) return res.serverError(err);	

								
								// if no length
								
							if (!projectsbudgetorg.length) {
								
									var result = {	
												data: [{
												'y': 0,
												'color': '#f48fb1',
												'label': 0,
												}]
												};
									return res.json(200, result);
								}

								//console.log("TAMAÑO: ",budgetprogress.lenth);


								if(projectsbudgetorg.length){


									

									projectsbudgetorg.totalBudgetExcOrg = 0

									projectsbudgetorg.forEach(function(orgExec,i){
										//console.log("BUDGETPROGRESS: ", clus);

										if(orgExec._id.project_budget_currency === 'cop'){
											var clustotalBudgetsCOPtoUSD = orgExec.totalBudgetOrgEx/params.coptousd;
											
											projectsbudgetorg.totalBudgetExcOrg = projectsbudgetorg.totalBudgetExcOrg+clustotalBudgetsCOPtoUSD;

											orgExec.totalBudgetOrgEx=clustotalBudgetsCOPtoUSD;
											orgExec.totalBudgetOrgEx = orgExec.totalBudgetOrgEx.toFixed(2);

										}else if(orgExec._id.project_budget_currency === 'eur'){

											var clustotalBudgetsEURtoUSDChart = orgExec.totalBudgetOrgEx*params.eurotousd;

											projectsbudgetorg.totalBudgetExcOrg = projectsbudgetorg.totalBudgetExcOrg+(orgExec.totalBudgetOrgEx*params.eurotousd);
											
											orgExec.totalBudgetOrgEx=clustotalBudgetsEURtoUSDChart;
											orgExec.totalBudgetOrgEx = orgExec.totalBudgetOrgEx.toFixed(2);

										}else{
											projectsbudgetorg.totalBudgetExcOrg = projectsbudgetorg.totalBudgetExcOrg+orgExec.totalBudgetOrgEx

										}


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

									projectsbudgetorg = [{totalBudgetOrgEx:0}];
									

								}

								$projectsBudgetOne = projectsbudgetorg[0];


							
								
								switch (req.param('chart_for')) {
									case 'financingExecutorOrg':
									//console.log("BUDG: ",projectsbudgetorg.length);
									//console.log("BUDG- new: ",projectsbudgetorg);
										if (projectsbudgetorg.length < 1) {
											
											var result = {	
												data: [{
												'y': 0,
												'color': '#f48fb1',
												'label': 0,
												}]
												};
											
											
											return res.json(200, result);
										} else {

											//console.log("LOS CLUSTERS: ",budgetprogress);
											var result = {	data: []};

											projectsbudgetorg.sort(function(a, b) {
										  return b.totalBudgetOrgEx - a.totalBudgetOrgEx;
											});

											projectsbudgetorg.forEach(function(excOrg,i){


												if(i<5){


											var newExecOrgProjectsBudget = {
												'y':parseFloat(excOrg.totalBudgetOrgEx),
												'color':'blue',
												'name': excOrg._id.organization+' ('+excOrg._id.project_budget_currency+')',
												'label': (excOrg.totalBudgetOrgEx / (projectsbudgetorg.totalBudgetExcOrg))*100
											};


												result.data.push(newExecOrgProjectsBudget);
											}

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
							})	;
					}else{

						Project
						.find()
						.where( filters.default )
						.where( filters.adminRpcode )
						.where( filters.admin0pcode )
						.where( filters.cluster_id )
						.where( filters.organization_tag )
						.where(filters.donor_tag)
						.where( filters.implementer_tag)
						.where(filters.project_plan_component)
						.where( filters.activity_type)
						.where( filters.project_startDateNative )
						.where( filters.project_endDateNative)
						.exec( function( err, projectBudgetOrgEx ){

							if (err) return res.serverError(err);

							if (!projectBudgetOrgEx.length) {
								
									var result = {	
												data: [{
												'y': 0,
												'color': '#f48fb1',
												'label': 0,
												}]
												};
									return res.json(200, result);
								}

							if(projectBudgetOrgEx.length){

								counter = 0;
								length = projectBudgetOrgEx.length;
								listProjectsBudgetExOrg = [];
								
								var resultOrgEx = {data:[]};

								projectBudgetOrgEx.forEach(function(project){

									TargetLocation.find()
										.where( {project_id: project.id})
										.where( filters.admin1pcode )
										.where( filters.admin2pcode ).exec(function(err,targloc){

											if(targloc.length){

												listProjectsBudgetExOrg.push(project);

											   
											}

											counter++;
									         if ( counter === length ) {

									         	//console.log("LISTA FINAL",listTargetBeneficiaries);

													

									         	const projectsBudgetgroupsByCluster = [...listProjectsBudgetExOrg.reduce((r, o) => {
														  const key = o.organization_tag + '-' + o.organization + '-'+ o.project_budget_currency;
														  
														  const item = r.get(key) || Object.assign({}, o, {
														    project_budget: 0,
														    TOTALBUDGET : 0
														  });
														  
														  item.project_budget += o.project_budget;
														 
														  item.TOTALBUDGET = item.project_budget;

														  return r.set(key, item);
														}, new Map).values()];

									         	//console.log("RESULTADO: ",targetbenefgroups);

									         	totalFinancialFinalOrgExec = 0;

									         	listProjectsBudgetExOrg.forEach(function (projectbud){

									         		if(projectbud.project_budget_currency === 'cop'){
														var projectBudgetsCOPtoUSD = projectbud.project_budget/params.coptousd;
														totalFinancialFinalOrgExec = totalFinancialFinalOrgExec+projectBudgetsCOPtoUSD;

													}else if(projectbud.project_budget_currency === 'eur'){


														totalFinancialFinalOrgExec = totalFinancialFinalOrgExec+(projectbud.project_budget*params.eurotousd);
													

													}else{
														totalFinancialFinalOrgExec = totalFinancialFinalOrgExec+projectbud.project_budget

													}

									         	});


									         	switch (req.param('chart_for')) {
													case 'financingExecutorOrg':
														if (projectsBudgetgroupsByCluster.length < 1 ) {
															
															
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

															var result = {	data: []};

														projectsBudgetgroupsByCluster.forEach(function(execOrg,i){


															if(execOrg.project_budget_currency === 'cop'){
											//console.log("Antes2 : ", clus.totalBudgetProgress);
											var clustotalBudgetsCOPtoUSDChart = execOrg.TOTALBUDGET/params.coptousd;
											//console.log("DESPUES2 : ",clustotalBudgetsCOPtoUSDChart);
											execOrg.TOTALBUDGET = clustotalBudgetsCOPtoUSDChart;
											execOrg.TOTALBUDGET = execOrg.TOTALBUDGET.toFixed(2);
											

										}else if(execOrg.project_budget_currency === 'eur'){

											var clustotalBudgetsEURtoUSDChart = execOrg.TOTALBUDGET*params.eurotousd;
											//console.log("DESPUES EUR: ",clustotalBudgetsEURtoUSDChart);
											execOrg.TOTALBUDGET = clustotalBudgetsEURtoUSDChart;
											execOrg.TOTALBUDGET = execOrg.TOTALBUDGET.toFixed(2);
										}


															

														var newExeOrgfinancingCluster = {
																'y':parseFloat(execOrg.TOTALBUDGET),
																'color':'blue',
																'name': execOrg.organization+' ('+execOrg.project_budget_currency+')',
																'label': (execOrg.TOTALBUDGET / (totalFinancialFinalOrgExec))*100
															};


																resultOrgEx.data.push(newExeOrgfinancingCluster)

															});

															
															return res.json(200, resultOrgEx);
														}
														break;
													
														default:
															return res.json( 200, { value:0 });
															
															break;
													}
									         }
									});
								});


							}/*else{

								return res.json( 200, { value:0 });
								
							}	*/						



						});

					}				
							
											
				break; 


				case 'BarChartFinancingOrgImplementing':


				if(params.admin1pcode === 'all'){



						Project.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObject
								}
							]).toArray(function (err, budgetsprogress) {
								if (err) return res.serverError(err);	

								
								// if no length
							if (!budgetsprogress.length) {
								var result = {	
												data: [{
												'y': 0,
												'color': '#f48fb1',
												'label': 0,
												}]
												};
									return res.json(200, result);
								}

								//console.log("TAMAÑO: ",budgetprogress.lenth);


								if(budgetsprogress.length){



									counter = 0;

									length = budgetsprogress.length;

									//budgetprogressimpl.totalBudgetProgressDonor = 0
									budgetsprogress.totalBudgetProgressOrgImpl = 0;

									implementorgbudgetprogress = [];

									totalFinancialFinalOrgImple = 0;

									budgetsprogress.forEach(function(budgprog){


										if(typeof budgprog.project_budget === 'string'){
													var stringtonum = parseFloat(budgprog.project_budget);

													console.log("ES STRING select ADMIN1PCODE !!");
										            	

										            if(stringtonum){



											         	if(budgprog.project_budget_currency === 'cop'){


																totalFinancialFinalOrgImple = totalFinancialFinalOrgImple + (stringtonum/params.coptousd);


															}else if(budgprog.project_budget_currency === 'eur'){


																totalFinancialFinalOrgImple = totalFinancialFinalOrgImple + (stringtonum*params.eurotousd);
																
															

															}else{


																totalFinancialFinalOrgImple = totalFinancialFinalOrgImple + stringtonum;
															}

											    	}
											    	else{

											    		totalFinancialFinalOrgImple = totalFinancialFinalOrgImple + 0;

											    	}
										}else{

											if(budgprog.project_budget_currency === 'cop'){


																totalFinancialFinalOrgImple = totalFinancialFinalOrgImple + (budgprog.project_budget/params.coptousd);


															}else if(budgprog.project_budget_currency === 'eur'){


																totalFinancialFinalOrgImple = totalFinancialFinalOrgImple + (budgprog.project_budget*params.eurotousd);
																
															

															}else{


																totalFinancialFinalOrgImple = totalFinancialFinalOrgImple + budgprog.project_budget;
															}


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
						                             		'project_budget':budgprog.project_budget,
						                             		'project_budget_currency':budgprog.project_budget_currency
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
														  const key = o.organization_tag + '-' + o.organization + '-'+ o.project_budget_currency;
														  
														  const item = r.get(key) || Object.assign({}, o, {
														    project_budget: 0,
														    TOTALBUDGET : 0
														  });
														  
														  item.project_budget += o.project_budget;
														 
														  item.TOTALBUDGET = item.project_budget;

														  return r.set(key, item);
														}, new Map).values()];  



									       	budgetprogressByImpleOrg.forEach(function(orgim,i){

									       		if(orgim.project_budget_currency === 'cop'){
														newTotalBudImpl  = orgim.TOTALBUDGET /params.coptousd;
														//console.log("tota cop: ", newTotalBudImpl);
														orgim.TOTALBUDGET = newTotalBudImpl.toFixed(2);
														//console.log("TOT cop: ",orgimplementer.TOTALBUDGET);

													}else if(orgim.project_budget_currency === 'eur'){

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
																		'name': 'Org Impl',
																		'label': 0,
																	}]
																};
													
													
													return res.json(200, result);
										} else {

											var result = {data:[]};


											budgetprogressByImpleOrg.sort(function(a, b) {
											  return b.TOTALBUDGET - a.TOTALBUDGET;
												});


											//console.log("LOS CLUSTERS: ",budgetprogress);

											budgetprogressByImpleOrg.forEach(function(orgimplementer,i){

											
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
													'name': orgimplementer.organization+' ('+orgimplementer.project_budget_currency+')',
													'label': (orgimplementer.TOTALBUDGET / (totalFinancialFinalOrgImple))*100
												};

												//console.log("AGREGADO A RESULT: ", neworgimplefinancial);



												result.data.push(neworgimplefinancial);
											}
											});

											
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
									return res.json(200, { value: 0 });

									
									

						}
					});
				});					

			}else{
				//console.log("ENTRA AQUI", filterObject);

				Project
						.find()
						.where( filters.default )
						.where( filters.adminRpcode )
						.where( filters.admin0pcode )
						.where( filters.cluster_id )
						.where( filters.organization_tag )
						.where(filters.donor_tag)
						.where( filters.implementer_tag)
						.where(filters.project_plan_component)
						.where( filters.activity_type)
						.where( filters.project_startDateNative )
						.where( filters.project_endDateNative)
						.exec( function( err, projects ){

								if (err) return res.serverError(err);	

								//console.log("PROJECTS: ",projects);
								// if no length
								if (!projects.length) {
								var result = {	
												data: [{
												'y': 0,
												'color': '#f48fb1',
												'label': 0,
												}]
												};
									return res.json(200, result);
								}


								if(projects.length){


									counter = 0;

									length = projects.length;



									implementorgfinancial = [];

									totalFinancialFinalOrgImple = 0;
																	

									projects.forEach(function(project){

										TargetLocation.find()
										.where( {project_id: project.id})
										.where( filters.admin1pcode )
										.where( filters.admin2pcode ).exec(function(err,targloc){

											if(targloc.length){

												if(typeof budgprog.project_budget === 'string'){
													var stringtonum = parseFloat(budgprog.project_budget);

													console.log("ES STRING select ADMIN1PCODE !!");
										            	

										            if(stringtonum){


															if(project.project_budget_currency === 'cop'){


																totalFinancialFinalOrgImple = totalFinancialFinalOrgImple + (project.project_budget/params.coptousd);


															}else if(project.project_budget_currency === 'eur'){


																totalFinancialFinalOrgImple = totalFinancialFinalOrgImple + (project.project_budget*params.eurotousd);
																
															

															}else{


																totalFinancialFinalOrgImple = totalFinancialFinalOrgImple + (project.project_budget);
															}

													}else{

														totalFinancialFinalOrgImple = totalFinancialFinalOrgImple + 0;


													}
											}else{

												if(project.project_budget_currency === 'cop'){


																totalFinancialFinalOrgImple = totalFinancialFinalOrgImple + (project.project_budget/params.coptousd);


															}else if(project.project_budget_currency === 'eur'){


																totalFinancialFinalOrgImple = totalFinancialFinalOrgImple + (project.project_budget*params.eurotousd);
																
															

															}else{


																totalFinancialFinalOrgImple = totalFinancialFinalOrgImple + (project.project_budget);
															}

											}
									   




												if(project.implementing_partners){

													//console.log("IMPLE: ",budgprog.implementing_partners);

													project.implementing_partners.forEach(function (imp, i){

														


														if(imp.organization_tag){




								                           /*  const exist = implementorgbudgetprogress.find( implementer => implementer.organization_tag === imp.organization_tag );

								                             if(!exist){*/

								                             	newimplementorg = {
								                             		'organization_name':imp.organization_name,
								                             		'organization_tag':imp.organization_tag,
								                             		'organization':imp.organization,
								                             		'project_budget':project.project_budget,
								                             		'project_budget_currency':project.project_budget_currency
								                             	}
								                             	implementorgfinancial.push(newimplementorg);

								                             	//console.log("HICE PUSH: ",newimplementorg);

																
								                             //}

								                         }
						                            

													});

												}
											}

												counter++;
												

												if(counter === length){
																														



															 const budgetprogressByImpleOrg = [...implementorgfinancial.reduce((r, o) => {
																  const key = o.organization_tag + '-' + o.organization_name + '-'+ o.project_budget_currency;
																  
																  const item = r.get(key) || Object.assign({}, o, {
																    project_budget: 0,
																    TOTALBUDGET : 0
																  });
																  
																  item.project_budget += o.project_budget;
																 
																  item.TOTALBUDGET = item.project_budget;

																  return r.set(key, item);
																}, new Map).values()];  

												

														       	budgetprogressByImpleOrg.forEach(function(orgim,i){

														       		if(orgim.project_budget_currency === 'cop'){
																			newTotalBudImpl  = orgim.TOTALBUDGET /params.coptousd;
																			//console.log("tota cop: ", newTotalBudImpl);
																			orgim.TOTALBUDGET = newTotalBudImpl.toFixed(2);
																			//console.log("TOT cop: ",orgimplementer.TOTALBUDGET);

																		}else if(orgim.project_budget_currency === 'eur'){

																			newTotalBudImpl = orgim.TOTALBUDGET *params.eurotousd;
																			//console.log("tota eur: ", newTotalBudImpl);

																			orgim.TOTALBUDGET = newTotalBudImpl.toFixed(2);
																			//console.log("TOT euro: ",orgimplementer.TOTALBUDGET);

																		}

																});


																switch (req.param('chart_for')) {
																	case 'financingOrgImplementing':

																		if (!budgetprogressByImpleOrg.length) {
																			
																			var result = {	
																				data: [{
																					'y': 0,
																					'color': '#f48fb1',
																					'name': 'Org Impl',
																					'label': 0,
																				}]
																			};
																			
																			
																			return res.json(200, result);
																		} else {

																			var result = {data:[]};

																			budgetprogressByImpleOrg.sort(function(a, b) {
																			  return b.TOTALBUDGET - a.TOTALBUDGET;
																				});

																			budgetprogressByImpleOrg.forEach(function(orgimplement,i){

																				if(i<5){
																					var orgimplementer_name;
																					if(orgimplement.organization_name){
																						orgimplementer_name = orgimplement.organization_name;

																					}else{
																						orgimplement.organization_tag;

																					}
																						var neworgimplefinancial = {
																							'y': parseFloat(orgimplement.TOTALBUDGET),
																							'color':'blue',
																							'name': orgimplement.organization+' ('+orgimplement.project_budget_currency+')',
																							'label': (orgimplement.TOTALBUDGET / (totalFinancialFinalOrgImple))*100
																						};

																						
																						result.data.push(neworgimplefinancial);
																				}

																			});

																			return res.json(200, result);


																		}

																		break;

																		default:
																		return res.json( 200, { value:0 });
																		
																		break;
														}

											}


										});//Termino verificación de TargetLocation

									});

								}

							});

						
				}





				break;



				case 'BarChartFinancingDonor':


				if(params.admin1pcode === 'all'){



						Project.native(function (err, results) {
							if(err) return res.serverError(err);
			
							results.aggregate([
								{
									//$match : filterObject
									$match: filterObject
								}
							]).toArray(function (err, financingdonor) {
								if (err) return res.serverError(err);	

								
								// if no length
								if (!financingdonor.length) {
									var result = {	
												data: [{
												'y': 0,
												'color': '#f48fb1',
												'label': 0,
												}]
												};
									return res.json(200, result);
								}

								//console.log("TAMAÑO: ",budgetprogress.lenth);


								if(financingdonor.length){



									counter = 0;

									length = financingdonor.length;

									//budgetprogressimpl.totalBudgetProgressDonor = 0
									

									donorsFinancing = [];

									totalFinancialFinalDonor = 0;

									financingdonor.forEach(function(projfinancial){

										if(typeof projfinancial.project_budget === 'string'){
											var stringtonum = parseFloat(projfinancial.project_budget);

										
								            	

								            if(stringtonum){

								            	
								            	
								            	if(projfinancial.project_budget_currency === 'cop'){

									         		totalFinancialFinalDonor = totalFinancialFinalDonor + (stringtonum/params.coptousd);
														

													}else if(projfinancial.project_budget_currency === 'eur'){

														
														totalFinancialFinalDonor = totalFinancialFinalDonor + (stringtonum*params.eurotousd);
														
													

													}else{
														
														totalFinancialFinalDonor = totalFinancialFinalDonor + stringtonum;
														

													}

												}else{


													totalFinancialFinalDonor = totalFinancialFinalDonor + 0;

												}
											}else{


												if(projfinancial.project_budget_currency === 'cop'){

														totalFinancialFinalDonor = totalFinancialFinalDonor + (projfinancial.project_budget/params.coptousd);
														

													}else if(projfinancial.project_budget_currency === 'eur'){


														totalFinancialFinalDonor = totalFinancialFinalDonor + (projfinancial.project_budget*params.eurotousd);
														
														
													

													}else{


														totalFinancialFinalDonor = totalFinancialFinalDonor + (projfinancial.project_budget);
														

													}


											}

										if(projfinancial.project_donor){

											//console.log("IMPLE: ",budgprog.implementing_partners);

											projfinancial.project_donor.forEach(function (don, i){

												


												if(don.project_donor_id){




															 if(don.project_donor_budget){
															 	donor_budg =  don.project_donor_budget;

															 }	else{
															 	donor_budg = 0;
															 }

						                             	newdonor = {
						                             		'donor_name':don.project_donor_name,
						                             		'donor_id':don.project_donor_id,
						                             		'donor_budget':donor_budg,
						                             		'project_budget_currency':projfinancial.project_budget_currency
						                             	}
						                             	donorsFinancing.push(newdonor);

						                             	//console.log("HICE PUSH: ",newimplementorg);

														
						                             //}

						                         }
				                            

											});

										}

										counter++;

									    if ( counter === length ) {

									    	


									       const financingGroupByDonors = [...donorsFinancing.reduce((r, o) => {
														  const key = o.donor_id + '-' + o.donor_name + '-'+ o.project_budget_currency;
														  
														  const item = r.get(key) || Object.assign({}, o, {
														    donor_budget: 0,
														    TOTALBUDGET : 0
														  });
														  
														  item.donor_budget += o.donor_budget;
														 
														  item.TOTALBUDGET = item.donor_budget;

														  return r.set(key, item);
														}, new Map).values()];  



									       	financingGroupByDonors.forEach(function(orgdonor,i){

									       		if(orgdonor.project_budget_currency === 'cop'){
														newTotalBudDon  = orgdonor.TOTALBUDGET /params.coptousd;
														//console.log("tota cop: ", newTotalBudImpl);
														orgdonor.TOTALBUDGET = newTotalBudDon.toFixed(2);
														//console.log("TOT cop: ",orgimplementer.TOTALBUDGET);

													}else if(orgdonor.project_budget_currency === 'eur'){

														newTotalBudDon = orgdonor.TOTALBUDGET *params.eurotousd;
														//console.log("tota eur: ", newTotalBudImpl);

														orgdonor.TOTALBUDGET = newTotalBudDon.toFixed(2);
														//console.log("TOT euro: ",orgimplementer.TOTALBUDGET);

													}

											});

									        // console.log("TOTAL: ",totalFinancialFinalOrgImple);

									    switch (req.param('chart_for')) {
											case 'financingDonor':

											//console.log("TOTAL-2: ", budgetprogress.totalBudgetProgressCluster);
												if (!financingGroupByDonors.length) {
													
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

											financingGroupByDonors.sort(function(a, b) {
											  return b.TOTALBUDGET - a.TOTALBUDGET;
												});


											//console.log("LOS CLUSTERS: ",budgetprogress);

											financingGroupByDonors.forEach(function(orgdon,i){

											
											if(i<5){

												//console.log("CADA GRUPO: ", orgimplementer);

											var donor_name;
											if(orgdon.donor_name){
												donor_name = orgdon.donor_name;

											}else{
												orgdon.donor_id;

											}
												var neworgdonorfinancial = {
													'y': parseFloat(orgdon.TOTALBUDGET),
													'color':'blue',
													'name': donor_name+' ('+orgdon.project_budget_currency+')',
													'label': (orgdon.TOTALBUDGET / (totalFinancialFinalDonor))*100
												};

												//console.log("AGREGADO A RESULT: ", neworgimplefinancial);



												result.data.push(neworgdonorfinancial);
											}
											});

											
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
									return res.json(200, { value: 0 });

						}
					});
				});					

			}else{

				Project
						.find()
						.where( filters.default )
						.where( filters.adminRpcode )
						.where( filters.admin0pcode )
						.where( filters.cluster_id )
						.where( filters.organization_tag )
						.where(filters.donor_tag)
						.where( filters.implementer_tag)
						.where(filters.project_plan_component)
						.where( filters.activity_type)
						.where( filters.project_startDateNative )
						.where( filters.project_endDateNative)
						.exec( function( err, projects ){

								if (err) return res.serverError(err);	

								if (!projects.length) {
									var result = {	
												data: [{
												'y': 0,
												'color': '#f48fb1',
												'label': 0,
												}]
												};
									return res.json(200, result);
								}

								if(projects.length){


									counter = 0;

									length = projects.length;

									donorfinancial = [];

									totalFinancialFinalDonors = 0;

									projects.forEach(function(project){

										TargetLocation.find()
										.where( {project_id: project.id})
										.where( filters.admin1pcode )
										.where( filters.admin2pcode ).exec(function(err,targloc){

											if(targloc.length){

												if(typeof project.project_budget === 'string'){
													var stringtonum = parseFloat(project.project_budget);

										            	

										            if(stringtonum){

														if(project.project_budget_currency === 'cop'){


																totalFinancialFinalDonors = totalFinancialFinalDonors + (stringtonum/params.coptousd);


															}else if(project.project_budget_currency === 'eur'){


																totalFinancialFinalDonors = totalFinancialFinalDonors + (stringtonum*params.eurotousd);
																
															

															}else{


																totalFinancialFinalDonors = totalFinancialFinalDonors + stringtonum;
															}

														}else{
															totalFinancialFinalDonors = totalFinancialFinalDonors + 0;

														}
													}else{

														if(project.project_budget_currency === 'cop'){


																totalFinancialFinalDonors = totalFinancialFinalDonors + (project.project_budget/params.coptousd);


															}else if(project.project_budget_currency === 'eur'){


																totalFinancialFinalDonors = totalFinancialFinalDonors + (project.project_budget*params.eurotousd);
																
															

															}else{


																totalFinancialFinalDonors = totalFinancialFinalDonors + project.project_budget;
															}

														


													}
									   
													if(project.project_donor){

														//console.log("ENTRa: ",project.project_donor);

														project.project_donor.forEach(function (donor, i){

															

															if(donor.project_donor_id){

															 if(donor.project_donor_budget){
															 	donor_budg =  donor.project_donor_budget;

															 }	else{
															 	donor_budg = 0;
															 }

									                             	newdonororg = {
									                             		'donor_name':donor.project_donor_name,
									                             		'donor_id':donor.project_donor_id,
									                             		'donor_budget':donor_budg,
									                             		'project_budget_currency':project.project_budget_currency
									                             	}
									                             	donorfinancial.push(newdonororg);

									                         }
							                            

														});

													}
												}
											

											counter++;
												
												if(counter === length){

													

													


															 const financialgroupByDonors = [...donorfinancial.reduce((r, o) => {
																  const key = o.donor_id + '-' + o.donor_name + '-'+ o.project_budget_currency;
																  
																  const item = r.get(key) || Object.assign({}, o, {
																    donor_budget: 0,
																    TOTALBUDGET : 0
																  });
																  
																  item.donor_budget += o.donor_budget;
																 
																  item.TOTALBUDGET = item.donor_budget;

																  return r.set(key, item);
																}, new Map).values()];  

												

														       	financialgroupByDonors.forEach(function(orgdon,i){

														       		if(orgdon.project_budget_currency === 'cop'){
																			newTotalBudDonor  = orgdon.TOTALBUDGET /params.coptousd;
																			//console.log("tota cop: ", newTotalBudImpl);
																			orgdon.TOTALBUDGET = newTotalBudDonor.toFixed(2);
																			//console.log("TOT cop: ",orgimplementer.TOTALBUDGET);

																		}else if(orgdon.project_budget_currency === 'eur'){

																			newTotalBudDonor = orgdon.TOTALBUDGET *params.eurotousd;
																			//console.log("tota eur: ", newTotalBudImpl);

																			orgdon.TOTALBUDGET = newTotalBudDonor.toFixed(2);
																			//console.log("TOT euro: ",orgimplementer.TOTALBUDGET);

																		}

																});


																switch (req.param('chart_for')) {
																	case 'financingDonor':
																	//console.log("DONORS FINANCING: ",financialgroupByDonors);
																		if (!financialgroupByDonors.length) {
																			
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

																			financialgroupByDonors.sort(function(a, b) {
																			  return b.TOTALBUDGET - a.TOTALBUDGET;
																				});

																			financialgroupByDonors.forEach(function(orgdonor,i){

																				if(i<5){
																					var orgdonor_name;
																					if(orgdonor.donor_name){
																						orgdonor_name = orgdonor.donor_name;

																					}else{
																						orgdonor.donor_name;

																					}
																						var newdonorfinancial = {
																							'y': parseFloat(orgdonor.TOTALBUDGET),
																							'color':'blue',
																							'name': orgdonor_name+' ('+orgdonor.project_budget_currency+')',
																							'label': (orgdonor.TOTALBUDGET / (totalFinancialFinalDonors))*100
																						};

																						result.data.push(newdonorfinancial);
																				}

																			});

																			return res.json(200, result);


																		}

																		break;

																		default:
																		return res.json( 200, { value:0 });
																		
																		break;
																	}
																}
													});
											});

								}else{
									return res.json(200, { value: 0 });

								}

							});
									
			}

				break;

				default: 
				
					return res.json( 200, { value:0 });
					
					break;

		}

	}


};

module.exports = Cluster4wprojectplanDashboardController;
