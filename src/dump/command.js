import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';
import ora from 'ora';
import SiteClient from '../site/SiteClient';
import detectSsg from './detectSsg';
import dump from './dump';
import requireToken from './requireToken';
import Loader from '../local/Loader';
import ItemsRepo from '../local/ItemsRepo';

export default async function(options) {
  const configFile = path.resolve(options['--config'] || 'dato.config.js');
  const environment = options['--environment'];
  const tokenOption = options['--token'] || process.env.DATO_API_TOKEN;
  const watch = options['--watch'];
  const quiet = options['--quiet'];
  const previewMode = options['--preview'];
  const cmaBaseUrl = options['--cmaBaseUrl'];

  const token = tokenOption || (await requireToken());

  try {
    fs.accessSync(configFile);
  } catch (e) {
    process.stderr.write(`Missing config file ${configFile}\n`);
    process.exit(1);
  }

  try {
    const headers = {
      'X-Reason': 'dump',
      'X-SSG': detectSsg(process.cwd()),
    };

    if (environment) {
      headers['X-Environment'] = environment;
    }

    const client = new SiteClient(
      token,
      headers,
      cmaBaseUrl,
    );

    const loader = new Loader(client, previewMode, environment);

    process.stdout.write('Fetching content from DatoCMS');
    await loader.load();
    process.stdout.write('Done');

    await dump(configFile, new ItemsRepo(loader.entitiesRepo), quiet);

    if (watch) {
      const unwatch = loader.watch(async promise => {
        const watchSpinner = ora(
          'Detected change in content, loading new data',
        ).start();
        await promise;
        watchSpinner.succeed();
        return dump(configFile, new ItemsRepo(loader.entitiesRepo), quiet);
      });

      process.on('SIGINT', () => {
        unwatch();
        process.exit();
      });

      chokidar.watch(configFile).on('change', () => {
        process.stdout.write('Detected change to config file!');
        return dump(configFile, loader.itemsRepo, quiet);
      });
    }
  } catch (e) {
    process.stderr.write(e.message);
    process.exit(1);
  }
}
