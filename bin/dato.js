#!/usr/bin/env node

require('../lib');
const runCli = require('../lib/cli');

runCli().catch(e => {
  process.stdout.write(`Command failed with the following error:\n`);
  process.stdout.write(`${e.message}\n`);
  process.exit(1);
});
