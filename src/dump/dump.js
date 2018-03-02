import { join, relative } from 'path';
import denodeify from 'denodeify';
import nodeRimraf from 'rimraf';
import Loader from '../local/Loader';
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
      operations.push(createDirectory(join(base, dir), subConfig));
    },

    createDataFile(file, format, data) {
      operations.push(() => {
        return Promise.resolve(data)
          .then(dr => createDataFile.bind(null, join(base, file), format, dr)());
      });
    },

    createPost(file, format, data) {
      operations.push(() => {
        return Promise.resolve(data)
          .then(dr => createPost.bind(null, join(base, file), format, dr)());
      });
    },

    addToDataFile(file, format, data) {
      operations.push(() => {
        return Promise.resolve(data)
          .then(dr => addToDataFile.bind(null, join(base, file), format, dr)());
      });
    },
  };

  config(dsl, i18n);

  return operations;
}

createDirectory = (dir, config) => {
  const operations = collectOperations(dir, config);

  return () => {
    return rimraf(join(dir, '*'))
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

export default async function dump(configFile, client, draftMode, destinationPath = process.cwd()) {
  /* eslint-disable global-require, import/no-dynamic-require */
  delete require.cache[configFile];
  const config = require(configFile);
  /* eslint-enable global-require, import/no-dynamic-require */

  const loader = new Loader(client, draftMode);
  await loader.load();

  i18n.availableLocales = loader.itemsRepo.site.locales;
  i18n.locale = i18n.availableLocales[0];

  const startOperation = start(
    destinationPath,
    config.bind(config, loader.itemsRepo)
  );

  return await startOperation();
}
