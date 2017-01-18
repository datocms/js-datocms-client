/* eslint-disable no-proto */

export default function Links(...args) {
  const instance = new Array(...args);
  instance.__proto__ = Links.prototype;
  return instance;
}

Links.prototype = Object.create(Array.prototype);

Links.prototype.toMap = function toMap(maxDepth = 3, currentDepth = 0) {
  return this.filter(item => !!item).map(item => item.toMap(maxDepth, currentDepth));
};
