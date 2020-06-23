use ngmHealthCluster;
try {
  db.getCollection('activities').find({}).forEach(function (d) { if( d.response && d.response.length && !Array.isArray(d.response) ) { d.response = JSON.parse(d.response); db.getCollection('activities').save(d); } });
  db.getCollection('activities').find({}).forEach(function (d) { if( d.strategic_objective_descriptions && d.strategic_objective_descriptions.length && !Array.isArray(d.strategic_objective_descriptions)) { d.strategic_objective_descriptions = JSON.parse(d.strategic_objective_descriptions); db.getCollection('activities').save(d); } });
  db.getCollection('activities').find({}).forEach(function (d) { if( d.vulnerable_populations && d.vulnerable_populations.length && !Array.isArray(d.vulnerable_populations) ) { d.vulnerable_populations = JSON.parse(d.vulnerable_populations); db.getCollection('activities').save(d); } });
  db.getCollection('activities').find({}).forEach(function (d) { if( d.details && d.details.length && !Array.isArray(d.details) ) {d.details = JSON.parse(d.details); db.getCollection('activities').save(d); }});
  db.getCollection('activities').find({}).forEach(function (d) { if( d.unit_type_id && d.unit_type_id.length && !Array.isArray(d.unit_type_id) ) { d.unit_type_id = JSON.parse(d.unit_type_id); db.getCollection('activities').save(d); } });
  db.getCollection('activities').find({}).forEach(function (d) { if( d.mpc_delivery_type_id && d.mpc_delivery_type_id.length && !Array.isArray(d.mpc_delivery_type_id) ) { d.mpc_delivery_type_id = JSON.parse(d.mpc_delivery_type_id); db.getCollection('activities').save(d); } });
  db.getCollection('activities').find({}).forEach(function (d) { if( d.mpc_mechanism_type_id && d.mpc_mechanism_type_id.length && !Array.isArray(d.mpc_mechanism_type_id) ) { d.mpc_mechanism_type_id = JSON.parse(d.mpc_mechanism_type_id); db.getCollection('activities').save(d); } });
  db.getCollection('activities').find({}).forEach(function (d) { if( d.mpc_transfer_category_id && d.mpc_transfer_category_id.length && !Array.isArray(d.mpc_transfer_category_id)) { d.mpc_transfer_category_id = JSON.parse(d.mpc_transfer_category_id); db.getCollection('activities').save(d); } });
  db.getCollection('activities').find({}).forEach(function (d) { if( d.mpc_grant_type_id && d.mpc_grant_type_id.length && !Array.isArray(d.mpc_grant_type_id) ) { d.mpc_grant_type_id = JSON.parse(d.mpc_grant_type_id); db.getCollection('activities').save(d); } });
} catch (err){
  print(err);
  throw err;
}
