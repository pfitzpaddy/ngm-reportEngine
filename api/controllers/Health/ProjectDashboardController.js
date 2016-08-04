/**
 * ProjectController
 *
 * @description :: Health Cluster Dashboard
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// flatten json
function flatten( json ) {
  var array = [];
  for( var i in json ) {
    if ( json.hasOwnProperty( i ) && json[ i ] instanceof Object ){
      array.push( json[ i ] );
    }
  }
  return array;
}

var ProjectDashboardController = {

  // contact list
  getContactListCsv: function( req, res ){

    // require
    var json2csv = require( 'json2csv' ),
        moment = require( 'moment' ),
        fields = [ 'name', 'organization', 'admin0name', 'position', 'phone', 'email', 'createdAt' ],
        fieldNames = [ 'Name', 'Organization', 'Country', 'Position', 'Phone', 'Email', 'Joined ReportHub' ];

    // get all projects ( not empty )
    User.find( { app_home: 'health' } ).exec(function( err, users ){

      // return error
      if ( err ) return res.negotiate( err );

      // format date
      users.forEach( function( d, i ){
        users[ i ].createdAt = moment( d.createdAt ).format('YYYY-MM-DD')
      });

      // return csv
      json2csv({ data: users, fields: fields, fieldNames: fieldNames }, function( err, csv ) {
        
        // error
        if ( err ) return res.negotiate( err );

        // success
        return res.json( 200, { data: csv } );

      });     
      
    }); 

  },

  // prepare and return csv based on filtered project
  getCsvDownload: function( params, filters, projects, project_ids, res ) {

    // require
    var data = [],
        fields,
        fieldNames,
        moment = require( 'moment' ),
        json2csv = require( 'json2csv' );

    // return indicator
    switch( params.details ){

      // summarise financial progress
      case 'financial':

        // store data by project
        var projectStore = {};
        
        // json2csv
        fields = [ 'id', 'organization', 'admin0pcode', 'admin0name', 'project_code', 'project_title', 'project_budget', 'project_budget_currency', 'project_donor', 'project_budget_date_recieved', 'project_budget_amount_recieved' ],
        fieldNames = [ 'ReportHub ID', 'Partner', 'Country Pcode', 'Country', 'Project Code', 'Project Title', 'Total Project Budget', 'Project Budget Currency', 'Donor', 'Date Funds Recieved', 'Amount Recieved' ];

        // projects
        projects.forEach( function( p, i ){
          // project details
          projectStore[ p.id ] = {}
          projectStore[ p.id ].id = p.id;
          projectStore[ p.id ].organization = p.organization;
          projectStore[ p.id ].admin0pcode = p.admin0pcode;
          projectStore[ p.id ].admin0name = p.admin0name;
          projectStore[ p.id ].project_code = p.project_code;
          projectStore[ p.id ].project_title = p.project_title;

        });

        // get financial details
        BudgetProgress
          .find()
          .where( { project_id: project_ids } )
          .where( filters.financial_filter_s )
          .where( filters.financial_filter_e )
          .where( { organization: { '!': 'iMMAP' } } )
          .exec( function( err, budget ) {

            // error
            if ( err ) return res.negotiate( err );

            // budget
            budget.forEach( function( b, i ){

              // latest updated project details
              budget[ i ].organization = projectStore[ b.project_id ].organization;
              budget[ i ].project_code = projectStore[ b.project_id ].project_code;
              budget[ i ].project_title = projectStore[ b.project_id ].project_title;
              budget[ i ].admin0pcode = projectStore[ b.project_id ].admin0pcode;
              budget[ i ].admin0name = projectStore[ b.project_id ].admin0name;
              budget[ i ].project_budget_currency = b.project_budget_currency.toUpperCase();
              budget[ i ].project_budget_date_recieved = moment( b.project_budget_date_recieved ).format('YYYY-MM-DD');

            });
            
            // return csv
            json2csv({ data: budget, fields: fields, fieldNames: fieldNames }, function( err, csv ) {
              
              // error
              if ( err ) return res.negotiate( err );

              // success
              return res.json( 200, { data: csv } );

            });

          });

        break;

      // summarise beneficiaries by location ( admin2 )
      case 'locations':

        // store data by project
        var locationStore = {};
        
        // json2csv
        fields = [ 'admin0pcode', 'admin0name', 'admin1pcode', 'admin1name', 'admin2pcode', 'admin2name', 'under5male', 'under5female', 'over5male', 'over5female', 'penta3_vacc_male_under1', 'penta3_vacc_female_under1', 'skilled_birth_attendant', 'conflict_trauma_treated', 'education_male', 'education_female', 'capacity_building_male', 'capacity_building_female', 'total', 'lng', 'lat' ],
        fieldNames = [  'Country Pcode', 'Country', 'Admin1 Pcode', 'Admin1 Name', 'Admin2 Pcode', 'Admin2 Name', 'Under 5 Male', 'Under 5 Female', 'Over 5 Male', 'Over 5 Female', 'Penta3 Vacc Male Under1', 'Penta3 Vacc Female Under1', 'Skilled Birth Attendant', 'Conflict Trauma Treated', 'Education Male', 'Education Female', 'Capacity Building Male', 'Capacity Building Female', 'Total', 'lng', 'lat' ];

        // beneficiaires
        Beneficiaries
          .find()
          .where( { project_id: project_ids } )
          .where( filters.reporting_filter_s )
          .where( filters.reporting_filter_e )              
          .where( filters.adminRpcode_filter )
          .where( filters.admin0pcode_filter )
          .where( filters.admin1pcode_filter )
          .where( filters.admin2pcode_filter )
          .where( filters.beneficiaries_filter )
          .where( { organization: { '!': 'iMMAP' } } )
          .exec( function( err, beneficiaries ){

            // return error
            if ( err ) return res.negotiate( err );
            
            // beneficiaries
            beneficiaries.forEach( function( b, i ){

              // if nothing
              if ( !locationStore[ l.admin2pcode ] ) {
                locationStore[ l.admin2pcode ] = {};
                locationStore[ l.admin2pcode ].admin0pcode = l.admin0pcode;
                locationStore[ l.admin2pcode ].admin0name = l.admin0name;
                locationStore[ l.admin2pcode ].admin1pcode = l.admin1pcode;
                locationStore[ l.admin2pcode ].admin1name = l.admin1name;
                locationStore[ l.admin2pcode ].admin2pcode = l.admin2pcode;
                locationStore[ l.admin2pcode ].admin2name = l.admin2name;
                // beneficairies standard row 1
                locationStore[ l.admin2pcode ].under5male = 0;
                locationStore[ l.admin2pcode ].under5female = 0;
                locationStore[ l.admin2pcode ].over5male = 0;
                locationStore[ l.admin2pcode ].over5female = 0;
                // beneficairies standard row 2
                locationStore[ l.admin2pcode ].penta3_vacc_male_under1 = 0;
                locationStore[ l.admin2pcode ].penta3_vacc_female_under1 = 0;
                locationStore[ l.admin2pcode ].skilled_birth_attendant = 0;
                locationStore[ l.admin2pcode ].conflict_trauma_treated = 0;
                // beneficairies training/education
                locationStore[ l.admin2pcode ].education_male = 0;
                locationStore[ l.admin2pcode ].education_female = 0;
                locationStore[ l.admin2pcode ].capacity_building_male = 0;
                locationStore[ l.admin2pcode ].capacity_building_female = 0;
                // beneficairies total
                locationStore[ l.admin2pcode ].total = 0;
                // location lat, lng
                locationStore[ l.admin2pcode ].lat = l.admin2lat;
                locationStore[ l.admin2pcode ].lng = l.admin2lng;                   
              }

              // beneficairies standard row 1
              locationStore[ b.admin2pcode ].under5male += b.under5male;
              locationStore[ b.admin2pcode ].under5female += b.under5female;
              locationStore[ b.admin2pcode ].over5male += b.over5male;
              locationStore[ b.admin2pcode ].over5female += b.over5female;
              // beneficairies standard row 2
              locationStore[ b.admin2pcode ].penta3_vacc_male_under1 += b.penta3_vacc_male_under1;
              locationStore[ b.admin2pcode ].penta3_vacc_female_under1 += b.penta3_vacc_female_under1;
              locationStore[ b.admin2pcode ].skilled_birth_attendant += b.skilled_birth_attendant;
              locationStore[ b.admin2pcode ].conflict_trauma_treated += b.conflict_trauma_treated;
              // beneficairies training/education
              locationStore[ b.admin2pcode ].education_male += b.education_male;
              locationStore[ b.admin2pcode ].education_female += b.education_female;
              locationStore[ b.admin2pcode ].capacity_building_male += b.capacity_building_male;
              locationStore[ b.admin2pcode ].capacity_building_female += b.capacity_building_female;

              // total
              locationStore[ b.admin2pcode ].total += b.under5male + 
                                                      b.under5female +
                                                      b.over5male +
                                                      b.over5female +
                                                      b.penta3_vacc_male_under1 + 
                                                      b.penta3_vacc_female_under1 +
                                                      b.skilled_birth_attendant +
                                                      b.conflict_trauma_treated +
                                                      b.education_male + 
                                                      b.education_female + 
                                                      b.capacity_building_male + 
                                                      b.capacity_building_female;

            });

            // flatten
            var data = flatten( locationStore );

            // return csv
            json2csv({ data: data, fields: fields, fieldNames: fieldNames }, function( err, csv ) {
              
              // error
              if ( err ) return res.negotiate( err );

              // success
              return res.json( 200, { data: csv } );

            });

          });

        break;

      // summarise beneficiaries by health_facility
      case 'health_facility':

        // store data by project
        var projectStore = {};
        
        // json2csv
        fields = [ 'project_id', 'organization', 'project_code', 'project_title', 'project_start_date', 'project_end_date', 'admin0pcode', 'admin0name', 'admin1pcode', 'admin1name', 'admin2pcode', 'admin2name', 'fac_type_name', 'fac_name', 'beneficiary_type', 'under5male', 'under5female', 'over5male', 'over5female', 'penta3_vacc_male_under1', 'penta3_vacc_female_under1', 'skilled_birth_attendant', 'conflict_trauma_treated', 'education_male', 'education_female', 'capacity_building_male', 'capacity_building_female', 'total', 'lng', 'lat' ],
        fieldNames = [ 'Project ID', 'Partner', 'Project Code', 'Project Title', 'Project Start Date', 'Project End Date', 'Country Pcode', 'Country', 'Admin1 Pcode', 'Admin1 Name', 'Admin2 Pcode', 'Admin2 Name', 'Health Facility Type', 'Health Facility Name', 'Beneficiary Category', 'Under 5 Male', 'Under 5 Female', 'Over 5 Male', 'Over 5 Female', 'Penta3 Vacc Male Under1', 'Penta3 Vacc Female Under1', 'Skilled Birth Attendant', 'Conflict Trauma Treated', 'Education Male', 'Education Female', 'Capacity Building Male', 'Capacity Building Female', 'Total', 'lng', 'lat' ];

        // beneficiaires
        Beneficiaries
          .find()
          .where( { project_id: project_ids } )
          .where( filters.reporting_filter_s )
          .where( filters.reporting_filter_e )
          .where( filters.adminRpcode_filter )
          .where( filters.admin0pcode_filter )
          .where( filters.admin1pcode_filter )
          .where( filters.admin2pcode_filter )
          .where( filters.beneficiaries_filter )
          .where( { organization: { '!': 'iMMAP' } } )
          .exec( function( err, beneficiaries ){
            
            // return error
            if ( err ) return res.negotiate( err );

            // beneficiaries
            beneficiaries.forEach( function( b, i ){

              // beneficiaries
              if ( !projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ] ) {
                projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ] = {};
                //
                projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].under5male = 0;
                projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].under5female = 0;
                projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].over5male = 0;
                projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].over5female = 0;
                //
                projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].penta3_vacc_male_under1 = 0;
                projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].penta3_vacc_female_under1 = 0;
                projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].skilled_birth_attendant = 0;
                projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].conflict_trauma_treated = 0;
                //
                projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].education_male = 0;
                projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].education_female = 0;
                projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].capacity_building_male = 0;
                projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].capacity_building_female = 0;
                //
                projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].total = 0;                
              }

              // attributes
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].project_id = b.project_id;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].organization = b.organization;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].project_title = b.project_title;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].admin0pcode = b.admin0pcode;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].admin0name = b.admin0name;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].admin1pcode = b.admin1pcode;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].admin1name = b.admin1name;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].admin2pcode = b.admin2pcode;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].admin2name = b.admin2name;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].fac_type_name = b.fac_type_name;
              
              // if no fac_name defined as yet
              if ( !projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].fac_name ) {
                projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].fac_name = [];
                projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].fac_name.push( b.fac_name );
              }
              
              // if not already on the heap
              if ( projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].fac_name.indexOf( b.fac_name ) === -1 ) {
               projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].fac_name.push( b.fac_name ); 
              }
              
              // beneficairies types
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].beneficiary_type = b.beneficiary_type;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].beneficiary_name = b.beneficiary_name;
              
              // sum
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].under5male += b.under5male;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].under5female += b.under5female;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].over5male += b.over5male;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].over5female += b.over5female;
              //
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].penta3_vacc_male_under1 += b.penta3_vacc_male_under1;              
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].penta3_vacc_female_under1 += b.penta3_vacc_female_under1;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].skilled_birth_attendant += b.skilled_birth_attendant;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].conflict_trauma_treated += b.conflict_trauma_treated;
              //
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].education_male += b.education_male;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].education_female += b.education_female;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].capacity_building_male += b.capacity_building_male;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].capacity_building_female += b.capacity_building_female;
              //
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].total += b.under5male + 
                                                                                                      b.under5female +
                                                                                                      b.over5male +
                                                                                                      b.over5female +
                                                                                                      b.penta3_vacc_male_under1 + 
                                                                                                      b.penta3_vacc_female_under1 +
                                                                                                      b.skilled_birth_attendant +
                                                                                                      b.conflict_trauma_treated +
                                                                                                      b.education_male + 
                                                                                                      b.education_female + 
                                                                                                      b.capacity_building_male + 
                                                                                                      b.capacity_building_female;
              
              // lat/lng
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].lat = b.admin2lat;
              projectStore[ b.project_id + b.admin2pcode + b.fac_type + b.beneficiary_type ].lng = b.admin2lng;

            });
  
            // project store to data
            var data = flatten( projectStore );

            // project data
            data.forEach( function( pd, i ){

              // projects
              projects.forEach( function( p, j ){
                
                // project details
                if ( pd.project_id === p.id ) {
                  data[i].project_title = p.project_title;
                  data[i].project_code = p.project_code;
                  data[i].project_start_date = moment( p.project_start_date ).format( 'YYYY-MM-DD' );
                  data[i].project_end_date = moment( p.project_end_date ).format( 'YYYY-MM-DD' );          
                }

              });

            });

            // return csv
            json2csv({ data: data, fields: fields, fieldNames: fieldNames }, function( err, csv ) {
              
              // error
              if ( err ) return res.negotiate( err );

              // success
              return res.json( 200, { data: csv } );

            });

          });


        break;

      // OCHA project progress export
      default: 

        // store data by project
        var projectStore = {};
        
        // json2csv
        fields = [ 'project_id', 'organization', 'project_code', 'project_title', 'project_start_date', 'project_end_date', 'admin0pcode', 'admin0name', 'admin1pcode', 'admin1name', 'beneficiary_type', 'under5male', 'under5female', 'over5male', 'over5female', 'total', 'lat', 'lng' ],
        fieldNames = [ 'Project ID', 'Partner', 'Project Code', 'Project Title', 'Project Start Date', 'Project End Date', 'Country Pcode', 'Country', 'Admin1 Pcode', 'Admin1 Name', 'Beneficiary Category', 'under5male', 'under5female', 'over5male', 'over5female', 'Total', 'lat', 'lng' ];

        // beneficiaires
        Beneficiaries
          .find()
          .where( { project_id: project_ids } )
          .where( filters.reporting_filter_s )
          .where( filters.reporting_filter_e )
          .where( filters.adminRpcode_filter )
          .where( filters.admin0pcode_filter )
          .where( filters.admin1pcode_filter )
          .where( filters.admin2pcode_filter )
          .where( filters.beneficiaries_filter )
          .where( { organization: { '!': 'iMMAP' } } )
          .exec( function( err, beneficiaries ){
            
            // return error
            if ( err ) return res.negotiate( err );

            // beneficiaries
            beneficiaries.forEach( function( b, i ){

              // beneficiaries
              if ( !projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ] ) {
                projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ] = {};
                projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].under5male = 0;
                projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].under5female = 0;
                projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].over5male = 0;                
                projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].over5female = 0;
                projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].total = 0;                
              }

              // attributes
              projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].project_id = b.project_id;
              projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].organization = b.organization;
              projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].admin0pcode = b.admin0pcode;
              projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].admin0name = b.admin0name;
              projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].project_title = b.project_title;
              projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].admin1pcode = b.admin1pcode;
              projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].admin1name = b.admin1name;
              
              // beneficairies types
              projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].beneficiary_type = b.beneficiary_type;
              projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].beneficiary_name = b.beneficiary_name;
              
              // summary
              projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].under5male += b.under5male + b.penta3_vacc_male_under1 + ( b.conflict_trauma_treated * 0.1 );
              projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].under5female += b.under5female + b.penta3_vacc_female_under1 + ( b.conflict_trauma_treated * 0.1 );
              projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].over5male += b.over5male + b.education_male + b.capacity_building_male + ( b.conflict_trauma_treated * 0.4 );
              projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].over5female += b.over5female + b.skilled_birth_attendant + b.education_female + b.capacity_building_female + ( b.conflict_trauma_treated * 0.4 );
              projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].total += b.under5male +
                                                                                          b.under5female +
                                                                                          b.over5male +
                                                                                          b.over5female +
                                                                                          b.penta3_vacc_male_under1 + 
                                                                                          b.penta3_vacc_female_under1 +
                                                                                          b.skilled_birth_attendant +
                                                                                          b.conflict_trauma_treated +
                                                                                          b.education_male + 
                                                                                          b.education_female + 
                                                                                          b.capacity_building_male + 
                                                                                          b.capacity_building_female;

              // lat/ng
              projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].lat = b.admin1lat;
              projectStore[ b.project_id + b.admin1pcode + b.beneficiary_type ].lng = b.admin1lng;              

            });

            // project store to data
            var data = flatten( projectStore );

            // project data
            data.forEach( function( pd, i ){

              // projects
              projects.forEach( function( p, j ){
                
                // project details
                if ( pd.project_id === p.id ) {
                  data[i].project_title = p.project_title;
                  data[i].project_code = p.project_code;
                  data[i].project_start_date = moment( p.project_start_date ).format( 'YYYY-MM-DD' );
                  data[i].project_end_date = moment( p.project_end_date ).format( 'YYYY-MM-DD' );          
                }

              });

            });

            // return csv
            json2csv({ data: data, fields: fields, fieldNames: fieldNames }, function( err, csv ) {
              
              // error
              if ( err ) return res.negotiate( err );

              // success
              return res.json( 200, { data: csv } );

            });

          });

        break;

    }    

  },

  // dashboard params to filter projects
  getHealthDetails: function( req, res ){

    // request input
    // if ( ( !req.param('project_id') ) || ( !req.param('start_date') || !req.param('end_date') || !req.param('project_type') || !req.param('beneficiary_type') || !req.param('admin1pcode') || !req.param('admin2pcode') ) ) {
    //   return res.json(401, {err: 'indicator, start_date, end_date, project_status, project_type, beneficiary_type, admin1pcode, admin2pcode required!'});
    // }

    // get params
    var params = {
      
      details: req.param('details') ? req.param('details') : false,

      indicator: req.param('indicator') ? req.param('indicator') : false,
      
      project_id: req.param('project_id') ? req.param('project_id') : false,

      project_status: req.param('project_status') ? req.param('project_status') : false,
      
      start_date: req.param('start_date') ? req.param('start_date') : '1990-01-01',
      end_date: req.param('end_date') ? req.param('end_date') : '2020-12-31',
      
      project_type: req.param('project_type') ? req.param('project_type') : ['all'],
      beneficiary_type: req.param('beneficiary_type') ? req.param('beneficiary_type') : ['all'],

      // 
      adminRpcode: req.param('adminRpcode') !== 'hq' ? req.param('adminRpcode').toUpperCase() : '*',
      admin0pcode: req.param('admin0pcode') !== 'all' ? req.param('admin0pcode').toUpperCase() : '*',
      admin1pcode: req.param('admin1pcode') !== 'all' ? req.param('admin1pcode') : '*',
      admin2pcode: req.param('admin2pcode') !== 'all' ? req.param('admin2pcode') : '*',

      //
      conflict: req.param('conflict') ? req.param('conflict') : false
    }

    // filters
    var filters = {
      // project_id
      project_id: params.project_id ? { id: params.project_id } : {},
      
      // admin1pcode locations filter
      adminRpcode_filter: params.adminRpcode !== '*' ? { adminRpcode: params.adminRpcode } : {},
      // admin2pcode locations filter
      admin0pcode_filter: params.admin0pcode !== '*' ? { admin0pcode: params.admin0pcode } : {},
      // admin1pcode locations filter
      admin1pcode_filter: params.admin1pcode !== '*' ? { admin1pcode: params.admin1pcode } : {},
      // admin2pcode locations filter
      admin2pcode_filter: params.admin2pcode !== '*' ? { admin2pcode: params.admin2pcode } : {},

      // date_filter
      date_filter_s: { project_start_date: { '<=': new Date( params.end_date ) } },
      date_filter_e: { project_end_date: { '>=': new Date( params.start_date ) } },
      
      // beneficiaries report_month
      reporting_filter_s: { reporting_period: { '>=': new Date( params.start_date ) } },
      reporting_filter_e: { reporting_period: { '<=': new Date( params.end_date ) } },
      
      // financial payment month
      financial_filter_s: { project_budget_date_recieved: { '>=': new Date( params.start_date ) } },
      financial_filter_e: { project_budget_date_recieved: { '<=': new Date( params.end_date ) } },      
      
      // project_status
      project_status_filter: params.project_status ? { project_status: params.project_status } : {},
      
      // project_type
      project_type_filter: params.project_type[0] === 'all' ? {} : { project_type: params.project_type },
      
      // beneficiaries_filter
      beneficiaries_filter: params.beneficiary_type[0] === 'all' ? {} : { beneficiary_type: params.beneficiary_type }

    };
    
    // get projects by organization_id
    Project.find()
      .where( filters.project_id )
      .where( filters.date_filter_s )
      .where( filters.date_filter_e )
      
      .where( filters.adminRpcode_filter )
      .where( filters.admin0pcode_filter )
      .where( filters.admin1pcode_filter )
      .where( filters.admin2pcode_filter )

      .where( filters.project_status_filter )
      .where( filters.project_type_filter )
      .where( filters.beneficiaries_filter )
      .where( { organization: { '!': 'iMMAP' } } )
      .exec( function( err, projects ){
      
        // return error
        if (err) return res.negotiate( err );

        // if no projects
        if ( !projects.length && params.indicator !== 'markers' ) return res.json( 200, { 'value': 0 } );

        // if no markers
        if ( !projects.length && params.indicator === 'markers' ) return res.json( 200, { 'data': { 'marker0': { layer: 'health', lat:34.5, lng:66.0, message: '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">NO PROJECTS</h5>' } } } );

        // get project ids
        var project_ids = [];        
        projects.forEach( function( p, i ) {
          // project id
          project_ids.push( p.id );

        });

        // if indicator, else data
        if ( params.indicator ) {

          // calculate and return metric
          ProjectDashboardController.getIndicatorMetric( params, filters, projects, project_ids, res );

        } else{

          // prepare download
          ProjectDashboardController.getCsvDownload( params, filters, projects, project_ids, res );

        }

      });

  },

  // calculate indicator value from filtered project ids
  getIndicatorMetric: function( params, filters, projects, project_ids, res ) {

    // return indicator
    switch( params.indicator ){

      // organizations
      case 'partners':

        // organization_ids
        var filter = {},
            organization_ids = [];
        
        // filter by $projects
        projects.forEach( function( d, i ){
          organization_ids.push( d.organization_id );
        });

        // params
        filter = params.project_status ? { id: organization_ids } : {};

        // no. of organizations
        Organization.count( filter ).exec( function( err, value ){

          // return error
          if ( err ) return res.negotiate( err );

          // return new Project
          return res.json( 200, { 'value': value } );

        });

        break;

      // proejcts
      case 'projects':

        // return new Project
        return res.json( 200, { 'value': projects.length });

        break;

      // locations
      case 'locations':

        // locations
        var locations = {},
            conflict = !params.conflict ? { } : { conflict: true };

        // actual locations
        TargetLocation
          .find()
          .where( { project_id: project_ids } )
          .where( filters.adminRpcode_filter )
          .where( filters.admin0pcode_filter )
          .where( filters.admin1pcode_filter )
          .where( filters.admin2pcode_filter )
          .where( { organization: { '!': 'iMMAP' } } )
          .where( conflict )
          .exec( function( err, target_locations ) {

            // return error
            if (err) return res.negotiate( err );

            // if no length
            if ( !target_locations.length ) return res.json(200, { 'value': 0 } );

            // for each
            target_locations.forEach( function( location, i ){
              //
              locations[ location.admin2name ] = location;

            });

            // actual locations
            Admin2
              .find()
              .where( filters.adminRpcode_filter )
              .where( filters.admin0pcode_filter )
              .where( filters.admin1pcode_filter )
              .where( filters.admin2pcode_filter )              
              .where( { conflict: true } )
              .exec( function( err, conflict_locations ) {    

                // return error
                if (err) return res.negotiate( err );

                // return new Project
                return res.json(200, { 'value': flatten( locations ).length, 'value_total': conflict_locations.length });

              });

          });

          break;

      // markers
      case 'markers':

        // params
        var markers = {},
            counter = 0,
            length = 0;

        // target locations
        TargetLocation
          .find()
          .where( { project_id: project_ids } )
          .where( filters.adminRpcode_filter )
          .where( filters.admin0pcode_filter )
          .where( filters.admin1pcode_filter )
          .where( filters.admin2pcode_filter )
          .where( { organization: { '!': 'iMMAP' } } )
          .exec( function( err, locations ){

            // return error
            if (err) return res.negotiate( err );

            // return no locations
            if ( !locations.length ) return res.json( 200, { 'data': { 'marker0': { layer: 'health', lat:34.5, lng:66.0, message: '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">NO PROJECTS</h5>' } } } );

            // length
            length = locations.length;

            // foreach location
            locations.forEach( function( d, i ){

              // get user details
              User.findOne( { username: d.username } ).exec( function( err, user ){

                // return error
                if (err) return res.negotiate( err );

                // popup message
                var message = '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">' + user.organization + ' | ' + d.project_title + '</h5>'
                            + '<div style="text-align:center">' + d.admin0name + '</div>'
                            + '<div style="text-align:center">' + d.admin1name + ', ' + d.admin2name + '</div>'
                            + '<div style="text-align:center">' + d.fac_type_name + '</div>'
                            + '<div style="text-align:center">' + d.fac_name + '</div>'
                            + '<h5 style="text-align:center; font-size:1.5rem; font-weight:100;">CONTACT</h5>'
                            + '<div style="text-align:center">' + user.name + '</div>'
                            + '<div style="text-align:center">' + user.position + '</div>'
                            + '<div style="text-align:center">' + user.phone + '</div>'
                            + '<div style="text-align:center">' + user.email + '</div>';

                // create markers
                markers[ 'marker' + counter ] = {
                  layer: 'health',
                  lat: d.admin2lat,
                  lng: d.admin2lng,
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

      // beneficiaries
      case 'beneficiaries':

        // beneficiaries
        var $beneficiaries = {
          under5male: 0,
          under5female: 0,
          under5total: 0,
          over5male: 0,
          over5female: 0,
          over5Total: 0,
          total: 0
        };

        // beneficiaires
        Beneficiaries
          .find()
          .where( { project_id: project_ids } )
          .where( filters.reporting_filter_s )
          .where( filters.reporting_filter_e )
          .where( filters.adminRpcode_filter )
          .where( filters.admin0pcode_filter )
          .where( filters.admin1pcode_filter )
          .where( filters.admin2pcode_filter )
          .where( filters.beneficiaries_filter )
          .where( { organization: { '!': 'iMMAP' } } )
          .exec( function( err, beneficiaries ){

            // return error
            if ( err ) return res.negotiate( err );

            // if no length
            if ( !beneficiaries.length ) return res.json(200, { 'value': 0 } );     
            
            // beneficiaries
            beneficiaries.forEach( function( b, i ){
              // summary
              $beneficiaries.under5male += b.under5male + b.penta3_vacc_male_under1 + ( b.conflict_trauma_treated * 0.1 );
              $beneficiaries.under5female += b.under5female + b.penta3_vacc_female_under1 + ( b.conflict_trauma_treated * 0.1 );                  
              $beneficiaries.over5male += b.over5male + b.education_male + b.capacity_building_male + ( b.conflict_trauma_treated * 0.4 );
              $beneficiaries.over5female += b.over5female + b.skilled_birth_attendant + b.education_female + b.capacity_building_female + ( b.conflict_trauma_treated * 0.4 );
              $beneficiaries.total += b.under5male + 
                                      b.under5female +
                                      b.over5male +
                                      b.over5female +
                                      b.penta3_vacc_male_under1 + 
                                      b.penta3_vacc_female_under1 +
                                      b.skilled_birth_attendant +
                                      b.conflict_trauma_treated +
                                      b.education_male + 
                                      b.education_female + 
                                      b.capacity_building_male + 
                                      b.capacity_building_female;

            });

            // res
            return res.json(200, { 'value': $beneficiaries.total } ); 

          });

        break;
        
      // beneficiaries
      default:

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
        var $beneficiaries = {
          under5male: 0,
          under5female: 0,
          under5total: 0,
          over5male: 0,
          over5female: 0,
          over5Total: 0,
          total: 0
        };

        // beneficiaires
        Beneficiaries
          .find()
          .where( { project_id: project_ids } )
          .where( filters.reporting_filter_s )
          .where( filters.reporting_filter_e )
          .where( filters.adminRpcode_filter )
          .where( filters.admin0pcode_filter )
          .where( filters.admin1pcode_filter )
          .where( filters.admin2pcode_filter )
          .where( filters.beneficiaries_filter )
          .where( { organization: { '!': 'iMMAP' } } )
          .exec( function( err, beneficiaries ){

            // return error
            if ( err ) return res.negotiate( err );

            // if no length
            if ( !beneficiaries.length ) return res.json(200, { 'value': 0 } );
            
            // beneficiaries
            beneficiaries.forEach( function( b, i ){
              // u5
              $beneficiaries.under5male += b.under5male + b.penta3_vacc_male_under1 + ( b.conflict_trauma_treated * 0.1 );
              $beneficiaries.under5female += b.under5female + b.penta3_vacc_female_under1 + ( b.conflict_trauma_treated * 0.1 );
              $beneficiaries.under5Total = $beneficiaries.under5male + $beneficiaries.under5female;
              // o5
              $beneficiaries.over5male += b.over5male + b.education_male + b.capacity_building_male + ( b.conflict_trauma_treated * 0.4 );
              $beneficiaries.over5female += b.over5female + b.skilled_birth_attendant + b.education_female + b.capacity_building_female + ( b.conflict_trauma_treated * 0.4 );
              $beneficiaries.over5Total = $beneficiaries.over5male + $beneficiaries.over5female;
              // total
              $beneficiaries.total += b.under5male + 
                                      b.under5female +
                                      b.over5male +
                                      b.over5female +
                                      b.penta3_vacc_male_under1 + 
                                      b.penta3_vacc_female_under1 +
                                      b.skilled_birth_attendant +
                                      b.conflict_trauma_treated +
                                      b.education_male + 
                                      b.education_female + 
                                      b.capacity_building_male + 
                                      b.capacity_building_female;

            });

            // breakdown
            switch( params.indicator ){

              // indicator
              case 'under5':

                // calc %
                var malePerCent = ( $beneficiaries.under5male / ( $beneficiaries.under5male + $beneficiaries.under5female ) ) * 100;
                var femalePerCent = ( $beneficiaries.under5female / ( $beneficiaries.under5male + $beneficiaries.under5female ) ) * 100;
                var totalPerCent = ( $beneficiaries.under5Total / ( $beneficiaries.under5Total + $beneficiaries.over5Total ) ) * 100;
                
                // assign data left
                result.label.left.label.label = malePerCent;
                result.label.left.subLabel.label = $beneficiaries.under5male;
                // assign data center
                result.label.center.label.label = totalPerCent;
                result.label.center.subLabel.label = $beneficiaries.under5Total;
                // assign data right
                result.label.right.label.label = femalePerCent;
                result.label.right.subLabel.label = $beneficiaries.under5female;

                // highcharts female
                result.data[0].y = femalePerCent;
                result.data[0].label = $beneficiaries.under5Total;
                // highcharts male
                result.data[1].y = malePerCent;
                result.data[1].label = $beneficiaries.under5Total;
                
                break;

              case 'over5':
                
                // calc %
                var malePerCent = ( $beneficiaries.over5male / ( $beneficiaries.over5male + $beneficiaries.over5female ) ) * 100;
                var femalePerCent = ( $beneficiaries.over5female / ( $beneficiaries.over5female + $beneficiaries.over5male ) ) * 100;
                var totalPerCent = ( $beneficiaries.over5Total / ( $beneficiaries.under5Total + $beneficiaries.over5Total ) ) * 100;
                
                // assign data left
                result.label.left.label.label = malePerCent;
                result.label.left.subLabel.label = $beneficiaries.over5male;
                // assign data center
                result.label.center.label.label = totalPerCent;
                result.label.center.subLabel.label = $beneficiaries.over5Total;
                // assign data right
                result.label.right.label.label = femalePerCent;
                result.label.right.subLabel.label = $beneficiaries.over5female;

                // highcharts female
                result.data[0].y = femalePerCent;
                result.data[0].label = $beneficiaries.over5Total;
                // highcharts male
                result.data[1].y = malePerCent;
                result.data[1].label = $beneficiaries.over5Total;

                break;
            }

            // return new Project
            return res.json( 200, result );

          });


        break;

    }

  }

};

module.exports = ProjectDashboardController;
