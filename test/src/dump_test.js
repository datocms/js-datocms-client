import path from 'path';
import rimraf from 'rimraf';
import tmp from 'tmp';
import dirCompare from 'dir-compare';
import dump from '../../src/dump/dump';
import SiteClient from '../../src/site/SiteClient';

describe('CLI tool', () => {
  it('dump', vcr(async () => {
    const dir = tmp.dirSync();
    const dirName = dir.name;
    // const dirName = path.resolve('test/fixtures/dump');
    const client = new SiteClient('1b3a3699366bc5494d9d62aca7cd4202bf3df85b124d3d2f07', {}, 'http://site-api.lvh.me:3001');
    const configFile = path.resolve('test/fixtures/dato.config.js');
    await dump(configFile, client, dirName);

    const result = dirCompare.compareSync(
      dirName, 'test/fixtures/dump',
      { compareContent: true }
    );

    expect(result.differences).to.equal(0);

    rimraf.sync(path.join(dirName, '*'));
    dir.removeCallback();
  }));
});
