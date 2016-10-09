import { join } from 'path';
import denodeify from 'denodeify';
import nodeRimraf from 'rimraf';
import Loader from '../local/Loader';
import createPost from './createPost';
import createDataFile from './createDataFile';
import addToDataFile from './addToDataFile';
import i18n from '../utils/i18n';

const rimraf = denodeify(nodeRimraf);

function createDirectory(path, config) {
  const operations = [];

  const dsl = {
    createDataFile(file, format, data) {
      operations.push(createDataFile.bind(null, join(path, file), format, data));
    },

    createPost(file, format, data) {
      operations.push(createPost.bind(null, join(path, file), format, data));
    },

    addToDataFile(file, format, data) {
      operations.push(addToDataFile.bind(null, join(path, file), format, data));
    },
  };

  config(dsl);

  return () => {
    return rimraf(join(path, '*'))
      .then(() => Promise.all(operations.map(o => o())));
  };
}

function start(path, config) {
  const operations = [];

  const dsl = {
    directory(dir, subConfig) {
      operations.push(createDirectory(join(path, dir), subConfig));
    },

    createDataFile(file, format, data) {
      operations.push(createDataFile.bind(null, join(path, file), format, data));
    },

    createPost(file, format, data) {
      operations.push(createPost.bind(null, join(path, file), format, data));
    },

    addToDataFile(file, format, data) {
      operations.push(addToDataFile.bind(null, join(path, file), format, data));
    },
  };

  config(dsl);

  return () => Promise.all(operations.map(o => o()));
}

export default async function dump(configFile, client, destinationPath = process.cwd()) {
  /* eslint-disable global-require */
  const config = require(configFile);
  /* eslint-enable global-require */

  const loader = new Loader(client);
  await loader.load();

  i18n.availableLocales = loader.itemsRepo.availableLocales;
  i18n.locale = i18n.availableLocales[0];

  const startOperation = start(
    destinationPath,
    config.bind(config, loader.itemsRepo, i18n)
  );

  await startOperation();
}
