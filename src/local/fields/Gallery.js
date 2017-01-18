/* eslint-disable no-proto */

export default function Gallery(...args) {
  const instance = new Array(...args);
  instance.__proto__ = Gallery.prototype;
  return instance;
}

Gallery.prototype = Object.create(Array.prototype);

Gallery.prototype.toMap = function toMap(maxDepth = 3, currentDepth = 0) {
  return this.filter(item => !!item).map(item => item.toMap(maxDepth, currentDepth + 1));
};
