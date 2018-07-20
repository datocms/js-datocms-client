import fs from 'fs';
import path from 'path';
import baseMkdirp from 'mkdirp';
import denodeify from 'denodeify';

const fsWriteFile = denodeify(fs.writeFile);
const mkdirp = denodeify(baseMkdirp);

export default function writeFile(filePath, content) {
  return mkdirp(path.dirname(filePath))
    .then(() => fsWriteFile(filePath, content))
    .then(() => `Written ${path.relative(process.cwd(), filePath)}`);
}
