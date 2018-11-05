import { toItemApiKey } from './toApiKey';

export default ({ field, itemTypes }) => {
  let filteredItemTypes = itemTypes;

  for (const validation of field.validations) {
    if (Object.prototype.hasOwnProperty.call(validation, 'linkContentType')) {
      const linkedContentTypeIds = validation.linkContentType.map(item => toItemApiKey(item));

      if (linkedContentTypeIds.length > 0) {
        filteredItemTypes = itemTypes.filter((item) => {
          return linkedContentTypeIds.indexOf(item.apiKey) >= 0;
        });
      }
    }
  }

  return filteredItemTypes.map(item => item.id);
};
