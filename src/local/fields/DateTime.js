/* eslint-disable no-proto */

export default function DateTime(...args) {
  const instance = new Date(...args);
  instance.__proto__ = DateTime.prototype;
  return instance;
}

DateTime.prototype = Object.create(Date.prototype);

DateTime.prototype.toMap = function toMap() {
  return this.toISOString();
};
