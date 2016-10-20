import yaml from 'js-yaml';
import toml from 'toml-js';
import traverse from 'traverse';

export default function serializeData(format, data) {
  const safeData = traverse(data).map(function(value) {
    if (typeof value === 'undefined') {
      this.update(null);
    }
  });

  switch (format) {
    case 'yaml':
    case 'yml':
      return yaml.safeDump(safeData).trim();

    case 'toml':
      return toml.dump(safeData).trim();

    case 'json':
      return JSON.stringify(safeData, null, 2).trim();

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
