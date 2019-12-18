import { serializedAttributes } from './serializeJsonApi';

export default function buildModularBlock(unserializedBody) {
  const attributes = serializedAttributes('item', unserializedBody, null);

  const payload = {
    type: 'item',
    attributes,
    relationships: {
      item_type: {
        data: {
          id: unserializedBody.itemType || unserializedBody.item_type,
          type: 'item_type',
        },
      },
    },
  };

  if (unserializedBody.id) {
    payload.id = unserializedBody.id;
  }

  return payload;
}
