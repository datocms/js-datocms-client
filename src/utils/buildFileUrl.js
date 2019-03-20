import queryString from 'querystring';

export default function buildFileUrl(uploadEntity, entitiesRepo, params = {}) {
  if (!uploadEntity) {
    return null;
  }

  const { site: { imgixHost } } = entitiesRepo;
  const { path } = uploadEntity;

  if (params && Object.keys(params).length > 0) {
    return `https://${imgixHost}${path}?${queryString.stringify(params)}`;
  }

  return `https://${imgixHost}${path}`;
}
