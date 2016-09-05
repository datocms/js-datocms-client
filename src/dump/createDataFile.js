import serializeData from './serializeData';
import writeFile from './writeFile';

export default function createDataFile(file, format, data) {
  return writeFile(file, serializeData(format, data));
}
