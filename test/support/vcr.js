import nock from 'nock';
import path from 'path';
import fs from 'fs';
import baseMkdirp from 'mkdirp';
import denodeify from 'denodeify';

const mkdirp = denodeify(baseMkdirp);
const writeFile = denodeify(fs.writeFile);

function nockReset() {
  nock.cleanAll();
  nock.recorder.clear();
  nock.restore();
}

function nockStartRecording() {
  return nock.recorder.rec({
    output_objects: true,
    dont_print: true,
  });
}

function beforeTest(cassettePath, options) {
  nockReset();

  // I feel like this could be written better. Some duplication here
  if (options.mode === 'all') {
    nockStartRecording();
  } else if (fs.existsSync(cassettePath)) {
    if (!nock.isActive()) {
      nock.activate();
    }

    if (options.beforeLoad) {
      options.beforeLoad(nock);
    }

    const nocks = nock.load(cassettePath);

    if (options.afterLoad) {
      options.afterLoad(nocks);
    }
  } else {
    nockStartRecording();
  }
}

function afterTest(cassettePath) {
  const cassettes = nock.recorder.play();

  if (cassettes.length) {
    return mkdirp(path.dirname(cassettePath)).then(() => {
      const sanitizedCassettes = cassettes.map((cassette) => {
        return Object.assign(cassette, { response: cassette.response });
      });
      return writeFile(cassettePath, JSON.stringify(sanitizedCassettes, null, 2));
    });
  }

  return Promise.resolve();
}

function isPromise(object) {
  return object && typeof object.then === 'function';
}

module.exports = function (cassette, options, testFn) {
  const cassettePath = path.resolve(path.join('cassettes', `${cassette}.json`));

  beforeTest(cassettePath, options);

  const testRun = testFn();

  if (isPromise(testRun)) {
    return testRun.then((res) => {
      return afterTest(cassettePath, options).then(() => {
        return res;
      });
    }, (err) => {
      if (options.writeOnFailure) {
        return afterTest(cassettePath, options);
      }

      return Promise.reject(err);
    });
  }

  return Promise.resolve(testRun);
};
