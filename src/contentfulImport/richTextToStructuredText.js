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
        file: uploadId ? { uploadId } : null,
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

    return isAllowedChild
      ? createNode('block', { item: payload })
      : createNode('span', {
          value: `** Contentful asset inaccessible: #${node.data.target.sys.id} **`,
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

export const createStructuredTextAssetBlock = async datoClient => {
  // DatoCMS does not handle assets in Structured Text like Contentful does, so
  // we need to create a modular block with a file field to allow assets in Structured

  let contentfulAssetModularBlock;

  try {
    contentfulAssetModularBlock = await datoClient.itemTypes.find(
      'structured_text_asset',
    );
  } catch {
    // do nothing
  }

  if (!contentfulAssetModularBlock) {
    contentfulAssetModularBlock = await datoClient.itemTypes.create({
      name: 'Structured Text asset',
      apiKey: 'structured_text_asset',
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

const liftAssets = richText => {
  const visit = (node, cb, index = 0, parents = []) => {
    if (node.content && node.content.length > 0) {
      node.content.forEach((child, i) => {
        visit(child, cb, i, [...parents, node]);
      });
    }

    cb(node, index, parents);
  };

  const liftedImages = new WeakSet();

  visit(richText, (node, index, parents) => {
    if (
      !node ||
      node.nodeType !== 'embedded-asset-block' ||
      liftedImages.has(node) ||
      parents.length === 1 // is a top level asset
    ) {
      return;
    }

    const imgParent = parents[parents.length - 1];

    imgParent.content.splice(index, 1);

    let i = parents.length;
    let splitChildrenIndex = index;
    let contentAfterSplitPoint = [];

    /* eslint-disable no-plusplus */
    while (--i > 0) {
      const parent = parents[i];
      const parentsParent = parents[i - 1];

      contentAfterSplitPoint = parent.content.splice(splitChildrenIndex);

      splitChildrenIndex = parentsParent.content.indexOf(parent);

      let nodeInserted = false;

      if (i === 1) {
        splitChildrenIndex += 1;
        parentsParent.content.splice(splitChildrenIndex, 0, node);
        liftedImages.add(node);

        nodeInserted = true;
      }

      splitChildrenIndex += 1;

      if (contentAfterSplitPoint.length > 0) {
        parentsParent.content.splice(splitChildrenIndex, 0, {
          ...parent,
          content: contentAfterSplitPoint,
        });
      }
      // Remove the parent if empty
      if (parent.content.length === 0) {
        splitChildrenIndex -= 1;
        parentsParent.content.splice(
          nodeInserted ? splitChildrenIndex - 1 : splitChildrenIndex,
          1,
        );
      }
    }
  });
};

export default async function(datoClient, contentfulRecordMap, uploadsMapping) {
  const assetBlock = await datoClient.itemTypes.find('structured_text_asset');

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

      if (!uploadsMapping[node.data.target.sys.id]) {
        return null;
      }

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

  return async value => {
    // Extrapolate assets from lists without losing content
    liftAssets(value);

    return richTextToStructuredText(value, { handlers });
  };
}
