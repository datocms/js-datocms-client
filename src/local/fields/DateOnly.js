/* eslint-disable no-proto */

export default function DateOnly(...args) {
  const instance = new Date(...args);
  instance.__proto__ = DateOnly.prototype;
  return instance;
}

DateOnly.prototype = Object.create(Date.prototype);

DateOnly.prototype.toMap = function toMap() {
  return this.toISOString().slice(0, 10);
};
