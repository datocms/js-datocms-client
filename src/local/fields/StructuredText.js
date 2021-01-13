import visit from 'unist-util-visit';
import {
  isInlineItem,
  isItemLink,
  isBlock,
} from 'datocms-structured-text-utils';

const uniq = arr => {
  return arr.filter((item, index) => {
    return arr.indexOf(item) >= index;
  });
};

const findAll = (document, predicate) => {
  const result = [];

  visit(document, predicate, node => {
    result.push(node);
  });

  return result;
};

export default class StructuredText {
  constructor(value, { itemsRepo }) {
    this.value = value;
    this.itemsRepo = itemsRepo;
  }

  get blocks() {
    return uniq(
      findAll(this.value.document, isBlock).map(node => node.item),
    ).map(id => this.itemsRepo.find(id));
  }

  get links() {
    return uniq(
      findAll(this.value.document, [isInlineItem, isItemLink]).map(
        node => node.item,
      ),
    ).map(id => this.itemsRepo.find(id));
  }

  toMap(maxDepth = 3, currentDepth = 0) {
    return {
      value: this.value,
      blocks: this.blocks.map(item => item.toMap(maxDepth, currentDepth)),
      links: this.links.map(item => item.toMap(maxDepth, currentDepth)),
    };
  }
}
