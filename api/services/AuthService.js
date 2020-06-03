const ROLES = [{
  ROLE: 'PUBLIC',
  EDIT: false,
  EDIT_USER: false,
  EDIT_USER_CLUSTER:false,
  EDIT_USER_CLUSTER_RESTRICTED:[],
  EDIT_USER_ORG:false,
  EDIT_USER_ORG_RESTRICTED:[],
  ADMIN_RESTRICTED: [ 'admin0pcode', 'organization_tag' ],
  ADMIN_MENU: [ 'cluster_id', 'report_id' ],
  DASHBOARD_RESTRICTED: [],
  DASHBOARD_MENU: [ 'adminRpcode', 'admin0pcode', 'cluster_id', 'organization_tag' ],
  TEAM_RESTRICTED: [],
  TEAM_MENU: [],
  VALIDATE: false,
  LEVEL: 0,
  DESCRIPTION: 'Public Access'
},{
  ROLE: 'USER',
  EDIT: true,
  EDIT_RESTRICTED: ['organization_tag', 'admin0pcode', 'adminRpcode' ],
  EDIT_USER: false,
  EDIT_USER_CLUSTER:false,
  EDIT_USER_CLUSTER_RESTRICTED:[],
  EDIT_USER_ORG:false,
  EDIT_USER_ORG_RESTRICTED:[],
  EDIT_USER_RESTRICTED: ['organization_tag', 'admin0pcode', 'adminRpcode'],
  ADMIN_RESTRICTED: [ 'admin0pcode', 'organization_tag' ],
  ADMIN_MENU: [ 'cluster_id', 'report_id' ],
  DASHBOARD_RESTRICTED: [ 'adminRpcode', 'admin0pcode', 'organization_tag' ],
  DASHBOARD_MENU: [ 'cluster_id' ],
  DASHBOARD_DOWNLOAD: true,
  DASHBOARD_DOWNLOAD_RESTRICTED: ['organization_tag', 'admin0pcode', 'adminRpcode'],
  TEAM_RESTRICTED: [ 'admin0pcode', 'organization_tag' ],
  TEAM_MENU: [ 'cluster_id', 'report_id' ],
  PROJECT_RESTRICTED: ['adminRpcode','admin0pcode', 'organization_tag'],
  PROJECT_MENU: ['cluster_id'],
  VALIDATE: false,
  LEVEL: 1,
  DESCRIPTION: 'The USER can add, edit and update reports for your Organization'
},
{
  ROLE: 'ORG',
  EDIT: true,
  EDIT_RESTRICTED: ['organization_tag', 'admin0pcode', 'adminRpcode'],
  EDIT_USER: true,
  EDIT_USER_CLUSTER:true,
  EDIT_USER_CLUSTER_RESTRICTED:[],
  EDIT_USER_ORG:false,
  EDIT_USER_ORG_RESTRICTED:[],
  EDIT_USER_ROLES: [ 'USER', 'ORG' ],
  EDIT_USER_RESTRICTED: ['organization_tag', 'admin0pcode', 'adminRpcode'],
  ADMIN_RESTRICTED: [ 'admin0pcode', 'organization_tag' ],
  ADMIN_MENU: [ 'cluster_id', 'report_id' ],
  DASHBOARD_RESTRICTED: [ 'adminRpcode', 'admin0pcode', 'organization_tag' ],
  DASHBOARD_MENU: [ 'cluster_id' ],
  DASHBOARD_DOWNLOAD: true,
  DASHBOARD_DOWNLOAD_RESTRICTED: ['organization_tag', 'admin0pcode', 'adminRpcode'],
  TEAM_RESTRICTED: [ 'admin0pcode', 'organization_tag' ],
  TEAM_MENU: [ 'cluster_id' ],
  PROJECT_RESTRICTED: ['adminRpcode','admin0pcode', 'organization_tag'],
  PROJECT_MENU: ['cluster_id'],
  VALIDATE: false,
  LEVEL: 2,
  DESCRIPTION: 'The ORG role is to manage the USERS of your Organization'
},
{
  ROLE: 'CLUSTER',
  EDIT: true,
  EDIT_RESTRICTED: ['cluster_id', 'admin0pcode', 'adminRpcode'],
  EDIT_USER: true,
  EDIT_USER_CLUSTER:true,
  EDIT_USER_CLUSTER_RESTRICTED:[],
  EDIT_USER_ORG:false,
  EDIT_USER_ORG_RESTRICTED:[],
  EDIT_USER_ROLES: [ 'USER', 'ORG', 'CLUSTER' ],
  EDIT_USER_RESTRICTED: ['cluster_id', 'admin0pcode', 'adminRpcode'],
  ADMIN_RESTRICTED: [ 'admin0pcode', 'cluster_id' ],
  ADMIN_MENU: [ 'organization_tag', 'report_id' ],
  DASHBOARD_RESTRICTED: [ 'adminRpcode', 'admin0pcode', 'cluster_id' ],
  DASHBOARD_MENU: [ 'organization_tag' ],
  DASHBOARD_DOWNLOAD: true,
  DASHBOARD_DOWNLOAD_RESTRICTED: ['cluster_id', 'admin0pcode', 'adminRpcode'],
  TEAM_RESTRICTED: [ 'admin0pcode', 'cluster_id' ],
  TEAM_MENU: [ 'organization_tag' ],
  PROJECT_RESTRICTED: ['adminRpcode','admin0pcode', 'cluster_id' ],
  PROJECT_MENU: ['organization_tag'],
  VALIDATE: true,
  LEVEL: 3,
  DESCRIPTION: 'The CLUSTER role is to manage the partners and projects of your Sector'
},
{
  ROLE: 'COUNTRY',
  EDIT: false,
  EDIT_RESTRICTED: ['admin0pcode', 'adminRpcode'],
  EDIT_USER: false,
  EDIT_USER_CLUSTER:true,
  EDIT_USER_CLUSTER_RESTRICTED:[],
  EDIT_USER_ORG:false,
  EDIT_USER_ORG_RESTRICTED:[],
  EDIT_USER_ROLES: [ 'USER', 'ORG', 'CLUSTER', 'COUNTRY' ],
  EDIT_USER_RESTRICTED: ['admin0pcode', 'adminRpcode'],
  ADMIN_RESTRICTED: [ 'admin0pcode' ],
  ADMIN_MENU: [ 'cluster_id', 'report_id', 'organization_tag' ],
  DASHBOARD_RESTRICTED: [ 'admin0pcode', 'adminRpcode' ],
  DASHBOARD_MENU: [ 'cluster_id', 'organization_tag' ],
  DASHBOARD_DOWNLOAD: true,
  DASHBOARD_DOWNLOAD_RESTRICTED: ['admin0pcode', 'adminRpcode'],
  TEAM_RESTRICTED: [ 'admin0pcode' ],
  TEAM_MENU: [ 'cluster_id', 'organization_tag' ],
  PROJECT_RESTRICTED: ['adminRpcode','admin0pcode'],
  PROJECT_MENU: ['cluster_id', 'organization_tag'],
  VALIDATE: true,
  LEVEL: 4,
  DESCRIPTION: 'The COUNTRY role acts as an observer and can view (but not edit) all Sectors of your COUNTRY'
},
{
  ROLE: 'COUNTRY_ADMIN',
  EDIT: true,
  EDIT_RESTRICTED: [ 'admin0pcode', 'adminRpcode'],
  EDIT_USER: true,
  EDIT_USER_CLUSTER:true,
  EDIT_USER_CLUSTER_RESTRICTED:[],
  EDIT_USER_ORG:true,
  EDIT_USER_ORG_RESTRICTED: ['admin0pcode'],
  EDIT_USER_ROLES: [ 'USER', 'ORG', 'CLUSTER', 'COUNTRY', 'COUNTRY_ADMIN' ],
  EDIT_USER_RESTRICTED: ['admin0pcode', 'adminRpcode'],
  ADMIN_RESTRICTED: [ 'admin0pcode' ],
  ADMIN_MENU: [ 'cluster_id', 'report_id', 'organization_tag' ],
  DASHBOARD_RESTRICTED: [ 'admin0pcode', 'adminRpcode' ],
  DASHBOARD_MENU: [ 'cluster_id', 'organization_tag' ],
  DASHBOARD_DOWNLOAD: true,
  DASHBOARD_DOWNLOAD_RESTRICTED: ['admin0pcode', 'adminRpcode'],
  TEAM_RESTRICTED: [ 'admin0pcode' ],
  TEAM_MENU: [ 'cluster_id', 'organization_tag' ],
  PROJECT_RESTRICTED: ['adminRpcode','admin0pcode'],
  PROJECT_MENU: ['cluster_id', 'organization_tag'],
  VALIDATE: false,
  LEVEL: 4,
  DESCRIPTION: 'The COUNTRY_ADMIN manages the partners and projects of your COUNTRY'
},
{
  ROLE: 'REGION_ORG',
  EDIT: false,
  EDIT_RESTRICTED: ['organization_tag', 'adminRpcode'],
  EDIT_USER: false,
  EDIT_USER_CLUSTER:false,
  EDIT_USER_CLUSTER_RESTRICTED:[],
  EDIT_USER_ORG:false,
  EDIT_USER_ORG_RESTRICTED:[],
  EDIT_USER_RESTRICTED: ['adminRpcode', 'organization_tag'],
  ADMIN_RESTRICTED: [ 'adminRpcode', 'organization_tag' ],
  ADMIN_MENU: [ 'admin0pcode', 'cluster_id', 'report_id' ],
  DASHBOARD_RESTRICTED: [ 'adminRpcode', 'organization_tag' ],
  DASHBOARD_MENU: [ 'admin0pcode', 'cluster_id' ],
  DASHBOARD_DOWNLOAD: true,
  DASHBOARD_DOWNLOAD_RESTRICTED: ['organization_tag', 'adminRpcode'],
  TEAM_RESTRICTED: [ 'adminRpcode', 'organization_tag' ],
  TEAM_MENU: [ 'admin0pcode', 'cluster_id' ],
  PROJECT_RESTRICTED: ['adminRpcode', 'organization_tag'],
  PROJECT_MENU: ['admin0pcode', 'cluster_id'],
  VALIDATE: false,
  LEVEL: 5,
  DESCRIPTION: 'The REGION_ORG role can view projects in your Region for your Organization'
},
{
  ROLE: 'REGION',
  EDIT: false,
  EDIT_RESTRICTED: ['adminRpcode'],
  EDIT_USER: false,
  EDIT_USER_CLUSTER:false,
  EDIT_USER_CLUSTER_RESTRICTED:[],
  EDIT_USER_ORG:false,
  EDIT_USER_ORG_RESTRICTED:[],
  EDIT_USER_RESTRICTED: ['adminRpcode'],
  ADMIN_RESTRICTED: [ 'adminRpcode' ],
  ADMIN_MENU: [ 'admin0pcode', 'cluster_id', 'report_id', 'organization_tag' ],
  DASHBOARD_RESTRICTED: [ 'adminRpcode' ],
  DASHBOARD_MENU: [ 'admin0pcode', 'cluster_id', 'organization_tag' ],
  DASHBOARD_DOWNLOAD: true,
  DASHBOARD_DOWNLOAD_RESTRICTED: ['adminRpcode'],
  TEAM_RESTRICTED: [ 'adminRpcode' ],
  TEAM_MENU: [ 'admin0pcode', 'cluster_id', 'organization_tag' ],
  PROJECT_RESTRICTED: ['adminRpcode'],
  PROJECT_MENU: ['admin0pcode', 'cluster_id', 'organization_tag'],
  VALIDATE: false,
  LEVEL: 6,
  DESCRIPTION: 'The REGION role can view projects in your Region for all Sectors'
},
{
  ROLE: 'HQ_ORG',
  EDIT: false,
  EDIT_RESTRICTED: ['organization_tag'],
  EDIT_USER: false,
  EDIT_USER_CLUSTER:false,
  EDIT_USER_CLUSTER_RESTRICTED:[],
  EDIT_USER_ORG:false,
  EDIT_USER_ORG_RESTRICTED:[],
  EDIT_USER_RESTRICTED: ['organization_tag'],
  ADMIN_RESTRICTED: [ 'organization_tag' ],
  ADMIN_MENU: [ 'adminRpcode', 'admin0pcode', 'cluster_id', 'report_id' ],
  DASHBOARD_RESTRICTED: [ 'organization_tag' ],
  DASHBOARD_MENU: [ 'adminRpcode', 'admin0pcode', 'cluster_id' ],
  DASHBOARD_DOWNLOAD: true,
  DASHBOARD_DOWNLOAD_RESTRICTED: ['organization_tag'],
  TEAM_RESTRICTED: [ 'organization_tag' ],
  TEAM_MENU: [ 'adminRpcode', 'admin0pcode', 'cluster_id' ],
  PROJECT_RESTRICTED: ['organization_tag'],
  PROJECT_MENU: ['adminRpcode', 'admin0pcode', 'cluster_id'],
  VALIDATE: false,
  LEVEL: 7,
  DESCRIPTION: 'The HQ_ORG role can view projects Globally for your Organisation'
},
{
  ROLE: 'HQ',
  EDIT: false,
  EDIT_RESTRICTED: [],
  EDIT_USER: false,
  EDIT_USER_CLUSTER:false,
  EDIT_USER_CLUSTER_RESTRICTED:[],
  EDIT_USER_ORG:false,
  EDIT_USER_ORG_RESTRICTED:[],
  EDIT_USER_RESTRICTED: [],
  ADMIN_RESTRICTED: [],
  ADMIN_MENU: [ 'adminRpcode', 'admin0pcode', 'cluster_id', 'report_id', 'organization_tag' ],
  DASHBOARD_RESTRICTED: [],
  DASHBOARD_MENU: [ 'adminRpcode', 'admin0pcode', 'cluster_id', 'organization_tag' ],
  DASHBOARD_DOWNLOAD: true,
  DASHBOARD_DOWNLOAD_RESTRICTED: [],
  TEAM_RESTRICTED: [],
  TEAM_MENU: [ 'adminRpcode', 'admin0pcode', 'cluster_id', 'organization_tag' ],
  PROJECT_RESTRICTED: [],
  PROJECT_MENU: ['adminRpcode', 'admin0pcode', 'cluster_id', 'organization_tag'],
  VALIDATE: false,
  LEVEL: 8,
  DESCRIPTION: 'The HQ role can view projects Globally for your all Sectors'
},
{
  ROLE: 'SUPERADMIN',
  EDIT: true,
  EDIT_RESTRICTED: [],
  EDIT_USER: true,
  EDIT_USER_CLUSTER:false,
  EDIT_USER_CLUSTER_RESTRICTED:[],
  EDIT_USER_ORG:false,
  EDIT_USER_ORG_RESTRICTED:[],
  EDIT_USER_ROLES: [ 'USER', 'ORG', 'CLUSTER', 'COUNTRY', 'COUNTRY_ADMIN', 'REGION_ORG', 'REGION', 'HQ_ORG', 'HQ', 'SUPERADMIN'],
  EDIT_USER_RESTRICTED: [],
  ADMIN_RESTRICTED: [],
  ADMIN_MENU: [ 'adminRpcode', 'admin0pcode', 'cluster_id', 'report_id', 'organization_tag' ],
  DASHBOARD_RESTRICTED: [],
  DASHBOARD_MENU: [ 'adminRpcode', 'admin0pcode', 'cluster_id', 'organization_tag' ],
  DASHBOARD_DOWNLOAD: true,
  DASHBOARD_DOWNLOAD_RESTRICTED: [],
  TEAM_RESTRICTED: [],
  TEAM_MENU: [ 'adminRpcode', 'admin0pcode', 'cluster_id', 'organization_tag' ],
  PROJECT_RESTRICTED: [],
  PROJECT_MENU: ['adminRpcode', 'admin0pcode', 'cluster_id', 'organization_tag'],
  VALIDATE: true,
  LEVEL: 9,
  DESCRIPTION: 'Beware, here be dragons!'
}];

