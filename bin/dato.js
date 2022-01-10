#!/usr/bin/env node

const PrettyError = require('pretty-error');
const chalk = require('chalk');

require('../lib');
const runCli = require('../lib/cli');
const ApiException = require('../lib/ApiException').default;

runCli().catch(e => {
  process.stderr.write(chalk.redBright(`\nCommand failed!\n`));

  if (e instanceof ApiException) {
    const humanMessage = e.humanMessageForFailedResponse();

    if (humanMessage) {
      process.stderr.write(`${chalk.red.underline(humanMessage)} \n\n`);
    }

    process.stderr.write(chalk.underline.gray(`\nFailed request:\n\n`));

    process.stderr.write(`${e.requestMethod} ${e.requestUrl}\n\n`);
    for (const [key, value] of Object.entries(e.requestHeaders)) {
      process.stderr.write(`${key}: ${value}\n`);
    }
    if (e.requestBody) {
      process.stderr.write(`\n${e.requestBody}`);
    }

    process.stderr.write(chalk.underline.gray(`\n\nHTTP Response:\n\n`));

    process.stderr.write(`${e.statusCode} ${e.statusText}\n\n`);
    for (const [key, value] of Object.entries(e.headers)) {
      process.stderr.write(`${key}: ${value}\n`);
    }

    if (e.body) {
      process.stderr.write(`\n${JSON.stringify(e.body)}`);
    }
  }

  process.stderr.write(chalk.underline.gray(`\n\nException details:\n\n`));
  process.stderr.write(new PrettyError().render(e));
  process.exit(1);
});
