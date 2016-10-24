const fs = require('fs');
const pkg = require('../package.json')

fs.writeFileSync('lib/pkg.js', `module.exports = { version: ${JSON.stringify(pkg.version)} };`);
