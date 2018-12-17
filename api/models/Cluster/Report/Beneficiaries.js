/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
// var 				  _ = require('lodash');
var 		   ObjectId = require('mongodb').ObjectID;
const BulkHasOperations = function (b) { return b && b.s && b.s.currentBatch && b.s.currentBatch.operations && b.s.currentBatch.operations.length > 0; }

module.exports = {

	// connection
	connection: 'ngmHealthClusterServer',

	// strict schema
	schema: true,

	// attributes
	attributes: {
		// region/country
		adminRpcode: {
			type: 'string',
			required: true
		},
		adminRname: {
			type: 'string',
			required: true
		},
		admin0pcode: {
			type: 'string',
			required: true
		},
		admin0name: {
			type: 'string',
			required: true
		},
		organization_id: {
			type: 'string',
			required: true
		},
		organization_tag: {
			type: 'string',
			required: true
		},
		organization: {
			type: 'string',
			required: true
		},
		implementing_partners: {
			type: 'string'
		},
		cluster_id: {
			type: 'string',
			required: true
		},
		cluster: {
			type: 'string',
			required: true
		},
		name: {
			type: 'string',
			required: true
		},
		position: {
			type: 'string',
			required: true
		},
		phone: {
			type: 'string',
			required: true
		},
		email: {
			type: 'string',
			unique: true,
			required: true
		},
		username: {
			type: 'string',
			required: true
		},

		// project
		project_id: {
			type: 'string',
			required: true
		},
		project_acbar_partner: {
			type: 'boolean'
		},
		project_hrp_code: {
			type: 'string',
			required: true
		},
		project_code: {
			type: 'string'
		},
		project_status: {
			type: 'string',
			defaultsTo: 'new'
		},
		project_title: {
			type: 'string',
			required: true
		},
		project_description: {
			type: 'string',
			required: true
		},
		project_start_date: {
			type: 'date',
			required: true
		},
		project_end_date: {
			type: 'date',
			required: true
		},
		project_budget: {
			type: 'float'
		},
		project_budget_currency: {
			type: 'string',
			required: true
		},
		mpc_purpose: {
			type: 'array'
		},
		mpc_purpose_cluster_id: {
			type: 'string'
		},
		mpc_purpose_type_id: {
			type: 'string'
		},
		mpc_purpose_type_name: {
			type: 'string'
		},
		inter_cluster_activities: {
			type: 'array'
		},
		project_donor: {
			type: 'array'
		},

		// SOs
		strategic_objectives: {
			type: 'array'
		},

		// report
		report_id: {
			type: 'string',
			required: true
		},
		report_active: {
			type: 'boolean',
			defaultsTo: true
		},
		report_status: {
			type: 'string',
			defaultsTo: 'todo'
		},
		report_month: {
			type: 'integer',
			required: true
		},
		report_year: {
			type: 'integer',
			required: true
		},
		report_submitted: {
			type: 'date'
		},
		reporting_period: {
			type: 'date',
			required: true
		},
		reporting_due_date: {
			type: 'date',
			required: true
		},

		// category
		category_type_id: {
			type: 'string'
		},
		category_type_name: {
			type: 'string'
		},

		// beneficiary
		beneficiary_type_id: {
			type: 'string',
			required: true
		},
		beneficiary_type_name: {
			type: 'string',
			required: true
		},
		distribution_start_date: {
			type: 'date'
		},
		distribution_end_date: {
			type: 'date'
		},
		distribution_status: {
			type: 'string'
		},

		// activity_type
		activity_type_id: {
			type: 'string',
			required: true
		},
		activity_type_name: {
			type: 'string',
			required: true
		},

		// activity_description
		activity_description_id: {
			type: 'string',
			required: true
		},
		activity_description_name: {
			type: 'string',
			required: true
		},

		// added new 'W' for NG, activities should be planned better
		activity_detail_id: {
			type: 'string'
		},
		activity_detail_name: {
			type: 'string'
		},

		// NG cholera response
		activity_cholera_response_id: {
			type: 'string'
		},
		activity_cholera_response_name: {
			type: 'string'
		},		

		// indicator that relates to activity for HRP reporting
		indicator_id: {
			type: 'string'
		},
		indicator_name: {
			type: 'string'
		},	

		// mpc delivery
		mpc_delivery_type_id: {
			type: 'string'
		},
		mpc_delivery_type_name: {
			type: 'string'
		},

		//mpc mechanism
		mpc_mechanism_type_id:{
			type: 'string'
		},
		mpc_mechanism_type_name: {
			type: 'string'
		},

		package_type_id:{
			type: 'string'
		},

		package_type_name:{
			type: 'string'
		},
		
		// delivery (population, service)
		delivery_type_id: {
			type: 'string',
			defaultsTo: 'population'
		},
		delivery_type_name: {
			type: 'string',
			defaultsTo: 'New Beneficiaries'
		},

		// transfers per beneficiary
		transfer_type_id: {
			type: 'integer',
			defaultsTo: 0
		},
		transfer_type_value: {
			type: 'integer',
			defaultsTo: 0
		},

		// indicator
			// sessions -> training
		sessions:{
			type: 'integer',
			defaultsTo: 0
		},
			// units -> eiewg
		units: {
			type: 'float',
			defaultsTo: 0
		},
		// units
		unit_type_id: {
			type: 'string'
		},
		unit_type_name: {
			type: 'string'
		},

		// conditional/unconditional
		cash_amount: {
			type: 'integer',
			defaultsTo: 0
		},

		// beneficiaries
		households:{
			type: 'integer',
			defaultsTo: 0
		},
		families: {
			type: 'integer',
			defaultsTo: 0
		},
		boys:{
			type: 'integer',
			defaultsTo: 0
		},
		girls:{
			type: 'integer',
			defaultsTo: 0
		},
		men:{
			type: 'integer',
			defaultsTo: 0
		},
		women:{
			type: 'integer',
			defaultsTo: 0
		},
		elderly_men:{
			type: 'integer',
			defaultsTo: 0
		},
		elderly_women:{
			type: 'integer',
			defaultsTo: 0
		},
		total_beneficiaries:{
			type: 'integer',
			defaultsTo: 0
		},
		injury_treatment_same_province:{
			type: 'boolean'
		},

		// store partial kits
		partial_kits: {
			type: 'array'

		},

		// store kit details
		kit_details: {
			type: 'array'

		},

		// location
		location_id: {
			type: 'string'
		},
		admin1pcode: {
			type: 'string',
			required: true
		},
		admin1name: {
			type: 'string',
			required: true
		},
		admin2pcode: {
			type: 'string',
			required: true
		},
		admin2name: {
			type: 'string',
			required: true
		},
		admin3pcode: {
			type: 'string'
		},
		admin3name: {
			type: 'string'
		},
		admin4pcode: {
			type: 'string'
		},
		admin4name: {
			type: 'string'
		},
		admin5pcode: {
			type: 'string'
		},
		admin5name: {
			type: 'string'
		},

		// DTM
		site_id: {
			type: 'string'
		},
		site_class: {
			type: 'string'
		},
		site_status: {
			type: 'string'
		},
		site_implementation_id: {
			type: 'string'
		},
		site_implementation_name: {
			type: 'string'
		},
		site_type_id: {
			type: 'string'
		},
		site_type_name: {
			type: 'string'
		},
		site_name: {
			type: 'string',
			required: true
		},
		site_hub_id: {
			type: 'string'
		},
		site_hub_name: {
			type: 'string'
		},
		site_households:{
			type: 'integer',
			defaultsTo: 0,
		},
		site_population:{
			type: 'integer',
			defaultsTo: 0,
		},
		site_boys:{
			type: 'integer',
			defaultsTo: 0,
		},
		site_girls:{
			type: 'integer',
			defaultsTo: 0,
		},
		site_men:{
			type: 'integer',
			defaultsTo: 0,
		},
		site_women:{
			type: 'integer',
			defaultsTo: 0,
		},
		site_elderly_men:{
			type: 'integer',
			defaultsTo: 0,
		},
		site_elderly_women:{
			type: 'integer',
			defaultsTo: 0,
		},
		site_lng: {
			type: 'float',
			required: true
		},
		site_lat: {
			type: 'float',
			required: true
		},
		
		admin1lng: {
			type: 'float',
			required: true
		},
		admin1lat: {
			type: 'float',
			required: true
		},
		admin2lng: {
			type: 'float',
			required: true
		},
		admin2lat: {
			type: 'float',
			required: true
		},
		admin3lng: {
			type: 'float'
		},
		admin3lat: {
			type: 'float'
		},
		admin4lng: {
			type: 'float'
		},
		admin4lat: {
			type: 'float'
		},
		admin5lng: {
			type: 'float'
		},
		admin5lat: {
			type: 'float'
		},
		conflict: {
			type: 'boolean'
		},

		/******* WASH NG IRS *******/

		// Water (IRS) association
		water: {
			collection: 'wateractivities',
			via: 'beneficiary_id'
		},

		// Boreholes (IRS) association
		boreholes: {
			collection: 'borehole',
			via: 'beneficiary_id'
		},

		// Sanitation (IRS) association
		sanitation: {
			collection: 'sanitationactivities',
			via: 'beneficiary_id'
		},

		// Hygiene (IRS) association
		hygiene: {
			collection: 'hygieneactivities',
			via: 'beneficiary_id'
		},

		// Cash (IRS) association
		cash: {
			collection: 'cashactivities',
			via: 'beneficiary_id'
		},

		// Cash (IRS) association
		accountability: {
			collection: 'accountabilityactivities',
			via: 'beneficiary_id'
		},

		// Remarks
		remarks: {
			type: 'string'
		},



		/*********** 2016 *************/
		// Project details
		project_type: {
			type: 'array'
		},
		project_type_other: {
			type: 'string'
		},
		activity_type: {
			type: 'array'
		},
		activity_description: {
			type: 'array'
		},
		beneficiary_name: {
			type: 'string'
		},
		beneficiary_type: {
			type: 'array'
		},
		penta3_vacc_male_under1:{
			type: 'integer'
		},
		penta3_vacc_female_under1:{
			type: 'integer'
		},
		skilled_birth_attendant:{
			type: 'integer'
		},
		conflict_trauma_treated:{
			type: 'integer'
		},
		education_topic: {
			type: 'string'
		},
		education_sessions:{
			type: 'integer'
		},
		education_male:{
			type: 'integer'
		},
		education_female:{
			type: 'integer'
		},
		training_topic: {
			type: 'string'
		},
		training_sessions:{
			type: 'integer'
		},
		training_male:{
			type: 'integer'
		},
		training_female:{
			type: 'integer'
		}

	},

	// encrypt password before create, assign org_id
	// beforeCreate: function ( b, next ) {

	// 	// add reference for unlinked issue
	// 	b.location_reference_id = b.location_id.valueOf();
	// 	next();

	// }

	// updateOrCreate
		// http://stackoverflow.com/questions/25936910/sails-js-model-insert-or-update-records
	updateOrCreateEach: function( parent, values, cb ){
		var self = this; // reference for use by callbacks
		// If no values were specified, return []
		if (!values.length) cb( false, [] );

		var results = [],
				counter = 0,
				length = values.length;

		// values
		values.forEach(function( value ){

			if( value.id ){
				self.update({ id: value.id }, value, function( err, update ){
					if(err) return cb(err, false);
					results.push( update[0] );

					counter++;
					if( counter===length ){
						cb( false, results );
					}
				});
			}else{
				// set based on criteria
				for ( key in parent ){
					value[ key ] = parent[ key ];
				}
				self.create(value, function( err, create ){
					if(err) return cb(err, false);
					results.push( create );

					counter++;
					if( counter===length ){
						cb( false, results );
					}
				});
			}

		});
	},

	updateOrCreateEachBulk: function( values, status, cb ){
		var self = this; // reference for use by callbacks
		// If no values were specified, return []
		if (!values.length) cb( false, [] );
		var nBeneficiaries	   = 0,
			countBeneficiaries = 0,
			isError = false;
		
		// count n of beneficiaries to do ops on, 
		values.forEach(function( value,i ){
			// checked for [] before, but still
			if(Array.isArray(value.beneficiaries)){
				nBeneficiaries = nBeneficiaries + value.beneficiaries.length
			}
		});
		// if there are beneficiaries to perform ops on
		if(nBeneficiaries){
			self.native(function(err, collection) {
				if(err) return cb(err, false);

				// simple association finder, check waterline valuesParser if more advanced functionality needed
				var associationProps = Object.keys(self.attributes)
											 .filter(function(key){return self.attributes[key].hasOwnProperty("collection");});
				// date fields
				var dateProps 		 = Object.keys(self.attributes)
											 .filter(function(key){return self.attributes[key].type === 'date';});

				var bulk = collection.initializeUnorderedBulkOp();
				// add bulk operation per location, per beneficiary

				// measure time #TODO delete
				// var hrstart = process.hrtime()
				// measure time end

				values.forEach(function( value,i ){
					value.beneficiaries.forEach(function(b,j){
						// set report status
						b.report_status = status;

						// cast date fields to date
						dateProps.forEach(function(d){
							if( b[d] ){
								b[d] = new Date(b[d]);
							}
						});

						// validate each obj with sails model
						// if omitted will insert any incoming object into collection, but much faster
						// takes time #TODO: consider without validation
						self.validate(b,function(err){
							// return only first err callback for async ops
							if(isError) return;
							if(err&&isError===false){isError=true; return cb(err, false)};

							// obj without associations
							var _b = _.omit(b,associationProps);

							// if id exists update or create
							if (_b.id) {
								bulk.find( {_id:ObjectId(_b.id)} ).updateOne({ $set: _b });
							} else {
								b.location_id = _b.location_id  = value.id;
								// generate beneficiary id for associations reference
								b._id = _b._id  = new ObjectId()
								bulk.insert(_b)
							}

							countBeneficiaries++;

							if (countBeneficiaries === nBeneficiaries) {

								// measure time #TODO delete
								// var hrend = process.hrtime(hrstart)
								// console.info('Execution time (validate): %ds %dms', hrend[0], hrend[1] / 1000000)
								// measure time end

								if (BulkHasOperations(bulk)){ 
									bulk.execute(function(err, results) {
										if(err) return cb(err, false);
										// replace if _id with id like sails
										values.forEach(function( value,i ){
											value.beneficiaries.forEach(function(b,j){
												if(b._id){
													values[i].beneficiaries[j].id = b._id.toString();
													delete b._id;
												}
											})
										})
										// measure time #TODO delete
										// var hrstart = process.hrtime()
										// measure time end

										// update associations
										self.updateOrCreateAssociations(values, function(err){
											if(err) return cb(err, false);

											// measure time #TODO delete
											// hrend = process.hrtime(hrstart)
											// console.info('Execution time (associations): %ds %dms', hrend[0], hrend[1] / 1000000)
											// measure time end

											cb( false, [] );
										})
									});
								} else return cb( false, [] );
							}
						});
					});
				});
			})
		// if no beneficiaries
		} else return cb(false,[]);
	},

	updateOrCreateAssociations: function(values,cb){
		var self = this;
		// filter beneficiaries model attributes for associations
		associationsObject = _.pick(self.attributes, Object.keys(self.attributes).filter(function(key){return self.attributes[key].hasOwnProperty("collection");}));
		// flatten to array e.g. [{association:'boreholes', collection:'borehole', via: 'beneficiary_id'},{association:'sanitation', collection:'sanitationactivities', via: 'beneficiary_id'}]
		var associations = [];
		_.forIn(associationsObject,function(v,k){
			association = {association:k, collection: associationsObject[k].collection, via:associationsObject[k].via }
			associations.push(association)
		});
		var nAssociations  		= 0, 
			counterAssociations = 0;
		// total number of associations records to do ops on
		values.forEach(function(l,i){
			l.beneficiaries.forEach(function(b){
				associations.forEach(function(a){
					if(Array.isArray(b[a.association])){nAssociations = nAssociations + b[a.association].length;}
				});		
			});
		});
		// look for association in the beneficiary record and perform operation on it
		values.forEach(function(l,i){
			l.beneficiaries.forEach(function(b){
				// for each defined association in the model
				associations.forEach(function(a){
					// guard, check if association is an array
					if(Array.isArray(b[a.association])){
						// null all associations for a beneficiary like sails does, e.g. needed for deleted records updates
						// relinks foreign key on update phase if record not deleted
						sails.models[a.collection].update({beneficiary_id:b.id}, {beneficiary_id:null}).exec(function(err){
							if(err) return cb(err);
							if (nAssociations){
								b[a.association].forEach(function(record){
									// set foreign key (beneficiary_id) reference type ObjectId
									record[a.via] = b.id;
									// console.log(record)
									if(record.id){
										sails.models[a.collection].update({ id: record.id }, record, function( err ){
											// TODO return only one cb on err
											if(err) return cb(err);
											// for debug #TODO delete 
											// console.log('updated');
											counterAssociations++;
											if( counterAssociations===nAssociations ){
												cb( false );
											}
										});
									}else{
										sails.models[a.collection].create(record, function( err ){
											// TODO return only one cb on err
											if(err) return cb(err);
											// for debug #TODO delete 
											// console.log('created')
											counterAssociations++;
											if( counterAssociations===nAssociations ){
												cb( false );
											}
										});
									}
								})
							}
						})
					}
				})
			})
		})
		// return if no associations
		if(!nAssociations) return cb(false);
	}
};

