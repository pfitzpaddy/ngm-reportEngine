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
        fields = [ 'name', 'organization', 'position', 'phone', 'email', 'createdAt' ],
        fieldNames = [ 'Name', 'Organization', 'Position', 'Phone', 'Email', 'Joined ReportHub' ];

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

      // summarise beneficiaries by location ( district )
      case 'locations':

        // store data by project
        var locationStore = {};
        
        // json2csv
        fields = [ 'prov_name', 'prov_code', 'dist_name', 'dist_code', 'under5male', 'under5female', 'over5male', 'over5female', 'penta3_vacc_male_under1', 'penta3_vacc_female_under1', 'skilled_birth_attendant', 'conflict_trauma_treated', 'education_male', 'education_female', 'capacity_building_male', 'capacity_building_female', 'total', 'lng', 'lat' ],
        fieldNames = [ 'Province Name', 'Province Code', 'District Name', 'District Code', 'Under 5 Male', 'Under 5 Female', 'Over 5 Male', 'Over 5 Female', 'Penta3 Vacc Male Under1', 'Penta3 Vacc Female Under1', 'Skilled Birth Attendant', 'Conflict Trauma Treated', 'Education Male', 'Education Female', 'Capacity Building Male', 'Capacity Building Female', 'Total', 'lng', 'lat' ];

        // get reports
        Report
          .find()
          .where( { project_id: project_ids } )
          .where( filters.reporting_filter_s )
          .where( filters.reporting_filter_e )
          .populateAll()
          .exec( function( err, reports ) {

            // return error
            if ( err ) return res.negotiate( err );

            // each location
            var location_ids = [];

            // for each report/location
            reports.forEach( function( r, i ){
              r.locations.forEach( function( l, j ){

                // locations
                location_ids.push( l.id );
                // location details
                locationStore[ l.dist_code ] = {};
                locationStore[ l.dist_code ].prov_code = l.prov_code;
                locationStore[ l.dist_code ].prov_name = l.prov_name;
                locationStore[ l.dist_code ].dist_code = l.dist_code;
                locationStore[ l.dist_code ].dist_name = l.dist_name;
                // beneficairies
                locationStore[ l.dist_code ].under5male = 0;
                locationStore[ l.dist_code ].penta3_vacc_male_under1 = 0;
                locationStore[ l.dist_code ].under5female = 0;
                locationStore[ l.dist_code ].penta3_vacc_female_under1 = 0;
                locationStore[ l.dist_code ].over5male = 0;
                locationStore[ l.dist_code ].over5female = 0;
                locationStore[ l.dist_code ].skilled_birth_attendant = 0;
                locationStore[ l.dist_code ].conflict_trauma_treated = 0;
                locationStore[ l.dist_code ].education_male = 0;
                locationStore[ l.dist_code ].education_female = 0;
                locationStore[ l.dist_code ].capacity_building_male = 0;
                locationStore[ l.dist_code ].capacity_building_female = 0;
                locationStore[ l.dist_code ].total = 0;
                // location lat, lng
                locationStore[ l.dist_code ].lat = l.dist_lat;
                locationStore[ l.dist_code ].lng = l.dist_lng;                

              });
            });

            // beneficiaires
            Beneficiaries
              .find()
              .where( { location_id: location_ids } )
              .where( filters.beneficiaries_filter )
              .where( filters.prov_code_filter )
              .where( filters.dist_code_filter )
              .exec( function( err, beneficiaries ){

                // return error
                if ( err ) return res.negotiate( err );
                
                // beneficiaries
                beneficiaries.forEach( function( b, i ){

                  // u5
                  locationStore[ b.dist_code ].under5male += b.under5male;
                  locationStore[ b.dist_code ].under5female += b.under5female;
                  locationStore[ b.dist_code ].penta3_vacc_male_under1 += b.penta3_vacc_male_under1;
                  locationStore[ b.dist_code ].penta3_vacc_female_under1 += b.penta3_vacc_female_under1;
                  // o5
                  locationStore[ b.dist_code ].over5male += b.over5male;
                  locationStore[ b.dist_code ].over5female += b.over5female;
                  locationStore[ b.dist_code ].skilled_birth_attendant += b.skilled_birth_attendant;
                  locationStore[ b.dist_code ].conflict_trauma_treated += b.conflict_trauma_treated;
                  locationStore[ b.dist_code ].education_male += b.education_male;
                  locationStore[ b.dist_code ].education_female += b.education_female;
                  locationStore[ b.dist_code ].capacity_building_male += b.capacity_building_male;
                  locationStore[ b.dist_code ].capacity_building_female += b.capacity_building_female;

                  // total
                  locationStore[ b.dist_code ].total += b.under5male + b.penta3_vacc_male_under1 + b.over5male + b.education_male + b.capacity_building_male + b.under5female + b.penta3_vacc_female_under1 + b.over5female + b.skilled_birth_attendant + b.education_female + b.capacity_building_female + b.conflict_trauma_treated;

                });

                // return csv
                json2csv({ data: flatten( locationStore ), fields: fields, fieldNames: fieldNames }, function( err, csv ) {
                  
                  // error
                  if ( err ) return res.negotiate( err );

                  // success
                  return res.json( 200, { data: csv } );

                });

              });

          });

        break;

      // summarise beneficiaries by health_facility
      // case 'health_facility':

      //   // store data by project
      //   var locationStore = {};
        
      //   // json2csv
      //   fields = [ 'id', 'prov_code', 'prov_name', 'dist_code', 'dist_name', 'fac_type_name', 'fac_name', 'under5male', 'under5female', 'over5male', 'over5female', 'penta3_vacc_male_under1', 'penta3_vacc_female_under1', 'skilled_birth_attendant', 'conflict_trauma_treated', 'education_male', 'education_female', 'capacity_building_male', 'capacity_building_female', 'total', 'lng', 'lat' ],
      //   fieldNames = [ 'ID', 'Province Code', 'Province Name', 'District Code', 'District Name', 'Health Facility Type', 'Health Facility Name', 'Under 5 Male', 'Under 5 Female', 'Over 5 Male', 'Over 5 Female', 'Penta3 Vacc Male Under1', 'Penta3 Vacc Female Under1', 'Skilled Birth Attendant', 'Conflict Trauma Treated', 'Education Male', 'Education Female', 'Capacity Building Male', 'Capacity Building Female', 'Total', 'lng', 'lat' ];

      //   // get reports
      //   Report
      //     .find()
      //     .where( { project_id: project_ids } )
      //     .where( filters.reporting_filter_s )
      //     .where( filters.reporting_filter_e )
      //     .populateAll()
      //     .exec( function( err, reports ) {

      //       // return error
      //       if ( err ) return res.negotiate( err );

      //       // each location
      //       var location_ids = [];

      //       // for each report/location
      //       reports.forEach( function( r, i ){
      //         r.locations.forEach( function( l, j ){

      //           // locations
      //           location_ids.push( l.id );
      //           // location details
      //           locationStore[ l.fac_type + l.fac_name ] = {};
      //           locationStore[ l.fac_type + l.fac_name ].id = l.id;
      //           locationStore[ l.fac_type + l.fac_name ].prov_code = l.prov_code;
      //           locationStore[ l.fac_type + l.fac_name ].prov_name = l.prov_name;
      //           locationStore[ l.fac_type + l.fac_name ].dist_code = l.dist_code;
      //           locationStore[ l.fac_type + l.fac_name ].dist_name = l.dist_name;
      //           locationStore[ l.fac_type + l.fac_name ].fac_type_name = l.fac_type_name;
      //           locationStore[ l.fac_type + l.fac_name ].fac_name = l.fac_name;
      //           // beneficairies
      //           locationStore[ l.fac_type + l.fac_name ].under5male = 0;
      //           locationStore[ l.fac_type + l.fac_name ].penta3_vacc_male_under1 = 0;
      //           locationStore[ l.fac_type + l.fac_name ].under5female = 0;
      //           locationStore[ l.fac_type + l.fac_name ].penta3_vacc_female_under1 = 0;
      //           locationStore[ l.fac_type + l.fac_name ].over5male = 0;
      //           locationStore[ l.fac_type + l.fac_name ].over5female = 0;
      //           locationStore[ l.fac_type + l.fac_name ].skilled_birth_attendant = 0;
      //           locationStore[ l.fac_type + l.fac_name ].conflict_trauma_treated = 0;
      //           locationStore[ l.fac_type + l.fac_name ].education_male = 0;
      //           locationStore[ l.fac_type + l.fac_name ].education_female = 0;
      //           locationStore[ l.fac_type + l.fac_name ].capacity_building_male = 0;
      //           locationStore[ l.fac_type + l.fac_name ].capacity_building_female = 0;
      //           locationStore[ l.fac_type + l.fac_name ].total = 0;
      //           // location lat, lng
      //           locationStore[ l.fac_type + l.fac_name ].lat = l.dist_lat;
      //           locationStore[ l.fac_type + l.fac_name ].lng = l.dist_lng;                

      //         });
      //       });

      //       // beneficiaires
      //       Beneficiaries
      //         .find()
      //         .where( { location_id: location_ids } )
      //         .where( filters.beneficiaries_filter )
      //         .where( filters.prov_code_filter )
      //         .where( filters.dist_code_filter )
      //         .exec( function( err, beneficiaries ){

      //           // return error
      //           if ( err ) return res.negotiate( err );
                
      //           // beneficiaries
      //           beneficiaries.forEach( function( b, i ){

      //             // u5
      //             locationStore[ b.fac_type + b.fac_name ].under5male += b.under5male;
      //             locationStore[ b.fac_type + b.fac_name ].under5female += b.under5female;
      //             locationStore[ b.fac_type + b.fac_name ].penta3_vacc_male_under1 += b.penta3_vacc_male_under1;
      //             locationStore[ b.fac_type + b.fac_name ].penta3_vacc_female_under1 += b.penta3_vacc_female_under1;
      //             // o5
      //             locationStore[ b.fac_type + b.fac_name ].over5male += b.over5male;
      //             locationStore[ b.fac_type + b.fac_name ].over5female += b.over5female;
      //             locationStore[ b.fac_type + b.fac_name ].skilled_birth_attendant += b.skilled_birth_attendant;
      //             locationStore[ b.fac_type + b.fac_name ].conflict_trauma_treated += b.conflict_trauma_treated;
      //             locationStore[ b.fac_type + b.fac_name ].education_male += b.education_male;
      //             locationStore[ b.fac_type + b.fac_name ].education_female += b.education_female;
      //             locationStore[ b.fac_type + b.fac_name ].capacity_building_male += b.capacity_building_male;
      //             locationStore[ b.fac_type + b.fac_name ].capacity_building_female += b.capacity_building_female;

      //             // total
      //             locationStore[ b.fac_type + b.fac_name ].total += b.under5male + b.penta3_vacc_male_under1 + b.over5male + b.education_male + b.capacity_building_male + b.under5female + b.penta3_vacc_female_under1 + b.over5female + b.skilled_birth_attendant + b.education_female + b.capacity_building_female + b.conflict_trauma_treated;

      //           });

      //           // return csv
      //           json2csv({ data: flatten( locationStore ), fields: fields, fieldNames: fieldNames }, function( err, csv ) {
                  
      //             // error
      //             if ( err ) return res.negotiate( err );

      //             // success
      //             return res.json( 200, { data: csv } );

      //           });

      //         });

      //     });

      //   break;

      // summarise beneficiaries by health_facility
      case 'health_facility':

        // store data by project
        var locationStore = {};
        
        // json2csv
        fields = [ 'prov_code', 'prov_name', 'dist_code', 'dist_name', 'fac_type_name', 'fac_name', 'under5male', 'under5female', 'over5male', 'over5female', 'penta3_vacc_male_under1', 'penta3_vacc_female_under1', 'skilled_birth_attendant', 'conflict_trauma_treated', 'education_male', 'education_female', 'capacity_building_male', 'capacity_building_female', 'total', 'lng', 'lat' ],
        fieldNames = [ 'Province Code', 'Province Name', 'District Code', 'District Name', 'Health Facility Type', 'Health Facility Name', 'Under 5 Male', 'Under 5 Female', 'Over 5 Male', 'Over 5 Female', 'Penta3 Vacc Male Under1', 'Penta3 Vacc Female Under1', 'Skilled Birth Attendant', 'Conflict Trauma Treated', 'Education Male', 'Education Female', 'Capacity Building Male', 'Capacity Building Female', 'Total', 'lng', 'lat' ];

        // get reports
        Report
          .find()
          .where( { project_id: project_ids } )
          .where( filters.reporting_filter_s )
          .where( filters.reporting_filter_e )
          .populateAll()
          .exec( function( err, reports ) {

            // return error
            if ( err ) return res.negotiate( err );

            // each location
            var location_ids = [];

            // for each report/location
            reports.forEach( function( r, i ){
              r.locations.forEach( function( l, j ){

                // locations
                location_ids.push( l.id );
                // location details
                locationStore[ l.dist_code + l.fac_type ] = {};
                locationStore[ l.dist_code + l.fac_type ].prov_code = l.prov_code;
                locationStore[ l.dist_code + l.fac_type ].prov_name = l.prov_name;
                locationStore[ l.dist_code + l.fac_type ].dist_code = l.dist_code;
                locationStore[ l.dist_code + l.fac_type ].dist_name = l.dist_name;
                locationStore[ l.dist_code + l.fac_type ].fac_type_name = l.fac_type_name;
                if ( !locationStore[ l.dist_code + l.fac_type ].fac_name.length ) {
                  locationStore[ l.dist_code + l.fac_type ].fac_name = [];
                }
                locationStore[ l.dist_code + l.fac_type ].fac_name.push( l.fac_name );
                // beneficairies
                locationStore[ l.dist_code + l.fac_type ].under5male = 0;
                locationStore[ l.dist_code + l.fac_type ].penta3_vacc_male_under1 = 0;
                locationStore[ l.dist_code + l.fac_type ].under5female = 0;
                locationStore[ l.dist_code + l.fac_type ].penta3_vacc_female_under1 = 0;
                locationStore[ l.dist_code + l.fac_type ].over5male = 0;
                locationStore[ l.dist_code + l.fac_type ].over5female = 0;
                locationStore[ l.dist_code + l.fac_type ].skilled_birth_attendant = 0;
                locationStore[ l.dist_code + l.fac_type ].conflict_trauma_treated = 0;
                locationStore[ l.dist_code + l.fac_type ].education_male = 0;
                locationStore[ l.dist_code + l.fac_type ].education_female = 0;
                locationStore[ l.dist_code + l.fac_type ].capacity_building_male = 0;
                locationStore[ l.dist_code + l.fac_type ].capacity_building_female = 0;
                locationStore[ l.dist_code + l.fac_type ].total = 0;
                // location lat, lng
                locationStore[ l.dist_code + l.fac_type ].lat = l.dist_lat;
                locationStore[ l.dist_code + l.fac_type ].lng = l.dist_lng;                

              });
            });

            // beneficiaires
            Beneficiaries
              .find()
              .where( { location_id: location_ids } )
              .where( filters.beneficiaries_filter )
              .where( filters.prov_code_filter )
              .where( filters.dist_code_filter )
              .exec( function( err, beneficiaries ){

                // return error
                if ( err ) return res.negotiate( err );
                
                // beneficiaries
                beneficiaries.forEach( function( b, i ){

                  // u5
                  locationStore[ b.dist_code + b.fac_type ].under5male += b.under5male;
                  locationStore[ b.dist_code + b.fac_type ].under5female += b.under5female;
                  locationStore[ b.dist_code + b.fac_type ].penta3_vacc_male_under1 += b.penta3_vacc_male_under1;
                  locationStore[ b.dist_code + b.fac_type ].penta3_vacc_female_under1 += b.penta3_vacc_female_under1;
                  // o5
                  locationStore[ b.dist_code + b.fac_type ].over5male += b.over5male;
                  locationStore[ b.dist_code + b.fac_type ].over5female += b.over5female;
                  locationStore[ b.dist_code + b.fac_type ].skilled_birth_attendant += b.skilled_birth_attendant;
                  locationStore[ b.dist_code + b.fac_type ].conflict_trauma_treated += b.conflict_trauma_treated;
                  locationStore[ b.dist_code + b.fac_type ].education_male += b.education_male;
                  locationStore[ b.dist_code + b.fac_type ].education_female += b.education_female;
                  locationStore[ b.dist_code + b.fac_type ].capacity_building_male += b.capacity_building_male;
                  locationStore[ b.dist_code + b.fac_type ].capacity_building_female += b.capacity_building_female;

                  // total
                  locationStore[ b.dist_code + b.fac_type ].total += b.under5male + b.penta3_vacc_male_under1 + b.over5male + b.education_male + b.capacity_building_male + b.under5female + b.penta3_vacc_female_under1 + b.over5female + b.skilled_birth_attendant + b.education_female + b.capacity_building_female + b.conflict_trauma_treated;

                });

                // return csv
                json2csv({ data: flatten( locationStore ), fields: fields, fieldNames: fieldNames }, function( err, csv ) {
                  
                  // error
                  if ( err ) return res.negotiate( err );

                  // success
                  return res.json( 200, { data: csv } );

                });

              });

          });

        break;


      // summarise financial progress
      case 'financial':

        // store data by project
        var projectStore = {};
        
        // json2csv
        fields = [ 'id', 'organization', 'project_code', 'project_title', 'project_budget', 'project_budget_currency', 'project_donor', 'project_budget_date_recieved', 'project_budget_amount_recieved' ],
        fieldNames = [ 'ReportHub ID', 'Partner', 'Project Code', 'Project Title', 'Total Project Budget', 'Project Budget Currency', 'Donor', 'Date Funds Recieved', 'Amount Recieved' ];

        // projects
        projects.forEach( function( p, i ){
          // project details
          projectStore[ p.id ] = {}
          projectStore[ p.id ].id = p.id;
          projectStore[ p.id ].organization = p.organization;
          projectStore[ p.id ].project_code = p.project_code;
          projectStore[ p.id ].project_title = p.project_title;

        });

        // get financial details
        BudgetProgress
          .find()
          .where( { project_id: project_ids } )
          .where( filters.financial_filter_s )
          .where( filters.financial_filter_e )
          .exec( function( err, budget ) {

            // error
            if ( err ) return res.negotiate( err );

            // budget
            budget.forEach( function( b, i ){

              // latest updated project details
              budget[ i ].organization = projectStore[ b.project_id ].organization;
              budget[ i ].project_code = projectStore[ b.project_id ].project_code;
              budget[ i ].project_title = projectStore[ b.project_id ].project_title;
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

      // OCHA project progress export
      default:

        // store data by project
        var projectStore = {};
        
        // json2csv
        fields = [ 'id', 'organization', 'project_code', 'project_title', 'project_start_date', 'project_end_date', 'prov_code', 'prov_name', 'beneficiary_type', 'under5male', 'over5male', 'under5female', 'over5female', 'total', 'lat', 'lng' ],
        fieldNames = [ 'ReportHub ID', 'Partner', 'Project Code', 'Project Title', 'Project Start Date', 'Project End Date', 'Province Code', 'Province Name', 'Beneficiary Category', 'under5male', 'over5male', 'under5female', 'over5female', 'Total', 'lat', 'lng' ];

        // projects
        projects.forEach( function( p, i ){
          // project details
          projectStore[ p.id ] = {}
          projectStore[ p.id ].id = p.id;
          projectStore[ p.id ].organization = p.organization;
          projectStore[ p.id ].project_code = p.project_code;
          projectStore[ p.id ].project_title = p.project_title;
          projectStore[ p.id ].project_start_date = moment( p.project_start_date ).format( 'YYYY-MM-DD' );
          projectStore[ p.id ].project_end_date = moment( p.project_end_date ).format( 'YYYY-MM-DD' );

        });

        // beneficiaires
        Beneficiaries
          .find()
          .where( { project_id: project_ids } )
          .where( filters.beneficiaries_filter )
          .where( filters.reporting_filter_s )
          .where( filters.reporting_filter_e )
          .where( filters.prov_code_filter )
          .where( filters.dist_code_filter )
          .exec( function( err, beneficiaries ){
            
            // return error
            if ( err ) return res.negotiate( err );

            // beneficiaries
            beneficiaries.forEach( function( b, i ){

              // project location
              if ( !projectStore[ b.project_id ][ b.prov_code ] ) {
                // project location
                projectStore[ b.project_id ][ b.prov_code ] = {}
                projectStore[ b.project_id ][ b.prov_code ].prov_code = b.prov_code;
                projectStore[ b.project_id ][ b.prov_code ].prov_name = b.prov_name;
                projectStore[ b.project_id ][ b.prov_code ].lat = b.prov_lat;
                projectStore[ b.project_id ][ b.prov_code ].lng = b.prov_lng;                    

              }
              // beneficiaries
              if ( !projectStore[ b.project_id ][ b.prov_code ][ b.beneficiary_type ] ) {
                projectStore[ b.project_id ][ b.prov_code ][ b.beneficiary_type ] = {};
                projectStore[ b.project_id ][ b.prov_code ][ b.beneficiary_type ].under5male = 0;
                projectStore[ b.project_id ][ b.prov_code ][ b.beneficiary_type ].over5male = 0;
                projectStore[ b.project_id ][ b.prov_code ][ b.beneficiary_type ].under5female = 0;
                projectStore[ b.project_id ][ b.prov_code ][ b.beneficiary_type ].over5female = 0;
                projectStore[ b.project_id ][ b.prov_code ][ b.beneficiary_type ].total = 0;
                projectStore[ b.project_id ][ b.prov_code ][ b.beneficiary_type ].beneficiary_type = b.beneficiary_type;
                projectStore[ b.project_id ][ b.prov_code ][ b.beneficiary_type ].beneficiary_name = b.beneficiary_name;
              }

              // summary
              projectStore[ b.project_id ][ b.prov_code ][ b.beneficiary_type ].under5male += b.under5male + b.penta3_vacc_male_under1 + ( b.conflict_trauma_treated * 0.1 );
              projectStore[ b.project_id ][ b.prov_code ][ b.beneficiary_type ].over5male += b.over5male + b.education_male + b.capacity_building_male + ( b.conflict_trauma_treated * 0.4 );
              projectStore[ b.project_id ][ b.prov_code ][ b.beneficiary_type ].under5female += b.under5female + b.penta3_vacc_female_under1 + ( b.conflict_trauma_treated * 0.1 );
              projectStore[ b.project_id ][ b.prov_code ][ b.beneficiary_type ].over5female += b.over5female + b.skilled_birth_attendant + b.education_female + b.capacity_building_female + ( b.conflict_trauma_treated * 0.4 );
              projectStore[ b.project_id ][ b.prov_code ][ b.beneficiary_type ].total += b.under5male + b.penta3_vacc_male_under1 + b.over5male + b.education_male + b.capacity_building_male + b.under5female + b.penta3_vacc_female_under1 + b.over5female + b.skilled_birth_attendant + b.education_female + b.capacity_building_female + b.conflict_trauma_treated;

            });

            // flatten by project
            var projectArray = flatten( projectStore );
            projectArray.forEach( function( p, i ) {

              // flatten location
              var locationArray = flatten( p );

              // no reports, provide basic info
              if( !locationArray.length ){ 

                // list project target locations
                projects[i].prov_code.forEach( function( p_code, j ) {

                  // if beneficiaries exist
                  if ( projects[i].beneficiary_type ) {

                    // list project target beneficairies
                    projects[i].beneficiary_type.forEach( function( beneficiaries, k ) {

                      // empty project
                      data.push({
                        id: p.id,
                        organization: p.organization,
                        project_code: p.project_code,
                        project_title: p.project_title,
                        project_start_date: p.project_start_date,
                        project_end_date: p.project_end_date,
                        prov_code: p_code,
                        prov_name: '',
                        beneficiary_type: beneficiaries,
                        under5male: 0,
                        over5male: 0,
                        under5female: 0,
                        over5female: 0,
                        total: 0,
                        lat: 0,
                        lng: 0
                      });

                    });
                  }

                });

              } else {

                // each location
                locationArray.forEach( function( l, j ) {

                  // beneficiaries
                  var beneficiariesArray = flatten( l );
                  beneficiariesArray.forEach( function( b, k ) {

                    // active project
                    data.push({
                      id: p.id,
                      organization: p.organization,
                      project_code: p.project_code,
                      project_title: p.project_title,
                      project_start_date: p.project_start_date,
                      project_end_date: p.project_end_date,
                      prov_code: l.prov_code,
                      prov_name: l.prov_name,
                      beneficiary_type: b.beneficiary_name,
                      under5male: b.under5male,
                      over5male: b.over5male,
                      under5female: b.under5female,
                      over5female: b.over5female,
                      total: b.total,
                      lat: l.lat,
                      lng: l.lng
                    });
                  });

                });

              }

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
    // if ( ( !req.param('project_id') ) || ( !req.param('start_date') || !req.param('end_date') || !req.param('project_type') || !req.param('beneficiary_type') || !req.param('prov_code') || !req.param('dist_code') ) ) {
    //   return res.json(401, {err: 'indicator, start_date, end_date, project_status, project_type, beneficiary_type, prov_code, dist_code required!'});
    // }

    // get params
    var params = {
      details: req.param('details') ? req.param('details') : false,
      indicator: req.param('indicator') ? req.param('indicator') : false,
      project_id: req.param('project_id') ? req.param('project_id') : false,
      start_date: req.param('start_date') ? req.param('start_date') : '1990-01-01',
      end_date: req.param('end_date') ? req.param('end_date') : '2020-12-31',
      project_status: req.param('project_status') ? req.param('project_status') : false,
      project_type: req.param('project_type') ? req.param('project_type') : ['all'],
      beneficiary_type: req.param('beneficiary_type') ? req.param('beneficiary_type') : ['all'],
      prov_code: req.param('prov_code') ? req.param('prov_code') : '*',
      dist_code: req.param('dist_code') ? req.param('dist_code') : '*',
      conflict: req.param('conflict') ? req.param('conflict') : false
    }

    // filters
    var filters = {
      // project_id
      project_id: params.project_id ? { id: params.project_id } : {},
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
      beneficiaries_filter: params.beneficiary_type[0] === 'all' ? {} : { beneficiary_type: params.beneficiary_type },
      // prov locations filter
      prov_code_filter: params.prov_code !== '*' ? { prov_code: params.prov_code } : {},
      // dist locations filter
      dist_code_filter: params.dist_code !== '*' ? { dist_code: params.dist_code } : {},

    };
    
    // get projects by organization_id
    Project.find()
      .where( filters.project_id )
      .where( filters.date_filter_s )
      .where( filters.date_filter_e )
      .where( filters.project_status_filter )
      .where( filters.project_type_filter )
      .where( filters.beneficiaries_filter )
      .where( filters.prov_code_filter )
      .where( filters.dist_code_filter )
      .where( { organization: { '!': 'iMMAP' } } )
      .exec( function( err, projects ){
      
        // return error
        if (err) return res.negotiate( err );

        // if no projects
        if ( !projects.length ) return res.json( 200, { 'value': 0 } );

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
          .where( filters.prov_code_filter )
          .where( filters.dist_code_filter )
          .where( conflict )
          .exec( function( err, target_locations ) {

            // return error
            if (err) return res.negotiate( err );

            // if no length
            if ( !target_locations.length ) return res.json(200, { 'value': 0 } );

            // for each
            target_locations.forEach( function( location, i ){
              //
              locations[ location.dist_name ] = location;

            });

            // actual locations
            District
              .find()
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
          .where( filters.prov_code_filter )
          .where( filters.dist_code_filter )
          .exec( function( err, locations ){

            // return error
            if (err) return res.negotiate( err );

            // return no locations
            if (!locations.length) return res.json(200, { 'data': {} });

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
                            + '<div style="text-align:center"> in ' + d.prov_name + ', ' + d.dist_name + '</div>'
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
                  lat: d.dist_lat,
                  lng: d.dist_lng,
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
          .where( filters.beneficiaries_filter )
          .where( filters.reporting_filter_s )
          .where( filters.reporting_filter_e )
          .where( filters.prov_code_filter )
          .where( filters.dist_code_filter )
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
              $beneficiaries.total += b.under5male + b.penta3_vacc_male_under1 + b.over5male + b.education_male + b.capacity_building_male + b.under5female + b.penta3_vacc_female_under1 + b.over5female + b.skilled_birth_attendant + b.education_female + b.capacity_building_female + b.conflict_trauma_treated;

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
          .where( filters.beneficiaries_filter )
          .where( filters.reporting_filter_s )
          .where( filters.reporting_filter_e )
          .where( filters.prov_code_filter )
          .where( filters.dist_code_filter )
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
              $beneficiaries.total += b.under5male + b.penta3_vacc_male_under1 + b.over5male + b.education_male + b.capacity_building_male + b.under5female + b.penta3_vacc_female_under1 + b.over5female + b.skilled_birth_attendant + b.education_female + b.capacity_building_female + b.conflict_trauma_treated;

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
