import readline from 'readline';
import fs from 'fs';
import ora from 'ora';

const path = './contentfulImport.json';

export const promptForAction = (message, answerToTriggerAction, action) =>
  new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(message, answer => {
      if (answer === answerToTriggerAction) {
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
    const message = `
*****Recovery file*****

We found a recovery file from your last import attempt, you can use this file to continue importing from where you left off. 
If you made any changes to your Contentful project we suggest to select "n" and start importing from scratch. 

Do you wish to start from where you left off? [Y/n]: `;

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
