import fs from 'fs';
import denodeify from 'denodeify';

const fsReadFile = denodeify(fs.readFile);
const fsAccess = denodeify(fs.access);

export default async function readFile(filePath) {
  try {
    await fsAccess(filePath);
  } catch (e) {
    return null;
  }

  return fsReadFile(filePath, 'utf-8');
}
