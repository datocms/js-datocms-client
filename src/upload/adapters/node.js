import url from 'url';
import fs from 'fs';
import remote from './nodeRemote';
import local from './nodeLocal';

export default function node(client, source) {
  const { host } = url.parse(source);

  if (host) {
    return remote(client, source);
  }

  fs.accessSync(source);

  return local(client, source);
}
