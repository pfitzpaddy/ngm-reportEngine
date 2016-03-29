/**
 * ProjectController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  //
  create: function(req, res){

    // update financials
    Workshop.create( [{
      title: 'Workshop Group 1',
      date: 'Monday April 4, 2016',
      time: '9am till 2pm incl. lunch',
      theme: 'lime lighten-4',
      participants: [{
        workshop_id: '1'
      },{
        workshop_id: '1'
      },{
        workshop_id: '1'
      },{
        workshop_id: '1'
      }]
    },{
      title: 'Workshop Group 2',
      date: 'Tuesday April 5, 2016',
      time: '9am till 2pm',
      theme: 'light-blue lighten-4',
      participants: [{
        workshop_id: '2'
      },{
        workshop_id: '2'
      },{
        workshop_id: '2'
      },{
        workshop_id: '2'
      }]
    },{
      title: 'Workshop Group 3',
      date: 'Wednesday April 6, 2016',
      time: '9am till 2pm',
      theme: 'teal lighten-4',
      participants: [{
        workshop_id: '3'
      },{
        workshop_id: '3'
      },{
        workshop_id: '3'
      },{
        workshop_id: '3'
      }]
    },{
      title: 'Workshop Group 4',
      date: 'Monday April 4, 2016',
      time: '9am till 2pm',
      theme: 'blue lighten-3',
      participants: [{
        workshop_id: '4'
      },{
        workshop_id: '4'
      },{
        workshop_id: '4'
      },{
        workshop_id: '4'
      }]
    }] ).exec(function(err, workshops){
        
      // return error
      if (err) return res.negotiate( err );

      // return data
      return res.json(200, { data: workshops } );
      
    });

  },

  // set project details
  setWorkshop: function(req, res) {

    // request input
    if (!req.param('data')) {
      return res.json(401, { err: 'data required!' });
    }    

    // get
    $data = req.param('data')[0];

    //
    $data.workshops.forEach(function(d, i){

      // update financials
      Workshop.update( { id: d.id }, d ).exec(function(err, workshops){
          
        // return error
        if (err) return res.negotiate( err );

        if ( i === $data.workshops.length - 1  ) {
          // return data
          return res.json(200, [{ workshops: workshops }] );
        }

      });

    });

  },

  // set project details
  getWorkshop: function(req, res) {

    // get beneficiaries
    Workshop.find().populateAll().exec(function(err, workshops){

      // return error
      if (err) return res.negotiate( err );

      // return data
      return res.json(200, [{ workshops: workshops }] );

    });

  }

};
