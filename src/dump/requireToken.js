import readline from 'readline';
import fs from 'fs';
import denodeify from 'denodeify';

const fsAppendFile = denodeify(fs.appendFile);

export default function () {
  return new Promise((resolve, reject) => {
    process.stdout.write('Site token is not specified! Please paste your DatoCMS site read-only API token.\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.on('SIGINT', () => {
      process.exit(1);
    });

    rl.on('SIGCONT', () => {
      rl.prompt();
    });

    rl.question('> ', (token) => {
      rl.close();

      if (token) {
        resolve(token);
        return;
      }

      reject();
    });
  })
    .then((token) => {
      return fsAppendFile('.env', `DATO_API_TOKEN=${token}`)
        .then(() => process.stdout.write('\nToken added to .env file.\n\n'))
        .then(() => token);
    })
    .catch(() => {
      process.stderr.write('\nMissing token.\n');
      process.exit(1);
    });
}
