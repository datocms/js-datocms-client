import yaml from 'js-yaml';
import toml from 'toml-js';

export default function serializeData(format, data) {
  switch (format) {
    case 'yaml':
    case 'yml':
      return yaml.safeDump(data).trim();

    case 'toml':
      return toml.dump(data).trim();

    case 'json':
      return JSON.stringify(data, null, 2).trim();

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
