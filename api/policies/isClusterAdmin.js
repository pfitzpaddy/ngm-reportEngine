/**
 * tokenClusterAdminAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated cluster admin user via token or session user
 *
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
const clusterAdminRoles = ['SUPERADMIN', 'COUNTRY_ADMIN', 'CLUSTER'];

module.exports = function(req, res, next) {

  let admin = false;
  if (req.token.roles && Array.isArray(req.token.roles)) {
    admin = clusterAdminRoles.some((val) => req.token.roles.indexOf(val) !== -1);
  } else if (req.session && req.session.session_user && req.session.session_user.roles && Array.isArray(req.session.session_user.roles)) {
    console.log(req.session.session_user.roles)
    admin = clusterAdminRoles.some((val) => req.session.session_user.roles.indexOf(val) !== -1);
  }

  if (admin) {
    next();
  } else {
    return res.json(403, { err: 'No Cluster Admin Rights' });
  }

};
