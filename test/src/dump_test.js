import path from 'path';
import rimraf from 'rimraf';
import tmp from 'tmp';
import dirCompare from 'dir-compare';
import dump from '../../src/dump/dump';
import SiteClient from '../../src/site/SiteClient';

describe('CLI tool', () => {
  it('dump', vcr(async () => {
    const dir = tmp.dirSync();
    const client = new SiteClient('XXX', {}, 'http://site-api.lvh.me:3001');
    const configFile = path.resolve('test/fixtures/dato.config.js');
    await dump(configFile, client, dir.name);

    const result = dirCompare.compareSync(
      dir.name, 'test/fixtures/dump',
      { compareContent: true }
    );

    expect(result.differences).to.equal(0);

    rimraf.sync(path.join(dir.name, '*'));
    dir.removeCallback();
  }));
});
