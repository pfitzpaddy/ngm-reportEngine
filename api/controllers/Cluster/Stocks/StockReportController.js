/**
 * ReportController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 // libs
var Promise = require('bluebird');
var util = require('util');
var async = require('async');
var moment = require( 'moment' );
var _under = require('underscore');

// set moment
var moment = require('moment');

var StockReportController = {

  // parse results from sails
	set_result: function( result ) {
		if( util.isArray( result ) ) {
			// update ( array )
			return result[0];
		} else {
			// create ( object )
			return result;
		}
	},
  // get all reports
  getReportsList: function( req, res ) {

    // request input
    if ( !req.param( 'filter' ) ) {
      return res.json( 401, { err: 'filter required!' });
    }

    // promise
		Promise.all([
			StockReport.find( req.param( 'filter' ) ).sort( 'report_month ASC' ),
			Stock.find( req.param( 'filter' ) )
		])
		.catch( function( err ) {
			return res.negotiate( err );
		})
		.then( function( result ) {

			// gather results
			var reports = result[ 0 ];
			var stocks = result[ 1 ];

			// async loop reports
			async.each( reports, function ( report, next ) {

				// add status empty
				report.icon = 'adjust'
				report.status = '#80cbc4';
				report.status_title = 'Empty Submission';

				// if report is 'todo' and before due date!
				if ( report.report_status === 'todo' && moment().isSameOrBefore( moment( report.reporting_due_date ) ) ) {

					// add status todo but ok
					report.icon = 'watch_later';
					report.status = '#4db6ac';
					report.status_title = 'ToDo';

				}

				// if report is 'todo' and past due date!
				if ( report.report_status === 'todo' && moment().isAfter( moment( report.reporting_due_date ) ) ) {

					// set to red (overdue!)
					report.icon = 'error';
					report.status = '#e57373'
					report.status_title = 'Due';

				}

				// async loop stocks
				async.each( stocks, function ( stock, b_next ) {

					// stocks exist for this report
					if ( report.id === stock.report_id ) {

						// if report is 'todo' and has records ( is saved )
						if ( report.report_status === 'todo' ) {
							// if stocks ( report has been updated )
							if ( stock ) {
								report.icon = 'watch_later';
								report.status = '#fff176';
								report.status_title = 'Pending';
							}
						}
					}
					b_next();
				}, function ( err ) {
					if ( err ) return err;
					next();
				});
			}, function ( err ) {
				if ( err ) return err;
				// return
				return res.json( 200, reports );
			});

    });

  },

  // get all Reports
  getReportById: async function( req, res ) {

    // request input
    if ( !req.param( 'id' ) ) {
      return res.json(401, { err: 'id required!' });
    }

    if ( req.param('previous')) var prev = true;

    var query = { id: req.param( 'id' ) };

    let report = await StockReport.findOne( query );

    if (prev) {
      query = {
        report_month: moment(report.reporting_period).subtract(1, 'M').month(),
        report_year: moment(report.reporting_period).subtract(1, 'M').year(),
        organization_tag: report.organization_tag,
        admin0pcode: report.admin0pcode
      };
      report = await StockReport.findOne( query );
    }

    if (report) {

    query = { report_id: report.id };

    // promise
		Promise.all([
			StockLocation.find( query ),
			Stock.find( query ),
		])
		.catch( function( err ) {
			return res.negotiate( err );
		})
		.then( function( result ) {

			var locations = result[ 0 ];
			var stocks = result[ 1 ];

			// placeholder
			report.stocklocations = [];

			// async loop locations
			async.each( locations, function ( location, next ) {

				// counter
				var locations_counter = 0;
				var locations_features = 1;

				// set holders
				location.stocks = [];

				// set next in locations array
				var set_next = function ( location ){
					locations_counter++;
					if( locations_counter === locations_features ){
						report.stocklocations.push( location );
						next();
					}
				}

				// stocks
				if ( stocks.length ){
					async.each( stocks, function ( stock, b_next ) {
						if ( location.id === stock.location_id ) {
							// push
							location.stocks.push( stock );
						}
						// next
						b_next();
					}, function ( err ) {
						// error
						if ( err ) return err;
						// increment counter
						set_next( location );
					});
				} else {
					// increment counter
					set_next( location );
				}

			}, function ( err ) {
				if ( err ) return err;
				return res.json( 200, report );
			});

    });
    } else return res.json(200, {});

  },

  // set report details by report id
  setReportById: function( req, res ) {

    // request input
    if ( !req.param( 'report' ) ) {
      return res.json(401, { err: 'report required!' });
    }

    // get report
    var report = req.param( 'report' );
    var locations = req.param( 'report' ).stocklocations;

    // find
		var findOrganization = {
			// organization_id: report.organization_id
		}
		var findReport = {
			report_id: report.id
		}
		var findLocation;
    var findTargetLocation;

    delete report.createdAt;
    delete report.updatedAt;

		StockReport
    .update( { id: report.id }, report )
    .exec( function( err, report ){

      // return error
      if ( err ) return res.negotiate( err );

      // update / create locations
      report = report[0];
      report.stocklocations = [];

      // prepare for cloning
      var report_copy = JSON.parse( JSON.stringify( report ) );
      delete report_copy.id;
      delete report_copy.createdAt;
      delete report_copy.updatedAt;

      // async loop report locations
      async.eachOf( locations, function ( location, li, next ) {

        // set counter
        var locations_counter = 0;
        var locations_features = 1;

        // set stocks
        var stocks = location.stocks;

        // set next in locations array
        var set_next = function ( location, li ){
          locations_counter++;
          if( locations_counter === locations_features ){
            // report.stocklocations.push( location );
            report.stocklocations[li] = location;
            next();
          }
        }

        delete location.createdAt;
        delete location.updatedAt;
        location.report_status = report_copy.report_status;
        location.report_active = report_copy.report_active;
        // update or create
        StockLocation.updateOrCreate( _under.extend( {}, findOrganization, findReport ), { id: location.id }, location ).exec(function( err, result ){

          // set result, update / create stocks
          location = Utils.set_result( result );
          findLocation = { location_id: location.id }
          findTargetLocation = { stock_warehouse_id: location.stock_warehouse_id }
          location.stocks = [];

          // prepare for cloning
          var location_copy = JSON.parse( JSON.stringify( location ) );
          delete location_copy.id;
          delete location_copy.createdAt;
          delete location_copy.updatedAt;

          // async loop report stocks
          async.eachOf( stocks, function ( stock, i, s_next ) {
            delete stock.createdAt;
            delete stock.updatedAt;
            // clone
            var s = _under.extend( {}, report_copy, location_copy, stock );
            s.report_status = report_copy.report_status;
            s.report_active = report_copy.report_active;
            // update or create
            Stock.updateOrCreate( _under.extend( {}, findOrganization, findReport, findLocation, findTargetLocation ), { id: s.id }, s ).exec(function( err, result ){
                    // location.stocks.push( Utils.set_result( result ) );
                    // set stocks in the original order
                    location.stocks[i] = Utils.set_result(result);
                    s_next(err);
              });
            }, function ( err ) {
              if ( err ) return res.negotiate( err );
              // increment counter
              set_next( location, li );
            });

        });
      }, function ( err ) {
        if ( err ) return res.negotiate( err );
        return res.json( 200, report );
      });

    });

  },

  // remove warehouse
  removeLocationById: async function( req, res ) {

    // request input
    if ( !req.param( 'stock_warehouse_id' ) ) {
      return res.json(401, { err: 'stock_warehouse_id required!' });
    }

    // stock_warehouse_id
    var stock_warehouse_id = req.param( 'stock_warehouse_id' );

    try {
      // find locations containing beneficiaries first
      const stocks = await Stock.find({ stock_warehouse_id: stock_warehouse_id }, { select: ['location_id'] })
      const uniq_locations = [...new Set(stocks.map(s => s.location_id))];

      await Promise.all([
        StockWarehouse.destroy({ id: stock_warehouse_id }),
        StockLocation.destroy({ stock_warehouse_id: stock_warehouse_id, id: { $nin: uniq_locations } })
      ])

      return res.json(200, { msg: 'Success!' });

    } catch (err) {
      return res.negotiate(err);
    }

    },
    // remove
    removeStock: function( req, res ){

      // request input
      if ( !req.param( 'id' ) ) {
        return res.json(401, { err: 'id required!' });
      }

      // get report
      var $id = req.param( 'id' );

      Stock
        .destroy({ id: $id })
        .exec(function( err, b ){

          // return error
          if ( err ) return res.json({ err: true, error: err });

          // return reports
          return res.json( 200, { msg: 'success' } );

        });

    },

    // update stocks by id ( cluster admin correction )
  setStocksById: function (req, res) {
    // request input
    if (!req.param('stocks') || !Array.isArray(req.param('stocks'))) {
      return res.json(401, { err: 'stocks array required!' });
    }
    let stocks = req.param('stocks');
    let stocks_update = [];

    // return res
    let returnStocks = function(err) {
      if (err) return res.json( 500, { err: err });
        return res.json( 200, { stocks: stocks_update } );
    }

    async.eachOf(stocks, function (s, is, next) {
      delete s.updatedAt;
      delete s.createdAt;
      if (s.id) {
        let id = s.id;
        Stock.update({ id: s.id }, s).exec(function (err, result) {
          if (err) return next(err);
          let resultObj = Utils.set_result(result);
          if (resultObj) {
            resultObj.updated = true
            stocks_update[is] = Utils.set_result(resultObj);
          } else {
            s.updated = false
            s.id = id;
            stocks_update[is] = s;
          }
          next();
        });
      } else {
        s.updated = false
        stocks_update[is] = s;
        next();
      }
    }, function (err) {
      returnStocks(err);
    });

  },

  setStockById: async function (req, res) {
    // request input
    let stock = req.param('stock');

    if (!stock) {
      return res.json(401, { err: 'stock required!' });
    }

    if (!stock.id) {
      return res.json(401, { err: 'id required!' });
    }

    // check if user can modify record
    let edit = await AuthService.canEditRecord(req.token, 'Stock', stock.id);
    if (edit.err){
      return res.json(edit.code, { err: err.err });
    }

    delete stock.updatedAt;
    delete stock.createdAt;
    // update of next fields not allowed
    delete stock.adminRpcode;
    delete stock.admin0pcode;
    delete stock.organization;
    delete stock.organization_id;
    delete stock.organization_tag;
    delete stock.report_id;
    delete stock.location_id;

    if (stock.id) {
      Stock.update({ id: stock.id }, stock).exec(function (err, result) {
        if (err) return res.negotiate(err);
        result = Utils.set_result(result);
        if (!result) {
          return res.json(404, { err: 'Stock with such id not found!' });
        }
        return res.json(200, { stock: result });
      });
    } else {
      return res.json(401, { err: 'id required!' });
    }

  },

};

module.exports = StockReportController;
