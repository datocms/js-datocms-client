import {
  richTextToStructuredText,
  visitChildren,
} from 'datocms-contentful-to-structured-text';
import { allowedChildren } from 'datocms-structured-text-utils';

const createItemLinkFunction = async (createNode, node, context) => {
  const isAllowedChild = allowedChildren[context.parentNodeType].includes(
    'inlineNodes',
  );

  const children = await visitChildren(createNode, node, {
    ...context,
    parentNodeType: isAllowedChild ? 'itemLink' : context.parentNodeType,
  });

  return item =>
    isAllowedChild && item
      ? createNode('itemLink', { item, children })
      : children;
};

const inlineItemFunction = async (createNode, node, context) => {
  const isAllowedChild = allowedChildren[context.parentNodeType].includes(
    'inlineNodes',
  );

  return item =>
    isAllowedChild && item
      ? createNode('inlineItem', { item })
      : createNode('span', {
          value: `link to missing item`,
        });
};

export default function(datoClient, contentfulRecordMap, uploadsMapping) {
  // if link it should create a placeholder and then substitute it on the link phase
  // if modular block it should create a new block
  // if asset it should create a new image modular block

  const handlers = {
    'embedded-entry-inline': async (createNode, node, context) => {
      const createDatoInlineItem = await inlineItemFunction(
        createNode,
        node,
        context,
      );

      return createDatoInlineItem(contentfulRecordMap[node.data.target.sys.id]);
    },
    'embedded-entry-block': async (createNode, node, context) => {
      const createDatoInlineItem = await inlineItemFunction(
        createNode,
        node,
        context,
      );

      return createDatoInlineItem(contentfulRecordMap[node.data.target.sys.id]);
    },
    'entry-hyperlink': async (createNode, node, context) => {
      const createItemLink = await createItemLinkFunction(
        createNode,
        node,
        context,
      );

      return createItemLink(contentfulRecordMap[node.data.target.sys.id]);
    },
    'asset-hyperlink': (createNode, node, context) => {
      // create modular block if not exists and create image
      return createNode('span', {
        value: `asset-hyperlink ${node.data.target.sys.id}`,
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
