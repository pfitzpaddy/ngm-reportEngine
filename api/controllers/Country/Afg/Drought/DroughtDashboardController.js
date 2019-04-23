/**
 * DroughtDashboardController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// require
var moment = require( 'moment' );
var json2csv = require( 'json2csv' );
var Promise = require( 'bluebird' );
var DroughtDashboard = {
	
	getSumBeneficiariy: function( records ){
		
		var value=0;
		
		records.forEach(function(d,i){
			for (var d_key in d) {
				if ((d_key === 'boys' || d_key === 'girls' || d_key === 'men' || d_key === 'women' || d_key === 'elderly_men' || d_key === 'elderly_women')  && !isNaN(d[d_key]) && typeof(d[d_key]) === 'number' ){
					value += d[d_key];
				}
			}
		});
		
		return value;
	},
	
	// get distinct 
	getDistinct: function( key, records ){
		
		store = {}
		records.forEach(function(d,i){
			for (var d_key in d) {
				
				if( key === d_key  && !store[key] ){
					store[d[key]] = true
				}
			}
		});
		return Object.keys(store).length;
	},

	removeDuplicate: function (key, records){
		lookupObject = {}
		newArray = [];
		
		for(var i in records){
			lookupObject[records[i][key]] = records[i];
		}
		for (var i in lookupObject){
			newArray.push(lookupObject[i]);
		}

		return newArray
	},
  
	// get params from req
	getParams: function( req ){
		// check req
		if (  !req.param('indicator') || !req.param('year') || !req.param('cluster') || !req.param('province')  || !req.param('district')  || !req.param('month') || !req.param('start_date') || !req.param('end_date') ) {
			return res.json( 401, { err: 'year, province, district, month, start_date, end_date required!' });
		}
		// return params
		return {
				indicator: req.param('indicator'),
				list: req.param('list') ? req.param('list') : false,
				year: parseInt( req.param('year') ),
				country: 'all',
				cluster: req.param('cluster'),
				province: req.param('province'),
				district: req.param('district'),
				urgency: req.param('urgency'),
				status_plan: req.param('status_plan'),
				organization_tag: req.param('organization_tag'),
				month: req.param('month'),
        start_date: req.param('start_date'),
        end_date: req.param('end_date'),
      
      }
			
    },
  
    // return filters
    getFilters: function( params ){
			// filters

			var beneficiaryTypeArray = ['drought_affected_non_displaced', 'drought_affected_displaced', 'natural_disaster_affected_drought'];
			if (params.urgency === 'emergency'){
				beneficiaryTypeArray = ['drought_affected_non_displaced', 'drought_affected_displaced'];
			} else if (params.urgency === 'non_emergency'){
				beneficiaryTypeArray = ['natural_disaster_affected_drought'];
			} else {
				beneficiaryTypeArray;
			}
			
      return {
				year: { report_year: params.year },
				country: params.country !=='all' ?{ admin0pcode: params.country }:{},
				cluster: params.cluster !== 'all' ? { 'activity_type.cluster_id': {contains: params.cluster}}: {},
        province: params.province !== 'all' ? { admin1pcode: params.province } : {},
        district: params.district !== 'all' ? { admin2pcode: params.district } : {},
				// organization_tag: params.organization_tag !== 'all' ? { organization_tag: params.organization_tag } : {},
				organization_tag: params.organization_tag !== 'all' ? { organization_tag: { '!': ['immap'] }, organization_tag: [params.organization_tag]}:{organization_tag:{'!':['immap']}},
				month: params.month !== 'all' ? { report_month: parseInt(params.month) } : {},
				date: { reporting_start_date: { '>=': params.start_date, '<': params.end_date } },
				// beneficiary_type: params.status_plan === 'all' ? { beneficiary_type_id: { contains:'drought_affected_'}}:{beneficiary_type_id: 'drought_affected_'+params.status_plan},
				beneficiary_type: params.status_plan === 'all' ? { beneficiary_type_id: { $in: beneficiaryTypeArray } } : { beneficiary_type_id: params.status_plan },
				// beneficiary_type: params.status_plan === 'all' ? { beneficiary_type_id: { '!': ['drought_affected_displaced'] }, beneficiary_type_id:['drought_affected_non_displaced'] } : { beneficiary_type_id: 'drought_affected_' + params.status_plan }
				// exclude: { organization_tag: { '!=': 'immap' } }
      }
    },
		
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
		
    // get epr indicators
    getDroughtReportsIndicator: function(req, res) {

			// params
    var params = DroughtDashboard.getParams( req, res );
		
    // filters
		var filters = DroughtDashboard.getFilters( params );
		
		
			Beneficiaries.find()
				.where(filters.year)
				.where(filters.cluster)
				.where(filters.province)
				.where(filters.district)
				.where(filters.beneficiary_type)
				.where(filters.organization_tag)
				.where(filters.month)
				.then(function (beneficiaries) {
					$report = beneficiaries;

					if ($report.length === 0) {

						switch (params.indicator) {

							case 'reports':

								return res.json(200, []);
								break;

							case 'calendar':

								return res.json(200, {});
								break;

						}
					} else {
						return Promise.map($report, function (report) {
							return Report.find({
								id: report.report_id
							})
								.then(function (data) {
									
									if(data.length>0){
										return data[0];

									} else{
										return [];
									}
								});
						})
							.then(function (beneficiaryReport) {
								switch (params.indicator) {

									case 'reports':
										beneficiaryReport = DroughtDashboard.removeDuplicate('id', beneficiaryReport);
										beneficiaryReport.forEach(function (b,i) {											
											beneficiaryReport[i].icon = 'watch_later';
											if (beneficiaryReport[i].report_status === 'complete'){
												beneficiaryReport[i].status = '#4db6ac';
												beneficiaryReport[i].status_title = 'Complete';
											} else if (beneficiaryReport[i].report_status === 'todo'){
												beneficiaryReport[i].status = '#fff176';
												beneficiaryReport[i].status_title = 'To Do';
											}else{
												beneficiaryReport[i].status = '#e57373';
												beneficiaryReport[i].status_title = 'Pending';
											}
										})
										
										return res.json(200, beneficiaryReport);
										break;

									case 'calendar':
										// result
										var result = {};

										// for each row, format for cal-heatmap
										beneficiaryReport = DroughtDashboard.removeDuplicate('id', beneficiaryReport);
										beneficiaryReport.forEach(function (d, i) {

											// timestamp is seconds since 1st Jan 1970
											if (!result[new Date(d.report_submitted).getTime() / 1000]) {
												result[new Date(d.report_submitted).getTime() / 1000] = 0;
											}
											result[new Date(d.report_submitted).getTime() / 1000]++;
										});

										// return number of expected reports
										return res.json(200, {
											'data': result
										});
										break;

									default:

										// return number of reports
										return res.json(200, beneficiaryReport);

										break;
								}
							});
					}
				})
				.catch(function (err) {
					return res.negotiate(err);
				})
							
	},
  
    // get alert indicator
    getDroughtIndicator: function(req, res) {
			
      // params
      var params = DroughtDashboard.getParams( req );
			
      // filters
      var filters = DroughtDashboard.getFilters( params );
			
      // run query
      Beneficiaries
			.find()
			.where( filters.year )
			.where( filters.cluster )
			.where( filters.province )
			.where( filters.district )
			.where( filters.beneficiary_type )
			.where( filters.organization_tag )
			.where( filters.month )
      .exec( function( err, results ){
					
          // return error
          if (err) return res.negotiate( err );
  
          // indicator
          switch( params.indicator ){
						
            // total reports due
            case 'rows':
						
						// return number of expected reports
						return res.json( 200, { 'value': results.length } );
  
						break;
  
            case 'total':
  
						
							var value = DroughtDashboard.getSumBeneficiariy(results);							
              return res.json( 200, { 'value': value } );
  
							case 'locations':
							
								var value = DroughtDashboard.getDistinct( 'admin2pcode', results );
								
								return res.json( 200, { 'value': value } );
							
							case 'cluster':

								var value = DroughtDashboard.getDistinct('cluster', results);
								
								return res.json(200, { 'value': value });
							
							case 'activities':
  
								var value = DroughtDashboard.getDistinct( 'activity_description_id', results );
								return res.json( 200, { 'value': value } );
							
							// total reports submitted
							case 'submitted_reports':

							// return number of expected reports
                var value = DroughtDashboard.getDistinct( 'dataid', results );
                return res.json( 200, { 'value': value } );
                

								case 'markers':
  
								// markers
              var markers = {};
							
              // for each
              results.forEach(function(d,i){
								d.total = d.boys +
									d.girls +
									d.men +
									d.women +
									d.elderly_men +
									d.elderly_women;
								// message
                var message = '<div class="center card-panel" style="width:300px">' +
															'<div>' + '<div class="count" style="text-align:center">' + d.total + '</div> Beneficiaries <br/><br/>' + '</div>'+
															'<div>' + '<div style="text-align:center">' + d.activity_description_name + '</div>' + '<div>' +
                              '<div style="text-align:center">' + d.girls + ' girls, ' +  d.boys + ' boys, ' + d.men + ' men, ' + d.women + ' women' +'</div>' +
                              '<div>' + 'in ' + d.admin1name + ', ' + d.admin2name + '</div>' +                              
                              '<div>' +'<div style="text-align:center">' + d.organization + '</div>' +
															'</div>';
																// create markers
																markers['marker' + i] = {
																	layer: 'beneficiaries',
																	lat: d.admin2lat,
																	lng: d.admin2lng,
                  message: message
                };
              });
  
              // return markers
              return res.json( { status:200, data: markers } );

              case 'organizations':

              if ( !params.list ) {
								
                  var value = DroughtDashboard.getDistinct( 'organization_tag', results );
								
									return res.json( 200, { 'value': value } );
									
                  break;
  
								} else {
									
									var organizations = [];
									
                  results.forEach(function( d, i ){
										
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
											organizations = DroughtDashboard.flatten( organizations );
                    }
										
                    // order
                    organizations.sort(function(a, b) {
											return a.organization.localeCompare(b.organization);
                    });
										
                    // default
                    organizations.unshift({
                      organization_tag: 'all',
                      organization: 'All',
                    });
  
                    return res.json( 200, organizations );
                    
										
                    break;
									}
									
							
									default:
  
									// return number of expected reports
              return res.json( 200, results );
							
              break;
							
						}
  
						
        });
				
    },
		
 
    getDroughtData: function(req, res) {
			
			// params
			var params = DroughtDashboard.getParams( req );
			
			// filters
			var filters = DroughtDashboard.getFilters( params );
		
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
											'activity_type_id',
											'activity_type_name',
											'activity_description_id',
											'activity_description_name',
											'activity_status_id',
											'activity_status_name',
											'delivery_type_id',
											'delivery_type_name',
											'units',
											'unit_type_id',
											'unit_type_name',
											'transfer_type_value',
											'mpc_delivery_type_id',
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
											'site_lng',
											'site_lat'
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
										'activity_type_id',
										'activity_type_name',
										'activity_description_id',
										'activity_description_name',
										'activity_status_id',
										'activity_status_name',
										'delivery_type_id',
										'delivery_type_name',
										'units',
										'unit_type_id',
										'unit_type_name',
										'transfer_type_value',
										'mpc_delivery_type_id',
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
										'site_lng',
										'site_lat'
									];			
		
    // run query
    Beneficiaries
		.find()
		.where( filters.year )
		.where( filters.cluster )
    .where( filters.province )
		.where( filters.district )
		.where( filters.beneficiary_type)
		.where( filters.organization_tag )
		.where( filters.month )
    .exec( function( err, results ){
				
			
        // return error
				if (err) return res.negotiate( err );
				// format  / sum
				results.forEach(function (d, i) {
					results[i].report_month = moment(results[i].reporting_period).format('MMMM');
					results[i].total =results[i].boys +
														results[i].girls +
														results[i].men +
														results[i].women +
														results[i].elderly_men +
														results[i].elderly_women;
				});
				
        // return csv
			json2csv({ data: results, fields: fields, fieldNames: fieldNames}, function( err, csv ) {
					
					// error
					if ( err ) return res.negotiate( err );
					
        // success
        return res.json( 200, { data: csv } );

			}); 
			
    });
		
	},
  
	
    
	getLatestUpdate: function( req, res ){
		
		if (req.param('status_plan') === 'all'){
			beneficiary_type= {beneficiary_type_id: { contains: 'drought_affected_' }}			
		} else{
			beneficiary_type = { beneficiary_type_id: 'drought_affected_' + req.param('status_plan') }			
		}
		Beneficiaries
			.find()
			.where(beneficiary_type )
			.where({'organization_tag': { '!': ['immap'] }})
			.limit(1)
			.exec( function( err, results ){
				
				// return error
				if (err) return res.negotiate( err );
				
				// latest update
				return res.json( 200, results[0] );
	
			});
	}    
};

module.exports = DroughtDashboard;