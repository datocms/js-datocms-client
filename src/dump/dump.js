import { resolve, relative } from 'path';
import denodeify from 'denodeify';
import PrettyError from 'pretty-error';
import nodeRimraf from 'rimraf';
import ora from 'ora';
import createPost from './createPost';
import createDataFile from './createDataFile';
import addToDataFile from './addToDataFile';
import i18n from '../utils/i18n';

const rimraf = denodeify(nodeRimraf);

let createDirectory;

function collectOperations(base, config) {
  const operations = [];

  const dsl = {
    directory(dir, subConfig) {
      operations.push(createDirectory(resolve(base, dir), subConfig));
    },

    createDataFile(file, format, data) {
      operations.push(() => {
        return Promise.resolve(data)
          .then(dr => createDataFile.bind(null, resolve(base, file), format, dr)());
      });
    },

    createPost(file, format, data) {
      operations.push(() => {
        return Promise.resolve(data)
          .then(dr => createPost.bind(null, resolve(base, file), format, dr)());
      });
    },

    addToDataFile(file, format, data) {
      operations.push(() => {
        return Promise.resolve(data)
          .then(dr => addToDataFile.bind(null, resolve(base, file), format, dr)());
      });
    },
  };

  config(dsl, i18n);

  return operations;
}

createDirectory = (dir, config) => {
  const operations = collectOperations(dir, config);

  return () => {
    return rimraf(resolve(dir, '*'))
      .then(() => Promise.all(operations.map(o => o())))
      .then((descriptions) => {
        const description = `Created ${relative(process.cwd(), dir)}`;
        return [].concat(description, ...descriptions);
      });
  };
};

function start(path, config) {
  const operations = collectOperations(path, config);

  return () => {
    return Promise.all(operations.map(o => o()))
      .then(descriptions => [].concat(...descriptions));
  };
}

export default function dump(
  configFile,
  itemsRepo,
  quiet = false,
  destinationPath = process.cwd(),
) {
  /* eslint-disable global-require, import/no-dynamic-require */
  delete require.cache[configFile];
  const config = require(configFile);
  /* eslint-enable global-require, import/no-dynamic-require */

  i18n.availableLocales = itemsRepo.site.locales;
  [i18n.locale] = i18n.availableLocales;

  const startOperation = start(
    destinationPath,
    config.bind(config, itemsRepo),
  );

  const spinner = ora('Writing content').start();

  return startOperation()
    .then((operations) => {
      spinner.succeed();
      if (!quiet) {
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
