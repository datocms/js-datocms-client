import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';
import PrettyError from 'pretty-error';
import ora from 'ora';
import SiteClient from '../site/SiteClient';
import detectSsg from './detectSsg';
import dump from './dump';
import SiteChangeWatcher from './SiteChangeWatcher';

export default function (options) {
  const configFile = path.resolve(options['--config'] || 'dato.config.js');
  const token = options['--token'] || process.env.DATO_API_TOKEN;
  const watch = options['--watch'];
  const verbose = options['--verbose'];

  if (!token) {
    process.stdout.write(
      'Missing API token: use the --token option or set an DATO_API_TOKEN environment variable!\n'
    );
    process.exit(1);
  }

  try {
    fs.accessSync(configFile);
  } catch (e) {
    process.stdout.write(`Missing config file ${configFile}\n`);
    process.exit(1);
  }

  const client = new SiteClient(
    token,
    {
      'X-Reason': 'dump',
      'X-SSG': detectSsg(process.cwd()),
    }
  );

  function exec(prefix = '') {
    let text = 'Fetching content from DatoCMS';

    if (prefix) {
      text = `${prefix}! ${text}`;
    }

    const spinner = ora(text).start();

    return dump(configFile, client)
      .then((operations) => {
        spinner.succeed();
        if (verbose) {
          process.stdout.write('\n');
          operations.forEach(operation => process.stdout.write(`* ${operation}\n`));
          process.stdout.write('\n');
        }
      })
      .catch((e) => {
        spinner.fail();
        process.stderr.write(new PrettyError().render(e));
      });
  }

  if (watch) {
    return exec()
      .then(() => client.site.find())
      .then((site) => {
        const watcher = new SiteChangeWatcher(site.id);
        watcher.connect(exec.bind(null, 'Detected site data change'));

        chokidar.watch(configFile)
          .on('change', exec.bind(null, 'Detected change to config file'));

        process.on('SIGINT', () => {
          watcher.disconnect();
          process.exit();
        });
      });
  }

  return exec();
}
