/* global generateNewAccountClient:true */

import tmp from 'tmp';
import path from 'path';
import glob from 'glob';
import runCli from '../../src/cli';
import { SiteClient } from '../../src/index';
import captureStream from '../support/captureStream';

describe.only('CLI tool', () => {
  it('dato new migration', async () => {
    const dir = tmp.dirSync();
    const dirName = dir.name;

    const oldCwd = process.cwd();
    process.chdir(dirName);

    await runCli('new migration foobar');

    const globPath = path.join(dirName, './migrations/*.js');
    const migrationFiles = glob.sync(globPath);

    expect(migrationFiles.length).to.eq(1);

    process.chdir(oldCwd);
    dir.removeCallback();
  });

  it(
    'dato migrate --destination=foobar',
    vcr(async () => {
      const accountClient = await generateNewAccountClient();

      const site = await accountClient.sites.create({
        name: 'Integration new test site',
      });

      const oldCwd = process.cwd();
      process.chdir(path.resolve('test/fixtures/cli/scenario1'));

      await runCli(
        `migrate --destination=foobar --token=${site.readwriteToken} --cmaBaseUrl=${process.env.SITE_API_BASE_URL}`,
      );

      const client = new SiteClient(
        site.readwriteToken,
        {
          environment: 'foobar',
        },
        process.env.SITE_API_BASE_URL,
      );

      const model = await client.itemTypes.find('article');
      expect(model.apiKey).to.eq('article');

      process.chdir(oldCwd);
    }),
  );

  it(
    'dato maintenance on',
    vcr(async () => {
      const accountClient = await generateNewAccountClient();

      const site = await accountClient.sites.create({
        name: 'Integration new test site',
      });

      await runCli(
        `maintenance on --token=${site.readwriteToken} --cmaBaseUrl=${process.env.SITE_API_BASE_URL}`,
      );

      const client = new SiteClient(
        site.readwriteToken,
        {},
        process.env.SITE_API_BASE_URL,
      );

      const { active } = await client.maintenanceMode.find();
      expect(active).to.eq(true);

      await runCli(
        `maintenance off --token=${site.readwriteToken} --cmaBaseUrl=${process.env.SITE_API_BASE_URL}`,
      );

      const { active: newActive } = await client.maintenanceMode.find();
      expect(newActive).to.eq(false);
    }),
  );

  it(
    'dato environment destroy foobar',
    vcr(async () => {
      const accountClient = await generateNewAccountClient();

      const site = await accountClient.sites.create({
        name: 'Integration new test site',
      });

      const client = new SiteClient(
        site.readwriteToken,
        {},
        process.env.SITE_API_BASE_URL,
      );

      await client.environments.fork('main', {
        id: 'my-sandbox-env',
      });

      const envs = await client.environments.all();

      expect(envs.length).to.eq(2);

      await runCli(
        `environment destroy my-sandbox-env --token=${site.readwriteToken} --cmaBaseUrl=${process.env.SITE_API_BASE_URL}`,
      );

      const newEnvs = await client.environments.all();

      expect(newEnvs.length).to.eq(1);
    }),
  );

  describe('inspect console output', () => {
    let hook;
    before(() => {
      hook = captureStream(process.stdout);
    });
    after(() => hook.detach());

    it(
      'dato environment get-primary',
      vcr(async () => {
        const accountClient = await generateNewAccountClient();
        const site = await accountClient.sites.create({
          name: 'Integration new test site',
        });

        await runCli(
          `environment get-primary --token=${site.readwriteToken} --cmaBaseUrl=http://site-api.lvh.me:3001`,
        );

        expect(hook.getCaptured().trim()).to.eq('main');
      }),
    );
  });
});
