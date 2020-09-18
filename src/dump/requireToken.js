import readline from 'readline';
import fs from 'fs';
import denodeify from 'denodeify';

const fsAppendFile = denodeify(fs.appendFile);

export default async function() {
  const token = await new Promise((resolve, reject) => {
    process.stdout.write(
      'Site token is not specified! Please paste your DatoCMS site read-only API token.\n',
    );

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.on('SIGINT', () => {
      reject(new Error('Received SIGINT'));
    });

    rl.on('SIGCONT', () => {
      rl.prompt();
    });

    rl.question('> ', input => {
      rl.close();

      if (input) {
        resolve(input);
        return;
      }

      reject(new Error('Missing token'));
    });
  });

  await fsAppendFile('.env', `DATO_API_TOKEN=${token}`);

  process.stdout.write('\nToken added to .env file.\n\n');
}
