/* global generateNewAccountClient:true */

import tmp from 'tmp';
import path from 'path';
import glob from 'glob';
import fs from 'fs';
import runCli from '../../src/cli';
import { SiteClient } from '../../src/index';
import captureStream from '../support/captureStream';

describe('CLI tool', () => {
  describe('dato new migration', () => {
    let oldCwd;
    let tempDir;
    let tempDirName;

    before(() => {
      tempDir = tmp.dirSync({ unsafeCleanup: true });
      tempDirName = tempDir.name;
    });
    before(() => {
      oldCwd = process.cwd();
    });
    after(() => process.chdir(oldCwd));
    after(() => tempDir.removeCallback());

    describe('with no --migrationTemplate option', () => {
      it('uses default template', async () => {
        process.chdir(tempDirName);

        await runCli('new migration foobar');

        const globPath = path.join(tempDirName, './migrations/*.js');
        const migrationFiles = glob.sync(globPath);

        expect(migrationFiles.length).to.eq(1);

        expect(
          fs.readFileSync(migrationFiles[0], 'utf-8').includes('exports'),
        ).to.equal(true);
      });
    });

    describe('with --migrationTemplate option', () => {
      it('uses custom template', async () => {
        process.chdir(tempDirName);

        const templatePath = path.join(
          oldCwd,
          'test/fixtures/migrationTemplate.js',
        );

        await runCli(
          `new migration foobar --migrationTemplate=${templatePath}`,
        );

        const globPath = path.join(tempDirName, './migrations/*.js');
        const migrationFiles = glob.sync(globPath);

        expect(migrationFiles.length).to.eq(1);

        expect(fs.readFileSync(migrationFiles[0], 'utf-8')).to.eq('// FOO\n');
      });
    });
  });

  describe('dato migrate', () => {
    let oldCwd;

    before(() => {
      oldCwd = process.cwd();
    });
    after(() => {
      process.chdir(oldCwd);
    });

    it(
      'forks primary env and runs migrations',
      vcr(async () => {
        process.chdir(path.resolve('test/fixtures/cli/scenario1'));

        const accountClient = await generateNewAccountClient();

        const site = await accountClient.sites.create({
          name: 'Integration new test site',
        });

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
      }),
    );
  });

  describe('dato maintenance', () => {
    describe('on', () => {
      it(
        'turns on maintenance mode',
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
    });
  });

  describe('dato environment', () => {
    describe('destroy', () => {
      it(
        'destroy',
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
    });

    describe('promote', () => {
      it(
        'promotes the environment to primary',
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

          const newSandboxName = 'my-sandbox-env';

          await client.environments.fork('main', {
            id: newSandboxName,
          });

          const envs = await client.environments.all();
          expect(envs.length).to.eq(2);

          await runCli(
            `environment promote ${newSandboxName} --token=${site.readwriteToken} --cmaBaseUrl=${process.env.SITE_API_BASE_URL}`,
          );

          const newEnvs = await client.environments.all();
          const primaryEnv = newEnvs.find(({ meta: { primary } }) => primary);

          expect(primaryEnv.id).to.eq(newSandboxName);
        }),
      );
    });

    describe('get-primary', () => {
      let hook;
      before(() => {
        hook = captureStream(process.stdout);
      });
      after(() => hook.detach());

      it(
        'returns the name of the primary environment',
        vcr(async () => {
          const accountClient = await generateNewAccountClient();
          const site = await accountClient.sites.create({
            name: 'Integration new test site',
          });

          await runCli(
            `environment get-primary --token=${site.readwriteToken} --cmaBaseUrl=${process.env.SITE_API_BASE_URL}`,
          );

          expect(hook.getCaptured().trim()).to.eq('main');
        }),
      );
    });
  });

  describe('dato check', () => {
    it('presence of token', async () => {
      const checkFunc = () => runCli(`check`) instanceof Promise;

      expect(checkFunc()).to.eq(true);
    });
  });
});
