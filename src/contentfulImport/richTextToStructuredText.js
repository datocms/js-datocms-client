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
          value: `** Contentful entry missing or inaccessible: ${node.data.target.sys.id} **`,
        });
};

const createBlockHandler = async (createNode, node, context, assetBlockId) => {
  // assetBlockId is created on createFields

  const isAllowedChild = allowedChildren[context.parentNodeType].includes(
    'block',
  );

  return uploadId => {
    const payload = {
      type: 'item',
      attributes: {
        file: { uploadId },
      },
      relationships: {
        item_type: {
          data: {
            id: assetBlockId,
            type: 'item_type',
          },
        },
      },
    };

    return isAllowedChild && uploadId
      ? createNode('block', { item: payload })
      : createNode('span', {
          value: `Missing asset #${node.data.target.sys.id}`,
        });
  };
};

const createAssetLinkHandler = async (createNode, node, context) => {
  const isAllowedChild = allowedChildren[context.parentNodeType].includes(
    'inlineNodes',
  );

  const children = await visitChildren(createNode, node, {
    ...context,
    parentNodeType: isAllowedChild ? 'link' : context.parentNodeType,
  });

  return assetUrl =>
    isAllowedChild && assetUrl
      ? createNode('link', { url: assetUrl, children })
      : children;
};

export const createAssetModularBlock = async datoClient => {
  // DatoCMS does not handle assets in Structured Text like Contentful does, so
  // we need to create a modular block with a file field to allow assets in Structured

  let contentfulAssetModularBlock;

  try {
    contentfulAssetModularBlock = await datoClient.itemTypes.find(
      'contentful_asset',
    );
  } catch {
    // do nothing
  }

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

  return contentfulAssetModularBlock.id;
};

export default async function(datoClient, contentfulRecordMap, uploadsMapping) {
  const assetBlock = await datoClient.itemTypes.find('contentful_asset');

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
      const assetLinkHandler = await createAssetLinkHandler(
        createNode,
        node,
        context,
      );

      const upload = await datoClient.uploads.find(
        uploadsMapping[node.data.target.sys.id],
      );

      return assetLinkHandler(upload.url);
    },
    'embedded-asset-block': async (createNode, node, context) => {
      const modularBlockHandler = await createBlockHandler(
        createNode,
        node,
        context,
        assetBlock.id,
      );

      return modularBlockHandler(uploadsMapping[node.data.target.sys.id]);
    },
  };

  return async value => richTextToStructuredText(value, { handlers });
}
