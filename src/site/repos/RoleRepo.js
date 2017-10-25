import deserializeJsonApi from '../../deserializeJsonApi';
import serializeJsonApi from '../../serializeJsonApi';

export default class RoleRepo {
  constructor(client) {
    this.client = client;
  }

  create(resourceAttributes) {
    const serializedResource = serializeJsonApi(
      resourceAttributes,
      {
        type: 'role',
        attributes: [
          'name',
          'canEditFavicon',
          'canEditSite',
          'canEditSchema',
          'canManageUsers',
          'canManageAccessTokens',
          'canPerformSiteSearch',
          'canPublishToStaging',
          'canPublishToProduction',
          'positiveItemTypePermissions',
          'negativeItemTypePermissions',
        ],
        requiredAttributes: [
          'name',
          'canEditFavicon',
          'canEditSite',
          'canEditSchema',
          'canManageUsers',
          'canManageAccessTokens',
          'canPerformSiteSearch',
          'canPublishToStaging',
          'canPublishToProduction',
          'positiveItemTypePermissions',
          'negativeItemTypePermissions',
        ],
      }
    );
    return this.client.post('/roles', serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  update(roleId, resourceAttributes) {
    const serializedResource = serializeJsonApi(
      roleId,
      resourceAttributes,
      {
        type: 'role',
        attributes: [
          'name',
          'canEditFavicon',
          'canEditSite',
          'canEditSchema',
          'canManageUsers',
          'canManageAccessTokens',
          'canPerformSiteSearch',
          'canPublishToStaging',
          'canPublishToProduction',
          'positiveItemTypePermissions',
          'negativeItemTypePermissions',
        ],
        requiredAttributes: [
          'name',
          'canEditFavicon',
          'canEditSite',
          'canEditSchema',
          'canManageUsers',
          'canManageAccessTokens',
          'canPerformSiteSearch',
          'canPublishToStaging',
          'canPublishToProduction',
          'positiveItemTypePermissions',
          'negativeItemTypePermissions',
        ],
      }
    );
    return this.client.put(`/roles/${roleId}`, serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  all() {
    return this.client.get('/roles')
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  find(roleId) {
    return this.client.get(`/roles/${roleId}`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  destroy(roleId) {
    return this.client.delete(`/roles/${roleId}`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }
}
