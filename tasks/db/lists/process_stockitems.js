use ngmHealthCluster;
try {
  db.getCollection('stockitems').find({}).forEach(function (d) { if( d.details && d.details.length ) {print(d._id.valueOf()); d.details = JSON.stringify(d.details); db.getCollection('stockitems').save(d); }});
  db.getCollection('stockitems').find({}).forEach(function (d) { if( d.details && d.details.length ) {print(d._id.valueOf()); d.details = JSON.parse(d.details); db.getCollection('stockitems').save(d); }});
} catch (err){
  print(err);
  throw err;
}