/**
 * Checks if user can edit in input view zones.
 * @param {string} permission - Permission to check, accepts one of values: 'EDIT', 'EDIT_USER', defined as props on ngmPermissions.
 * @param {Object} user - User object.
 * @param {Object} zones - Object containing zones and their values.
 * @param {string} zones.adminRpcode - adminRpcode.
 * @param {string} zones.admin0pcode - admin0pcode.
 * @param {string} zones.cluster_id - cluster_id.
 * @param {string} zones.organization_tag - organization_tag.
 * @returns {boolean} User can/cannot edit for input view zones.
 */
module.exports.canDo = function(permission, user, zones) {
  let USER_PERMISSIONS = ROLES.filter(function(x){return user.roles.includes(x.ROLE)});
  // check params
  if (!permission||!zones||typeof zones!=='object'||typeof permission!=='string') return false

  // _RESTRICTED prop on permissions conf with user restricted zones
  const permission_restricted = (permission ? permission : 'EDIT') + '_RESTRICTED';

  // validation logic

  // roll over user roles definitions, use for...of in future
  for (const role of USER_PERMISSIONS){
    // if permission active
    if (role[permission]){
      allowed = true;
      // roll over role restricted zones
      for (const z of role[permission_restricted]){
        // if not own zone
        // console.log(user[z], zones[z]);
        if(!z||!user[z]||!zones[z]||(user[z].toLowerCase() !== zones[z].toLowerCase())){
          // disallow access
          allowed = false;
        }
      }
      // fast return on match
      if(allowed) return allowed
    }
  }

  // otherwise if no match, no edit rights
  return false;
};

/**
 * Checks if user can edit in record on collection, wrapper for canDo.
 * @param {Object} userObj - User object.
 * @param {string} collection - Collection global name.
 * @param {string} id - Record id.
 * @returns {Object} {err:false, code:200}
 */
module.exports.canEditRecord = async function (userObj, collection, id) {
  let beneficiary_db = await global[collection].findOne({ id: id });
  if (!beneficiary_db) {
    return { err: 'Record with such id not found!', code: 404 };
  }
  if (!userObj) {
    return { err: 'Token not found!', code: 401 };
  }
  let user = await User.findOne({ id: userObj.sid });

  if (!AuthService.canDo('EDIT', user, beneficiary_db)) {
    return { err: 'Not permitted!', code: 403 }
  }
  return { err: false, code: 200 }
};
