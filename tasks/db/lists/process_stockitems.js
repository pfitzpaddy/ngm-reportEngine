use ngmHealthCluster;
try {
  db.getCollection('stockitems').find({}).forEach(function (d) { if( d.details && d.details.length && !Array.isArray(d.details) ) { d.details = JSON.parse(d.details); db.getCollection('stockitems').save(d); }});
} catch (err){
  print(err);
  throw err;
}
