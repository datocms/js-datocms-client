import readline from 'readline';
import fs from 'fs';
import ora from 'ora';

const path = './contentfulImport.json';

export const promptForAction = (message, rightAnswer, action) =>
  new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(message, answer => {
      if (answer === rightAnswer) {
        action();
      }

      rl.close();
      resolve(answer);
    });
  });

export const destroyTempFile = () =>
  fs.unlink(path, err => {
    if (err) {
      console.log(`failed to delete temp file: ${err}`);
    }
  });

export const initializeCache = async () => {
  let spinner;

  if (fs.existsSync(path)) {
    const message =
      'We found a recovery file from your previous import attempt, you can use this file to continue importing from where you left. If you made any changes to your Contentful project we suggest to select no and start from scratch. Do you wish to use this file? [Y/n]';

    spinner = ora(`Using recovery file in ${path}`);
    await promptForAction(message, 'n', destroyTempFile);
  }

  if (!fs.existsSync(path)) {
    fs.appendFile(path, JSON.stringify({}), function onFileAppened(err) {
      if (err) throw err;
    });

    spinner = ora(`Created recovery file in ${path}`);
  }

  return Promise.resolve(spinner.succeed());
};

const readFile = () => {
  const rawdata = fs.readFileSync(path);
  return JSON.parse(rawdata);
};

export const writeToFile = json => {
  const data = readFile();

  fs.writeFileSync(path, JSON.stringify({ ...data, ...json }), err => {
    if (err) throw err;
  });
};

export const removeFromFile = key => {
  const data = readFile();
  delete data[key];

  fs.writeFileSync(path, JSON.stringify(data), err => {
    if (err) throw err;
  });
};

export const cached = key => {
  return readFile()[key];
};
