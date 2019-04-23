/**
* Documents.js
*
* @description :: FILE META DATA STORAGE.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	// connection
    connection: 'ngmHealthClusterServer',
    
    schema: false,

    attributes: {
        fileid: {
                type: 'string',
        },
        filename: {
            type: 'string',
        },
        filename_extention: {
            type: 'string',
        },
        mime_type: {
            type: 'string',
        },
        fileid_local: {
            type: 'string',
        },
        project_id: {
            type: 'string',
        },
        admin0pcode: {
            type: 'string',
        },
        organization_tag: {
            type: 'string',
        },
        fileowner: {
            type: 'string',
        }
    }
	
}
