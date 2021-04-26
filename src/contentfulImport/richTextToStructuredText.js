import {
  richTextToStructuredText,
  visitChildren,
} from 'datocms-contentful-to-structured-text';
import { allowedChildren } from 'datocms-structured-text-utils';

const createItemLinkHandler = async (createNode, node, context) => {
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

const createInlineItemHandler = async (createNode, node, context) => {
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

const createModularBlockHandler = async (createNode, node, context) => {
  const isAllowedChild = allowedChildren[context.parentNodeType].includes(
    'block',
  );

  return modularBlockId => {
    return isAllowedChild && modularBlockId
      ? createNode('block', { item: modularBlockId })
      : createNode('span', {
          value: `Asset #${node.data.target.sys.id}`,
        });
  };
};

export default async function(datoClient, contentfulRecordMap, uploadsMapping) {
  // if link it should create a placeholder and then substitute it on the link phase
  // if modular block it should create a new block
  // if asset it should create a new image modular block
  console.log('ooooooo', datoClient);

  let contentfulAssetModularBlock = await datoClient.itemTypes.find(
    'contentful_asset',
  );

  if (!contentfulAssetModularBlock) {
    contentfulAssetModularBlock = await datoClient.itemTypes.create({
      name: 'Contentful asset',
      apiKey: 'contentful_asset',
      modularBlock: true,
    });

    await datoClient.fields.create(contentfulAssetModularBlock.id, {
      label: 'File',
      apiKey: 'file',
      fieldType: 'file',
    });
  }

  const handlers = {
    'embedded-entry-inline': async (createNode, node, context) => {
      const inlineItemHandler = await createInlineItemHandler(
        createNode,
        node,
        context,
      );

      return inlineItemHandler(contentfulRecordMap[node.data.target.sys.id]);
    },
    'embedded-entry-block': async (createNode, node, context) => {
      const inlineItemHandler = await createInlineItemHandler(
        createNode,
        node,
        context,
      );

      return inlineItemHandler(contentfulRecordMap[node.data.target.sys.id]);
    },
    'entry-hyperlink': async (createNode, node, context) => {
      const createItemLink = await createItemLinkHandler(
        createNode,
        node,
        context,
      );

      return createItemLink(contentfulRecordMap[node.data.target.sys.id]);
    },
    'asset-hyperlink': async (createNode, node, context) => {
      // create modular block if not exists and create image
      const modularBlockHandler = await createModularBlockHandler(
        createNode,
        node,
        context,
      );

      const modularBlock = await datoClient.items.create({
        itemType: contentfulAssetModularBlock.id,
        file: uploadsMapping[node.data.target.sys.id],
      });

      return modularBlockHandler(modularBlock.id);
    },
    'embedded-asset-block': async (createNode, node, context) => {
      const modularBlockHandler = await createModularBlockHandler(
        createNode,
        node,
        context,
      );

      const modularBlock = await datoClient.items.create({
        itemType: contentfulAssetModularBlock.id,
        file: uploadsMapping[node.data.target.sys.id],
      });

      return modularBlockHandler(modularBlock.id);
    },
  };

  return async value => richTextToStructuredText(value, { handlers });
}
