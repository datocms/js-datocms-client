/* eslint-disable no-param-reassign */

module.exports = (dato, root) => {
  root.createDataFile('foobar.toml', 'toml', {
    section: [{ key: 'value1' }, { key: 'value2' }, { key: 'value3' }],
  });
};
