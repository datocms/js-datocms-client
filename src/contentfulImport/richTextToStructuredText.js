import { richTextToStructuredText } from 'datocms-contentful-to-structured-text';

export default function(itemTypeMapping, datoClient) {
  // if link it should create a placeholder and then substitute it on the link phase
  // if modular block it should create a new block
  // if asset it should create a new image modular block

  const handlers = {
    'embedded-entry-inline': (createNode, node, context) => {
      return createNode('span', {
        value: `embedded-entry-inline ${node.data.target.sys.id}`,
      });
    },
    'entry-hyperlink': (createNode, node, context) => {
      return createNode('span', {
        value: `entry-hyperlink ${node.data.target.sys.id}`,
      });
    },
    'asset-hyperlink': (createNode, node, context) => {
      return createNode('span', {
        value: `asset-hyperlink ${node.data.target.sys.id}`,
      });
    },
    // inlineItem: link to another item. I have no way of knowing the linked item
    'embedded-entry-block': (createNode, node, context) => {
      return createNode('span', {
        value: `embedded-entry-block ${node.data.target.sys.id}`,
      });
    },
    'embedded-asset-block': (createNode, node, context) => {
      return createNode('span', {
        value: `embedded-asset-block ${node.data.target.sys.id}`,
      });
    },
  };

  return async value => richTextToStructuredText(value, { handlers });
}
