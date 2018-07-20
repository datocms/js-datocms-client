import writeFile from './writeFile';
import readFile from './readFile';
import serializeData from './serializeData';

export default async function addToDataFile(file, format, data) {
  const oldContent = await readFile(file) || '';
  const contentToAdd = serializeData(format, data);

  const newContent = oldContent.replace(
    /\n*(#\s*datocms:start[\s\S]*#\s*datocms:end|$)/,
    `\n\n# datocms:start\n${contentToAdd}\n# datocms:end`,
  );

  return writeFile(file, newContent);
}
